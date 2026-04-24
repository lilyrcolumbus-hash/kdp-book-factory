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

### ADHD Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Calm Blue | #667EEA | Titles, primary actions |
| Soft Purple | #764BA2 | Section headers, accents |
| Gentle Green | #4CAF50 | Positive/success |
| Warm Amber | #FFB74D | Tips, highlights |
| Coral | #FF6F61 | Funny quotes, emphasis |
| Pink | #EC64AA | Weekend/special |
| Teal | #009688 | Secondary positive |

## Product Roadmap — Target Niches
Based on market research of Amazon best sellers:

### Active Niches
1. **ADHD Planner** — adults, minimalist neutral boho style, Canva workflow
2. **Senior / Large Print** — high contrast, nostalgic, accessible

### Planned Niches (Teens/Tweens, age 13)
3. **Mega Puzzle Book for Smart Teens** — mix word search + sudoku + crosswords + cryptograms + trivia, 200 pág, $9.99, 6x9. Already have all generators in the app.
4. **Destructive Journal ("Wreck This")** — anti-journal, creative destruction prompts, punk/sketch aesthetic, 120 pág, $9.99, 6x9
5. **Self-Care / Confidence Planner for Teen Girls** — vision board, bucket list, mood tracker, habit tracker, goal setting, aesthetic Pinterest style (lavender/soft pink), 150 pág, $11.99, 8.5x11

### Market Data (Teen Niche)
- Best price range: $8.99-$12.99
- Optimal pages: 120-200
- Sizes: 6x9 (puzzles/journals), 8.5x11 (planners/activity)
- Parents buy for kids = high urgency purchases
- Anxiety/self-care journals = fastest growing teen sub-niche

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
