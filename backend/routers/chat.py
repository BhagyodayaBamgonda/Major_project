from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from models.chat import ChatRequest, ChatResponse
from utils.session_store import session_store
from utils.query_optimizer import normalize_query, query_cache
from services.prompt_builder import build_prompt
from services.llm_service import generate_pandas_code
from services.compute_service import execute_pandas_code, detect_simple_query, generate_local_explanation
import logging

logger = logging.getLogger("chat")

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received question for session {request.session_id}: {request.question}")
    
    if request.session_id not in session_store:
        logger.warning(f"Session {request.session_id} not found")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a file first.")
        
    session_data = session_store[request.session_id]
    df = session_data["df"]
    schema = session_data["schema"]
    
    # 1. Normalize Query
    norm_query = normalize_query(request.question)
    logger.debug(f"Normalized query: {norm_query}")
    
    # 2. Check Cache
    cached_data = query_cache.get(request.session_id, norm_query)
    if cached_data:
        logger.info(f"Cache hit for session {request.session_id}")
        return ChatResponse(
            message=cached_data["message"] + " (Cached)",
            answer=cached_data["answer"],
            code=cached_data["code"],
            error=None
        )
    
    try:
        # 3. Simple Query Detection (No LLM)
        result, code = detect_simple_query(df, norm_query)
        
        # 4. Fallback to LLM if complex
        if code is None:
            logger.info("Complex query detected, calling LLM...")
            prompt = build_prompt(schema, request.question)
            code, ai_message = await generate_pandas_code(prompt)
            logger.info(f"Generated code: {code}")
            result, error = await run_in_threadpool(execute_pandas_code, df, code)
            
            if error:
                logger.error(f"Execution error: {error}")
                return ChatResponse(message="Execution Error", answer=None, code=code, error=error)
            
            message = ai_message
        else:
            logger.info(f"Simple query detected, bypassed LLM. Code: {code}")
            message = generate_local_explanation(result)
        
        # 6. Store in Cache
        query_cache.set(request.session_id, norm_query, {
            "message": message,
            "answer": result,
            "code": code
        })
            
        return ChatResponse(message=message, answer=result, code=code, error=None)
        
    except Exception as e:
        logger.exception("Unexpected error in chat endpoint")
        return ChatResponse(message="Failed to process request", answer=None, code="", error=str(e))
