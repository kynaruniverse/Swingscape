"""
NICHE — word list build script.

Merges a raw English dictionary word list with wordfreq frequency data,
filters junk, and exports a single sorted JSON asset the app ships with.

Run once, offline. Output is bundled into the app — never runs on-device.
"""

import json
import re
from wordfreq import zipf_frequency

RAW_WORDLIST_PATH = "british_lowercase_only.txt"
BLOCK_LIST_PATH = "block_list.json"
OUTPUT_PATH = "niche_wordlist.json"

# Minimum word length — 1-2 letter "words" are mostly noise/abbreviations
MIN_LENGTH = 3
MAX_LENGTH = 15

# Words with a zipf frequency below this are so rare wordfreq barely has
# signal on them — often typos, archaic spellings, or dictionary-list noise
# rather than words a real player could ever justify finding "on purpose".
MIN_ZIPF = 0.5

# Proper-noun / name block list, built by build_blocklist.py (run that
# script first, or this will fall back to an empty set with a warning).
try:
    with open(BLOCK_LIST_PATH, encoding="utf-8") as f:
        BLOCK_LIST = set(json.load(f))
except FileNotFoundError:
    print(f"WARNING: {BLOCK_LIST_PATH} not found — run build_blocklist.py first. "
          f"Proceeding with NO proper-noun filtering.")
    BLOCK_LIST = set()

WORD_PATTERN = re.compile(r"^[a-z]+$")

# Offensive-term filter — separate from BLOCK_LIST (which only covers
# proper nouns). Standard British word-list sources include profanity
# and slurs; a word game should never surface these as a "discovery".
# This is a starter list, not exhaustive — same caveat as BLOCK_LIST,
# expect to extend it during playtesting whenever something slips through.
OFFENSIVE_TERMS = {
    "fuck", "fucker", "fucking", "fucked", "motherfucker",
    "shit", "shitter", "shitty", "bullshit",
    "cunt", "cocksucker", "cock", "dick", "dickhead", "prick",
    "bitch", "bastard", "asshole", "arsehole", "twat", "wanker",
    "wank", "spastic", "retard", "retarded",
    "nigger", "nigga", "chink", "spic", "wetback", "gook", "kike",
    "faggot", "fag", "dyke", "tranny", "paki", "coon", "raghead",
    "slut", "whore", "skank", "hooker",
    "rape", "rapist",
    "nazi", "hitler",
}


def rarity_score(zipf: float) -> int:
    """Convert a zipf frequency (~0-8 scale) into a 0-1000 rarity score.
    Lower zipf (rarer word) -> higher score."""
    score = (8 - zipf) * 125
    return max(0, min(1000, round(score)))


def tier_for_zipf(zipf: float) -> str:
    if zipf >= 5.5:
        return "common"
    if zipf >= 4.5:
        return "familiar"
    if zipf >= 3.5:
        return "uncommon"
    if zipf >= 2.5:
        return "rare"
    if zipf >= 1.5:
        return "obscure"
    return "niche"


def main():
    with open(RAW_WORDLIST_PATH, encoding="utf-8") as f:
        raw_words = [w.strip().lower() for w in f if w.strip()]

    print(f"Loaded {len(raw_words)} raw words")

    # Dedupe while preserving first-seen order — the source list can
    # contain the same word twice (e.g. differing only in a variant
    # spelling entry elsewhere), and duplicates just bloat the shipped
    # JSON for no gameplay benefit.
    seen = set()
    deduped_words = []
    for w in raw_words:
        if w not in seen:
            seen.add(w)
            deduped_words.append(w)
    skipped_duplicate = len(raw_words) - len(deduped_words)
    raw_words = deduped_words

    entries = []
    skipped_pattern = skipped_length = skipped_block = skipped_norare = 0
    skipped_offensive = 0

    for word in raw_words:
        if not WORD_PATTERN.match(word):
            skipped_pattern += 1
            continue
        if not (MIN_LENGTH <= len(word) <= MAX_LENGTH):
            skipped_length += 1
            continue
        if word in BLOCK_LIST:
            skipped_block += 1
            continue
        if word in OFFENSIVE_TERMS:
            skipped_offensive += 1
            continue

        zipf = zipf_frequency(word, "en")
        if zipf < MIN_ZIPF:
            skipped_norare += 1
            continue

        entries.append({
            "word": word,
            "zipf": round(zipf, 3),
            "rarity_score": rarity_score(zipf),
            "tier": tier_for_zipf(zipf),
        })

    entries.sort(key=lambda e: e["word"])

    print(f"Kept {len(entries)} words")
    print(f"Skipped: pattern={skipped_pattern} length={skipped_length} "
          f"blocklist={skipped_block} offensive={skipped_offensive} "
          f"no-frequency-data={skipped_norare} duplicates={skipped_duplicate}")
          
    tier_counts = {}
    for e in entries:
        tier_counts[e["tier"]] = tier_counts.get(e["tier"], 0) + 1
    print("Tier distribution:", tier_counts)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, separators=(",", ":"))

    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
