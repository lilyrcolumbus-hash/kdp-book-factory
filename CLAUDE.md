# KDP Book Factory

## Project Overview
Web-based PDF book generation tool for Amazon Kindle Direct Publishing (KDP). Vanilla JS / jsPDF, no build step. **Production-ready end-to-end pipeline as of 2026-05-09: Stage 0 research dashboard (with optional MEGA mode for 1 Sonnet run instead of 4) → 6-stage wizard → fal.ai cover + interior automation → automated PDF compile → KDP-ready output. Cost per fully-automated book ≈ $1.10.**

**URL local:** http://localhost:8765/ (corre con `python3 -m http.server 8765` desde el repo root)

**Idioma de la UI:** **English** (US KDP market). Comunicación con el dueño/usuario en español, código y producto en inglés (memoria personal).

**Storage:**
- **IndexedDB** `kdp-book-factory` / store `book_ideas` / key `all` — book ideas (research drafts). Replaced localStorage 2026-05-07 to eliminate quota issues. Auto-migrated from legacy localStorage on first boot.
- `localStorage['bw_projects']` — `{active, list[]}` of book projects (wizard data + asset images)
- `localStorage['falai_api_key']` — fal.ai API key (used for both Phase A cover gen + Phase B interior gen)
- `localStorage['bw_book_ideas']` — DEPRECATED, auto-cleared after migration to IDB
- `localStorage['bw_legacy_cleaned_v1']` — one-time flag, removes orphan projects without a linking Book Idea

## Sprint 8 changes — 2026-05-14

### Deploy to Cloudflare Workers + Static Assets (DONE 2026-05-14)

**Live URL:** https://kdp-book-factory.lilyrcolumbus.workers.dev

