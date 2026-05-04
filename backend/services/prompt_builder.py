import json
import logging

logger = logging.getLogger("prompt_builder")


# ---------------------------------------------------------------------------
# PROMPT 1 — Code-generation prompt (for LLM Call 1)
# ---------------------------------------------------------------------------

def build_code_prompt(schema: dict, question: str, df) -> str:
    import json

    sample = json.dumps(df.head(5).to_dict(orient="records"), indent=2)
    schema_str = "\n".join([f"- {col}: {dtype}" for col, dtype in schema.items()])

    return f"""
You are an expert Python data analyst.

You are working with a Pandas DataFrame named `df`.

-------------------------------------
SCHEMA
-------------------------------------
{schema_str}

-------------------------------------
SAMPLE DATA
-------------------------------------
{sample}

-------------------------------------
QUESTION
-------------------------------------
{question}

-------------------------------------
RULES (STRICT)
-------------------------------------

1. Use ONLY column names exactly as given in schema (case-sensitive)

2. Identify correct column from the question

3. For text filtering ALWAYS use this pattern:
   df['ColumnName'].astype(str).str.strip().str.lower().str.contains("keyword", na=False)

4. Extract a meaningful keyword from the question:
   - "Bhubaneswar" → "bhub"
   - "New Delhi" → "delhi"
   - "Mumbai City" → "mumbai"

5. NEVER use == for string matching

6. Apply filtering BEFORE aggregation

7. For count:
   result = df[condition].shape[0]

8. For sum:
   result = df[condition]['column'].sum()

9. For average:
   result = df[condition]['column'].mean()

10. DO NOT modify dataframe (no df['col'] = ...)

11. Assign final output ONLY to:
    result

-------------------------------------
CRITICAL RULES
-------------------------------------

- Output ONLY Python code
- No explanation
- No JSON
- No markdown
- No comments
- No import

-------------------------------------
OUTPUT
-------------------------------------

Return ONLY executable Python code.

-------------------------------------
EXAMPLE
-------------------------------------

result = df[df['City'].astype(str).str.strip().str.lower().str.contains("bhub", na=False)].shape[0]
"""
# ---------------------------------------------------------------------------
# PROMPT 2 — Natural language answer prompt (for LLM Call 2)
# Kept here for documentation; the actual prompt is inlined in llm_service.py
# so it stays co-located with the call. This builder is available if callers
# prefer to build the prompt externally.
# ---------------------------------------------------------------------------

def build_answer_prompt(question: str, result) -> str:
    return (
        f"Question: {question}\n"
        f"Result: {result}\n\n"
        "Write a short, clear natural answer.\n"
        "Do not include code."
    )