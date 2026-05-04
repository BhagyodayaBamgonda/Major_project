import pandas as pd
from fastapi import UploadFile

def load_file_to_dataframe(file: UploadFile) -> pd.DataFrame:
    filename = file.filename.lower()
    
    if filename.endswith('.csv'):
        return pd.read_csv(file.file)
    elif filename.endswith(('.xls', '.xlsx')):
        return pd.read_excel(file.file)
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel.")
