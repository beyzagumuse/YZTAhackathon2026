from supabase import create_client, Client
from app.core.config import settings


_client_cache = None

def _init_supabase_client() -> Client:
    """Initialize and cache the Supabase client."""
    global _client_cache
    if _client_cache is not None:
        return _client_cache
    
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_KEY must be set in the environment or in a .env file. "
            "Add them to /Users/ebg/Desktop/hackathon/.env and restart the server."
        )
    
    _client_cache = create_client(url, key)
    return _client_cache


class _LazyClient:
    """Lazy proxy for Supabase client. Initializes on first use."""
    
    def __getattr__(self, name):
        return getattr(_init_supabase_client(), name)
    
    def __call__(self, *args, **kwargs):
        return _init_supabase_client()(*args, **kwargs)


# Export as supabase_client - will be initialized on first use
supabase_client = _LazyClient()
