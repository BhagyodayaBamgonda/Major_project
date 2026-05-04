import logging

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool

from models.chat import ChatRequest, ChatResponse
from utils.session_store import session_store
from utils.query_optimizer import normalize_query, query_cache
from services.prompt_builder import build_code_prompt, build_answer_prompt
from services.llm_service import generate_pandas_code_only, generate_natural_language_answer
from services.compute_service import execute_pandas_code, detect_simple_query
from services.fuzzy_fallback import find_fuzzy_correction

logger = logging.getLogger("chat")

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    # ── Session validation ──────────────────────────────────────────────────
    if request.session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    session_data = session_store[request.session_id]
    df     = session_data["df"]
    schema = session_data["schema"]

    # ── Step 0: Log incoming question ───────────────────────────────────────
    logger.info(f"[STEP 0] Incoming question: {request.question!r}")

    norm_query = normalize_query(request.question)

    # ── Cache check ─────────────────────────────────────────────────────────
    cached_data = query_cache.get(request.session_id, norm_query)
    if cached_data:
        logger.info("[CACHE] Returning cached result.")
        return ChatResponse(
            success=True,
            question=request.question,
            query=cached_data["code"],
            answer=cached_data["answer"],
            message=f"{cached_data['message']} (cached)",
            error=None,
        )

    try:
        result = None
        code   = None

        # ── Step 1: Try simple query (no LLM needed) ────────────────────────
        result, code = detect_simple_query(df, norm_query)

        if code is not None:
            logger.info(f"[STEP 1] Simple query matched. Code: {code!r}")
            logger.info(f"[STEP 2] Execution result (simple): {result!r}")

            # For simple queries go directly to LLM Call 2 for NL answer
            natural_answer = await generate_natural_language_answer(
                request.question, result
            )
            logger.info(f"[STEP 3] Natural language answer: {natural_answer!r}")

        else:
            # ── Step 1a: LLM Call 1 — generate pandas code only ────────────
            logger.info("[STEP 1] Building code-generation prompt...")
            code_prompt = build_code_prompt(schema, request.question, df)

            logger.info("[STEP 1] Calling LLM for pandas code (Call 1)...")
            code = await generate_pandas_code_only(code_prompt)
            logger.info(f"[STEP 1] Generated pandas code:\n{code}")

            # ── Safety guard ────────────────────────────────────────────────
            if "import" in code or "os." in code:
                logger.error("[STEP 1] Unsafe code detected — aborting.")
                raise ValueError("Unsafe code detected in generated pandas code.")

            # ── Step 2: Execute code on DataFrame ───────────────────────────
            logger.info("[STEP 2] Executing pandas code on DataFrame...")
            result, error = await run_in_threadpool(execute_pandas_code, df, code)

            if error:
                logger.error(f"[STEP 2] Execution error: {error}")
                return ChatResponse(
                    success=False,
                    question=request.question,
                    query=code,
                    answer=None,
                    message="Error while executing the generated query.",
                    error="EXECUTION_ERROR",
                )

            logger.info(f"[STEP 2] Execution result: {result!r}")

            # ── Step 2b: Fuzzy fallback if result is 0 ──────────────────────
            effective_question = request.question
            if result == 0:
                logger.info("[FALLBACK] Result is 0 — attempting fuzzy spelling correction...")
                correction = find_fuzzy_correction(request.question, df)

                if correction:
                    corrected_q, col_name, orig_kw, matched_val = correction
                    logger.info(
                        f"[FALLBACK] Triggered | col={col_name!r} | "
                        f"{orig_kw!r} → {matched_val!r}"
                    )
                    logger.info(f"[FALLBACK] Re-running pipeline with: {corrected_q!r}")

                    # Re-run LLM Call 1 with corrected question
                    fallback_prompt = build_code_prompt(schema, corrected_q, df)
                    fallback_code = await generate_pandas_code_only(fallback_prompt)
                    logger.info(f"[FALLBACK] Regenerated code:\n{fallback_code}")

                    # Re-execute
                    fb_result, fb_error = await run_in_threadpool(
                        execute_pandas_code, df, fallback_code
                    )

                    if not fb_error:
                        logger.info(f"[FALLBACK] New result: {fb_result!r}")
                        result = fb_result
                        code   = fallback_code
                        effective_question = corrected_q
                    else:
                        logger.warning(f"[FALLBACK] Re-execution failed: {fb_error} — keeping original result.")
                else:
                    logger.info("[FALLBACK] No fuzzy match found — keeping original result (genuinely 0).")

            # ── Step 3: LLM Call 2 — natural language answer ────────────────
            logger.info("[STEP 3] Calling LLM for natural language answer (Call 2)...")
            natural_answer = await generate_natural_language_answer(
                effective_question, result
            )
            logger.info(f"[STEP 3] Natural language answer: {natural_answer!r}")

        # ── Cache store ──────────────────────────────────────────────────────
        query_cache.set(request.session_id, norm_query, {
            "message": natural_answer,
            "answer":  result,
            "code":    code,
        })

        logger.info("[DONE] Returning final response to client.")

        return ChatResponse(
            success=True,
            question=request.question,
            query=code,
            answer=result,
            message=natural_answer,
            error=None,
        )

    except Exception:
        logger.exception("[ERROR] Chat pipeline failure.")
        return ChatResponse(
            success=False,
            question=request.question,
            query=None,
            answer=None,
            message="Something went wrong while processing your request.",
            error="INTERNAL_ERROR",
        )