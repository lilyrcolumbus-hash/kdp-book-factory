# KDP Book Factory

## Project Overview
Web-based PDF book generation tool for Amazon Kindle Direct Publishing (KDP). Single-page HTML5/JavaScript app using jsPDF. No backend required.

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3
- **PDF Engine**: jsPDF 2.5.1 (CDN)
- **Node.js**: Used for CLI PDF generation (`generate-v2.mjs`)
- **Storage**: localStorage for config persistence
- **No frameworks, no build step** — open `index.html` directly

## Project Structure
```
index.html              — Main UI (all tabs/forms)
css/style.css           — Dark theme styling
js/
  app.js                — Core: tab nav, page dimensions, progress bars, i18n
  word-search.js        — Word search puzzle generator
  sudoku.js             — Sudoku generator with backtracking
  journal.js            — Journals/planners (daily, weekly, monthly, etc.)
  adhd-planner.js       — ADHD-specific planner (basic PDF version)
  adhd-workflow.js      — PRO workflow: page-by-page Canva blueprint + image prompts
  coloring.js           — Coloring book builder + OpenArt prompt generator
  math-puzzles.js       — Math problem generator
  extra-puzzles.js      — Mazes, number search, cryptograms, crosswords
  cover-generator.js    — Basic KDP cover generator
  metadata.js           — SEO metadata templates for Amazon
  royalties.js          — KDP royalty calculator
  image-prompts.js      — Niche-specific image prompt generator (Midjourney/DALL-E)
  preview.js            — PDF preview modal
  batch.js              — Batch generation (5 books)
  storage.js            — localStorage persistence
generate-v2.mjs         — Node.js script to generate sample ADHD Planner PDF
```

## Key Conventions
- All generator functions are `async` and use `tick()` for UI responsiveness
- Page dimensions via `getPageDimensions(size)` in app.js — returns `[width, height]` in points
- Progress bars: `showProgress(id, percent, text)` / `hideProgress(id)`
- All form IDs follow prefix pattern: `ws-` (word search), `su-` (sudoku), `jr-` (journal), `adhd-` (ADHD planner), `ip-` (image prompts), etc.
- Bilingual support: `UI_STRINGS` in app.js with `es`/`en` keys
- Click-to-copy on `.prompt-item` and `.meta-item` elements

## Image Prompt Generator (`js/image-prompts.js`)
Generates detailed Midjourney/DALL-E prompts unique per book so no two books share visuals.
- Each niche has multiple style variations; the system picks a different one each time
- Used combos tracked in localStorage to avoid repeats within a session
- Each generation outputs: 1 master background, 1 cover, 7 illustrations, hex palette, Google Fonts
- Prompts include Midjourney flags (`--ar 17:22 --v 6 --style raw`)

### Supported Niches
| Niche | Styles | Target |
|-------|--------|--------|
| `adhd` | Boho Neutral Watercolor, Minimal Botanical, Earth Tone Geometric | Adults with ADHD |
| `senior` | Vintage Garden, Classic High Contrast, Sunny Coastal | Seniors, large print |

### Adding a New Niche
Add a new key to `IMAGE_PROMPTS` in `image-prompts.js`:
```js
IMAGE_PROMPTS.newNiche = {
    label: 'Display Name',
    description: 'Short description',
    styles: [
        {
            name: 'Style Name',
            bgPrompt: 'Detailed Midjourney prompt for master background...',
            illustrations: ['prompt1', 'prompt2', ...],  // 5-7 items
            coverPrompt: 'Detailed prompt for book cover...',
            palette: { color1: '#HEX', color2: '#HEX', ... },  // 6-8 colors
            fonts: { display: 'Font', body: 'Font', accent: 'Font' },
        },
        // Add 2-3 styles minimum for variety
    ],
};
```
Then add `<option value="newNiche">Label</option>` to the `#ip-niche` select in `index.html`.

## ADHD Planner Module
The ADHD planner has two modes:
1. **Basic PDF** (`adhd-planner.js`): Generates a functional but basic PDF via jsPDF
2. **PRO Workflow** (`adhd-workflow.js`): Generates a complete page-by-page blueprint for designing in Canva with:
   - Image prompts for Midjourney/DALL-E (backgrounds per page)
   - Exact text content with humor, ready to copy-paste
   - Color palette with hex codes
   - Font system (Playfair Display, Lato, Montserrat)
   - Step-by-step Canva instructions per page type

