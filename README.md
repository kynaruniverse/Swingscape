# Niche — word rarity game

Alphabetical-gap word game: given two bookend words, find any real word
between them, scored by rarity. See `niche-game-design-document.md` for
the full design spec.

## How to get this running, step by step

Your normal workflow doesn't run local installs — you edit in SPCK,
push to GitHub, and let a cloud service (Vercel) do the actual
build. This project uses the same pattern, just with **EAS Build**
(Expo's cloud build service) standing in for Vercel, triggered by
**GitHub Actions** — a tool you already use.

### 1. Get the code into a GitHub repo

- Unzip this project.
- Create a new GitHub repo (e.g. `niche-game`).
- In SPCK Editor: open the repo, add all these files into it (the
  folder structure — `app/`, `preprocessing/`, `.github/` — needs to
  stay intact), commit, and push to `main`. Same process you already
  use for your other projects.

### 2. Create a free Expo account and get a token

This is the one-off setup step — Expo's cloud build service needs to
know it's you.

- Go to **expo.dev** in your phone's browser and sign up (free).
- Go to your account settings → **Access Tokens** → create a new
  token. Copy it — you won't see it again.

### 3. Add the token as a GitHub secret

- In your GitHub repo (via the GitHub website/app, not SPCK): go to
  **Settings → Secrets and variables → Actions → New repository
  secret**.
- Name: `EXPO_TOKEN`. Value: the token you just copied.
- This lets the GitHub Action authenticate to Expo's build servers
  without the token ever living in your code.

### 4. Trigger a build

Two ways, both already wired up in `.github/workflows/eas-build.yml`:

- **Automatic:** any push to `main` that touches files in `app/`
  triggers a build automatically.
- **Manual:** go to your repo's **Actions** tab → select "EAS Build
  (Android APK)" → **Run workflow**. Useful if you want a build
  without pushing a change.

### 5. Download and install the APK

- The GitHub Action itself only *triggers* the build — the actual
  compile happens on Expo's servers (this is the same shape as
  Vercel: GitHub just kicks it off).
- Go to **expo.dev** → your project → **Builds**. You'll see it
  running, then finished, with a **Download** button and a QR code.
- On your Android phone: either scan that QR code, or tap the
  download link directly in your phone's browser, then open the
  downloaded `.apk` to install it. You may need to allow "install
  from unknown sources" the first time.

That's the whole loop — no local Node install, no Android Studio, no
Termux. Push → GitHub Action triggers EAS → download APK → install
on your phone.

## What's built so far

- `preprocessing/` — the offline data pipeline. Run once (on a machine
  with Python — this part genuinely does need running somewhere, see
  note below), output feeds the app.
  - `build_blocklist.py` → `block_list.json` (defense-in-depth proper-noun filter)
  - `build_wordlist.py` → `niche_wordlist.json` (word list + rarity scoring)
  - `build_definitions.py` → merges WordNet definitions into the same file
  - Source data: Ubuntu's `wbritish-large` package (British spelling,
    proper nouns excluded automatically), `wordfreq` for rarity, WordNet 3.0 for definitions
- `app/src/logic/` — pure game logic, framework-agnostic
  - `wordStore.ts` — fast offline word lookups (validity, range, rarity, definitions)
  - `pairGenerator.ts` — fair difficulty-banded pair generation
  - `roundState.ts` — immutable round state (guesses, best find, scoring)
  - `collectionStore.ts` — persists rare finds locally via AsyncStorage
- `app/src/screens/` — `ExploreScreen.tsx` (core unlimited-play loop) and `CollectionScreen.tsx` (saved finds)
- `app/App.tsx` — entry point with tab navigation between the two screens
- `eas.json` + `.github/workflows/eas-build.yml` — cloud build config, see steps above

**Not built yet:** Daily Duel mode, Supabase backend/leaderboards,
monetization, app icons/splash assets, final visual polish.

**Note on the preprocessing step:** the word list (`app/src/data/niche_wordlist.json`)
is already built and committed — you don't need to re-run the Python
pipeline to get the app working. You'd only touch `preprocessing/`
if you want to change the block list, allow-list, or rarity formula
later. That does need a real Python environment (not SPCK), so it's
the one part of this project that doesn't fit the phone-only loop —
worth doing occasionally from any machine with Python when you want
to tune the data, rather than as part of your regular workflow.

## Known issues / open items

- Profanity filtering has not had a real curation pass yet
- The allow-list override in `build_blocklist.py` is a starter list of ~50 common dual-purpose words
- Rarity scoring curve is a starting formula, not tuned against real play yet
- Definition coverage is 87.8% — some adverb-form definitions pull the noun sense of the root word rather than the adjective sense (a real definition, just not always the ideal one)
- None of the app UI has been confirmed running on an actual device yet — the logic layer is fully tested, the UI is not


