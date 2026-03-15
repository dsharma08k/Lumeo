
from typing import Optional
from supabase import create_client, Client
from backend.config import SUPABASE_URL, SUPABASE_KEY


def _build_supabase_client() -> Optional[Client]:
	"""Create Supabase client if credentials are valid, otherwise disable DB features."""
	if not SUPABASE_URL or not SUPABASE_KEY:
		return None
	if "your-project" in SUPABASE_URL or SUPABASE_KEY == "your-anon-key":
		return None

	try:
		return create_client(SUPABASE_URL, SUPABASE_KEY)
	except Exception:
		return None


# Optional Supabase client (None in local/dev without credentials)
supabase: Optional[Client] = _build_supabase_client()