### ADHD Planner Design Principles (from market research)
- **Only 3 daily priorities** — not 47
- **Undated** — no guilt for skipped days
- **Instructions on every page** — users complained about no guidance
- **Humorous tone** — engagement through personality
- **Simple sections**: Time Blocks (morning/afternoon/evening), Brain Dump, Mood & Energy, Habit Tracker (max 7), Weekly Reflection
- **Color-coded days** with unique colors per weekday
- **Gentle, non-judgmental language** throughout

### ADHD Color Palette (original — used in basic PDF mode)
| Name | Hex | Usage |
|------|-----|-------|
| Calm Blue | #667EEA | Titles, primary actions |
| Soft Purple | #764BA2 | Section headers, accents |
| Gentle Green | #4CAF50 | Positive/success |
| Warm Amber | #FFB74D | Tips, highlights |
| Coral | #FF6F61 | Funny quotes, emphasis |
| Pink | #EC64AA | Weekend/special |
| Teal | #009688 | Secondary positive |

### ADHD Neutral Palette (CHOSEN — for Canva/PRO version)
User chose minimalist style inspired by Future ADHD (#1 worldwide planner) but with neutral colors and more creativity. This is the palette to use for the final Canva-designed product:

| Name | Hex | Usage |
|------|-----|-------|
| Cream | #F5F0E8 | Page background, base |
| Sand | #E8DCC4 | Secondary background, cards |
| Mocha | #8B7355 | Body text, borders |
| Sage Green | #A8B5A0 | Section headers, positive |
| Terracotta | #C08B6D | Accents, highlights |
| Dusty Rose | #D4A5A0 | Soft accents, weekend |
| Charcoal | #3C3A36 | Primary text, headings |
| Soft Gray | #B8B3A8 | Dividers, subtle elements |

## Design & Image Strategy

### Key Principle: Prompt Templates, Not Reused Images
Each book gets unique images generated from a prompt FORMULA. The formula is reusable, the images are not. This way:
- Every book looks different (Amazon won't flag, buyers won't notice)
- Production is fast (just change variables in the prompt formula)
- No image library to maintain

### Prompt Formula Structure
```
[STYLE] background for [BOOK TYPE],
[COLOR PALETTE], [THEMATIC ELEMENT],
minimal, high quality, [DIMENSIONS] --ar 17:22 --v 6 --style raw
```
Variables change per book: style (watercolor/botanical/geometric), palette (sage/lavender/coral), elements (leaves/stars/hearts), mood (calming/energizing/feminine).

8 styles × 6 palettes × 6 elements = 288 unique visual combinations possible.

### Image Assets Per Book (8 total)
1. **1 Master Background** — subtle texture/watercolor, lots of empty space for content
2. **7 Small Illustrations** — line art icons (brain, coffee, plant, stars, heart, divider, moon), transparent background, reusable across pages within the SAME book

### Canva Workflow (per book)
- **Day 1 (1h):** Generate images in Midjourney/DALL-E using prompts from the app
- **Day 2 (1-2h):** Design 7 unique page templates in Canva (Daily Focus, Weekly Overview, Brain Dump, Mood & Energy, Habit Tracker, Reflection, Welcome)
- **Day 3 (30min):** Duplicate templates to fill book (84 daily + 12 weekly + 12 brain dump etc. = ~145 pages), export PDF, upload to KDP

### What Gets Reused vs What's Unique Per Book
| Reused (invisible to buyer) | Unique per book (visible) |
|---|---|
| Canva layout/template structure | All images (always new) |
| Prompt formula in the app | Color palette |
| Font system approach | Visual style/mood |
| Page types (daily, weekly, etc.) | Illustrations and decorations |

## Product Roadmap — Target Niches
Based on market research of Amazon best sellers:

### Active Niches
1. **ADHD Planner** — adults, minimalist neutral boho style, Canva workflow
2. **Senior / Large Print** — high contrast, nostalgic, accessible

### Chosen Niches (Teens/Tweens, age 13) — USER SELECTED #2, #4, #5
Production order decided by user:

3. **Mega Puzzle Book for Smart Teens** (DO FIRST)
   - Mix: word search + sudoku + crosswords + cryptograms + trivia
   - 200 pages, $9.99, 6x9 paperback
   - All generators already exist in the app — fastest to produce
   - Title pattern: "The Ultimate Puzzle Book for Smart Teens"
   - Competitors: "Ultimate Brain Games for Teens" (word search, crosswords, cryptograms, sudoku mix)

4. **Destructive Journal ("Wreck This")** (DO SECOND)
   - Anti-journal with creative destruction prompts
   - "Rompe esta página", "Pinta con café", "Escribe tu peor miedo y táchalo"
   - Punk/sketch/raw aesthetic, hand-drawn feel
   - 120 pages, $9.99, 6x9 paperback
   - Inspiration: Wreck This Journal (Keri Smith, 10M+ copies sold), Burn After Writing
   - Teens who HATE traditional journaling love this format

5. **Self-Care / Confidence Planner for Teen Girls** (DO THIRD)
   - Vision board, bucket list, "Dear Future Me", mood tracker, habit tracker, goal setting
   - Sections: Personal Growth, Fitness, Habits & Self-Care, Savings & Budget, Study Goals
   - Aesthetic Pinterest style (lavender #B8A9C9, soft pink #E8B4B8, cream #FAF5EF)
   - 150 pages, $11.99, 8.5x11 paperback
   - Competitors: "2026 Planner for Teen Girls" (Brightbloom Nova), "52-Week Self-Love Journal"
   - Parents buy with urgency for daughters with anxiety

### Researched But Not Selected (for future)
- **Teen Anxiety / Mental Health Journal** — 90-day guided mood tracker, CBT prompts, self-care tools. Fastest growing teen sub-niche. Examples: "Teen Anxiety Journal: 90-Day Guided Mood Tracker" (CalmMind Press), "Therapy Journal for Teens" (ADC Publishing). Could be added later.
- **"Would You Rather?" Question Books** — 300-500 hilarious questions, $6.99-$9.99, ultra cheap to produce (text only). Viral among teens for road trips/sleepovers.
- **Summer/Road Trip Activity Books** — seasonal niche (May-August), puzzle variety packs
- **Gaming Guide Books** — Fortnite, Minecraft, Stardew Valley guides (surprisingly profitable)

### Market Data (Teen Niche)
- Best price range: $8.99-$12.99
- Optimal pages: 120-200
- Sizes: 6x9 (puzzles/journals), 8.5x11 (planners/activity)
- Parents buy for kids = high urgency purchases
- Anxiety/self-care journals = fastest growing teen sub-niche
- "For Smart Teens" in title = aspirational, increases clicks
- Best sellers mix multiple puzzle types (not just one)

### Amazon Best Seller References (Teen Category)
- The Ultimate Puzzle Book for Teens — crosswords, word search, sudoku, scramble
- Riddles for Smart Teens: 200 Puzzles — logic, investigations
- The Ultimate Activity Book For Teen Boys: 333+ Puzzles — variety pack
- Girls Rule Activity Book For Teens Made By Teens — mandala, M.A.S.H., sudoku, mazes
- Teen Anxiety Journal: 90-Day Guided Mood Tracker — prompts, mood trackers, self-care
- Anxiety Relief Journal for Teen Girls: 120 Guided Pages — ages 13-18
- Self Love Journal for Teens — daily prompts, activities, affirmations
- Put Your Worries Here (Lisa Schab LCSW) — creative therapeutic exercises
- Wreck This Journal (Keri Smith) — 10M+ copies, creative destruction
- Burn After Writing — secret journal, truth or dare with yourself

## KDP Page Sizes
All sizes available in `getPageDimensions()`. For hardcover books, use 8.25 x 11 (not 8.5 x 11). Recommended for ADHD planner: **8.5 x 11** (paperback) or **8.25 x 11** (hardcover).

## Running Locally
```bash
# Browser: just open the file
open index.html

# Generate sample ADHD PDF via Node:
npm install
node generate-v2.mjs
```

## Git Workflow
- Main development branch: `claude/generate-book-titles-syPZg`
- Merge to `main` for user access
- PDF samples committed to repo for mobile download access
- Repo is **private**

## Common Tasks
- **Add new book type**: Create `js/new-type.js`, add section in `index.html`, add tab button, add script tag, update `UI_STRINGS` in app.js
- **Add new niche to Image Prompts**: Add object to `IMAGE_PROMPTS` in `image-prompts.js`, add `<option>` to `#ip-niche` select in `index.html`
- **Add new page type to ADHD planner**: Add draw function in `adhd-planner.js`, add to `drawFn` map in `generateADHDPlanner()`, add blueprint in `adhd-workflow.js`
- **Generate sample PDF**: Edit and run `generate-v2.mjs` with Node.js, then convert to PNG with `pdftoppm -png -r 150 file.pdf output`
