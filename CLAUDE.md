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
  preview.js            — PDF preview modal
  batch.js              — Batch generation (5 books)
  storage.js            — localStorage persistence
generate-v2.mjs         — Node.js script to generate sample ADHD Planner PDF
```

## Key Conventions
- All generator functions are `async` and use `tick()` for UI responsiveness
- Page dimensions via `getPageDimensions(size)` in app.js — returns `[width, height]` in points
- Progress bars: `showProgress(id, percent, text)` / `hideProgress(id)`
- All form IDs follow prefix pattern: `ws-` (word search), `su-` (sudoku), `jr-` (journal), `adhd-` (ADHD planner), etc.
- Bilingual support: `UI_STRINGS` in app.js with `es`/`en` keys
- Click-to-copy on `.prompt-item` and `.meta-item` elements

## ADHD Planner Module (Primary Focus)
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
- **Add new page type to ADHD planner**: Add draw function in `adhd-planner.js`, add to `drawFn` map in `generateADHDPlanner()`, add blueprint in `adhd-workflow.js`
- **Generate sample PDF**: Edit and run `generate-v2.mjs` with Node.js, then convert to PNG with `pdftoppm -png -r 150 file.pdf output`
