"""
Fuzzy area/district matching shared by the English-name scrapers (Wasalt,
Property Finder). Saudi district names appear with inconsistent Latin
transliteration across platforms — e.g. 'Shamaliyah' vs 'Shamalyyah',
'Rawdah' vs 'Rawdhah', 'Janubiyah' vs 'Janoubeyyah'. These helpers normalize
those variants so the same canonical area slug matches all spellings, while
still keeping genuinely different districts (Obhur North vs South) apart.
"""

import re

_AREA_STOPWORDS = {
    "al", "the", "district", "jeddah", "riyadh", "dammam", "mecca", "medina",
}


def _norm_tok(t: str) -> str:
    """Collapse transliteration variants in one token: vowel runs → 'a'
    (handles o/u, i/y, e/a swaps) and any doubled letter → single."""
    t = re.sub(r"[aeiou]+", "a", t)
    t = re.sub(r"(.)\1+", r"\1", t)
    return t


def area_tokens(s: str) -> list:
    """Split an area name/slug into significant lowercase tokens (drops the 'al'
    article, city names, 'district', and sub-3-char fragments such as the stray
    'a'/'e' that Wasalt appends as 'Al Faiha|A')."""
    s = (s or "").lower().replace("-", " ").replace("_", " ")
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return [w for w in s.split() if len(w) >= 3 and w not in _AREA_STOPWORDS]


def area_matches(area: str, district: str) -> bool:
    """True if `district` is the same place as the requested `area`. Every
    significant token of `area` must find a district token that, after vowel
    normalization, is equal or shares a 4+ character common prefix. The 4-char
    floor prevents short fragments from matching unrelated districts."""
    need = area_tokens(area)
    hay = area_tokens(district)
    if not need or not hay:
        return False
    for nt in need:
        nnt = _norm_tok(nt)
        matched = False
        for ht in hay:
            nht = _norm_tok(ht)
            cp = 0
            for a, b in zip(nnt, nht):
                if a == b:
                    cp += 1
                else:
                    break
            if nnt == nht or cp >= 4:
                matched = True
                break
        if not matched:
            return False
    return True
