from collections import OrderedDict

class LRUSessionStore:
    def __init__(self, capacity: int = 50):
        self.capacity = capacity
        self.cache = OrderedDict()
        
    def __contains__(self, key):
        return key in self.cache
        
    def __getitem__(self, key):
        value = self.cache.pop(key)
        self.cache[key] = value
        return value
        
    def __setitem__(self, key, value):
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)
        self.cache[key] = value

session_store = LRUSessionStore(capacity=50)
