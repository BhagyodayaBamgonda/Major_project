from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


# -----------------------------
# Upload Response
# -----------------------------
class UploadResponse(BaseModel):
    success: bool = True
    session_id: str
    schema_info: Dict[str, str]
    message: str = "File uploaded successfully"


# -----------------------------
# Chat Request
# -----------------------------
class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session ID from upload")
    question: str = Field(..., description="User question about the dataset")


# -----------------------------
# Chat Response (MAIN MODEL)
# -----------------------------
class ChatResponse(BaseModel):
    success: bool
    question: str
    query: Optional[str] = None       # Generated pandas query
    answer: Optional[Any] = None      # Raw result (number, list, etc.)
    message: str                      # Natural language response
    error: Optional[str] = None       # Error type (MODEL_ERROR, EXECUTION_ERROR, etc.)


# -----------------------------
# Schema Response
# -----------------------------
class SchemaResponse(BaseModel):
    success: bool = True
    session_id: str
    schema_info: Dict[str, str]