Deployed via **Workers + Static Assets** (NOT classic Pages — Cloudflare's new "Create application" wizard routes static sites through Workers now). Same Cloudflare account as SiteSafe/SmartGrowth (`ae34fffdc22f7b4446e782a4188c9946`), but a **separate project**. No shared settings, env vars, or domain routing.

**Why Workers instead of Pages:** the user clicked "Create application" → Cloudflare's UI defaulted to the Workers flow with `npx wrangler deploy` as the deploy command. Functionally equivalent for static sites; the only diff is the URL pattern (`*.workers.dev` vs `*.pages.dev`).

**Config files added at repo root:**
- `wrangler.jsonc` — `assets.directory = "./"`, `not_found_handling = "single-page-application"` so any unknown route falls back to `index.html` (which loads the tab UI client-side).
- `.assetsignore` — excludes `.git/`, `node_modules/`, `*.md`, `*.mjs`, `*.pdf`, `n8n/`, `research/`, `package*.json`, `wrangler.jsonc` from the asset upload. Without this the first deploy uploaded 4918 files including the full git history (verified `/.git/HEAD` returned 200 — fixed by re-deploying with the ignore list).

**Auto-deploy** triggered on every push to `main` (same workflow as her other two CF projects).

### PWA setup — installable as iPhone app (DONE 2026-05-14)

User asked for the platform to work like an installed app on her iPhone. PWA approach lets her "Add to Home Screen" from Safari and launch the site fullscreen with its own icon, no browser chrome.

**Files added:**
- `manifest.json` — `name: KDP Book Factory`, `short_name: KDP Books`, `display: standalone`, `theme_color: #C8602F`, `background_color: #FBF6EC`, points at `icon.svg` for both `any` and `maskable` purpose
- `icon.svg` — two-book composition (cream + ochre) on terracotta rounded-square background, scales for any size since SVG. iOS 14+ accepts SVG for `apple-touch-icon`.
- `icon-maskable.svg` — simpler centered variant for Android's maskable area (10% safe padding all around).

**Meta tags added to `index.html`:**
- `viewport=width=device-width,initial-scale=1,viewport-fit=cover` (replaces older static viewport)
- `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title="KDP Books"`, `mobile-web-app-capable`
- `link rel="manifest"`, `link rel="apple-touch-icon"`, `link rel="icon"`

### Mobile CSS hardening (DONE 2026-05-14)

Existing `@media (max-width: 768px)` block had base coverage but missed iPhone-specific ergonomics. Added to `theme-warm.css`:

- **Tab nav scrolls horizontally** instead of wrapping to multiple lines on narrow widths (`overflow-x: auto`, `flex-wrap: nowrap`, hidden scrollbar). Same for `#bw-stages-nav`.
- **Mascot grid collapses to 1 column** under 768px (was 2 cols by default).
- **40px min tap targets** on buttons / mascot cards / style cards / palette cards — iOS Human Interface Guidelines minimum.
- **`-webkit-tap-highlight-color: transparent`** to kill the gray flash on tap.
- **`env(safe-area-inset-*)`** respected in standalone mode so content doesn't get hidden behind the notch / home indicator.
- **Long prompts and code blocks** get `word-break: break-word` so they don't trigger horizontal page scroll on narrow widths.

### How the user installs the app on iPhone (workflow for future reference)

1. Open `https://kdp-book-factory.lilyrcolumbus.workers.dev` in Safari (NOT Chrome — iOS only installs PWAs from Safari)
2. Tap the Share button (square with arrow up) at the bottom of Safari
3. Scroll down → **"Add to Home Screen"**
4. Confirm name (defaults to "KDP Books" thanks to `apple-mobile-web-app-title`)
5. Tap **Add** → icon appears on home screen with the terracotta "two-book" art
6. Launching from the home-screen icon opens the platform fullscreen with no Safari UI

**Caveat — localStorage is per-device.** A book started on Mac stays on Mac; iPhone has its own separate localStorage. Cross-device sync requires Sprint 9 (Supabase migration, still pending). For now the iPhone version is a separate workspace.

---

## Sprint 7 changes — 2026-05-13

Live test session with the user generating the cover in OpenArt with the Vol 1 variety-puzzle:for-teens preset. Three drops focused on **honest model recommendations** + **end-to-end platform connectivity** so future books with different mascots/niches don't blindly inherit Vol 1's hardcoded assumptions.

### Failure that triggered this sprint — character LoRA substituted the brain mascot (2026-05-13)

**Symptom:** user followed the OpenArt setup card recommendation ("Model or Character: American comic sketch") and pasted the verbatim cover prompt (pink brain mascot with sunglasses + headphones). OpenArt produced 3 cartoon teen GIRLS, no brain anywhere. Yellow palette + comic style + puzzle pieces all rendered correctly — the mascot was silently dropped.

**Root cause:** "American comic sketch" is a **character LoRA**, not a style overlay. It's trained on Genrih Valk-style human comic portraits — when a prompt asks for a non-human subject (pink brain, robot, owl), the model substitutes the closest human it knows. The recommendation didn't fail at the prompt level; it failed at the model selection level. The wrong tool for any mascot-driven cover.

**What I documented as "verified" was actually unverified for mascot use.** Earlier prompts described "American comic sketch" as appropriate for variety-puzzle:for-teens based on its presence in OpenArt's UI + the Wimpy Kid stylistic match. Never tested with a mascot prompt. Fix: stop calling things "verified" without running the actual case.

### Dynamic model resolver — `iwResolveModel(project)` in `js/image-workflow.js`

**Replaces** `IW_OPENART_PRESETS` static lookup. Reads the project state (`positioning.niche` + `style.mascot.has` + `style.mascot.type` + `style.visualStyle` + `style.palette`) and returns `{model, why, negativePrompt}` with no guessing.

**Universe of recommended models — confirmed to exist on OpenArt:**
- **Flux Dev** — base model, no character bias. Default for: mascots, objects, line art, scenes, photorealistic, watercolor, minimalist. Follows prompt literally, never substitutes.
- **American comic sketch** — character LoRA. ONLY used when cover is a human character in `comic-wimpy-kid` visualStyle without a mascot. Validated against user's cluster (Genius Girls, La Bibli des Ados).

**Explicitly NOT recommended** (any of these would be guessing): CartoonStyle XL, Watercolor SDXL, ColoringBook XL, Animagine XL, DreamShaper, LineArt SDXL, Ideogram-v2 (last one is fine but unused — we overlay text at compile time, no text-in-image needed). When a niche needs a specialized look (coloring line art, watercolor pastel), the strategy is "Flux Dev + prompt-controlled style", NOT "find a LoRA that may not exist".

**Decision tree (in priority order):**
1. **mascot.has = true** → `Flux Dev` + negative prompt with `human face, person, girl, boy, child, woman, man` guards. Reason: any character LoRA replaces mascots silently.
2. **No mascot + visualStyle=`comic-wimpy-kid` + niche ∈ {variety-puzzle, activity-book, workbook-edu, destructive-journal}** → `American comic sketch`. Human-character cover in comic style — the LoRA's wheelhouse.
3. **niche=`coloring-book`** → `Flux Dev` + line-art negatives (`color, shading, gradient, sketch lines, hatching`). LoRAs introduce shading by default.
4. **visualStyle=`photorealistic`** → `Flux Dev` with anti-cartoon negatives.
5. **Everything else** (aesthetic-pinterest, classic-clean, fantasy-ya, gaming-neon, retro-vintage, punk-sketch, watercolor-soft, bold-geometric, default) → `Flux Dev`. Style is controlled by the prompt text, not by a LoRA.

### OpenArt setup card — connected-to-stages UI (2026-05-13)

The card at the top of `iw-panels` (rendered by `iwRenderOpenArtConfig`) now shows the user **exactly what state the platform read** before recommending a model, so the connection is transparent:

```
🎨 OpenArt Setup para este libro     variety-puzzle · trim 6x9

Conectado a tus stages:
  niche=variety-puzzle:for-teens · visual style=comic-wimpy-kid ·
  palette=comic-yellow · 🐱 mascota: pink cartoon brain with sunglasses + headphones

Model or Character: Flux Dev
Aspect ratio: 2:3 portrait (1024×1536)
Negative prompt: …human face, person, girl, boy, child… [Copy]

Mascota detectada: "pink cartoon brain…". Flux Dev sigue el prompt literal
sin reemplazarla por una persona…
```

**Fields the user asked to remove** (user feedback: "lo que no debo tocar no lo pongas en la plataforma para no confundirme"):
- ~~Custom Settings: None (no tocar)~~ — left at default in OpenArt, user never touches it, doesn't need to see it
- ~~Auto Enhance: OFF~~ — same reasoning
- ~~Style / Style Palette tab / Suggested palettes~~ — redundant with Model name now that we recommend specific models
- ~~Multiple models list (Flux Dev · Animagine XL · CartoonStyle XL · DreamShaper)~~ — confused the user into overriding Model after picking a Character preset, which clobbered the LoRA

**Card now shows only fields the user actively sets in OpenArt:** Model or Character, Aspect ratio, Negative prompt (with Copy button). Plus the "Conectado a tus stages" transparency line + a one-sentence "why this model" explanation.

### Mascot-aware prompt resolution — `iwResolvePrompt(rawPrompt, project)`

**Problem this solves:** prompts in `IW_BOOKS['mega-brain-games-vol1'].pages[].prompt` are hardcoded for the pink-brain mascot — they literally include `"cute pink cartoon brain (#FF6B9D) with personality, wearing big black sunglasses…"` across all 11 slots. If the user picks a different mascot in Stage 2 (Robot Sidekick, Detective Animal, Pencil Squad, or types a custom mascot), the platform was silently sending them to OpenArt with prompts pointing at the wrong character. Same problem inverted for `no-mascot` selection.

**Resolution at render+copy time** (does not mutate IW_BOOKS — the catalog stays as the canonical pink-brain template):

```
mascot.has = false                          → iwPromptStripMascot()
mascot.id = 'brain-cartoon-pink'            → return raw (default match)
mascot.type matches /pink.+brain/i          → return raw
anything else                               → iwPromptSubstituteMascot(rawPrompt, mascot.type)
```

**Strip path (`iwPromptStripMascot`)** uses regex sentence-substitution to replace mascot mentions with object/typography alternatives:
- `CENTER: large cartoon mascot character — …` → `CENTER: bold composition of sample puzzles, decorative typography, and themed objects (no character).`
- `SCENE: cute pink brain mascot character (#FF6B9D)…` → `SCENE: composition of themed environment elements only — no character.`
- Corner-cluster mascot sentences → "stars, doodles, and themed icons only"
- `Mascot is focal point…` → `Themed objects are the focal point.`

**Substitute path (`iwPromptSubstituteMascot`)** rewrites brain-specific descriptors with the user's mascot string. Long-form descriptions are matched first so the "wearing big black sunglasses, wide friendly grin, blue gaming headphones over the top" qualifier gets replaced atomically, not left dangling after a shorter "pink brain" substitution.

**Wiring:** `iwCopyOnly`, `iwCopyAndOpen`, and the `iw-prompt` `<div>` rendered inside each panel all call `iwResolvePrompt(page.prompt)` before showing/copying. The user copies the resolved prompt — never the raw template — so what they paste into OpenArt always matches what's in their wizard.

**Honest limitation documented:** the IW_BOOKS catalog currently has only `mega-brain-games-vol1` (variety-puzzle:for-teens slot set: Word Hunters / Number Ninjas / Math Squad / Maze Runners / Code Breakers / Picture Detectives, plus cover/welcome/quote/solutions). The mascot substitution is **mascot-aware but niche-blind** — if the user creates a coloring book or journal in the wizard, the Imágenes IA tab still shows puzzle-book panels with ninja/detective/chalkboard scenes that don't apply. Real fix requires building IW_BOOKS catalog entries per niche OR a full template-driven prompt generator. Not blocking Vol 1 — variety-puzzle is what's shipping.

### User feedback patterns captured this sprint

These shape what gets shown vs hidden in the platform:
- **"No inventes nada"** — don't fabricate model/LoRA names; only recommend what I can confirm exists on OpenArt. The cost of one wrong model name is a failed generation + lost user trust.
- **"Lo que no debo tocar no lo pongas en la plataforma para no confundirme"** — UI surface should show only fields the user actively sets. Default-and-don't-touch fields belong in code comments, not the card.
- **"La plataforma debe estar conectada según lo que yo escogí en los estados anteriores"** — every recommendation downstream of the wizard must derive from `bwGetActive()` state, never be hardcoded for one book's preset.
- **"Sin equivocaciones"** — when in doubt about a model match, default to Flux Dev (safe, prompt-controlled). Don't gamble on a stylized LoRA that might have biases.

### CSS additions in `theme-warm.css`

- `.iw-openart-config-tag` — green badge for "🐱 mascota: <type>" (and muted variant for "sin mascota")
- `.iw-openart-config-connected` — surface row showing the project state the resolver read (niche / style / palette / mascot tag), with inline `<code>` chips for each field
- `.iw-openart-config-why` — sage-bordered explanation block below the grid

---

## Sprint 2 changes — 2026-05-01

Three feature drops on top of the 2026-04-30 hardened pipeline:

### Authors — KDP-mirror UI (Stage 1)
- Replaced single `authorPenName` text field with structured **Primary Author** (`prefix`/`firstName`/`middleName`/`lastName`) + array of **Contributors** (up to 9) with role dropdown matching KDP's exact list: Author, Editor, Foreword, Illustrator, Introduction, Narrator, Photographer, Preface, Translator.
- New helper `bwGetAuthorString(project)` composes the cover/copyright string. Two contributors with role `Author` → `Name 1 & Name 2` on cover. Other roles (Illustrator, Editor, …) appear on copyright/about-author but NOT in the cover author line.
- `bwMigrateAuthorFields(project)` is idempotent and runs from `bwGetAuthorString` — backfills `authorPrimary` from legacy `authorPenName` (best-effort name split) and converts `coAuthor` → first contributor with role `Author`. Legacy fields are kept in sync as derived mirrors so older code paths still work.
- Compile uses the helper in 3 places: `bcRenderCopyrightPage`, `bcRenderAboutAuthorPage`, cover-back signature.

### Hardcover pricing & compliance fixed (Stage 4)
**Bug fixed:** prior code calculated print cost & royalty for paperback only — toggling hardcover did nothing. Now:
- `bwCalcPrintCost(interior, pages, trim, format)` — `format='hardcover'` swaps base fee from `$0.85` → **`$6.80`** (KDP 2026 hardcover base). Per-page cost stays the same. Large-trim surcharge skipped for hardcover (KDP pre-restricts hardcover trims).
- Stage 4 royalty box now shows **two cards** when both formats are checked (paperback green/sage, hardcover ochre).
- Format checkboxes trigger `bwRenderStage4(el)` so the royalty cards re-render instantly.
- Compliance validates hardcover **separately**:
  - Negative margin → `error` `-25`
  - <$1 margin → `warn` `-10`
  - Hardcover-only KDP rules: min 75 pages, max 550 pages, NO 8.5×11 / `letter` trim
- Migration: existing books with hardcover ticked but never validated will surface real issues on next render.

### Pacing system + Mission Arc compile (Stage 3 + book-compile.js)
**Why:** previous compile rendered all puzzles of one type back-to-back (30 word searches, then 30 sudokus, then 60 math…). Workbook ergonomics, not teen engagement. User feedback called this out — kids drop the book by page 40.

- New field `content.pacing`: `sequential` (default), `mission-arc` (functional), `rotating` and `boss-build` (UI shown but compile falls back to mission-arc — labeled "coming soon").
- New Stage 3 card "🌀 Pacing" with the 4 options as clickable cards.
- New compile orchestrator `bcCompileMissionArc(doc, project, sections, tw, th, onProgress)`:
  - Builds chunk schedule: `numMissions = clamp(round(totalPuzzles / 14), 4, 8)`. Each section split as evenly as possible across missions (base + 1 extra to first N missions).
  - Mission divider page per mission with name + tagline. Default mission names hard-coded for Brain Squad theme: Recon, Field Training, Counterintel, Squad Goals, Pressure Test, Final Approach, Boss Level, Victory Lap. Override via `project.content.missions[]`.
  - Solutions grouped by section type at end (unchanged — easier to navigate).
- `bcRenderPuzzlesForSection` now takes `opts.startIdx` / `opts.renderCount` so callers can render a slice. Loops re-keyed: `for k=0..count` with `i = startIdx + k` for global index (used in puzzle numbering and theme rotation). Math/sudoku per-page batching uses `(startIdx + count)` as upper bound.
- `bwCompileBook` dispatches: if `pacing` is interleaved-family AND any section has count > 0 → `bcCompileMissionArc`. Else sequential (legacy path preserved).

### Preset recalibration — variety-puzzle:for-teens
**Before:** 30 wordsearch + 30 sudoku + **60 math** + 25 mazes + 25 cryptogram = 170 puzzles, 180 pages, $11.99 paperback. The 60-math block felt like homework.
**After:** 25/25/25/25/25 = 125 puzzles, 130 pages, **$9.99 paperback** (more competitive entry price, similar margin), `pacing: 'mission-arc'`, `difficulty: 'progressive'`. Subtitle hook updated to "125+ Puzzles".
**Reasoning saved as comment in the preset** so this isn't lost.

### Storage management (Stage 6)
- New helpers `bwGetStorageStats()`, `bwGetUnusedAssetSlots(project)`, `bwCleanupUnusedAssets(project)`.
- Stage 6 Assets card now has a **Storage bar** (top of grid): used KB / cap (~10240 KB Chrome) + active project size + unused image count. Color shifts sage → ochre → terracotta as % rises.
- **🧹 Clear unused images** button: removes asset slots whose ID isn't in `bcGetRequiredSlots(project)` (orphans from deleted sections, changed page treatment).
- **📊 Breakdown** button: alert listing every project with size in KB, image count, ★ marking the active. User deletes via header dropdown + 🗑️ Delete.
- Background: localStorage capacity ~10MB in Chrome but base64 dataUrls fill it fast (typical cover front ~800KB-1.5MB). Real fix is IndexedDB migration (P8 #31 in audit) but the cleanup tool buys time.

## Sprint 6 changes — 2026-05-10 → 2026-05-12

Live test session with real Sonnet research output (variety-puzzle:for-teens). User goal: terminar Vol 1 hoy. Fixes are reactive to the friction the user hit going Stage 0 → Apply → Stage 1 → compile → OpenArt manual (no fal.ai credit yet).

### Synthesizer hardening — `js/research-import.js` (2026-05-11)

Three bugs caught while reviewing the Decision Dashboard with a real cluster:

**1. Title prefix "Mascot:" leaked from differentiator.** User picked "Mascot + narrative wrapper" as a Stage 0 differentiator → synthesizer used the first word as title prefix → produced "Mascot: 150+ Puzzles for Teens Ages 11-15" as proposal #1. "Mascot" is a *style descriptor*, not a brand name — it doesn't work as a title prefix. **Fix:**
- Added `GENERIC_DIFF_TERMS` regex catching catalog descriptors: `mascot|narrative|wrapper|tone|format|theme|layout|illustration|illustrated|aesthetic|minimalist|vintage|modern|interleaved|progressive|difficulty|paper|hardcover|paperback|cover|interior|font|color|colour|black\s*and\s*white|bw`
- Added `BRAND_FALLBACK` map per niche-key: variety-puzzle → "Brain Squad", word-search → "Word Quest", sudoku → "Number Ninja", coloring-book → "Color Garden", journal-prompts → "Soul Letters", planner → "Daily Compass", workbook-edu → "Smart Steps", destructive-journal → "Wreck Squad", health-tracker → "Body Log", activity-book → "Boredom Buster"
- When `diffPrimary` matches generic regex → use brand fallback. Custom-typed differentiators that look brand-like still pass through unchanged.

**2. Subtitle flop when reception cluster had no praise data.** Default subtitle was `${itemCount} ${nicheLabel} designed for ${audience}${ageHint}` — generic and forgettable. **Fix:** `SUBTITLE_HOOK_BY_NICHE` map with niche-specific subtitles listing actual content types + value-prop angle. variety-puzzle → "150+ word searches, sudoku, mazes, math & cryptograms — screen-free fun for teens ages 11-15". Praise themes only appended when reception has 2+ books (real signal, not single-book leak).

**3. "150++" double-plus in description bullets.** `itemCount` already carried the `+` suffix; templates appended another → "150++ puzzles". **Fix:** removed the trailing `+` from the two affected template strings (fallback hookline + bullet list).

### Wizard self-heal — `bwRender` reads from storage when in-memory is null (2026-05-11)

**Bug:** after Apply, dashboard handler did `window.bwCurrentProject = bwGetActive()` to update the wizard's pointer. Didn't work — `bwCurrentProject` in `book-wizard.js:1072` is declared `let` (module-scoped), so the `window.` assignment created a separate global property without touching the actual variable. `bwRender` then read the real `bwCurrentProject` (still null) and hid the wizard (`#bw-app display:none`). User saw the green toast "✅ Applied — review Stage 1" but the wizard never appeared below the dashboard.

**Fix:** `bwRender` now self-heals at entry — if `bwCurrentProject` is null but `bwLoadAll().active` points at a valid project in storage, pull it back into the module-scoped variable before rendering. Resilient: any caller that updates active-id in localStorage and triggers `bwRender` works without needing to assign the variable from outside the module.

Tradeoff: makes `bwCurrentProject` effectively derived from storage on every render. Acceptable because (a) it's already meant to mirror storage, (b) the localStorage read is cheap, (c) eliminates a class of "module-scope variable can't be reached from caller" bugs.

### UX — sticky stage nav + auto-scroll on switch (2026-05-12)

User feedback: stages accumulated vertically as they scrolled, no easy way to jump back to a previous stage without scrolling all the way up. Two fixes:

- **`#bw-stages-nav` is now `position: sticky; top: 0; z-index: 50`** in `index.html` inline CSS. The 6 stage buttons stay pinned at the top of the viewport while user scrolls through any stage's content. One-click jump to any stage.
- **`bwSwitchStage` auto-scrolls** `#bw-stages-nav` into view after rendering. Previously, switching stages left the viewport wherever it was — clicking "Stage 3" from the bottom of Stage 1 left you reading Stage 3's footer. Now you land at the top of the stage you clicked.

### OpenArt config card in "Imágenes IA" panel (2026-05-12)

User insight: OpenArt has a **Style Palettes** UI (tabs: All / Fantasy / Anime / Comic & Cartoon / Illustration / Art Media / Art Style / Photography / Gaming) with sub-palettes per tab (e.g. Comic & Cartoon → "American comic sketch #1", "Cean comic", "Early 30s", "Retro comic", "Jack Kirby", "World of tintin", etc.). Picking the right palette tab + sub-palette + model + aspect ratio per niche is non-obvious — every book has different visual language. User asked for a setup card emergent in the platform so each book's correct OpenArt settings are spelled out.

**Implementation in `js/image-workflow.js`:**

- New `IW_OPENART_PRESETS` map (10 niches): each entry has `style` (description), `paletteTab` (the OpenArt tab name to click), `paletteSuggestions` (2-3 specific sub-palettes to try first), `models` (model names that match), `negativePrompt` (niche-tuned negative).
- `iwGetOpenArtConfig()` reads `bwGetActive()` to get the current project's `positioning.niche` + `technical.trimSize`, looks up the preset, and computes aspect ratio from the trim:
  - 6x9 → "2:3 portrait (1024×1536)"
  - 7x10 → "7:10 portrait — pick 2:3 if not listed"
  - 8.5x11 → "17:22 portrait — pick 3:4 if not listed (1024×1365)"
  - 5x8 → "5:8 portrait"
  - 8x10 → "4:5 portrait (1024×1280)"
  - 8.25x6 → "11:8 landscape"
- `iwRenderOpenArtConfig()` returns an HTML card rendered at the top of `iw-panels`. Fields shown: Style, Style Palette tab, Suggested palettes, Model, Aspect ratio, Negative prompt (with **📋 Copy negative** button), and a hint to ignore the Image Guidance accordions.
- `iwCopyNegativePrompt()` copies the niche's negative prompt to clipboard.

**Fields intentionally NOT shown** (user feedback: "no es relevante"):
- ~~Auto Enhance toggle~~ → removed
- ~~Number of Images~~ → removed
- ~~Custom Settings dropdown~~ → removed

**Order of card fields** (user feedback): Style → Style Palette tab → Suggested palettes → Model → Aspect ratio → Negative prompt.

**CSS in `theme-warm.css`:** new `.iw-openart-config` block — dashed orange-accent border, 2-column grid (collapses to 1-col under 700px), monospaced `<code>` for the negative prompt.

**Honest caveat documented in code:** the sub-palette suggestions for niches outside Comic & Cartoon (e.g. "Children's book illustration" for word-search, "Watercolor" for journal-prompts, "Bauhaus" for planner, "Line art" for coloring-book) are *plausible* OpenArt palette names but haven't been verified against the actual UI for those tabs. For variety-puzzle the names are confirmed against a screenshot. If a name doesn't exist verbatim in OpenArt, user picks closest match in the indicated tab.

### Honest scoping conversation — stages 1-6 vs. KDP backend (2026-05-11)

User asked: "estos requerimientos que son como KDP, qué sentido tienen hacerlo aquí si los voy a llenar en Amazon de nuevo?" Valid critique. Honest answer documented for future reference:

**Fields that MUST live in the platform** (they get printed into the PDF):
- Primary author firstName + lastName (Stage 1) — goes on cover, copyright page, About-Author page. Without it the PDF literally says "The Author".
- Trim size (Stage 4) — defines PDF page dimensions.
- Title + subtitle (Stage 0/Apply → Stage 5) — printed on the cover image overlay.
- Cover image + interior images (Stage 6).

**Fields that are platform-duplication of KDP** (compliance score / preview only, NOT printed in the PDF):
- BISAC categories (Stage 5) — KDP backend only.
- 7 backend keywords (Stage 5) — KDP backend only.
- AI disclosure checkbox (Stage 6) — KDP backend only.
- Pricing (Stage 4) — useful for royalty preview, but KDP asks again.
- Description (Stage 5) — useful to have queued for copy-paste into KDP, but doesn't go to the PDF.

**Decision:** documented in user-facing reply that for the fastest path to a finished book, the user can skip Stage 5 entirely and fill BISAC/keywords/AI disclosure/description directly in KDP at upload time. Compliance score 74 (or similar) is enough to compile. The platform doesn't enforce them as blockers.

This is a UX truth worth preserving — future sprints should consider hiding or graying the KDP-duplication fields by default with a "show optional KDP prep" disclosure, instead of treating them as in-flow blockers. Not done in this sprint; just noted.

### Verified: fal.ai key auth path + balance gating (2026-05-12)

User pasted their fal.ai key for validation. Test via `curl POST https://fal.run/fal-ai/flux/schnell` with a trivial prompt returned **HTTP 403 + `{"detail": "User is locked. Reason: Exhausted balance."}`**. Key auth IS valid (no 401), account just has no funds.

**Learnings worth keeping:**
- fal.ai distinguishes "bad key" (401/403 generic) from "out of credit" (403 with "Exhausted balance" body). Both produce 403; only the body tells you which. The existing error mapping in `js/image-gen.js` doesn't parse the response body for the "Exhausted balance" case — could surface a clearer toast like "Add credit at fal.ai/dashboard/billing" instead of the generic 403 message. Not fixed this sprint.
- fal.ai minimum top-up is **$10** (not $1 as the older Phase A copy implied). $10 covers ~9 books at $1.10/book. The "Get one here ($1 free credit)" hint in the Phase A card is misleading post-2026 policy change — should be updated to "fal.ai/dashboard/billing — $10 min top-up, ~9 books per refill".
- Realistic alt path for users who don't want to pay: OpenArt manual with the Infinite plan (path B from CLAUDE.md). The new `iwRenderOpenArtConfig` card makes this path equally guided.

### Confirmed flow — texts come from the platform, NOT from OpenArt (2026-05-12)

User asked: "¿quién hace los textos del libro?" Documenting the 3-layer answer for future ref:

1. **Cover texts** (title, subtitle, author, spine, back-cover description) — `book-compile.js` renders them via jsPDF *on top of the OpenArt image* when user clicks **🎨 Compile Cover Wrap PDF**. That's why every OpenArt prompt ends with `"No text, no letters, no words"` — the image is the background, text is overlaid at compile time. Source: `project.marketing.title` / `subtitle` / `description` + `bwGetAuthorString(project)`.

2. **Interior chrome** (copyright page, welcome, section dividers titles, about-author, "Vol 2 coming soon") — rendered programmatically by `bcRenderTitlePage` / `bcRenderCopyrightPage` / `bcRenderWelcomePage` / `bcRenderSectionDivider` / `bcRenderAboutAuthorPage`. Interior divider images reserve top ~25% as blank space so the section title overlays cleanly.

3. **Puzzles themselves** (wordsearch grids, sudoku numbers, math equations, mazes, cryptograms) — generated by the puzzle algorithms in `book-compile.js`, deterministic seeds per project. NOT IA. Parameters come from Stage 3 Content (count, difficulty, topics).

The user's compiled Interior PDF (148 pages) already had every text + puzzle inside — only the background images were missing. Once OpenArt-generated images get uploaded to the Assets Manager, recompile combines them.

### Hardcoded OpenArt prompts caveat (carried from Sprint 4, re-confirmed 2026-05-12)

`js/image-workflow.js` IW_BOOKS catalog has prompts hardcoded for the original `mega-brain-games-vol1` preset (variety-puzzle:for-teens + pink brain mascot + Wimpy Kid/Big Nate style + 6×9 + yellow/cyan/coral palette). They do NOT dynamically read `bwCurrentProject` — if user picks a different niche (sudoku, coloring, journal), the prompts wouldn't adapt. For variety-puzzle:for-teens with mascot the existing prompts coincide 100% with what Stage 0 + Apply produces. Future work: derive prompts dynamically from `project.style.palette` + `project.style.mascot` + `project.style.visualStyle` for niche-agnostic support. Not blocking Vol 1.

---

## Sprint 5 changes — 2026-05-08 → 2026-05-09

Focused session: live testing the Stage 0 → wizard → cover gen flow with real Sonnet research output. User goal explicit: "no perfeccionar, solo avanzar bien para terminar la plataforma". Fixes are reactive to real friction the user hit while running variety-puzzle:for-teens through end-to-end.

### Synthesize button stale state (2026-05-08)
**Bug:** user typed/pasted into Group A textarea but Synthesize button stayed `disabled` ("needs research"). Cause: button render reads from `idea.groupAText` at render time, blur handler saved to idea but didn't re-render. **Fix:** blur handler now replaces the button HTML in place + re-wires its click handler. Plus an `input` listener on each textarea flips disabled→enabled live as the user passes 50 chars (no need to wait for blur). Refactored synthesize click logic into a separate `dd0HandleSynthesize(idea)` function so the re-wired button and the original render path share the same handler.

### Description leak from single Group B book (2026-05-09)
**Bug:** with only 1 travel-themed book in Group B (Road Trip Game Book), the description synthesizer pulled `marketing.descHooks[0]` directly — leaked "Long car rides, delayed flights..." into a generic teen puzzle book description. **Fix:** rewrote `bwSynthesizeAll`'s description block to be niche+differentiator-driven instead of hook-leaked:
- Niche-aware hook templates (10 niches): `'variety-puzzle' → "Tired of puzzle books that talk down to teens like they're 8? Same."`
- Bullets prefer praise themes from cluster (Group C), fallback to differentiator-derived
- Pain-points block only renders if 2+ pain themes consensual (real signal, not single-book leak)
- CTA niche-flexible: kid/teen niches → "screen-free time, road trips, gift", adults → "no-fluff [niche] you'll actually use"

### Mascot differentiator → project.style.mascot
**Gap:** user picked "Mascot + narrative wrapper" as a Stage 0 differentiator but cover gen still produced covers WITHOUT mascot. Cause: `bwApplyClusterToProject` set `clusterPalette` and `differentiators` but never flipped `project.style.mascot.has`. **Fix:** apply step now scans differentiators for /mascot/i regex; if matched, sets `mascot.has = true` and assigns a niche-aware default type:
- variety-puzzle / activity-book → "pink cartoon brain mascot with sunglasses and headphones"
- journal → "celestial spirit mascot, pastel colors, mystical vibe"
- word-search / sudoku → "wise owl mascot with reading glasses"
- coloring → '' (coloring books don't use mascots, type left blank)
- fallback → "friendly cartoon character mascot"

### Keyword leak fix — count unique books, not occurrences (2026-05-09)
**Bug:** with 3 books in Group B, the keyword cluster picked up "road trip travel activity" because the single Road Trip book repeated those words 4× each. The minCount filter (2) counted total occurrences, not unique books. A single book repeating a word polluted the cluster. **Fix:** rewrote keyword extraction to count UNIQUE BOOKS containing each word. Now requires word to appear in 2+ distinct books to enter cluster. Total occurrences only used as tie-breaker when book-counts are equal. Verified with simulation: "puzzles" (in 3 books) and "games" (in 2 books) make it; "travel"/"road"/"trip" (in 1 book) get rejected even with high total counts.

### Niche keyword seeds (2026-05-09)
**Gap:** even with the unique-books fix, sparse Group B (1-2 books) produces few or zero valid cluster keywords. Apply step would leave KDP backend keywords empty. **Fix:** new `_riSeedKeywordsForNiche(niche, clusterKws)` helper with curated seed lists per niche (12 niches × 7 KDP-style buyer-intent phrases). Examples:
- variety-puzzle:for-teens → ["puzzle book for teens", "brain games for teens", "activity book ages 11 15", "gift for 12 year old", "gift for 13 year old", "screen free activity teens", "summer activity book teens"]
- word-search:large-print-seniors → ["large print word search seniors", "word search puzzle book elderly", "brain games for seniors", "gift for grandma", "cognitive exercise seniors", ...]

When cluster produces <4 valid keywords, seeds fill the remaining slots. Cluster signal always preferred (validates buyer intent), seeds are fallback. These are full PHRASES (what a buyer types into Amazon search), not single words — much higher conversion intent.

### Group C prompt — different books + shortened reviews (2026-05-09)
**Bug 1:** Sonnet returned the same 3 books for Group C as for Group A — reception cluster shouldn't be filtered by differentiator and should pick fresh "most-loved" books. **Fix:** prompt now explicitly says "pick DIFFERENT books than Groups A and B. Group C is about reception (what readers love/hate). If you find overlap, skip and look further down the bestseller list."

**Bug 2:** Sonnet pasted ~150-word verbatim reviews (3 reviews × 3 sentiments × 3 books = ~1400 words just in reviews). User feedback: "muy larga, resumido". **Fix:** changed Group C fields 7-8 from "Top 3 reviews 5⭐ (copy-paste full text)" to "Top 3 praise themes (3 SHORT 1-line themes)" + same for pain themes. ~85% less text, same synthesis result (Sonnet pre-clusters themes better than the regex-based parser anyway). Parser updated with new label aliases: `Top 3 praise themes`, `Pain themes`, `Why people love it beyond the cover/copy`, etc.

### Idea modal delete — instant, no confirmation
User explicit feedback: "esta confirmacion no la quiero". Click 🗑️ → idea deleted immediately, modal closes + reopens with refreshed list so user can rapid-fire cleanup. If last idea deleted, modal closes and empty state appears.

### MEGA mode — 1 Sonnet run for all 4 axes (2026-05-09)

**Why:** running 4 separate research prompts requires 4 setup-paste-send-wait cycles. User identified this as biggest bottleneck. Honest math: 4 separate prompts ≈ 12-20 min total; combined MEGA prompt ≈ 5-12 min. **30-50% real time savings** (less than my initial "70%" claim — Sonnet still has to do per-book browser work either way; what's saved is prompt setup overhead × 3, context-switching, and 3 extra clipboard transfers).

**Implementation:**
- `dd0BuildMegaPrompt(idea)` — single combined prompt that asks for 8-11 books split into 4 sections via `===SECTION X===` separators
- `dd0SplitMegaResponse(text)` — flexible regex splits the response on section headers, returns `{A, B, C, D}` text chunks
- `dd0RenderMegaBoxHtml(idea)` — collapsible card at top of Stage 0, default collapsed, dashed orange border to indicate the speedup option
- Split button click → fills the 4 group textareas + parses each + persists + re-renders so Synthesize button activates

**Both modes coexist** — user can use individual prompts (more controlled) or MEGA (faster). MEGA box collapses by default so users who prefer one-axis-at-a-time aren't confused.

### Empty-input ergonomics (decisions on what to skip)
User explicit decisions during testing:
- **Categories field in Stage 0 dashboard** — skip. Real category selection happens at KDP upload via Amazon's hierarchical picker. The platform doesn't compile categories into the PDF; filling them in Stage 0 is duplicate work the user re-does at KDP anyway. Suggestion: cluster surfaces the most-common categories from Group C, but field stays optional.
- **F12/Console suggestions** — user blocked: "esto de F12 no me funciona no lo digas de nuevo". Going forward, all debug/recovery instructions must be UI-driven (buttons, modals, niche-change reset), never console.
- **Long verbose responses from me** — user blocked: "responde directo... no hables de tantas cosas que marean". Going forward, focused short answers, no preamble.

### Parser robustness — emoji book separators (2026-05-08)
Sonnet's natural output uses headers like `📗 Book 1 — PRIMARY FILTER ✅`. Old book-separator regex required exact `Book 1:` or `---`. **Fix:** updated to `/^\s*(?:[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]\s*)?(?:book\s*\d+|libro\s*\d+|#\s*\d+|---+|===+)/iu` — accepts optional emoji prefix (full Unicode emoji block) and trailing text after the marker. Verified with regex test: matches all 6 Sonnet/manual formats.

### Honest research model recommendation (continued from Sprint 4)
Through this session's testing, confirmed:
- **Haiku 4.5** for these prompts: 0% success rate. Gives up fast on multi-step browser tasks.
- **Sonnet 4.6** for these prompts: ~70-90% success with the new prompt structure (search queries + audience constraint + time budget + fallback + emoji-tolerant parser). Iterates intelligently when first results don't fit.
- Cost difference (~$0.06 vs $0.004 per 4 prompts) is irrelevant — research quality determines book quality.

### Cluster diversity caveat (still open)
Sonnet sometimes returns 3 books from the SAME publisher (saw "La Bibli des Ados" 2-3 times in early test runs). Possible improvement: add `BOOKS FROM AT LEAST 2 DIFFERENT PUBLISHERS/AUTHORS` constraint to the prompt. Not urgent — easy to spot in cluster output. Leaving for future sprint.

---

## Sprint 4 changes — 2026-05-06 → 2026-05-07

Three drops: **Phase B (Interior Image Generator)**, **Stage 0 hardening** (niche-change holistic reset, IndexedDB persistence, prompt refinement), and **catalog enrichment** (search queries + audience guards per niche).

### Phase B — Interior Images Generator (DONE 2026-05-06)

After Phase A automated the cover, Phase B automates the rest of the visible images: section dividers, welcome page, quote page, solutions divider, optional cover-back, optional corner ornaments. Same fal.ai client, same key.

**File:** `js/image-gen.js` extended (~135 → ~290 lines)

**New functions:**
- `igBuildInteriorPrompts(project)` — returns `[{slotId, label, prompt, style, endpoint, aspectRatio}]` for every required interior slot. Uses `bcGetRequiredSlots(project)` to know which to ask for, then maps each to a slot-type-specific prompt.
- `igSectionThemeHint(type)` — flavor per puzzle type (wordsearch=detective, sudoku=ninja, math=symbols, mazes=labyrinth, cryptogram=spy)
- `igGenerateInteriorOne(slot)` — single-slot generation with proper endpoint routing
- `igDataUrlToProcessed(dataUrl)` — bridge helper that builds the `{dataUrl,width,height,sizeKB}` shape `bcSaveAsset` expects (without it, generated images saved as bare strings — `bcGetAsset` returned null and compile silently dropped them)

**Endpoint routing:**
- Slots WITH text (welcome / quote / dividers): Ideogram-v2 (text rendering)
- Slots WITHOUT text (corner ornaments / cover-back background): Flux-pro (cleaner illustrations, cheaper)

**UI in Stage 6 (`js/book-wizard.js` ~150 lines added):**
- New card `🖼️ Interior Images Generator` between Cover Generator and Assets Manager
- **🚀 Generate ALL missing (N)** — parallel `Promise.all` over every empty slot
- **🎨 Generate** per slot — test one at a time
- **✓ Use this / 🔄 Regenerate** per variant
- State stored on `project._interiorGen[slotId] = {status, url, error}` — ephemeral preview, NOT persisted to localStorage. Only the slot user explicitly uses gets saved via `bcSaveAsset`
- 9:16 aspect ratio canvas (matches book interior page)

**Cost:** ~$0.10 per slot × 8-9 slots typical = **~$0.80/book interior** + $0.30/cover from Phase A = **~$1.10/book full automated**.

**Bug fix bonus during Phase B integration:** `bwUseCoverVariant` was setting `project.assets['cover-front'] = dataUrl` (raw string), but `bcGetAsset` reads `project.assets[slotId]?.dataUrl` (object). Result: covers chosen via Phase A weren't being read by compile. Fixed to route through `bcSaveAsset`.

**CSS:** Added `.bw-intgen-*` classes to `theme-warm.css` — auto-fill 4-6 slot grid, saved badge, loading spinner, contextual action buttons (Generate / Use / Regenerate / Retry).

### Stage 0 hardening — niche-change reset, IndexedDB, button states

**Niche-change holistic reset (2026-05-06):**
Earlier niche change handler was patchy — first it cleared only research, then only research + incompatible differentiators. Both were partial fixes. User feedback: "comenzar del inicio". Final design: when niche changes, hard-reset every niche-dependent field in one helper:
```
dd0ClearNicheDependentState(idea):
  - groupAText/Parsed, groupBText/Parsed, groupCText/Parsed, groupDText/Parsed → wiped
  - differentiators (catalog + custom) → []
  - synthesis → null
  - decisions → {}
  - status → 'draft'
Preserved: id, createdAt, pen name, imprint
```
No confirmation dialog (user blocked it explicitly). Toast informs what was cleared. Single re-render after reset, no patches.

**Synthesize button blocked when 0 books (2026-05-06):**
Old behavior: clicking Synthesize on an empty cluster produced default values that looked like real recommendations (title proposals, subtitle, description) — confusing. New: button is `disabled` with tooltip when all 4 textareas have <50 chars of text. Label changes to "🧪 Synthesize cluster — needs research". As soon as any textarea has content, button enables.

**📚 My ideas (N) — always-visible header button (2026-05-06):**
Old asymmetric UX: with 1 idea → only label, no picker. With 2+ ideas → dropdown picker. This made saved drafts invisible until user accidentally created a 2nd one. New: uniform header showing `📚 Idea: [name] [status] [📚 My ideas (N)] [+ New]` regardless of count. Click "My ideas" → modal with full list, per-row Switch / 🗑️ actions. Delete is **instant** (no confirm dialog, user blocked it). Modal re-opens in place after each delete so user can rapid-fire cleanup.

**IndexedDB migration (2026-05-07):**
Critical fix. Book ideas were on localStorage (5MB cap shared with `bw_projects` cover images). User hit quota, drafts silently failed to save. Migration:
- Storage moved to IndexedDB (`kdp-book-factory` DB, `book_ideas` store, single `all` key holding `{active, list}`). Effective cap: gigabytes.
- Sync API preserved via in-memory cache. Reads return from cache (sync); writes update cache + fire-and-forget IDB persist.
- Boot: sync warm-start from legacy localStorage (if any), then async IDB load merges (NOT overwrites). Merge by `id` with newer `updatedAt` winning on conflict — protects ideas created during the boot window.
- Auto-migration: first boot after upgrade reads legacy localStorage, writes to IDB, removes the localStorage key.
- Fallback: if IDB unavailable (private mode), falls back to localStorage write.

**Phantom idea accumulation fix (2026-05-07):**
Symptom: each page reload added an "Untitled idea" — user accumulated 25 phantoms. Root cause: `dd0Mount` ran sync on page load BEFORE IDB load completed, saw empty cache, called `biCreate({niche:''})` to "ensure at least one idea exists". After IDB loaded, the phantom + the real ideas merged, persisting forever. Fix:
1. `dd0Mount` no longer auto-creates — `dd0Render` shows empty state with "+ Start a new book idea" button if no active idea exists. Async IDB load fires its own `dd0Render` once data arrives.
2. Boot auto-cleanup: `_biGcEmpties()` runs after IDB merge. If real ideas exist alongside empties → drop ALL empties. If all ideas are empty → keep just the newest one. Keeps the active empty if user is mid-typing.
3. `+ New` handler checks `biIsEmpty(active)` first — if user is already on a blank idea, just toasts "Already on a blank idea" instead of creating another.
4. ID uniqueness: `_biGenerateId()` uses `idea-{timestamp}-{counter}` (counter cycles 0-999) — no collision even on rapid clicks in same ms.

### Group prompt refinement (2026-05-07)

User audit revealed Group A research with Haiku returned 0 valid books, with Sonnet returned 3 books but **wrong audience** (Children's puzzle books instead of teens). Fixes applied to all 4 axis prompts:

**1. Search queries per niche** — added `searchQueries: [...]` field to all 12 niches in `RI_NICHE_CATALOG`. Examples:
- variety-puzzle:for-teens → ["puzzle book teens 11-15", "brain games teens", "activity book ages 12 13 14"]
- word-search:large-print-seniors → ["large print word search seniors", "word search large print elderly", "word search big print adults"]
- planner:adhd → ["ADHD planner adults", "ADHD daily planner undated", "neurodivergent planner adults"]

Injected into prompt as `START WITH THESE SEARCHES on amazon.com (try in order until you find N valid books)` so Sonnet/Haiku doesn't improvise queries (saves ~40-50% time, prevents drift).

**2. Audience constraint per niche** — added `audienceConstraint: '...'` field. Hard REJECT rule. Examples:
- variety-puzzle:for-teens → "ages 11-15 / teen / tween — REJECT if listing says ages 8-12, ages 6-9, or 'children' only"
- coloring-book:cottagecore → "adults — REJECT if kids coloring or non-cottagecore aesthetic (mandalas, animals only, etc.)"

Injected as `AUDIENCE CHECK (mandatory)` block. Stops drift to adjacent niches with similar BSR.

**3. Filter relaxed** — baseline `300+ reviews at 4.4⭐` → `100+ reviews at 4.3⭐`. The 300-review filter was unrealistic for books published 2024+ (review accumulation takes 12-18 months). 100 is achievable, still signals real traction.

**4. Explicit fallback** — added `IF YOU CAN'T FIND N VALID BOOKS: relax to (BSR < 250,000 OR 50+ reviews at 4.0⭐+) and note "RELAXED FILTER" in the result. Better N good-enough books than 0 perfect ones.` Prevents Sonnet from giving up entirely; surfaces cluster weakness to the user instead.

**5. Group C reviews trimmed** — was "Top 5 reviews 5⭐ + Top 5 reviews 1-3⭐" = 30 reviews verbatim per cluster. Reduced to **3+3 = 18 reviews**. 40% less text to paste, no signal loss (3 reviews per sentiment is enough for theme clustering).

**6. Group D added trim size** — was missing. Added question #3 "Trim size from product details (6×9 / 7×10 / 8.5×11 / other):". Plus `riNormalizeTrim()` helper that maps any trim string to canonical KDP trims by closest distance. Synthesizer counts trim votes, returns mode, applier writes to `project.technical.trimSize` and `project.content.interiorRec.trimSize`.

### Model recommendation (2026-05-07)

Tested research prompts with Haiku 4.5 vs Sonnet 4.6 on variety-puzzle:for-teens Group A:
- **Haiku**: 0 valid books, gives up fast on multi-step search/filter/extract. Cost: ~$0.001/call.
- **Sonnet**: 3 valid books, complete 8-field extraction, persistent iteration. Cost: ~$0.015/call.

For 4 axes × 1 book = 4 calls = **$0.06 with Sonnet vs $0.004 with Haiku**. Difference is irrelevant compared to research quality. **Use Sonnet for the 4 research prompts**, reserve Haiku for simple summarization / extraction tasks.

### Cluster diversity caveat

Sonnet may iterate to find more books from the FIRST publisher it identified as relevant (saw it pivot to "La Bibli des Ados" publisher after finding their first book). This produces a publisher-skewed cluster, not a niche-representative one. Future improvement: add `BOOKS FROM AT LEAST 2 DIFFERENT PUBLISHERS/AUTHORS` constraint to prompts. Not urgent — can be evaluated after each Sonnet run by checking if 3 books are from 3 distinct publishers.

---

## Sprint 3 changes — 2026-05-05

Two big drops: **Decision Dashboard / Stage 0** (shipped the planning doc below) and **Phase A cover automation** via fal.ai.

### Stage 0 — Decision Dashboard + 4-axis Research Import (DONE)

**What it is:** a pre-wizard screen that owns "what book are we even making" decisions before the 6-stage wizard runs. Replaces the old single-textarea cluster-dump idea with a **4-axis research model** — the user runs 4 separate Claude extension prompts (one per axis) and pastes each result back. Synthesis is per-axis (different statistical thresholds per group), then combined into one project.

**Files added:**
- `js/research-import.js` (~700 lines) — parsers, synthesizers, combinator, applier, and curated catalogs
- `js/book-ideas.js` (~145 lines) — Book Ideas storage layer (`bw_book_ideas` localStorage), separate from `bw_projects`
- `js/decision-dashboard.js` (~700 lines) — Stage 0 UI: niche dropdown, multi-select differentiator chips, 4 prompt cards, dashboard with collected decisions, "Apply" → wizard Stage 1

**4 axes (3+3+3+2 = 11 reference books):**
| Axis | Group size | What it captures | Synthesizer key outputs |
|---|---|---|---|
| **A** Visual | 3 books | Cover paleta, tipografía, mascot/no-mascot, layout signals | `dominant`, `accents`, `typography`, `mascot{has,type}` |
| **B** Marketing | 3 books | Title formulas, subtitle hooks, description structure, BSR/reviews validation | `medianPrice`, `medianPages`, `titlePatterns[]`, `keywords[]`, `bisac[]` |
| **C** Reception | 3 books | What 5★ reviews celebrate vs what 1-3★ complain about — pain/praise lexicons | `painPoints[]`, `praisePatterns[]` |
| **D** Interior | 2 books | Trim, paper, page treatment, pacing, perPage density | `trim`, `interior`, `pageTreatment`, `pacing` |

**Prompts are dynamic** — each prompt embeds the user's selected niche + differentiator chips so Claude knows what cluster to research. All 4 prompts include a date filter (`published 2024+`) and BSR/review-count validation (skip books with <50 reviews or BSR > 200k — too small to be reference). Group B explicitly **excludes A+ Content research** per user decision (legal exposure risk on Brand Registry-only feature).

**Curated catalogs (no free-text fields where avoidable):**
- `RI_NICHE_CATALOG` — 12 niches with pre-baked sub-niche, audience, keywords seeds
- `RI_DIFFERENTIATOR_PATTERNS` — 29 patterns grouped by type (tone, format, audience, narrative wrapper, etc.) — user picks via chip toggle, multi-select, custom-add textarea below
- `RI_IMPRINT_PATTERNS` — 6 imprint naming conventions
- `RI_PEN_NAME_TIPS` — 4 strategic guidelines (multi-author distribution, pronunciation, search-uniqueness, gender signaling)

**Multi-author UX:** pen name + imprint **only live in Stage 1 wizard**, NOT in Stage 0 dashboard — earlier version duplicated them and confused the user. Stage 0 only owns niche + differentiators. Everything else (title, subtitle, palette, etc.) is auto-filled from synthesis.

**Book Ideas vs Book Projects:** new layered model. A "Book Idea" = niche + differentiators + pen name + imprint (the brand decisions). A "Book Project" = the actual wizard-filled book (instance of a Book Idea). One Idea can spawn many Projects (e.g., Vol 1, Vol 2, Vol 3 of the same brand). Idea picker on Stage 0 collapses to a label when only 1 idea exists (no double-picker UX).

**Apply flow:**
1. User pastes 4 axis dumps → click Synthesize per-axis (or all at once)
2. Dashboard shows all collected decisions on one screen with editability
3. Click Apply → `bwApplyClusterToProject(project, synthesis, decisions)` populates `positioning`, `style`, `content`, `technical`, `marketing` fields
4. Navigates to wizard Stage 1 (NOT Stage 6 as initial draft mistakenly did) so user reviews from the top

**Legacy cleanup:** `bwInit()` runs one-time `bw_legacy_cleaned_v1` flag — removes orphan projects in `bw_projects` that aren't linked to any Book Idea (avoids stale seed projects from before the refactor showing up in dropdown).

**Wizard chrome hidden when no project:** if user lands and there's no active project, the wizard renders nothing (empty state) — Stage 0 dashboard fills the screen alone. Avoids the old confusing UX where empty wizard showed below the dashboard.

**Removed (UI cleanup pass):**
- Language selector (UI is English-only per memory; bilingual was scope creep)
- "References saved" sidebar (`bwRenderRefSidebar` call removed; function is dead code)
- "Apply smart defaults for this niche" button (defaults already auto-apply on project creation)
- All "friend" / casual phrasing — replaced with "research brief" / "research findings" / "researcher" (user feedback: "se profesional")

### Phase A — Cover automation via fal.ai (DONE 2026-05-05)

**Why fal.ai + Ideogram-v2 specifically:** Ideogram-v2 is the only mainstream image model that renders **text** (book titles, subtitles, "Vol N") without gibberish letters. Critical for KDP covers — every other model (DALL-E 3, Flux, SD) produces unreadable typography. fal.ai is the cheapest hosted endpoint for it (~$0.10/image vs Ideogram's own $0.20).

**File:** `js/image-gen.js` (~135 lines)

**Public functions exposed on `window`:**
- `igGetApiKey/igSetApiKey/igClearApiKey/igHasKey` — localStorage `falai_api_key`
- `igBuildCoverPrompts(project)` → returns 3 distinct prompts (A: mascot prominent / B: typography-driven / C: illustrated scene). Common style spine (palette + typography + KDP 6×9 ratio + "no watermark, no real face") shared across variants for visual coherence
- `igGenerateOne({prompt, style, aspectRatio, endpoint, negativePrompt})` — calls fal.ai sync endpoint with 90s timeout. Endpoints: `https://fal.run/fal-ai/ideogram/v2` (default, text rendering) and `https://fal.run/fal-ai/flux-pro/v1.1` (illustrations w/o text). Standard negative prompt blocks: watermark, gibberish text, real human face, photo realism, distorted letters
- `igGenerateCoverVariants(project, onProgress)` — parallel `Promise.all` of 3 variants with per-variant progress callbacks (pending/done/error)
- `igUrlToDataUrl(url)` — fetches fal.ai CDN URL → base64 dataURL (so it persists in localStorage; original CDN URL expires)

**Error handling:** specific messages for HTTP 401/403 (bad key), 402 (out of credits), AbortError (90s timeout). No silent failures.

**UI flow (Stage 6 Cover Generator card):**
1. No API key → password input + "Save key" + link to `fal.ai/dashboard/keys` + hint
2. Key saved but no project title → warning to apply Stage 0 first
3. Otherwise → "🎨 Generate 3 cover variants" button + change-key action
4. On generate → 3 variant cards in 9:16 aspect ratio, parallel loading spinners
5. Each variant has "✓ Use this" (downloads → base64 → `project.assets['cover-front']` → re-renders) + "🔄 Regenerate" (single variant retry without re-running others)

**What it does NOT do:**
- No interior images (puzzle illustrations, dividers) — those still go through OpenArt manual until Book 2+ when volume justifies the n8n + fal.ai full pipeline
- No A+ Content images
- No cover-back generation (uses front-only; back stays text-fallback in compile)

**Costs:** ~$0.30 to generate 3 variants. User picks 1, other 2 discarded (no localStorage save) — saves ~2MB per cover decision.

**Strategic position:** unblocks the user from waiting on OpenArt manual generation for the cover (the highest-leverage image — every visitor sees it at thumbnail size). Interior images are lower priority because they're behind purchase + most teens never look at section dividers carefully.

---

## Strategic shift — Competitive Auto-fill (planned 2026-05-03 → ✅ SHIPPED 2026-05-05 as Sprint 3)

**Insight del usuario 2026-05-03:** "puedes utilizar Claude extension para sacar info de Amazon y nos ahorramos los stages manuales". Esta es la dirección correcta — el Wizard de 6 stages es valioso pero llenarlo a mano para cada libro nuevo es fricción innecesaria cuando podemos pre-rellenarlo con data REAL del cluster que vende.

**Estado:** la implementación pivotó del diseño original "1 textarea con 8-10 libros" → "**4 axes con 3+3+3+2 libros**", porque Claude extension performs better con prompts focused (un eje a la vez) que con 1 megaprompt vago. Ver Sprint 3 arriba para el shipped design.

**Nueva fase planeada (Phase H — Research Import / Stage 0):**
En lugar de empezar el wizard vacío, el usuario pega un dump de 5-10 top sellers de Amazon en su nicho. La plataforma sintetiza el cluster y pre-rellena Stages 1-5. El usuario solo revisa + ajusta + va a Stage 6 (imágenes + compile).

Tiempo actual por libro: ~1h llenando stages a mano.
Tiempo objetivo con Stage 0: ~15 min (5 min pegar data + 10 min revisar/tweak).

### Datos imprescindibles a extraer por cada top-seller

Por cada uno de los 5-10 libros del cluster, capturar:

| Campo | Para qué se usa | Fuente Amazon |
|---|---|---|
| ASIN | ID único, dedupe | URL `/dp/B0XXXXXXX` |
| Título completo | Pattern del nicho (regex extracción) | Visible |
| Subtítulo | Hook largo SEO + comparison | Visible |
| Cover image (URL o file) | Cluster de paleta + tipografía + layout (mascot? sample puzzle? "Vol N" badge?) | Imagen producto |
| Descripción completa | Estructura del hook + bullets + CTA | Visible |
| Page count | Median del cluster — usuario apunta a ese número | Product details |
| Precio paperback | Median price → el precio sugerido es ese, NO inventado | Visible |
| Precio Kindle / hardcover | Format mix patterns (qué % tienen hardcover?) | Visible |
| Author / pen name | Si publican bajo imprint identificable (PIL, etc) | Visible |
| Series info | "Part of series" — vol N de M, frecuencia de release | Sidebar series widget |
| Publication date | Frescura — solo libros 2024-2026 son referencia válida; pre-2020 desactualizados | Product details |
| Categories breadcrumb | 3 categorías cluster (las que repiten más son las que el algoritmo de Amazon premia) | Sidebar |
| BSR (al menos top-level) | Volumen — más bajo = vende más; correlaciona con qué del cluster funciona | Product details |
| Top 5 reviews 5⭐ (texto completo) | Qué celebra la gente — el hook del libro nuevo debe prometer eso | Reviews tab → Most helpful |
| Top 5 reviews 1-3⭐ (texto completo) | Pain points reales — la descripción del libro nuevo debe prometer evitarlos | Reviews tab → filter low |

### Lo que la plataforma sintetiza automáticamente

A partir del dump, sin input adicional del usuario:

- **Median price** del cluster → precio sugerido para el nuevo libro (con sanity check de margen real KDP)
- **Median page count** → target de páginas (ajusta cuántos puzzles meter)
- **Title formula extraction** vía regex sobre los títulos del cluster — genera 5 propuestas de título para el libro nuevo siguiendo el pattern dominante
- **Cover style cluster** — analiza las cover images para extraer paleta dominante (color dominante + 2 acentos), tipo de tipografía (sans bold vs serif vs handwritten), presencia de elementos comunes (mascot, sample puzzle showcase, age range badge, "Volume N" callout). Output: prompt prearmado para OpenArt/fal.ai
- **Categories cluster** — las 3 que repiten más en >50% del cluster
- **Keywords inferidas** — extrae 7 backend keywords del solapamiento entre títulos + subtítulos + descriptions del cluster (palabras clave que aparecen ≥3 veces y NO son stop words)
- **Pain points** — clusteriza las reviews 1-3⭐ del cluster por temas (ej: "letra muy chica", "soluciones imposibles de encontrar", "precio alto para tan pocas páginas") — el wizard pone esos como "qué evitar" en Stage 1 differentiator
- **Praise patterns** — clusteriza reviews 5⭐ por temas (ej: "horas de entretenimiento", "ideal para regalo", "buen tamaño de letra") — el wizard pone esos como hooks en marketing description
- **Whitespace gap analysis** — qué hace 0% del cluster que el usuario podría hacer (ej: "ningún libro top-seller tiene narrative wrapper" → diferenciador real)

### Lo único que el usuario sigue aportando manualmente

3 cosas — todo lo demás se deriva del cluster + sintesis:

1. **Pen name(s) e imprint** — la plataforma no puede inventar identidad de autor por el usuario
2. **Diferenciador en 1 frase** — ej: "tono Wimpy Kid + mascota brain + Brain Squad narrative wrapper"
3. **Nicho exacto** — `variety-puzzle:for-teens`, `journal-prompts:self-care-women`, etc. Si el usuario no sabe, la plataforma puede sugerir basándose en el whitespace analysis

### Implementación propuesta

**Nuevo módulo `js/research-import.js`** con:

- `bwParseAmazonDump(text)` → parser flexible que acepta dump JSON o texto plano (formato libre que el usuario pegue de Claude extension) y extrae los 14 campos por libro
- `bwSynthesizeCluster(parsedBooks)` → returns `{medianPrice, medianPages, titleFormulas[], coverStyleCluster, categoriesCluster, keywordsCluster, painPoints[], praisePatterns[], whitespaceGaps[]}`
- `bwApplyClusterToProject(cluster, project)` → pre-rellena Stages 1-5 con cluster medians + el diferenciador del usuario

**Nueva UI: Stage 0 — Research Import** (antes de Stage 1):
- Textarea grande "Pega aquí los datos de 5-10 top sellers de tu nicho (de Claude extension o manual)"
- Botón "Synthesize cluster" → muestra report en panel: median price, page count, etc + cover style analysis con preview de paleta
- Botón "Apply to new project" → crea proyecto pre-rellenado, salta a Stage 1 con todo poblado, usuario solo revisa

**Workflow del usuario en Claude:**
1. Abre Amazon en navegador
2. Activa Claude extension
3. Pide a Claude: "extract title, subtitle, description, page count, price, categories, top 5 5-star reviews + top 5 low-star reviews from this page" — Claude lo devuelve estructurado
4. Repite para 5-10 top sellers del nicho
5. Pega el dump en Stage 0 de la plataforma
6. Click Synthesize → Apply → revisa Stages 1-5 → Stage 6 → publish

### Costos / tradeoffs

- **Tiempo de extracción manual con Claude extension:** ~1-2 min por libro × 8 = ~10-15 min total
- **Tiempo de síntesis platform-side:** instantáneo (algoritmos locales sobre el JSON)
- **Tiempo de revisión + tweak:** ~10 min
- **Total:** ~25 min vs ~1h actual = 60% reducción

**Riesgo:** la calidad del cluster depende de qué libros pone el usuario. Garbage in = garbage out. Mitigación: en el panel de síntesis mostrar warnings tipo "ojo: 3 de 8 libros son de 2018 — considéralos referencia outdated" o "el cluster tiene precios entre $7.99 y $19.99 — alta varianza, puede que estés mezclando 2 nichos distintos".

**No bloqueado por:** fal.ai (sigue siendo opcional para Book 2+), backend (todo client-side sobre el dump), API keys (Claude extension corre en el navegador del usuario).

### Cuándo construir esto

Depende del usuario. Dos paths posibles:
- **A) Después de validar Vol 1 con OpenArt manual** — confirma que el flow end-to-end (compile + KDP upload + sales) funciona, después automatiza el research para Vol 2+ y otros libros
- **B) Antes de Vol 1** — invertir 1-2 días construyendo Stage 0 ahora para que Vol 1 ya salga con cluster real, no con preset hardcoded de Mega Brain Games. Ventaja: el preset actual está calibrado para teens 11-15 puzzle books pero con cluster real podríamos descubrir whitespace mejor

Recomendación honesta: **path A**. La razón es que sin un libro real publicado todavía no sabes qué del wizard funciona y qué no — meter Stage 0 antes es optimizar prematuro un sistema sin métricas. Vol 1 = ground truth.

---

## Pipeline status — 2026-04-30

### ✅ Verificado vía test programmatic (Node + jsPDF real)

15/15 tests pasan en suite automatizada (`/tmp/audit-test.js` — no commiteado, scaffolding):

```
[T1]  Functions present                              ✓
[T2]  Fresh project creation w/ smart defaults       ✓
[T3]  Compliance scoring: 79/100 sin author          ✓
[T4]  Compliance: 87/100 con author                  ✓
[T5]  Asset slots dynamic (per-section): 17 slots    ✓
[T6]  Interior compile (170 puzzles → 153 pages)     ✓
[T7]  Cover wrap (spine 0.383" auto)                 ✓
[T8]  Duplicate Vol 1→Vol 2 preserves all decisions  ✓
[T9]  Compile Vol 2 (153 pages)                      ✓
[T10] Series sibling detection [Vol 1, Vol 2]        ✓
[T11] Empty project compile (6 pages: matter only)   ✓
[T12] Section count=1 edge case                      ✓
[T13] Unknown section type graceful fallback         ✓
[T14] Volume parsing (6 cases: Vol/Volume/Vol.)      ✓
[T15] Volume bump (3 cases including no-Vol pattern) ✓
```

**Output validado:**
- Interior PDF: 153 pages, 292 KB, valid PDF 1.3
- Cover wrap PDF: 1 page, spine width auto-correct (pageCount × paperThickness)
- All 5 puzzle types compile: wordsearch, sudoku, math, mazes, cryptogram
- Sections with count=0 correctly skipped (Picture Detectives rebus generator pending)
- Solutions auto-render per puzzle type
- Back matter (about + series cross-promo + review request) auto-fills

### ⏳ NO verificado todavía (necesita smoke test en browser)

**Confianza alta** (~90%) en que el COMPILE produce PDFs correctos.
**Confianza media** (~70%) en que la UI funciona end-to-end sin crash en Chrome.

Lo que requiere browser real para validar:

| Cosa | Probabilidad de bug |
|---|---|
| Click events del wizard (botones, navigation) | Baja-media |
| File upload + canvas compression | Media |
| Modal preview con iframe PDF | Media |
| CSS rendering del Assets Manager + modal | Media-alta |
| Drag-drop de referencias | Baja |
| localStorage en browser real | Baja |
| Auto-pageCount sync después de compile | Baja |
| **iPhone Safari preview iframe** | **Alta** — Safari maneja PDF iframes mal, descargar directo va a funcionar |

**Smoke test recomendado** (3 minutos): Abrir http://localhost:8765/ → borrar proyecto existente → crear nuevo → llenar Pen name (Stage 1) → subir cover front V3 (Stage 6) → click Compile Interior PDF. Si rompe, F12 → Console → mandar el error.

---

## 🚦 Estado actual end-to-end (2026-04-30)

### Lo que el user puede hacer hoy SIN bugs (verificado vía test)

| Acción | Estado |
|---|---|
| Crear nuevo proyecto Mega Brain Games (seed con B&W $11.99 default, 6 secciones, taglines, page treatment, layout) | ✅ |
| Llenar Stage 1 (positioning + author/imprint) | ✅ |
| Aplicar smart defaults Stage 2 (style, palette, mascot) | ✅ |
| Editar secciones Stage 3 (counts, types, difficulty) | ✅ |
| Stage 4: trim/interior/precio + auto-detect margen negativo | ✅ |
| Stage 5: title/subtitle/description/keywords/categories | ✅ |
| Stage 6: subir cover front + dividers (slot-based UI) | ✅ |
| Compilar Interior PDF (153 pages para 170 puzzles full size) | ✅ |
| Compilar Cover Wrap PDF con spine width auto | ✅ |
| Preview en modal iframe | ✅ (en Chrome desktop; iPhone Safari va a descargar directo) |
| Download PDF final KDP-ready | ✅ |
| Duplicar Vol 1 → Vol 2 con assets/decisiones copiadas | ✅ |
| Switching entre volúmenes en sidebar | ✅ |

### Lo que PUEDE fallar en browser real (no testeado)

- Bug de CSS visual (overflow, z-index, alignment) — fácil de corregir cuando aparece
- Click handler con timing issue
- File upload en Safari iOS (CORS o canvas tainted)
- Modal blob URL en Safari (a veces falla)

**Probabilidad de bug crítico:** baja. El compile pipeline (la pieza más compleja) está testeado a nivel de bytes con jsPDF real. Lo que queda son bugs de UI superficial — visuales, no funcionales.

---

## 🎯 Active Production: Mega Brain Games for Teens — Volume 1

### Locked decisions (post-2026-05-01 recalibration)
- **Cover title:** "MEGA BRAIN GAMES FOR TEENS"
- **Tagline:** "125+ Puzzles to Outsmart Boredom" *(was "170+" — recalibrated 2026-05-01: dropped Math from 60→25 because 60 felt like homework, total now 125)*
- **Listing title (full SEO):** Mega Brain Games for Teens: 125+ Puzzles to Outsmart Boredom — Word Search, Sudoku, Math, Mazes & Cryptograms | Ages 11-15 | Volume 1
- **Audience:** Ages 11-15, unisex
- **Format:** Paperback, 6×9", ~110-130 pages (actual after compile; mission-arc pacing adds mission dividers but interleaves puzzles → roughly same total page count)
- **Interior CONFIRMADO (default en seed):** **B&W Standard, cream paper, $9.99** *(was $11.99 — at 130pg vs 180pg the cheaper price point makes sense and beats the "$11.99 puzzle book" dominant cluster)*. Royalty ≈ $3.18/book
- **Tone:** Snarky-but-warm, anti-cringe (Wreck This Journal + Calvin and Hobbes vibe)
- **Narrative wrapper:** "Brain Squad" — now reflected in compile via **mission-arc pacing** (Mission 1: Recon → Mission 8: Victory Lap, mixed puzzle types per mission, NOT 30 of one type in a row)
- **Style direction:** Comic book / Wimpy Kid / Big Nate
- **Mascot locked:** Pink cartoon brain (#FF6B9D) with sunglasses + headphones (validated in cover V3)
- **Cover validated:** V3 yellow + brain mascot thumbs-up + pencil
- **Word Hunters divider validated:** V1 brain detective with magnifying glass

### Brain Squad sections (in seed `BW_PRESETS['variety-puzzle:for-teens']`, recalibrated 2026-05-01)
1. **WORD HUNTERS** — wordsearch, count=25, *"Find the words. Trust no one."* — auto-rotates themes (animals, food, nature, sports, travel, science, music, space, ocean) per puzzle
2. **NUMBER NINJAS** — sudoku, count=25, *"It's just numbers. (Plot twist: it's a trap.)"*
3. **MATH SQUAD** — math, count=25 (perPage=20, mixed ops), *"Math that doesn't make you cry. We hope."* *(was 60 — caller-friendly now, doesn't feel like a textbook)*
4. **MAZE RUNNERS** — mazes, count=25, *"If you get lost, that's kind of the point."*
5. **CODE BREAKERS** — cryptogram, count=25, *"Decode messages. Become a spy. Annoy parents."*
6. **PICTURE DETECTIVES** — rebus, **count=0** (generator pending — section auto-skipped in compile), *"Read pictures. Confuse adults."*

**Pacing:** `mission-arc` (default for this preset). At compile, sections are NOT rendered as 25 word searches in a row. Instead the compile builds 4-8 missions (Mission 1: Recon → Mission 8: Victory Lap), each with a divider page + ~3 word searches + ~3 sudokus + ~3 math + ~3 mazes + ~3 cryptograms interleaved. To revert to old behavior: Stage 3 → Pacing → "Sequential blocks".

### Image Workflow status
- ✅ Cover front V3 (yellow + brain thumbs-up + pencil)
- ✅ Word Hunters divider V1 (detective brain w/ magnifying glass)
- ⏳ 5 squad re-generations needed in OpenArt (Number Ninjas, Math Squad, Maze Runners, Code Breakers — Picture Detectives skipped). Differentiated prompts already drafted.
- ⏳ 3 misc: Welcome page, Quote page, Solutions divider
- 📌 **Compile works WITHOUT these** — fallback rendering uses section taglines on text-styled dividers. User can publish Vol 1 with just cover front and let interior be text-only on dividers.

---

## 🏗️ Platform Architecture (post-2026-04-28 refactor)

### Estado: 3 tabs principales (UI cálida, NO blue NO black)

```
┌─ Tabs visibles por defecto ─────────────────────────────┐
│  📚 Crear Libro    🎨 Imágenes IA    🛠️ Herramientas      │
│  (wizard 6-stages) (workflow imgs)   (toggle legacy)    │
└─────────────────────────────────────────────────────────┘

Toggle "🛠️ Herramientas avanzadas" muestra los tabs legacy:
Sopas · Sudoku · Journals · Colorear · Math · Más Puzzles
· ADHD · Portadas · Metadatos · Royalties
```

### Stack visual
- **Theme:** `css/theme-warm.css` (override sobre `css/style.css`)
- **Paleta plataforma:** cream `#FAF6EE` + terracotta `#C8602F` + sage `#8B9D7E` + ochre `#D4A574` + warm browns
- **Stage colors:** Stage 1=terracotta · 2=sage · 3=ochre · 4=mauve · 5=dusty steel · 6=olive
- **Cards:** background `#FBF6EC` + left border en color del stage
- **Empty fields:** white bg / **Filled fields:** verde-pálido `#F6FAEF` con borde sage (visualmente claro qué llenaste)
- **Required fields:** asterisco rojo + dot indicator antes del label
- **Responsive:** `@media (max-width: 768px)` para iPhone

### Data model: BookProject

Storage: `localStorage['bw_projects']` = `{active: id, list: [...projects]}`

```javascript
{
  id, createdAt, updatedAt, status, currentStage,
  positioning: {
    niche, subNiche, ageMin, ageMax, gender, language, market,
    buyerPersona, painPoint, differentiator,
    // Authors — KDP-mirror structure (2026-05-01):
    authorPrimary: { prefix, firstName, middleName, lastName },
    contributors: [{ role, prefix, firstName, middleName, lastName }],  // up to 9; role ∈ Author/Editor/Foreword/Illustrator/Introduction/Narrator/Photographer/Preface/Translator
    // Legacy mirrors kept in sync via bwStage1Save (older code paths still read these):
    authorPenName,    // = bwAuthorFullName(authorPrimary)
    coAuthor,         // = full name of first contributor with role 'Author'
    imprint           // optional publisher branding
  },
  style: { humor, voice, visualStyle, palette, mascot: { has, id, type, name } },
  content: {
    pageCount,
    pacing,           // 2026-05-01: 'sequential' | 'mission-arc' | 'rotating' | 'boss-build'
    missions,         // optional override of default mission names/taglines for mission-arc pacing
    sections: [{ name, type, count, difficulty, tagline, perPage, mathType, themes, gridSize, words }],
    frontMatter: {...}, backMatter: {...}
  },
  technical: {
    trimSize, interior, paper, coverFinish, formats,
    pricing: {paperback, hardcover, kindle},
    layout: {...},
    pageTreatment: 'none|corner-ornaments|corner-ornaments-per-section|soft-background|decorative-frame'
  },
  marketing: { title, subtitle, description, keywords: [7], bisac: [3] },
  references: [{ id, tags, notes, images, aiExtracted, appliedToStages }],
  compliance: { aiDisclosed },
  series: { name, volume, parentBookId },   // 2026-04-29 multi-volume series support
  assets: {                                  // 2026-04-29 — uploaded images for compile
    [slotId]: { dataUrl, width, height, sizeKB, uploadedAt }
  }
}
```

### Series management (2026-04-29 — P1 #5 DONE)

**Concepto:** los autores top de KDP no publican un libro y esperan — publican **series de 5-10 volúmenes** del mismo nicho con identidad visual idéntica (estilo + paleta + mascota + layout) y solo cambian el contenido. La plataforma soporta esto nativamente.

**Funciones (en `js/book-wizard.js`):**
- `bwParseVolumeFromTitle(title)` — extrae "Vol N" / "Volume N" / "Vol. N" del final del título
- `bwBumpVolumeInTitle(title, newN)` — reemplaza N por newN, o agrega "— Vol newN" si no había
- `bwAutoDetectSeries(project)` — backfill `series` para libros legacy desde el título
- `bwGetSeriesSiblings(project)` — lista todos los volúmenes de la misma serie ordenados por número
- `bwNextVolumeNumber(seriesName)` — devuelve max(volume) + 1
- `bwDuplicateAsNextVolume(source)` — clona el libro como Vol N+1

**Qué copia el duplicate (~90% de las decisiones):**
- positioning completo (nicho, sub-niche, edad, género, market, painPoint, differentiator)
- style completo (humor, voice, visualStyle, palette, **mascota**)
- technical completo (trim, interior, paper, formats, pricing, layout, **pageTreatment**)
- marketing.subtitle (mismo patrón)
- marketing.keywords (7 keywords del nicho — rara vez cambian entre vols)
- marketing.bisac (3 categorías — mismas para la serie)
- references (research del nicho aplicable a toda la serie)
- compliance.aiDisclosed flag

**Qué resetea/cambia:**
- marketing.title — bump del Vol N → N+1 automático
- marketing.description — vacío (Vol N+1 necesita hook fresco)
- content.sections — preserva la **shape** (count + difficulty + type) pero el contenido específico se llena de cero
- series.parentBookId = source.id (cross-promo back-matter futuro)
- series.volume = N+1
- currentStage = 3 (lleva al user directo a Content — único stage que cambia entre volúmenes)

**UI:**
- Header: badge "📚 {seriesName} · Vol N de M" + botón "📖 Duplicar como Vol N+1" (sage accent)
- Header dropdown: agrupado por serie via `<optgroup>` cuando hay >1 vol
- Sidebar: panel "📚 Esta serie" con lista de todos los volúmenes (Vol N + título + status emoji + % progreso). Click en cualquier vol cambia el activo.

**Migración legacy:** `bwInit()` corre `bwAutoDetectSeries` sobre todos los libros existentes — los que tengan "Vol N" en el título quedan agrupados automáticamente. Los standalone se tratan como Vol 1 de su propio nombre.

### Compliance Score engine
`bwScoreCompliance(project)` retorna `{score 0-100, issues}`. Validates:
- Page count 24-828 KDP
- Title length ≤200 chars
- **Pricing margin con fórmulas REALES KDP 2026** (corregido)
- Hardcover trim (no 8.5×11, debe ser 8.25×11)
- Inside margin escalado por páginas
- Keyword duplication con título
- Categories presence (3 max — ahora "Amazon Store Categories", BISAC murió 2023)
- AI disclosure flag

### Files

| Archivo | Rol |
|---|---|
| `index.html` | Layout principal, todas las tabs (UI en inglés) |
| `js/book-wizard.js` | Wizard (6 stages, smart defaults, compliance, references, series management, Stage 6 assets manager + compile UI + Cover Generator card) |
| `js/book-compile.js` | **NEW 2026-04-29** Orquestador del PDF KDP-ready end-to-end. `bwCompileBook(project)` + `bwCompileCoverWrap(project)`. ~830 líneas |
| `js/decision-dashboard.js` | **NEW 2026-05-05** Stage 0 — Decision Dashboard (pre-wizard). 4 axes prompt cards + collected decisions view + Apply→Stage 1 |
| `js/research-import.js` | **NEW 2026-05-05** 4-axis parsers + synthesizers + applier. Catalogs: 12 niches, 29 differentiator patterns, 6 imprint templates, pen name tips |
| `js/book-ideas.js` | **NEW 2026-05-05** Book Ideas storage (`bw_book_ideas`). One Idea = niche+differentiators+pen+imprint; spawns many Projects |
| `js/image-gen.js` | **NEW 2026-05-05** fal.ai client for cover automation. Ideogram-v2 (text rendering) + Flux Pro (illustrations). 3-variant parallel gen |
| `js/image-workflow.js` | Tab AI Images — 11 paneles para Mega Brain Games |
| `js/app.js` | Tab navigation + tools toggle (language switcher removed 2026-05-05 — UI is English-only) |
| `css/style.css` | Legacy dark mode |
| `css/theme-warm.css` | Override warm light theme (paleta + stage colors + cards + assets grid + modal + Stage 0 dashboard + Cover Generator) |
| `n8n/manifest.example.mega-puzzle-teens.json` | Production manifest |
| `n8n/manifest.schema.json` | Schema formal app↔n8n |
| `n8n/workflow.book-images.json` | n8n workflow (apunta a fal.ai, parqueado para Book 2+) |
| `n8n/SETUP.md` | Setup de n8n + fal.ai |

---

## 📐 KDP 2026 Rules — VERIFIED (no inventados)

Source: kdp.amazon.com/help, verificado 2026-04-28

### Print costs (USA marketplace, standard trim)

**Fórmula real (no $2.15 ni $5.65 que tenía antes):**

| Interior | Base fee | Per-page cost |
|---|---|---|
| B&W Standard | $0.85 | $0.012 |
| B&W Premium | $0.85 | $0.012 |
| Color Standard | $0.85 | $0.070 |
| Color Premium | $0.85 | $0.100 |

Ejemplo 200pg:
- B&W: `$0.85 + $2.40 = $3.25`
- Color std: `$0.85 + $14.00 = $14.85`
- Color premium: `$0.85 + $20.00 = $20.85`

**Large trim** (>6.12" wide o >9" tall): +$0.006/pg adicional.

### Royalty
- Paperback: 60% en Amazon.com directo (40% en distribución expandida)
- Kindle: 70% si precio entre $2.99-$9.99

### Margins (inside margin / gutter por páginas)
| Páginas | Min inside margin |
|---|---|
| ≤150 | 0.375" |
| 151-300 | 0.5" |
| 301-500 | 0.625" |
| 501-700 | 0.75" |
| 700+ | 0.875" |

### Otros
- **Bleed:** 0.125" en todos los lados
- **DPI:** 300 mínimo
- **Page count:** 24-828
- **Title max:** 200 chars
- **Backend keywords:** 7 slots
- **Categories:** 3 max **firme** (Amazon Store Categories, NO BISAC desde 2023). Per-format separate.
- **AI disclosure 2026:** OBLIGATORIO si usas AI-generated text/images. AI-assisted (yo ayudando con prompts) NO requiere. Penalty: book removal + account suspension.
- **Hardcover:** NO acepta trim 8.5×11, usa 8.25×11

### Pre-publish checklist (Stage 6 muestra esto)
- [ ] AI disclosure marcado en KDP
- [ ] Título verificado en USPTO Class 016 (no trademarks)
- [ ] Print proof ordenado y aprobado
- [ ] Cover wrap calculado con KDP Cover Calculator
- [ ] 3 Amazon Store Categories elegidas
- [ ] Look Inside revisado
- [ ] ISBN (KDP free o propio)
- [ ] Imprint name (opcional)
- [ ] A+ Content (si Brand Registry)
- [ ] Series page setup
- [ ] Back matter completo

---

## 📚 Smart Defaults Libraries (data en `js/book-wizard.js`)

### BW_NICHES (12 categorías validadas)
variety-puzzle, word-search, sudoku, coloring-book, activity-book, journal-prompts, planner, workbook-edu, kakuro, cryptogram, health-tracker, destructive-journal

### BW_VISUAL_STYLES (10 estilos con tags)
comic-wimpy-kid, aesthetic-pinterest, classic-clean, fantasy-ya, gaming-neon, retro-vintage, punk-sketch, watercolor-soft, bold-geometric, photorealistic

### BW_PALETTES (8 presets + custom)
comic-yellow, aesthetic-cream, bold-primary, pastel-calm, dark-mode, gaming-neon, earthy-warm, cottagecore

### BW_LAYOUT_PRESETS (KDP USA reglas por nicho)
12 presets con: pageDirection (siempre left-binding USA), spreadStrategy (single/one-sided/spread-related/spread-week), sectionDividerSide (recto), bleed, insideMargin, outsideMargin, notes.

**Spread strategies key:**
- `single` (variety puzzle, word search, sudoku): páginas independientes
- `one-sided` (coloring book): imagen SOLO en derecha, izquierda en blanco (anti-bleed-through del marker)
- `spread-related` (journal): izq prompt, der escribir
- `spread-week` (planner): vista semanal cubre 2 pgs
- `mixed` (activity book): mix de los anteriores

### BW_PRESETS (smart defaults completos por nicho)
Pobaldo: variety-puzzle:for-teens, word-search:large-print-seniors, journal-prompts:self-care-teens, coloring-book:adults-bold-easy, destructive-journal:teens.

Cada preset auto-fill style + content + technical + marketing.

### BW_MASCOT_SUGGESTIONS (validado por estudio top sellers)
9 nichos con sugerencias específicas. Cada sugerencia tiene: id, name (con emoji), desc, why (estratégico), refs (libros que la usan).

Ejemplos clave:
- variety-puzzle:for-teens → 5 opciones (brain cartoon, robot, detective animal, pencil squad, sin mascota)
- coloring-book → solo "sin mascota" (obligatorio)
- health-tracker → solo "sin mascota" (clinical)
- journal-prompts:self-care-teens → celestial spirit / sin mascota / pet cat

### BW_INTERIOR_REC (recomendación B&W vs Color por nicho)
11 nichos con: recommended (interior id), recommendedPrice, altPrice, reason, why_bw_wins.

**Recomendaciones clave:**
- variety-puzzle: B&W @ $11.99 (royalty $3.94)
- coloring-book: B&W obligatorio
- journal-prompts: B&W @ $11.99
- health-tracker: B&W @ $9.99

### BW_PAGE_TREATMENT (decoración en páginas de contenido — 2026-04-28)

**🟢 ACTIVADO POR DEFAULT 2026-04-28** — `bwApplyDefaults()` auto-aplica el `recommended` de cada nicho cuando se crea un libro. Solo se aplica si es compatible con el interior elegido (B&W bloquea soft-bg/frames).

**Concepto:** Decora puzzle/exercise pages SIN sacrificar legibilidad. UN imagen template se reusa en muchas páginas (eficiente).

**3 niveles disponibles:**
1. `corner-ornaments` — Ilustración pequeña en esquina (~12% page area). Funciona B&W y color.
2. `corner-ornaments-per-section` — 1 corner distinto por squad/sección (recomendado para variety puzzle)
3. `soft-background` — Patrón sutil al 5-10% opacity detrás del contenido. SOLO color interior.
4. `decorative-frame` — Marco temático (vines, geometría). SOLO color interior. Estilo Genius Girls.

**Reglas de compliance aplicadas:**
- **Safe zone:** 0.5"-0.625" desde cada borde — el contenido NUNCA toca decoración
- **Solutions section:** SIEMPRE limpia, sin treatment (legibilidad de respuestas)
- **B&W interior:** solo permite "corner-ornaments" o "none" (gradients salen muddy en B&W print)
- **Color interior:** todos los niveles disponibles (color page = color page, lleno o vacío, mismo costo)

**Recomendaciones por nicho:**
- variety-puzzle: corner-ornaments-per-section (6 ornaments, uno por squad)
- word-search:large-print-seniors: NONE (seniors necesitan máxima legibilidad)
- sudoku: none o corner-ornaments mínimo
- coloring-book: N/A (la imagen ES el contenido)
- activity-book: decorative-frame (Genius Girls validación)
- journal-prompts: soft-background-with-corners (aesthetic feel)
- planner: corner-ornaments mínimos (necesita espacio para escribir)
- workbook-edu kids: corner-ornaments (mascota chica = más fun)
- destructive-journal: unique-per-page (anti-template)
- health-tracker: NONE (clinical product)

### BW_IMAGE_PLAN (cuántas imágenes por libro)
10 nichos con: counts de cada tipo de imagen, repeating templates, pages without image.

**Insights críticos:**
- variety-puzzle: 13 únicas, ~190 sin imagen
- coloring-book: 53 únicas (50 coloring pages + cover) ⚠️ más caro
- destructive-journal: 103 únicas ⚠️ más caro aún
- planner: 10 únicas pero templates se repiten 52x weekly
- word-search/sudoku: 5-7 únicas (más simple)

---

## 📝 Pendientes de implementar (data libraries SUGERIDAS — no codificadas aún)

Estas tienen que entrar en próxima iteración. Aquí las listo COMPLETAS para que cualquier sesión futura las pueda agregar al wizard sin re-research.

### BW_TITLE_FORMULAS (sugerencias de título por nicho)

**variety-puzzle:for-teens:**
1. `[Power] Brain Games for Teens: [N]+ Puzzles to [Outcome] | Ages [X]-[Y] | Volume [N]`
2. `The Ultimate Puzzle Book for Smart Teens: [N]+ Brain Teasers to Challenge Your Mind`
3. `Mega [Niche] Activity Book for Tweens: [Specific Content] for Ages [X]-[Y]`
4. `[Brand Name] Brain Squad: [N]+ Mind-Bending Puzzles for Curious Teens`
5. `Big Book of Brain Games for Teens: [N]+ Word Search, Sudoku, Math & More`

**word-search:large-print-seniors:**
1. `Large Print Word Search Puzzles for Seniors: [N]+ Easy to Read Puzzles with Solutions | Big Font Brain Games for Adults and Elderly`
2. `Large Print Word Search for Seniors: [N]+ Themed Puzzles | Easy Cognitive Brain Exercise`
3. `Brain Games Large Print Word Search: [N]+ Relaxing Puzzles for Seniors`

**sudoku:large-print:**
1. `Large Print Sudoku Puzzle Book for Adults: [N]+ Easy to Medium Puzzles with Solutions`
2. `Sudoku Large Print for Seniors: [N]+ Easy-Medium Puzzles | Brain Training`

**coloring-book:adults-bold-easy:**
1. `Bold and Easy [Theme] Coloring Book for Adults: [N]+ Simple Large Print Designs | Thick Lines for Seniors and Beginners`
2. `[Theme] Coloring Book for Adults: [N]+ Stress-Relief Designs`

**journal-prompts:self-care-teens:**
1. `Self-Care Journal for Teen Girls: A Guided Workbook with Prompts for Confidence, Mindfulness & Self-Discovery | Ages [X]-[Y]`
2. `The Confidence Journal for Teen Girls: Daily Prompts to Build Self-Esteem & Empowerment`

**destructive-journal:teens:**
1. `Wreck This [Adjective] Journal: A [Tone] Journal of [N]+ Creative Prompts to [Action]`
2. `Destroy This Book: [N]+ Wild Creative Prompts for Teens Who Don't Color Inside the Lines`

**prayer-journal:women:**
1. `Prayer Journal for Women: 52 Week Scripture, Devotional & Guided Prayer Notebook | Daily Bible Verse Prompts`

**health-tracker:blood-pressure:**
1. `Blood Pressure Log Book: Daily Tracking Journal with Charts | Heart Rate Monitor Record | Large Print for Seniors`

### BW_KEYWORDS_LIBRARY (7 backend keywords sugeridos por nicho)

**variety-puzzle:for-teens:**
1. puzzle book for tweens
2. puzzle book 12 year old
3. brain games age 13
4. gift for 11 year old boy
5. gift for 13 year old girl
6. variety puzzle book teens
7. summer activity book teens

**word-search:large-print-seniors:**
1. word find puzzle adults easy read
2. brain games elderly cognitive fun
3. relaxing puzzles retirement gift
4. stress relief word puzzle book
5. dementia prevention brain exercise
6. large type puzzle book visually impaired
7. word scramble hunt seek and find

**sudoku:any:**
1. brain teaser number puzzle adult
2. retirement gift cognitive games
3. relaxation stress relief logic puzzle
4. number game grid puzzle beginner
5. mind sharpening senior activity
6. japanese puzzle brain training
7. stocking stuffer gift idea adults

**coloring-book:adults-bold-easy:**
1. stress relief adult relaxation mindful
2. thick lines simple designs beginners
3. marker friendly single sided pages
4. gift idea women mom grandmother
5. easy patterns large designs seniors
6. zen calm therapeutic art activity
7. doodle illustration thick outline simple

**journal-prompts:prayer-women:**
1. scripture writing worship gratitude
2. faith spiritual growth reflection
3. church gift baptism confirmation
4. daily devotion Bible verse prompt
5. Christian gift women birthday Easter
6. praise worship blank lined notebook
7. inspirational religious Catholic Protestant

**health-tracker:blood-pressure:**
1. blood pressure log daily record
2. heart rate monitoring health journal
3. medical tracker doctor appointment
4. diabetes sugar level food diary
5. migraine headache symptom tracker
6. IBS food elimination diet journal
7. health wellness daily tracking book

**Spanish market (universal):**
1. sopa de letras para adultos letra grande
2. busca palabras en espanol pasatiempos
3. rompecabezas sudoku facil adultos
4. diario de oracion mujer cristiana
5. libro actividades ninos colorear
6. juegos mentales personas mayores
7. libro para colorear adultos facil

### BW_DESCRIPTION_HOOKS (templates de apertura por tono)

**Snarky/humor (Wimpy Kid style):**
- "Tired of your teen staring at screens like a zombie? Drop this book in their hands and watch the magic happen."
- "Warning: This book may cause sudden bursts of intelligence. Side effects include showing off at family dinner."

**Wholesome/empowering (self-care teens):**
- "Every page is a gentle reminder: you are brilliant, you are capable, and your story matters."
- "This isn't just a journal—it's a daily love letter to the most important person you'll ever meet: yourself."

**Educational/professional (workbook seniors):**
- "Designed by educators with one goal: keep brains sharp at any age."
- "Over [N] expertly crafted puzzles to challenge your mind without straining your eyes."

**Fantasy/narrative (Genius Girls style):**
- "Step into a world where every puzzle is a quest, every challenge unlocks new powers..."
- "This isn't just an activity book — it's a destiny."

### BW_PAIN_POINTS_COMMON (pain points por audiencia)

**Padres/abuelos comprando para teens 11-15:**
- Aburrimiento en viajes largos / vacaciones
- Demasiado screen time
- "Algo educativo pero divertido" para regalar
- Stocking stuffer creativo
- Mantener mente activa en verano

**Seniors / familiares de seniors:**
- Letra muy chica en otros libros
- Aislamiento / soledad cognitiva
- Prevención de demencia/Alzheimer
- Regalo significativo
- Actividad sin pantalla

**Mujeres adultas (self-care/journals):**
- Stress / burnout
- Falta de tiempo para mindfulness
- Desconexión espiritual
- Necesidad de gratitud / reflection daily
- Buscar identidad post-vida-laboral

**Cuidadores de personas con condiciones:**
- Necesitan tracking médico simple
- Compliance con doctor recomendaciones
- Manejar ansiedad/depresión seres queridos
- Mantener mente activa de pacientes

### BW_BISAC_TO_AMAZON_STORE (mapping 2023+)

KDP eliminó BISAC en 2023. Equivalencias para tu nicho:

**variety-puzzle:** GAMES & ACTIVITIES > Puzzles > General · GAMES & ACTIVITIES > Puzzles > Logic & Brain Teasers · GAMES & ACTIVITIES > Word & Word Search

**word-search:** GAMES & ACTIVITIES > Word & Word Search · HEALTH & FITNESS > Aging · GAMES & ACTIVITIES > Puzzles > Crosswords

**sudoku:** GAMES & ACTIVITIES > Puzzles > Sudoku · GAMES & ACTIVITIES > Puzzles > Logic & Brain Teasers

**coloring-book:** CRAFTS & HOBBIES > Coloring Books > Adult · SELF-HELP > Stress Management

**activity-book-kids:** JUVENILE NONFICTION > Activity Books > General · JUVENILE NONFICTION > Games & Activities

**journal-prompts:** SELF-HELP > Journaling · BODY MIND & SPIRIT > Mindfulness & Meditation · RELIGION > Christian Living > Prayer

**planner:** BUSINESS & ECONOMICS > Time Management · SELF-HELP > Personal Growth · HOUSE & HOME > Organization

---

## 🗺️ Roadmap por fases

### ✅ Fase A — Wizard MVP (DONE 2026-04-28)
- Tab "📚 Create Book" con 6 stages
- BookProject data model centralizado
- Smart Defaults Engine (5 presets)
- Compliance Score live
- References sidebar drag-drop + Claude prompt generation
- Theme cálido (no blue/no black)
- Stage color coding + cards visuales
- KDP 2026 rules verificadas
- Mascot suggestions per niche (9 nichos)
- Interior recommendations engine
- Image plan per niche

### ✅ Fase A2 — Series Management (DONE 2026-04-29)
- `series: { name, volume, parentBookId }` en data model
- Auto-detección de "Vol N" / "Volume N" en títulos legacy
- `bwDuplicateAsNextVolume` clona positioning/style/technical/refs y resetea content
- Header dropdown agrupa volúmenes por serie (`<optgroup>`)
- Sidebar panel con todos los volúmenes + % progreso

### ✅ Fase D — PDF Compile + Cover Wrap (DONE + TESTED 2026-04-29)
- `js/book-compile.js` orquestador end-to-end
- Assets manager UI en Stage 6 (slot-based upload con compresión auto a 300DPI)
- Compile readiness check (validates all stages + author + margin sanity)
- Preview modal con iframe PDF + Download button
- Cover wrap PDF con spine width auto-calculado
- Auto back-matter: copyright + AI disclosure + about-author + series cross-promo + review request
- Smoke-tested programáticamente con 170 puzzles → 154 pages PDF válido

### ⏳ Fase B — Sistema completo de sugerencias (PENDING)
- Implementar BW_TITLE_FORMULAS en Stage 5
- Implementar BW_KEYWORDS_LIBRARY en Stage 5
- Implementar BW_DESCRIPTION_HOOKS en Stage 5
- Implementar BW_PAIN_POINTS_COMMON en Stage 1
- Auto-suggest dropdowns con opciones reales

### ⏳ Fase C — Conexión Wizard ↔ Image Workflow
- Cuando user llena Stage 1+2+3, auto-genera el manifest del Image Workflow
- Image Workflow lee del BookProject activo (no hardcoded)
- Cambio en wizard se refleja en Imágenes IA inmediatamente

### ✅ Fase D — Compile PDF (DONE + HARDENED 2026-04-30)
**Archivo:** `js/book-compile.js` (~840 líneas)

**Funciones públicas:**
- `bwCompileBook(project, opts)` → devuelve `jsPDF` doc con interior completo (frontmatter + sections + soluciones + backmatter)
- `bwCompileCoverWrap(project)` → devuelve `jsPDF` doc con cover wrap (back+spine+front, dimensiones KDP-ready)
- `bcCalcSpineWidth(project)` → `{inches, points}` según pgs × paperThickness
- `bcProcessUploadedImage(file, trimId)` → comprime imagen a 300DPI con bleed, JPEG q=0.88
- `bcGetRequiredSlots(project)` → array de slots dinámico por sections + page treatment
- `bcSaveAsset/bcGetAsset/bcRemoveAsset` → CRUD de assets en `project.assets[slotId]`. `bcSaveAsset` retorna `boolean` (false si quota exceeded, con rollback automático del in-memory state).
- `bcDocToBlobURL(doc)` → blob URL para iframe preview
- `bcDownloadDoc(doc, filename)` → trigger descarga directa

**Auto-pageCount sync:** después de cada compile interior exitoso, `bwHandleCompileInterior` actualiza `project.content.pageCount` con `doc.internal.getNumberOfPages()` y muestra toast informando — elimina el bug donde Stage 4 page count no matcheaba el PDF real (KDP rechaza upload si no coinciden).

**Constants KDP-correct:**
- BC_BLEED = 9pts (0.125")
- BC_PAPER_THICKNESS = { white: 0.002252, cream: 0.0025 } in/page
- BC_TRIMS_IN = todas las trim sizes oficiales KDP

**Pipeline del bwCompileBook:**
1. Title page (texto centrado, autor, vol)
2. Copyright (auto-fill: año, autor, AI disclosure note si flag)
3. AI Disclosure page (solo si project.compliance.aiDisclosed === true)
4. Welcome (full-page image si subida, sino texto)
5. Por cada section:
   - Section divider (full-page image si subida, sino fallback estilizado con tagline)
   - Puzzle pages (call generadores legacy con corner ornament overlay si pageTreatment activo)
6. Solutions divider + soluciones por sección
7. About the Author (template)
8. More Books in This Series (auto cross-promo via series.name)
9. Review request (template)

**Tipos de section soportados:** wordsearch, sudoku, math, mazes, cryptogram, rebus (placeholder por ahora). Cada tipo usa los helpers de los generadores legacy (drawSudokuOnPage, createWordSearchGrid, etc.).

**Cover wrap KDP-ready:**
- Layout: `[bleed] [back cover (tw)] [spine] [front cover (tw)] [bleed]`
- Spine width = pageCount × paperThickness (auto correcto)
- Spine text rotado 90° para libros USA left-binding
- Soporta cover-front + cover-back uploads

**UI integrada en Stage 6:**
- **Assets Manager grid:** slots dinámicos según secciones + page treatment. Cada slot card tiene thumb + label + replace/remove. Click empty card → upload con compresión automática a 300DPI.
- **Compile readiness check:** valida stages 1-5 completos + cover front uploaded antes de habilitar compile.
- **Botones Compile Interior PDF + Compile Cover Wrap PDF** con progress bar live.
- **Preview Modal:** iframe mostrando el PDF generado en pantalla completa. Botones: Cerrar (volver a editar) / Descargar PDF.

### ⏳ Fase E — Cloud deploy + sync
- Deploy a Cloudflare Pages → URL pública
- Acceso desde iPhone Safari (con responsive ya hecho)
- Caveat: localStorage NO sincroniza entre devices
- Solución intermedia: Export/Import JSON via AirDrop
- Solución real: Supabase backend (cuando volumen lo justifique)

### ⏳ Fase F — Refactor de generadores legacy
- word-search.js, sudoku.js, journal.js, etc. — actualmente islas con storage propio
- Refactor: leer del BookProject activo
- Cambiar título en wizard → reflejar en TODOS los tabs
- Migrar storage a `bw_projects` único

### ⏳ Fase G — Producto features avanzados
- Pen name management (multi-author distribution)
- Series strategy auto-link (Vol 1, Vol 2 detection)
- USPTO Class 016 trademark check
- Pre-launch marketing plan generator (Pinterest pins, TikTok hooks)
- Reviews strategy (ARC team integration)
- A+ Content templates (Brand Registry users)
- Bulk mode (varios libros simultáneos — reemplaza batch.js)

---

## 🎨 Image Generation Pipeline

### Estrategia 2-fases
| Fase | Tool | Costo |
|---|---|---|
| Book 1 (current) | OpenArt UI manual (plan Infinite, créditos existentes) | $0 |
| Book 2+ (cuando volumen justifique) | fal.ai + n8n (workflow ya construido) | ~$2/libro |

### Por qué NO OpenArt API
Plan Infinite NO incluye API access. Solo Enterprise (sales conversation + custom price). Confirmado 2026-04-28 — usuario revisó settings exhaustivamente, sin API menu. **NO re-investigar este tema.**

### Bookmarklet para auto-paste
En `index.html` tab Imágenes IA hay un bookmarklet que el user arrastra a su barra de bookmarks. Después en OpenArt: click → prompt se pega → click Generate. 1-click después del setup.

```javascript
javascript:(async()=>{try{const t=await navigator.clipboard.readText();const i=document.querySelector("textarea[placeholder*=prompt i],textarea[name*=prompt i],textarea");if(i){const s=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value").set;s.call(i,t);i.dispatchEvent(new Event("input",{bubbles:true}));i.focus();}else{alert("No se encontró el campo de prompt en esta página")}}catch(e){alert("Error: "+e.message)}})();
```

---

## 📚 References from research session 2026-04-26

Top sellers que estudiamos:

| Libro | Reviews | Insight clave |
|---|---|---|
| **Brain Games Puzzles Left/Right** (PIL) | 1,666★ | Variety + skill tags + named puzzles + header bands de color |
| **The Epic Activity Book for Genius Girls** (Doc Enigma) | 39★ ($14.52) | Narrative wrapper + themed borders + premium pricing — VALIDA cover AI generated |
| **Difficult Puzzle Book for Smart Kids** (M Prefontaine) | 1,006★ ($7-9) | Cover layout: color sólido + tipografía + grid samples + doodles |
| **Wimpy Kid** (Greg Heffley) | 300M+ copias | Comic B&W con character art = winning formula kids 8-15 |
| **Wreck This Journal** (Keri Smith) | Millones | Punk/destructive B&W vibe |

### Lecciones de top sellers aplicadas a Mega Brain Games:
1. ✅ Cover style M Prefontaine (color sólido + tipografía + doodles) — pero pivot a yellow + brain mascot
2. ✅ Variety + skill tags + named puzzles (Brain Squad)
3. ✅ Narrative wrapper Genius Girls — pero Brain Squad teen-snarky no fantasy-magical
4. ✅ Wimpy Kid character art (cerebro mascota consistente cover + interior)
5. ❌ Pinterest aesthetic (mi error inicial) — corregido a comic energy

---

## ⚠️ Errores históricos (corregidos — para no repetir)

### 2026-04-28: Print costs MAL calculados
**Antes (mal):** B&W 200pg = $2.15, Color 200pg = $5.65
**Real KDP 2026:** B&W = $3.25, Color = $14.85

Implicación crítica: Recomendación inicial "color @ $14.99" era margen NEGATIVO. Corrección: B&W @ $11.99 ó Color @ $29.99+.

### 2026-04-28: BISAC categories outdated
KDP eliminó BISAC en mid-2023. Ahora "Amazon Store Categories" (3 max firme).

### 2026-04-28: Pinterest aesthetic para kids 11-15
Mi error: asumir aesthetic minimalista = teen. Realidad: Pinterest aesthetic = mujeres 18-30, NO kids. Pivot a Comic Wimpy Kid validado por user.

### 2026-04-29: Sprint 1 bugs encontrados via test programático
Fixes aplicados antes de que el user los encontrara:

1. **count=0 sections creaban dividers huérfanos** — `bcRenderSectionDivider` corría incluso si no había puzzles. Picture Detectives (count=0) generaba page con tagline y nada después. Fix: `if (!section.count || section.count <= 0) continue;` en main loop.

2. **Word search slicing bug** — el código original `wordsPool.slice(i*3 % len, Math.floor(gridSize*0.8))` daba arrays vacíos cuando start > end. Fix: rotación de themes (animals/food/nature/sports/etc) por puzzle, llamando `getWordsForTheme` cada iteración.

3. **Author / Pen name no validado** — copyright page decía "The Author" si user no llenaba el campo. Fix: campo añadido a Stage 1 (positioning), validation en compile readiness.

4. **Cover wrap back vacío** — si user no subía cover-back image y no tenía description, la contraportada salía blanca. Fix: fallback con título + auto-generated description + author al pie.

5. **No margin sanity check en readiness** — user podía compilar con margen negativo. Fix: validation `royalty > $0.50/book` en readiness panel.

### 2026-04-29: Idioma de la plataforma
Originalmente UI tenía mix español/inglés. Memoria personal: "Todo lo implementado: inglés". Fix: traducción exhaustiva de book-wizard.js, book-compile.js, index.html. UI 100% en inglés ahora.

### 2026-05-01: Sprint 2 — design-level fixes

1. **Hardcover format silently used paperback math.** User noticed: ticking the hardcover format checkbox didn't change the royalty preview or compliance. Root cause: `bwCalcPrintCost` had no `format` parameter — both formats used $0.85 base. Fix: added `format` parameter (`'paperback'` | `'hardcover'`); hardcover swaps to $6.80 base. Compliance now validates each format independently. Stage 4 royalty box renders one card per active format.

2. **Author was a single text field — KDP supports up to 9 contributors with roles.** User pushed back when asked to put two names with `&`. Real KDP UI is structured: Primary Author (Prefix/First/Middle/Last) + array of Contributors with role dropdown. Fix: rebuilt Stage 1 author card to mirror KDP exactly. Migration is automatic (`bwMigrateAuthorFields`).

3. **Compile rendered all puzzles of one type in a row.** User feedback: "estan todas seguidas sopas de letras, luego todas seguidas numeros … les aburriiria asi todo seguido". This was a code-architecture decision (one section = one block) treated as a UX decision. It isn't. Top-selling teen activity books interleave types per page. Fix: added `content.pacing` field + `bcCompileMissionArc` orchestrator. Each mission is a divider page + a chunk of each section type interleaved. Default for variety-puzzle:for-teens preset is now `mission-arc`.

4. **60 math problems was too many.** Variety-puzzle:for-teens shipped with 30/30/60/25/25 = 170 puzzles. Math at 35% of total = "feels like homework". Real teen books cap math at 20-25. Fix: 25/25/25/25/25 = 125 puzzles. Page count drops 180 → 130 → price point can drop $11.99 → $9.99 (more competitive).

5. **localStorage filled silently and froze the UI.** User hit a 14.6 MB project (Chrome cap ~10 MB). Toast said "delete projects" but the user had no visibility into what was eating space. Fix: storage bar at top of Stage 6 Assets card showing % used, color-coded, with project size and unused image count. New buttons: 🧹 Clear unused images (removes orphan slot IDs) and 📊 Breakdown (alert listing all projects with sizes). Real fix is IndexedDB migration (P8 #31) but cleanup tool buys time.

### 2026-04-30: Sprint 1.5 audit — 6 bugs adicionales encontrados via 15-test suite

1. **`corner-ornaments-per-section` bloqueado en B&W incorrectamente** — `bwTreatmentAllowedForInterior` lo metía en el catch-all de "color only". Realidad: son ilustraciones simples, no gradientes — funcionan en B&W. Fix: agregada excepción explícita. Resultado: variety-puzzle:for-teens ahora aplica `corner-ornaments-per-section` por default (6 ornaments uno por squad), no fallback a single.

2. **Compliance score no penalizaba pen name vacío** — agregado check Stage 1: `-8 puntos` si falta. Score ahora 79 (sin author) → 87 (con author).

3. **Duplicate Vol N+1 perdía campos** `tagline`, `perPage`, `mathType`, `themes` de las secciones. Reemplazado field-cherry-pick por `bwDeepClone(s)` — preserva toda la estructura.

4. **Duplicate Vol N+1 NO copiaba `assets`** — user re-subía 8+ imágenes innecesariamente. Fix: `assets: bwDeepClone(source.assets)` en clone. Vol N+1 hereda dividers/ornaments/welcome/quote/solutions; user solo cambia cover-front.

5. **localStorage quota exceeded fallaba silenciosamente** al subir imagen. Fix: try/catch en `bwSaveAll` con detección de `QuotaExceededError`, toast claro al user, rollback en `bcSaveAsset` para que el in-memory state no muestre la imagen como "guardada" cuando falló persistir.

6. **Page count en Stage 4 no matcheaba PDF real después de compile** — KDP rechaza upload si pageCount entered ≠ páginas en PDF. Fix: auto-sync en `bwHandleCompileInterior` — después del compile, `project.content.pageCount = doc.internal.getNumberOfPages()` con toast informando el user.

## 🧪 Pipeline test results (2026-04-29)

Test programmático con jsPDF en Node, simulando browser script-scope con `var` transformation:

```
Project: Mega Brain Games for Teens — Vol 1
- 5 sections active (Picture Detectives count=0 skipped)
- 170 puzzles total: 30 ws + 30 sudoku + 60 math + 25 mazes + 25 cryptogram
- Cover: 6×9, B&W cream, 180 pgs, no images uploaded (fallback text)

Output:
  Interior PDF: 154 pages, 293.5 KB, valid PDF 1.3 ✓
  Cover wrap:   1 page,    3.4 KB,   valid PDF 1.3 ✓
  Spine width:  0.450" (180 pgs × 0.0025" cream — KDP correct)

Pipeline stages exercised:
  ✓ Title page
  ✓ Copyright (auto-fills year + author + AI disclosure note)
  ✓ AI Disclosure page (only when compliance.aiDisclosed === true)
  ✓ Welcome page (text fallback)
  ✓ 5 section dividers (text fallback with taglines)
  ✓ Word Search 30 puzzles (rotating themes per puzzle)
  ✓ Sudoku 30 puzzles
  ✓ Math 60 problems (3 pages of 20)
  ✓ Mazes 25 puzzles
  ✓ Cryptograms 25 puzzles (using CRYPTOGRAM_QUOTES)
  ✓ Solutions divider + per-section solutions
  ✓ About the Author
  ✓ More Books in This Series (lists series siblings via bwGetSeriesSiblings)
  ✓ Review Request
  ✓ Cover wrap with spine text rotated 90° (USA left-binding)
  ✓ Back cover fallback (title + description + author signature)
```

Test file scaffolding lived in /tmp/compile-test.js (not committed). To re-run after future changes:
```bash
cd /tmp && npm install jspdf
# Build the test file (see git history if needed) and run
node compile-test.js
```

---

## 🎯 Decisiones (resueltas 2026-04-29)

1. ✅ **Interior B&W $11.99 confirmado como default** en seed (Color @ $14.99 daba margen NEGATIVO). User puede cambiar a Color $29.99 manualmente si prefiere mascota a color full.
2. ✅ **Fase D (Compile PDF) shipped + tested** antes de Fase B (Marketing suggestions data libraries).
3. ⏳ **Cloudflare Pages deploy** — pendiente, aún no necesario hasta tener Vol 1 publicado.

## 🚀 Steps para sacar Vol 1 (workflow probado end-to-end)

```
1. Open http://localhost:8765/
2. Header → 🗑️ Delete (delete old project if its seed has stale defaults)
3. + New book → "Mega Brain Games for Teens — Vol 1"
   (seed auto-applies B&W $11.99, sections, taglines, page treatment, layout)
4. Stage 1 → Fill **Author / Pen name** (REQUIRED — copyright will say "The Author" otherwise)
5. Skim Stages 2-5 (defaults are recommended; just confirm)
6. Stage 6 → Upload at minimum **Cover front** image (V3 yellow brain)
   Optional: section dividers, welcome/quote/solutions, corner ornaments
7. Stage 6 → Click 📖 **Compile Interior PDF** → preview opens in modal
   Note actual page count from PDF (≈154 for full Mega Brain Games)
8. Stage 4 → Update pageCount to match actual (KDP requires exact match)
9. Stage 6 → Click 🎨 **Compile Cover Wrap PDF** → preview opens
   Spine width auto-calculated correctly
10. Download both PDFs
11. Upload to KDP:
    - Manuscript = Interior PDF
    - Cover = Cover Wrap PDF
    - **MARK AI Content Disclosure** (legally required, Stage 6 explains)
    - Fill metadata from Stage 5 marketing fields
    - Order print proof BEFORE Publish
12. After proof OK → Publish
```

## ⚠️ Known limitations (transparent for the user)

| Limitation | Impact | Workaround |
|---|---|---|
| **Bleed clipped on full-bleed images** | Page size = trim only (not trim+bleed). The 0.125" bleed area of dividers gets cut at print. | Keep important content 0.25" from edges of any uploaded image. KDP usually tolerates non-edge content. |
| **Maze solutions = text fallback** | Solutions page says "trace blue dot to red dot" instead of drawing the path. | Acceptable for MVP. Future fix: implement maze solver in `extra-puzzles.js`. |
| **No rebus generator** | Picture Detectives section count=0 in seed (skipped during compile). | Vol 1 ships with 5 sections (170 puzzles) instead of 6 (200). Build rebus generator before Vol 2 if you want this section. |
| **Section divider fallback is text-only** | If you don't upload a divider image, the section page shows the section name + tagline as styled text (no illustration). | Functional. Upload generated dividers anytime to upgrade visually. |
| **iPhone Safari may not render PDF in iframe modal** | Preview may auto-download instead of showing inline. | Use Chrome/Firefox/Safari macOS for desktop preview; iPhone is fine for downloading. |
| **localStorage 5MB cap** | If you upload many high-res images, may exceed limit (silent failure on write). | For Mega Brain Games (8 images), no problem. For coloring books (50+ images), need IndexedDB migration (P8 #31 in audit). |

---

## 🔗 URLs y comandos clave

### Local development
```bash
# Start server
python3 -m http.server 8765

# Open
http://localhost:8765/
```

### Repo
- GitHub: https://github.com/lilyrcolumbus-hash/kdp-book-factory
- Branch principal: `main`

### KDP refs
- KDP dashboard: https://kdp.amazon.com/
- KDP Cover Calculator: https://kdp.amazon.com/cover-calculator
- KDP help (print costs): https://kdp.amazon.com/en_US/help/topic/G201834340
- KDP help (margins/bleed): https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6

---

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3
- **PDF Engine**: jsPDF 2.5.1 (CDN)
- **ZIP Engine**: JSZip 3.10.1 (CDN — para Imágenes IA export)
- **Storage**: localStorage (persistente per-browser)
- **No frameworks, no build step** — abre `index.html` directo o sirve con Python http.server

## Project Structure
```
index.html              — UI principal (tabs, secciones, wizard inline styles)
css/
  style.css             — Estilos legacy dark mode
  theme-warm.css        — Override warm light theme + stage colors + cards
js/
  app.js                — Tab nav, language switcher, tools toggle
  book-wizard.js        — Wizard 6-stages + smart defaults + compliance
  image-workflow.js     — Tab Imágenes IA (11 paneles para Mega Brain Games)
  word-search.js        — Generador sopas (legacy, isla)
  sudoku.js             — Generador sudoku (legacy, isla)
  journal.js            — Generador journals (legacy, isla)
  coloring.js           — Generador coloring (legacy, isla)
  math-puzzles.js       — Generador math (legacy, isla)
  extra-puzzles.js      — Mazes, cryptograms, crosswords (legacy)
  adhd-planner.js       — ADHD basic PDF
  adhd-workflow.js      — ADHD PRO Canva blueprint
  cover-generator.js    — Cover básico
  metadata.js           — SEO templates
  royalties.js          — Calc legacy (reemplazado por wizard Stage 4)
  preview.js            — PDF preview modal
  batch.js              — Batch 5 libros (deprecar — wizard reemplazará)
  storage.js            — localStorage wrapper legacy
  kakuro.js             — Kakuro generator
  backgrounds.js        — Backgrounds vector library
n8n/
  manifest.schema.json
  manifest.example.mega-puzzle-teens.json
  manifest.test.first-3-pages.json
  workflow.book-images.json
  SETUP.md
output/                 — destino del ZIP exportado de Imágenes IA (después de unzip)
references/             — destino de imágenes referencias (drag-drop del wizard)
```

## Conventions
- All generator functions are `async`, use `tick()` for UI responsiveness
- Page dimensions via `getPageDimensions(size)` in app.js — returns `[width, height]` in points
- Progress bars: `showProgress(id, percent, text)` / `hideProgress(id)`
- Form ID prefixes: `ws-` (word search), `su-` (sudoku), `bw-` (book wizard), `iw-` (image workflow)
- Bilingual support: `UI_STRINGS` in app.js
- Click-to-copy on `.prompt-item` and `.meta-item`

## How to add a new niche to the wizard
1. Agregar a `BW_NICHES` con id, name, subs[]
2. Agregar layout preset a `BW_LAYOUT_PRESETS[niche]`
3. Agregar smart defaults a `BW_PRESETS[niche:subNiche]`
4. Agregar mascot suggestions a `BW_MASCOT_SUGGESTIONS[niche:subNiche]` o `niche:any`
5. Agregar interior recommendation a `BW_INTERIOR_REC[niche]`
6. Agregar image plan a `BW_IMAGE_PLAN[niche]`
7. Agregar BISAC suggestions a `BW_BISAC_SUGGESTED[niche]`
8. Cuando se implemente Fase B: agregar a BW_TITLE_FORMULAS, BW_KEYWORDS_LIBRARY, BW_DESCRIPTION_HOOKS

## 🔍 Audit completo — qué falta en la plataforma (2026-04-28)

Análisis exhaustivo de gaps. Priorizado por impacto al goal "publicar libros KDP profesionalmente".

### 🔥 P0 — Bloqueante (sin esto, no puedes publicar)

**1. PDF Compile (Fase D)** ✅ DONE 2026-04-29 — `js/book-compile.js`
- ✅ `bwCompileBook(project)` junta frontmatter + section dividers + puzzle pages + solutions + backmatter
- ✅ Respeta layout (recto/verso disponible via project.technical.layout)
- ✅ Aplica corner ornaments overlay automático cuando pageTreatment activo
- ✅ jsPDF, 300 DPI con bleed 0.125" correcto
- ✅ Soporta wordsearch, sudoku, math, mazes, cryptogram (rebus = placeholder)

**2. Cover wrap calculator** ✅ DONE 2026-04-29
- ✅ `bwCompileCoverWrap(project)` con spine width = pgs × paperThickness (white 0.002252", cream 0.0025")
- ✅ Genera PDF full-wrap (back+spine+front) con bleed
- ✅ Spine text rotado 90° (USA left-binding)

**3. Auto-back-matter generator** ✅ DONE 2026-04-29
- ✅ Copyright auto-fill (año, autor, AI disclosure note)
- ✅ About the Author template
- ✅ Cross-promo "More Books in This Series" — lee `bwGetSeriesSiblings()` para auto-listar otros vols
- ✅ Review request page
- ✅ AI disclosure page condicional (si `compliance.aiDisclosed === true`)

### 🟡 P1 — Crítico para profesional (sin esto, ves amateur)

**4. Pen name / Imprint management**
- Tabla de pen names (multi-author distribution)
- Imprint name (publisher branding distinto del autor)
- KDP recomienda 2-3 pen names para distribuir riesgo de bans
- Author Central setup checklist
- Pendiente agregar campo `authorPenName` y `imprint` a positioning stage

**5. Series strategy auto-link** ✅ DONE 2026-04-29
- ✅ Detect "Vol 1 / Volume 1" en título → marca como serie (`bwAutoDetectSeries`)
- ✅ Botón "📖 Duplicar como Vol N+1" copia 90% de decisiones, resetea contenido
- ✅ Sidebar panel muestra todos los volúmenes de la serie con progreso %
- ✅ Header dropdown agrupa por serie via `<optgroup>`
- ⏳ PENDIENTE: KDP Series Page setup (es manual en KDP dashboard, la plataforma no puede automatizar)
- ⏳ PENDIENTE: Auto-back-matter "Vol 2 coming soon" — depende de PDF Compile (P0 #1)
- ⏳ PENDIENTE: Cross-promo automático entre volúmenes — usa `series.parentBookId` cuando se haga PDF Compile

**6. Cover validation**
- Verificar que cover dimensions match el page count + paper
- Warning si user pone cover sin spine
- Preview del cover en thumbnail Amazon (test "se ve a 90px ancho?")

**7. Trademark check (USPTO Class 016)**
- Link directo a búsqueda USPTO con título pre-llenado
- Warning antes de Stage 6 "verifica que tu título no sea trademark"
- Class 016 = printed publications

**8. Print proof workflow**
- Reminder en Stage 6: "ANTES de hacer Publish, ordena print proof"
- Tracking del proof copy ordenado
- Checklist de revisión del proof

### 🟢 P2 — Marketing operations (después de publicar)

**9. Pinterest pins generator**
- 10 pins por libro (cover, interior, mockup, lifestyle, quote pins)
- Templates Canva-ready
- Plan estratégico decía "Pinterest es tu arma #1" — pero no tenemos generator

**10. TikTok/Reels hooks generator**
- 5 scripts por libro (flip-through, satisfying solve, gift unboxing, "5 reasons", reaction)
- Hashtags por nicho
- Hook templates probados

**11. Reviews acquisition strategy**
- Booksprout integration checklist
- BookSirens setup
- ARC team coordination
- Vine eligibility check (necesitas Brand Registry)
- 5 reviews = +270% sales (umbral mágico)

**12. Reddit/Facebook groups posting plan**
- r/selfpublish, r/kdp, r/puzzles posts schedule
- Facebook KDP groups, puzzle lover groups
- Templates de post (valor, no spam)

**13. Email list building**
- Reader magnet (free first chapter PDF)
- Mailing list integration (Mailchimp, ConvertKit)
- Auto-nurture sequence template

### 🟦 P3 — Analytics y tracking (después de publicar)

**14. BSR/Royalty tracking dashboard**
- Track BSR diario por libro
- Royalty mensual por libro
- Conversion rate (impressions → clicks → buys)
- Keyword performance (qué keywords convierten)

**15. A/B testing**
- Test 2 covers (cambiar a mitad del año)
- Test 2 descriptions
- Track impact en BSR/sales

**16. Categories rank tracking**
- Verifica si tu libro rankea en top 100 de categorías elegidas
- Si no rankea → ajustar keywords

### 🟪 P4 — Distribución más allá de KDP

**17. Ingram Spark integration**
- Distribución a librerías físicas
- Hardcover en wider markets
- Higher list price para librerías (40% margin)

**18. Apple Books / Google Play / B&N**
- Multi-platform publishing
- Diferentes formatos requeridos por cada uno

**19. Audiobook (ACX)**
- Post Vol 1 vendiendo, audiobook = +30% revenue
- Royalty share vs pay-per-finished-hour

### 🟣 P5 — Translation pipeline (Spanish market)

**20. EN → ES auto-translation**
- Word lists translation (ya tienes WORD_LISTS_ES)
- Description translation
- Keywords backend en Spanish
- Bilingual book template (EN+ES en same book)

**21. Mexican/LATAM market specifics**
- Amazon.com.mx pricing (peso conversion)
- Cultural adaptations
- Bisac equivalents en español

### 🟠 P6 — Content production helpers

**22. Title page generator**
- Plantilla con título + autor + publisher
- Estilizado según paleta del libro

**23. Dedication page**
- Template con espacio para dedicatoria personal

**24. Acknowledgments**
- Template con lista de agradecimientos

**25. Glossary/Index**
- Para libros educativos
- Auto-generado de keywords

### 🔵 P7 — UX improvements

**26. Onboarding tour**
- Primera vez que abres → tour interactivo de los 6 stages
- Skippable

**27. Save indicator visible**
- Toast "Guardado ✓" en cada cambio
- Currently silent — user no sabe si se guardó

**28. Undo/redo**
- Cmd+Z para revertir cambios
- Currently no hay undo si rompes algo

**29. Project timeline view**
- Última edición por libro
- Progreso % por libro
- Estimated time to complete

**30. Print-friendly summary**
- Imprime el BookProject como 1-page reference sheet
- Útil para tener al lado cuando subes a KDP

### ⚙️ P8 — Technical platform

**31. localStorage scaling**
- ~5-10MB limit per origin
- Imágenes base64 llenan rápido
- Necesitas migrar a IndexedDB o filesystem cuando llegues a 5+ libros

**32. Auto-backup local**
- Auto-export JSON cada N cambios al disco
- Versioning (book-vol1-v1.json, v2.json...)

**33. Cloud sync (Supabase)**
- Real cross-device sync
- Multi-user collaboration (futuro)
- Backup encriptado

**34. PWA installable**
- Manifest.json para iPhone "Add to Home Screen"
- Service worker para offline mode
- Push notifications (cuando KDP responde a tu submission)

**35. Multi-window**
- Abrir Wizard + Image Workflow side-by-side
- Currently solo 1 tab a la vez

**36. Keyboard shortcuts**
- Tab navigation entre stages
- Cmd+S explicit save
- Cmd+E export JSON
- ? para mostrar ayuda

### 🔴 P9 — Compliance edge cases

**37. International rights check**
- Si tu libro usa quotes/citations → permission needed
- Public domain rules (pre-1928 = public domain en USA)
- Fair use guidelines

**38. KDP Select strategy**
- Enroll en Select = exclusive 90 days en Kindle
- Bonus: 5 free promo days + Kindle Unlimited royalties
- Trade-off: no puedes vender Kindle en otras plataformas

**39. Tax/legal checklist**
- W-9 filed con KDP
- Tax interview completed
- Bank account configurado
- LLC vs personal tax ID

### 🎨 P10 — Brand consistency (multi-book scaling)

**40. Brand kit per pen name**
- Logo del publisher (mark)
- Spine consistency entre series
- Trade dress (recognizable design language)
- Cover template reusable

**41. Series bible**
- Mascot consistency (cerebro rosa SIEMPRE igual)
- Tone consistency
- Section naming convention

**42. Inventory tracking**
- Author copies ordered
- Print proofs storage
- Review copies sent (a quién, cuándo)

---

## 🏆 Mi recomendación de orden de ataque (post-Fase A)

Si cumples este orden, tienes una operación profesional escalable:

| Sprint | Items | Por qué primero |
|---|---|---|
| ✅ **Sprint 1** DONE 2026-04-29 | P0 #1 (PDF Compile) + #2 (Cover wrap) + #3 (Auto back-matter) | Cierra el ciclo end-to-end. |
| **Sprint 2** | P1 #4 (Pen name) + ✅ #5 (Series — DONE) + #6 (Cover validation) | Profesional vs amateur |
| **Sprint 3** | P2 #9 (Pinterest) + #10 (TikTok) + #11 (Reviews) | Marketing post-launch |
| **Sprint 4** | P3 #14 (Tracking) + P8 #32 (Backup) + #33 (Cloud sync) | Escalar sin perder data |
| **Sprint 5** | P5 #20 (ES translation) + P4 #17 (Ingram) | Expansión de mercado |

**Realista:** Sprint 1 = 1 semana de build. Sprint 2 = 3 días. Sprint 3 = 5 días.

---

## How to extend the wizard with a new stage
1. Agregar botón al `bwRenderStageNav()` array
2. Crear `bwRenderStageN(el)` function
3. Agregar al switch en `bwRenderStageContent()`
4. Agregar CSS class `.bw-stage-N` con `--stage-accent`
5. Agregar validations a `bwScoreCompliance()`
