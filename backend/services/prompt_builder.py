from typing import Dict

def build_prompt(schema: Dict[str, str], question: str) -> str:
    schema_str = "\n".join([f"- {col}: {dtype}" for col, dtype in schema.items()])
    
    return f"""You are a data analysis assistant. 
You are given a Pandas DataFrame named 'df'.
The DataFrame has the following columns and data types:
{schema_str}

User Question: {question}

Your task:
1. Write valid Python Pandas code to answer the question.
2. The code MUST assign the final answer to a variable named 'result'.
3. Provide a natural language, friendly explanation or response prefix.
4. For string filtering, ALWAYS use case-insensitive matching (e.g., .str.contains('val', case=False, na=False)) to avoid empty results.

Return your response in EXACTLY this JSON format:
{{
    "code": "result = df[df['Col'].str.contains('val', case=False, na=False)]['OtherCol']",
    "explanation": "Here are the results for 'val':"
}}

CRITICAL: Do not write anything other than the JSON block. No markdown, no text.
"""
