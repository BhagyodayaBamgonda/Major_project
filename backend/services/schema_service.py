import pandas as pd
from typing import Dict
import logging

logger = logging.getLogger("schema_service")

def extract_schema(df: pd.DataFrame) -> Dict[str, str]:
    schema = {}
    for column, dtype in df.dtypes.items():
        schema[column] = str(dtype)
    logger.info(f"Extracted schema: {schema}")
    return schema
