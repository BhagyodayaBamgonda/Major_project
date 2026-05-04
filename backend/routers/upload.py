from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid

from services.file_service import load_file_to_dataframe
from services.schema_service import extract_schema
from utils.session_store import session_store
from models.chat import UploadResponse
import logging

logger = logging.getLogger("upload")

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

@router.post("/upload", response_model=UploadResponse)
def upload_file(file: UploadFile = File(...)):
    # Validate file extension
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected upload of unsupported file type: {file.filename}")
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{file_ext}'. Supported types are: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    logger.info(f"Uploading file: {file.filename}")
    
    # Synchronous function runs in a thread pool, preventing event loop blocking
    try:
        # Load the dataframe
        df = load_file_to_dataframe(file)
        
        # Extract schema
        schema_info = extract_schema(df)
        
        # Create session ID
        session_id = str(uuid.uuid4())
        
        # Store in memory (LRU Cache handles limits)
        session_store[session_id] = {
            "df": df,
            "schema": schema_info
        }
        
        return UploadResponse(session_id=session_id, schema_info=schema_info)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
