import re
from typing import Dict, Any, Optional

class QueryCache:
    def __init__(self, capacity: int = 1000):
        self.capacity = capacity
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.order = []

    def get(self, session_id: str, query: str) -> Optional[Dict[str, Any]]:
        key = f"{session_id}::{query}"
        if key in self.cache:
            # move to end (MRU)
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return None

    def set(self, session_id: str, query: str, data: Dict[str, Any]):
        key = f"{session_id}::{query}"
        if key in self.cache:
            self.order.remove(key)
        elif len(self.cache) >= self.capacity:
            oldest = self.order.pop(0)
            del self.cache[oldest]
        self.cache[key] = data
        self.order.append(key)

query_cache = QueryCache()

def normalize_query(query: str) -> str:
    """Normalizes a query by lowercasing, stripping punctuation, and removing stopwords."""
    q = query.lower()
    # Remove punctuation
    q = re.sub(r'[^\w\s]', '', q)
    # Remove stopwords
    stopwords = {"what", "is", "the", "show", "me", "calculate", "find", "tell", "get", "of", "in", "a", "an", "for", "on"}
    words = q.split()
    filtered_words = [w for w in words if w not in stopwords]
    return " ".join(filtered_words)
