from pydantic import BaseModel
from typing import Dict, Any, Optional

class UploadResponse(BaseModel):
    session_id: str
    schema_info: Dict[str, str]

class ChatRequest(BaseModel):
    session_id: str
    question: str

class ChatResponse(BaseModel):
    message: str
    answer: Any
    code: str
    error: Optional[str] = None

class SchemaResponse(BaseModel):
    session_id: str
    schema_info: Dict[str, str]
