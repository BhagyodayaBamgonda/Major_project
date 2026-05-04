from fastapi import APIRouter, HTTPException
from models.chat import SchemaResponse
from utils.session_store import session_store

router = APIRouter()

@router.get("/schema/{session_id}", response_model=SchemaResponse)
async def get_schema(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    schema_info = session_store[session_id]["schema"]
    return SchemaResponse(session_id=session_id, schema_info=schema_info)
