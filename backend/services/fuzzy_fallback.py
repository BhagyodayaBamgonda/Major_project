"""
fuzzy_fallback.py
-----------------
Handles the case where a pandas query returns 0 due to a spelling mismatch
between the user's question and the actual values in the DataFrame.

Flow:
  1. Extract 1-word and 2-word candidate phrases from the question
  2. For each string column, fuzzy-match candidates against unique values
  3. If a close (but not exact) match is found, replace it in the question
  4. Return the corrected question so the caller can re-run the pipeline

Uses difflib (stdlib) — no extra dependencies.
"""

import difflib
import re
import logging
from typing import Optional, Tuple

import pandas as pd

logger = logging.getLogger("fuzzy_fallback")


def find_fuzzy_correction(
    question: str,
    df: pd.DataFrame,
    cutoff: float = 0.6,
) -> Optional[Tuple[str, str, str, str]]:
    """
    Tries to find a spelling-corrected version of the question.

    Parameters
    ----------
    question : str   — original user question
    df       : DataFrame — the uploaded dataset
    cutoff   : float — minimum similarity ratio (0-1) to accept a fuzzy match

    Returns
    -------
    (corrected_question, column_name, original_keyword, matched_value)
    or None if no useful fuzzy match is found.
    """
    words = question.lower().split()

    # Build 1-word and 2-word candidate phrases
    candidates: list = list(words)
    for i in range(len(words) - 1):
        candidates.append(f"{words[i]} {words[i + 1]}")

    logger.info(f"[FUZZY] Scanning {len(candidates)} candidate phrases from question...")

    for col in df.select_dtypes(include="object").columns:
        unique_vals: list = (
            df[col].astype(str).str.strip().dropna().unique().tolist()
        )
        unique_lower: list = [v.lower() for v in unique_vals]

        for candidate in candidates:
            # Skip very short tokens — they cause false positives
            if len(candidate) < 4:
                continue

            matches = difflib.get_close_matches(
                candidate, unique_lower, n=1, cutoff=cutoff
            )
            if not matches:
                continue

            matched_lower = matches[0]

            # Skip exact matches — spelling is already correct
            if matched_lower == candidate:
                continue

            # Recover original casing from the dataset
            try:
                matched_original = unique_vals[unique_lower.index(matched_lower)]
            except ValueError:
                continue

            score = difflib.SequenceMatcher(None, candidate, matched_lower).ratio()

            logger.info(
                f"[FUZZY] Column={col!r} | "
                f"keyword={candidate!r} → matched={matched_original!r} "
                f"(score={score:.2f})"
            )

            # Replace misspelled word in the original question (case-insensitive)
            corrected = re.sub(
                re.escape(candidate),
                matched_original,
                question,
                flags=re.IGNORECASE,
            )

            logger.info(f"[FUZZY] Corrected question: {corrected!r}")
            return corrected, col, candidate, matched_original

    logger.info("[FUZZY] No close match found in any string column.")
    return None
