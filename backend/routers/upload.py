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

def clean_dataframe(df):
    # Normalize column names
    df.columns = (
        df.columns
        .str.strip()
        .str.replace("\u00A0", " ", regex=False)
    )

    # Normalize string values
    for col in df.select_dtypes(include="object"):
        df[col] = (
            df[col]
            .astype(str)
            .str.replace("\u00A0", " ", regex=False)
            .str.strip()
        )

    return df

@router.post("/upload", response_model=UploadResponse)
def upload_file(file: UploadFile = File(...)):

    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. Supported types are: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    logger.info(f"Uploading file: {file.filename}")

    try:
        # 1. Load dataframe
        df = load_file_to_dataframe(file)

        # 🔥 2. CLEAN DATA (THIS FIXES YOUR ENTIRE ISSUE)
        df = clean_dataframe(df)

        # 3. Extract schema AFTER cleaning
        schema_info = extract_schema(df)

        # 4. Create session
        session_id = str(uuid.uuid4())

        # 5. Store cleaned df
        session_store[session_id] = {
            "df": df,
            "schema": schema_info
        }

        return UploadResponse(
            success=True,
            session_id=session_id,
            schema_info=schema_info
        )

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail="Failed to process file")