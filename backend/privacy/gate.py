"""Regex/keyword privacy blocklist. VLM-based gate implemented in Week 2."""
import re
SENSITIVE_PATTERNS = [r'password', r'otp', r'pin\b', r'credit.?card',
                      r'\bincognito\b', r'private.?brows', r'netbank',
                      r'\bonline.?bank']
_BLOCK = re.compile('|'.join(SENSITIVE_PATTERNS), re.IGNORECASE)
def should_store(caption: str, title: str | None, window_app: str | None) -> bool:
    hay = " ".join(x for x in [caption, title, window_app] if x)
    return not bool(_BLOCK.search(hay))
