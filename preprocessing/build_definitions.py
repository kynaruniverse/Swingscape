"""
NICHE — definitions builder.

Parses the raw WordNet 3.0 data files (installed via apt: wordnet-base)
into a simple word -> short definition mapping, then merges it into
the word list the app ships with.

WordNet file format reference (index.*):
    lemma  pos  synset_cnt  p_cnt  [ptr_symbol]*p_cnt  sense_cnt
    tagsense_cnt  [synset_offset]*sense_cnt
The synset offsets are ordered by decreasing frequency of use, so the
first offset is the most common sense — the one we want.

data.* format:
    synset_offset  lex_filenum  ss_type  w_cnt  [word  lex_id]*w_cnt
    p_cnt  [ptr]*p_cnt  [frames]  | gloss
The gloss is everything after "| " — typically a definition, sometimes
followed by example sentences in quotes separated by semicolons. We
keep just the definition part (before the first semicolon/quote) to
keep this short and reveal-screen friendly.
"""

import json
import re

WORDNET_DIR = "/usr/share/wordnet"
INPUT_WORDLIST = "niche_wordlist.json"
OUTPUT_WORDLIST = "niche_wordlist.json"  # merged in-place

POS_FILES = ["noun", "verb", "adj", "adv"]

# WordNet's standard suffix-stripping rules ("morphy"), used as a fallback
# when a word isn't found directly and isn't in the irregular exception
# file either. Order matters — longer/more specific suffixes first.
SUFFIX_RULES: dict[str, list[tuple[str, str]]] = {
    "noun": [("s", ""), ("ses", "s"), ("xes", "x"), ("zes", "z"),
             ("ches", "ch"), ("shes", "sh"), ("men", "man"), ("ies", "y")],
    "verb": [("s", ""), ("ies", "y"), ("es", ""), ("ed", ""), ("ed", "e"),
             ("ing", ""), ("ing", "e")],
    "adj": [("er", ""), ("est", ""), ("er", "e"), ("est", "e")],
    "adv": [],
}


def load_exceptions(pos: str) -> dict[str, str]:
    """inflected_form -> base lemma, from WordNet's irregular-forms list."""
    exceptions = {}
    with open(f"{WORDNET_DIR}/{pos}.exc", encoding="utf-8", errors="ignore") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) >= 2:
                exceptions[parts[0]] = parts[1]  # first listed lemma
    return exceptions


def lemmatize(word: str, pos: str, exceptions: dict[str, str],
              known_lemmas: set[str]) -> str | None:
    """Best-effort reduction of an inflected word to a WordNet-known lemma."""
    if word in known_lemmas:
        return word
    if word in exceptions:
        return exceptions[word]
    for suffix, replacement in SUFFIX_RULES.get(pos, []):
        if word.endswith(suffix):
            candidate = word[: -len(suffix)] + replacement
            if candidate in known_lemmas:
                return candidate
    return None


def parse_data_file(pos: str) -> dict[str, str]:
    """Returns synset_offset -> short gloss for one POS data file."""
    offset_to_gloss = {}
    with open(f"{WORDNET_DIR}/data.{pos}", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if line.startswith(" ") or not line.strip():
                continue  # header/copyright lines start with spaces
            if "|" not in line:
                continue
            offset = line[:8]
            gloss_raw = line.split("|", 1)[1].strip()
            # Keep just the definition part: split on first semicolon
            # (WordNet convention: definition; "example 1"; "example 2")
            short_gloss = gloss_raw.split(";")[0].strip()
            offset_to_gloss[offset] = short_gloss
    return offset_to_gloss


def parse_index_file(pos: str) -> dict[str, str]:
    """Returns lemma -> first (most common) synset_offset for one POS."""
    word_to_offset = {}
    with open(f"{WORDNET_DIR}/index.{pos}", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if line.startswith(" ") or not line.strip():
                continue
            parts = line.strip().split()
            lemma = parts[0].replace("_", " ")
            if " " in lemma:
                continue  # skip multi-word phrases, our word list is single tokens
            try:
                p_cnt = int(parts[3])
                sense_cnt_idx = 4 + p_cnt  # pointer symbols occupy indices 4..4+p_cnt-1
                first_offset = parts[sense_cnt_idx + 2]  # skip sense_cnt + tagsense_cnt
            except (ValueError, IndexError):
                continue
            word_to_offset[lemma] = first_offset
    return word_to_offset


def build_definitions():
    definitions = {}
    pos_lemma_sets: dict[str, set[str]] = {}
    pos_exceptions: dict[str, dict[str, str]] = {}

    # Order matters: noun senses checked first, then verb, etc. — a word
    # already defined by an earlier POS keeps that definition, since
    # noun/verb senses are generally more central than adj/adv ones.
    for pos in POS_FILES:
        offset_to_gloss = parse_data_file(pos)
        word_to_offset = parse_index_file(pos)
        known_lemmas = set(word_to_offset.keys())
        exceptions = load_exceptions(pos)
        pos_lemma_sets[pos] = known_lemmas
        pos_exceptions[pos] = exceptions

        for word in known_lemmas:
            if word not in definitions:
                gloss = offset_to_gloss.get(word_to_offset[word])
                if gloss:
                    definitions[word] = gloss

        # Also register every irregular inflected form directly, so
        # e.g. "abaci" resolves without needing lemmatization at all.
        for inflected, lemma in exceptions.items():
            if inflected in definitions or lemma not in word_to_offset:
                continue
            gloss = offset_to_gloss.get(word_to_offset[lemma])
            if gloss:
                definitions[inflected] = gloss

    return definitions, pos_lemma_sets, pos_exceptions


def main():
    print("Parsing WordNet data files...")
    definitions, pos_lemma_sets, pos_exceptions = build_definitions()
    print(f"Built {len(definitions)} definitions")

    with open(INPUT_WORDLIST, encoding="utf-8") as f:
        wordlist = json.load(f)

    matched_direct = 0
    matched_lemma = 0
    for entry in wordlist:
        word = entry["word"]
        d = definitions.get(word)
        if d:
            entry["definition"] = d
            matched_direct += 1
            continue

        # Not found directly — try reducing it to a base form via
        # suffix rules across each part of speech.
        found = False
        for pos in POS_FILES:
            lemma = lemmatize(word, pos, pos_exceptions[pos], pos_lemma_sets[pos])
            if lemma and lemma in definitions:
                entry["definition"] = definitions[lemma]
                matched_lemma += 1
                found = True
                break

        # Cross-POS fallback: WordNet rarely indexes derived "-ly"
        # adverbs directly (e.g. "aberrantly" isn't listed, but its
        # base adjective "aberrant" is) — strip "-ly" and check the
        # adjective lemma set specifically, not the adverb one.
        if not found and word.endswith("ly") and len(word) > 3:
            candidate = word[:-2]
            if candidate in pos_lemma_sets["adj"] and candidate in definitions:
                entry["definition"] = definitions[candidate]
                matched_lemma += 1

    total_matched = matched_direct + matched_lemma
    print(f"Matched definitions for {total_matched}/{len(wordlist)} words "
          f"({total_matched / len(wordlist) * 100:.1f}%) "
          f"— {matched_direct} direct, {matched_lemma} via lemmatization")

    with open(OUTPUT_WORDLIST, "w", encoding="utf-8") as f:
        json.dump(wordlist, f, separators=(",", ":"))

    print(f"Wrote {OUTPUT_WORDLIST} with definitions merged in")


if __name__ == "__main__":
    main()
