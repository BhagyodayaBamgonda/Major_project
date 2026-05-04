import os
from google import genai
import logging

logger = logging.getLogger("llm_service")

# Load environment variables if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import json
from typing import Tuple

async def generate_pandas_code(prompt: str) -> Tuple[str, str]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please set it in your .env file.")
        
    client = genai.Client(api_key=api_key)
    
    logger.info("Calling Gemini for code and explanation...")
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    
    text = response.text.strip()
    
    # Clean markdown if model outputs it
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()
        
    try:
        data = json.loads(text)
        code = data.get("code", "")
        explanation = data.get("explanation", "Here is the result:")
        return code.strip(), explanation.strip()
    except Exception as e:
        logger.error(f"Failed to parse JSON from Gemini: {text}")
        return text.strip(), "Here is the result:"
