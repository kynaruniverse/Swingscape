"""
NICHE — proper noun block-list builder.

Combines common first names, US surnames, country names, and US state
names into a single lowercase block set, saved as JSON. This is
subtracted from the dictionary in build_wordlist.py so proper nouns
(e.g. "wisconsin") don't slip through as playable words.

This is a *starter* filter, not exhaustive — it catches the highest-
frequency, highest-risk categories (the ones actually likely to show up
as bookend words, since bookends are biased toward common/familiar
words). Smaller cities, historical names, and brand names are not
covered and would need a further pass if they turn up in playtesting.
"""

import csv
import json

output = set()

# --- First names (US Social Security baby names, 1880-2008 —
# comprehensive historical coverage, correctly includes short/common
# names like "Ron" that smaller curated lists tend to miss) ---
with open("baby_names.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row["name"].strip().lower()
        if name:
            output.add(name)

# --- US surnames (Census-derived, top ~150k) ---
# Only keep reasonably common ones (rank cutoff) — very rare surnames
# are unlikely to collide with real dictionary words anyway, and we
# don't want to accidentally block legitimate common words that happen
# to also be rare surnames.
SURNAME_RANK_CUTOFF = 10000
with open("surnames.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            rank = int(row["rank"])
        except (ValueError, KeyError):
            continue
        if rank <= SURNAME_RANK_CUTOFF:
            output.add(row["name"].strip().lower())

# --- Countries (common name + official name + alt spellings) ---
with open("countries.json", encoding="utf-8") as f:
    countries = json.load(f)
for c in countries:
    output.add(c["name"]["common"].lower())
    output.add(c["name"]["official"].lower())
    for alt in c.get("altSpellings", []):
        output.add(alt.lower())
    # demonyms (e.g. "French", "Japanese") are legitimate dictionary
    # words in their own right (also used as languages/adjectives) —
    # deliberately NOT blocking those, only the country names themselves.

# --- US states ---
with open("us_states.txt", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        output.add(row["State"].strip().lower())

# Strip anything with spaces/punctuation — build_wordlist.py's dictionary
# only ever contains single lowercase alpha tokens, so multi-word
# entries (e.g. "united states") can never match anyway and are just
# noise in the block set.
output = {w for w in output if w.isalpha()}

# --- Allow-list override ---
# Frequency alone can't separate "wisconsin" (a place name that happens
# to be moderately common in text) from "grace" (an everyday English
# word that also happens to be a name) — they can end up with similar
# zipf scores. So: a small manual allow-list of common dual-purpose
# words wins over the automated block list.
#
# NOTE: this is a starter list, not exhaustive — same caveat as the
# rest of the filtering pipeline. Expect to add to this during
# playtesting whenever a legitimate word gets wrongly blocked.
ALLOW_LIST = {
    "will", "grace", "may", "mark", "hope", "rose", "art", "faith",
    "jack", "drew", "hazel", "iris", "ivy", "june", "august", "summer",
    "autumn", "dawn", "sky", "joy", "patience", "prudence", "grant",
    "page", "daisy", "holly", "crystal", "amber", "jasmine", "ruby",
    "pearl", "olive", "bill", "victor", "constance", "chase", "sonny",
    "reed", "wade", "dale", "glen", "earl", "duke", "guy", "trey",
    "chad", "brook", "lane", "clay", "cliff", "forest", "heath",
    "meadow", "sage", "star", "storm", "wolf", "fox", "robin", "wren",
}
output -= ALLOW_LIST

print(f"Built block list with {len(output)} entries (after allow-list override)")

with open("block_list.json", "w", encoding="utf-8") as f:
    json.dump(sorted(output), f, indent=0)

print("Wrote block_list.json")
