import os
import logging
from google import genai

# Load environment variables if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("llm_service")

# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------

def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set it in your .env file."
        )
    return genai.Client(api_key=api_key)


# ---------------------------------------------------------------------------
# CALL 1 — Generate ONLY pandas code
# ---------------------------------------------------------------------------

async def generate_pandas_code_only(prompt: str) -> str:
    """
    First LLM call: returns ONLY the pandas code string.
    The code must assign its final output to the variable `result`.

    No JSON, no explanation — pure Python code only.
    """
    client = _get_client()
    logger.info("LLM Call 1 — generating pandas code...")

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )

    raw = response.text.strip()

    # Strip markdown fences if the model wraps in ```python … ```
    if raw.startswith("```python"):
        raw = raw[len("```python"):].strip()
    elif raw.startswith("```"):
        raw = raw[3:].strip()

    if raw.endswith("```"):
        raw = raw[:-3].strip()

    logger.info(f"LLM Call 1 — pandas code received:\n{raw}")
    return raw


# ---------------------------------------------------------------------------
# CALL 2 — Generate natural language answer from actual result
# ---------------------------------------------------------------------------

async def generate_natural_language_answer(question: str, result) -> str:
    """
    Second LLM call: given the user's question and the *actual* computed
    result, produce a clear natural language answer.

    No code, no JSON — plain English only.
    """
    client = _get_client()
    logger.info("LLM Call 2 — generating natural language answer...")

    prompt = (
        "You are a helpful data analyst assistant.\n\n"
        f"The user asked: {question}\n\n"
        f"The computed result from the data is: {result}\n\n"
        "Write a clear, concise, natural language answer that directly answers "
        "the user's question using the result above. "
        "Do NOT include code. Do NOT use placeholders. "
        "Just give a plain English sentence or short paragraph."
    )

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )

    answer = response.text.strip()
    logger.info(f"LLM Call 2 — natural language answer: {answer}")
    return answer
