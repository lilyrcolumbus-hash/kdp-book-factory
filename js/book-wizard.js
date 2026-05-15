// Book Wizard — Centralized Book Project orchestrator.
// Unifies data across all generators + tracks compliance + manages references.
// Storage: localStorage 'bw_projects' = { active: id, list: [{...projects}] }

// ====================== TAXONOMIES ======================

const BW_NICHES = [
  { id: 'variety-puzzle', name: 'Variety Puzzle Book', subs: ['for-teens','for-tweens','for-kids','for-adults','for-seniors-large-print'] },
  { id: 'word-search', name: 'Word Search', subs: ['large-print-seniors','for-teens','for-kids','themed-bible','themed-cooking','spanish'] },
  { id: 'sudoku', name: 'Sudoku', subs: ['easy-medium','medium-hard','large-print','for-kids','spanish'] },
  { id: 'coloring-book', name: 'Coloring Book', subs: ['adults-bold-easy','cottagecore','witchy-gothic','botanical','for-kids','mexican-folk-art'] },
  { id: 'activity-book', name: 'Activity Book', subs: ['for-teens','for-kids-8-12','for-adults','dementia-alzheimer','bilingual'] },
  { id: 'journal-prompts', name: 'Guided Journal', subs: ['prayer-women','gratitude','self-care-teens','grief','adhd-planner'] },
  { id: 'planner', name: 'Planner', subs: ['daily','weekly','adhd','self-care-teen-girls','profession-specific'] },
  { id: 'workbook-edu', name: 'Educational Workbook', subs: ['handwriting','sight-words','math-facts','bilingual-en-es'] },
  { id: 'kakuro', name: 'Kakuro', subs: ['easy','medium','hard'] },
  { id: 'cryptogram', name: 'Cryptogram', subs: ['famous-quotes','bible','humor'] },
  { id: 'health-tracker', name: 'Health Tracker', subs: ['blood-pressure','ibs-food','migraine','diabetes','menopause'] },
  { id: 'destructive-journal', name: 'Destructive / Wreck Journal', subs: ['teens','adults','prompts'] }
];

const BW_VISUAL_STYLES = [
  { id: 'comic-wimpy-kid', name: 'Comic / Wimpy Kid', emoji: '💥', tags: ['kids','teens','energetic','humor'] },
  { id: 'aesthetic-pinterest', name: 'Aesthetic / Pinterest', emoji: '✨', tags: ['teens','wholesome','girls','calm'] },
  { id: 'classic-clean', name: 'Classic Clean', emoji: '📐', tags: ['adults','seniors','professional'] },
  { id: 'fantasy-ya', name: 'Fantasy YA', emoji: '🔮', tags: ['kids','teens','narrative','magical'] },
  { id: 'gaming-neon', name: 'Gaming / Neon', emoji: '🎮', tags: ['teens','boys','energetic'] },
  { id: 'retro-vintage', name: 'Retro Vintage', emoji: '📻', tags: ['adults','nostalgic'] },
  { id: 'punk-sketch', name: 'Punk Sketch (Wreck)', emoji: '🎸', tags: ['teens','edgy','destructive'] },
  { id: 'watercolor-soft', name: 'Watercolor Soft', emoji: '🌸', tags: ['adults','calm','wellness'] },
  { id: 'bold-geometric', name: 'Bold Geometric', emoji: '🔶', tags: ['adults','professional','modern'] },
  { id: 'photorealistic', name: 'Photorealistic', emoji: '📷', tags: ['adults','specific'] }
];

const BW_PALETTES = [
  { id: 'comic-yellow',    name: 'Comic Yellow',    colors: ['#FFD93D','#FF6B9D','#4ECDC4','#2B6CB0'] },
  { id: 'aesthetic-cream', name: 'Aesthetic Cream', colors: ['#F5E6D3','#8B9D7E','#C8602F','#8B6F47'] },
  { id: 'bold-primary',    name: 'Bold Primary',    colors: ['#E63946','#F1C40F','#2B6CB0','#FFFFFF'] },
  { id: 'pastel-calm',     name: 'Pastel Calm',     colors: ['#FFD6E0','#C4E1FF','#FFE5B4','#D4F1C5'] },
  { id: 'dark-mode',       name: 'Dark Mode',       colors: ['#1A1A2E','#16213E','#E94560','#F4F4F4'] },
  { id: 'gaming-neon',     name: 'Gaming Neon',     colors: ['#0F0F1E','#FF00C8','#00F0FF','#FFD600'] },
  { id: 'earthy-warm',     name: 'Earthy Warm',     colors: ['#D4A574','#8B6F47','#5B4636','#F0E5D8'] },
  { id: 'cottagecore',     name: 'Cottagecore',     colors: ['#A8B89A','#E8D5B7','#C7956D','#FAF3E0'] }
];

const BW_HUMOR = [
  { id: 'none',        name: 'No (serious)',      desc: 'Professional tone, no humor' },
  { id: 'snarky',      name: 'Snarky / Wimpy',  desc: 'Anti-cringe, self-aware, slightly sarcastic (Wimpy Kid)' },
  { id: 'silly',       name: 'Silly / Kids',    desc: 'Silly-fun, for young kids' },
  { id: 'wholesome',   name: 'Wholesome',       desc: 'Warm, gentle, empowering' },
  { id: 'educational', name: 'Educational',     desc: 'Curious, learning-focused' }
];

const BW_VOICE = [
  { id: 'energetic',  name: 'Energetic' },
  { id: 'calm',       name: 'Calm' },
  { id: 'empoderante',name: 'Empowering' },
  { id: 'mysterious', name: 'Mysterious' },
  { id: 'funny',      name: 'Funny' }
];

const BW_TRIM_SIZES = [
  { id: '5x8',       name: '5 × 8',       desc: 'Pocket / Stocking stuffer' },
  { id: '5.5x8.5',   name: '5.5 × 8.5',   desc: 'Standard pocket' },
  { id: '6x9',       name: '6 × 9',       desc: '⭐ Recommended for puzzle/journal books' },
  { id: '7x10',      name: '7 × 10',      desc: 'Workbook / educational' },
  { id: '8x10',      name: '8 × 10',      desc: 'Activity / coloring (kids)' },
  { id: '8.5x8.5',   name: '8.5 × 8.5',   desc: 'Square (coloring adults)' },
  { id: 'letter',    name: '8.5 × 11',    desc: 'Large planner / workbook' },
  { id: '8.25x11',   name: '8.25 × 11',   desc: 'For hardcover (NOT 8.5×11)' }
];

// KDP 2026 print cost formulas (US marketplace, standard trim)
// Source: kdp.amazon.com/en_US/help/topic/G201834340 — verified 2026-04-28
// Formula: base_fee + (per_page × page_count). Large trim adds ~$0.006/page.
const BW_INTERIOR = [
  { id: 'bw-standard',     name: 'B&W Standard',     baseFee: 0.85, perPage: 0.012, desc: 'Cheapest. Cream or white paper. Classic puzzle book.' },
  { id: 'bw-premium',      name: 'B&W Premium',      baseFee: 0.85, perPage: 0.012, desc: 'Same cost as standard (KDP doesn\'t differentiate much).' },
  { id: 'color-standard',  name: 'Color Standard',   baseFee: 0.85, perPage: 0.070, desc: '⭐ Color on white paper. Much more expensive to print.' },
  { id: 'color-premium',   name: 'Color Premium',    baseFee: 0.85, perPage: 0.100, desc: 'Top quality color. Only justified for premium books $19.99+' }
];

// Calculate print cost dynamically by interior + pages + trim
function bwCalcPrintCost(interiorId, pageCount, trimSize, format) {
  const interior = BW_INTERIOR.find(i => i.id === interiorId);
  if (!interior) return 0;
  // Hardcover uses a higher base fee (~$6.80) but same per-page cost as paperback
  const baseFee = format === 'hardcover' ? 6.80 : interior.baseFee;
  let cost = baseFee + (interior.perPage * (pageCount || 0));
  // Large trim surcharge (>6.12" wide or >9" tall) — paperback only; hardcover trims are pre-restricted by KDP
  if (format !== 'hardcover' && bwIsLargeTrim(trimSize)) cost += 0.006 * (pageCount || 0);
  return cost;
}

function bwIsLargeTrim(trimSize) {
  const map = { '5x8': [5, 8], '5.25x8': [5.25, 8], '5.5x8.5': [5.5, 8.5], '6x9': [6, 9], '6.14x9.21': [6.14, 9.21], '6.69x9.61': [6.69, 9.61], '7x10': [7, 10], '7.44x9.69': [7.44, 9.69], '7.5x9.25': [7.5, 9.25], '8x10': [8, 10], '8.25x6': [8.25, 6], 'letter': [8.5, 11], '8.25x11': [8.25, 11], '8.5x8.5': [8.5, 8.5], '8.25x8.25': [8.25, 8.25] };
  const dims = map[trimSize] || [6, 9];
  return dims[0] > 6.12 || dims[1] > 9;
}

// KDP 2026 inside margin scales with page count
// Source: KDP help / G201834230
function bwGetMinInsideMargin(pageCount) {
  if (!pageCount) return 0.375;
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.5;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.75;
  return 0.875;
}

const BW_BISAC_SUGGESTED = {
  'variety-puzzle': [
    'GAMES & ACTIVITIES / Puzzles / General',
    'GAMES & ACTIVITIES / Puzzles / Logic & Brain Teasers',
    'GAMES & ACTIVITIES / Word & Word Search'
  ],
  'word-search': [
    'GAMES & ACTIVITIES / Word & Word Search',
    'GAMES & ACTIVITIES / Puzzles / Crosswords',
    'HEALTH & FITNESS / Aging'
  ],
  'sudoku': [
    'GAMES & ACTIVITIES / Puzzles / Sudoku',
    'GAMES & ACTIVITIES / Puzzles / Logic & Brain Teasers'
  ],
  'coloring-book': [
    'CRAFTS & HOBBIES / Coloring Books / Adult',
    'SELF-HELP / Stress Management',
    'CRAFTS & HOBBIES / General'
  ],
  'activity-book': [
    'JUVENILE NONFICTION / Activity Books / General',
    'JUVENILE NONFICTION / Games & Activities',
    'GAMES & ACTIVITIES / Puzzles / General'
  ],
  'journal-prompts': [
    'SELF-HELP / Journaling',
    'BODY MIND & SPIRIT / Mindfulness & Meditation',
    'RELIGION / Christian Living / Prayer'
  ],
  'planner': [
    'BUSINESS & ECONOMICS / Time Management',
    'SELF-HELP / Personal Growth / General',
    'HOUSE & HOME / Organization'
  ]
};

// KDP USA page layout rules per book type
// All books are LEFT-binding (USA standard, English reading direction)
// Recto = right page = ODD page numbers (1, 3, 5...)
// Verso = left page = EVEN page numbers (2, 4, 6...)
const BW_LAYOUT_PRESETS = {
  'variety-puzzle': {
    pageDirection: 'left-binding',
    spreadStrategy: 'single',          // each page independent (each is a puzzle)
    sectionDividerSide: 'recto',       // section dividers always start on RIGHT page (odd)
    coverPageOnRecto: true,            // title page on right (page 1)
    blankBacks: false,                  // both sides used
    bleed: true,                        // covers + section dividers full bleed
    insideMargin: 0.625,                // larger gutter for spine binding
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: 'Variety puzzle: both sides of pages used. Section dividers on recto (odd). Solutions at end.'
  },
  'word-search': {
    pageDirection: 'left-binding',
    spreadStrategy: 'single',
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: true,
    insideMargin: 0.625,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: '1 puzzle per page, both sides.'
  },
  'sudoku': {
    pageDirection: 'left-binding',
    spreadStrategy: 'single',
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: false,                       // no full bleed para puzzle pages (legibilidad)
    insideMargin: 0.625,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: '1-2 puzzles per page, both sides, NO bleed (keep margins for readability).'
  },
  'coloring-book': {
    pageDirection: 'left-binding',
    spreadStrategy: 'one-sided',        // imagen para colorear en RIGHT page
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: true,                   // back de cada imagen = en blanco (evita bleed-through)
    bleed: true,
    insideMargin: 0.625,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: 'CRITICAL: Coloring images ALWAYS on right page (recto/odd). Left page back = blank to prevent marker bleed-through. This is industry standard.'
  },
  'activity-book': {
    pageDirection: 'left-binding',
    spreadStrategy: 'mixed',
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: true,
    insideMargin: 0.625,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: 'Mix of coloring (1-side) + puzzles (both sides). Coloring pages with blank back.'
  },
  'journal-prompts': {
    pageDirection: 'left-binding',
    spreadStrategy: 'spread-related',   // 2-page spreads (prompt left, write right)
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: false,                       // no bleed (texto se cortaría en el spine)
    insideMargin: 0.75,                 // gutter más amplio para escribir cerca del spine
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: '2-page spreads: left with prompt/quote, right with lines/writing space. Generous gutter to avoid spine writing.'
  },
  'planner': {
    pageDirection: 'left-binding',
    spreadStrategy: 'spread-week',      // weekly view spread (left=Mon-Wed, right=Thu-Sun)
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: false,
    insideMargin: 0.75,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: 'Planner spreads: weekly or monthly view covers 2 pages. Wide gutter.'
  },
  'workbook-edu': {
    pageDirection: 'left-binding',
    spreadStrategy: 'single',
    sectionDividerSide: 'recto',
    coverPageOnRecto: true,
    blankBacks: false,
    bleed: false,
    insideMargin: 0.625,
    outsideMargin: 0.5,
    topMargin: 0.5,
    bottomMargin: 0.5,
    notes: 'Written exercises, both sides. NO bleed (text must stay in safe area).'
  },
  'kakuro': { pageDirection: 'left-binding', spreadStrategy: 'single', sectionDividerSide: 'recto', coverPageOnRecto: true, blankBacks: false, bleed: false, insideMargin: 0.625, outsideMargin: 0.5, topMargin: 0.5, bottomMargin: 0.5, notes: 'Similar a sudoku.' },
  'cryptogram': { pageDirection: 'left-binding', spreadStrategy: 'single', sectionDividerSide: 'recto', coverPageOnRecto: true, blankBacks: false, bleed: false, insideMargin: 0.625, outsideMargin: 0.5, topMargin: 0.5, bottomMargin: 0.5, notes: 'Similar a sudoku.' },
  'health-tracker': { pageDirection: 'left-binding', spreadStrategy: 'spread-related', sectionDividerSide: 'recto', coverPageOnRecto: true, blankBacks: false, bleed: false, insideMargin: 0.75, outsideMargin: 0.5, topMargin: 0.5, bottomMargin: 0.5, notes: 'Trackers in spreads (repetitive data by days/weeks).' },
  'destructive-journal': { pageDirection: 'left-binding', spreadStrategy: 'single', sectionDividerSide: 'either', coverPageOnRecto: true, blankBacks: false, bleed: true, insideMargin: 0.5, outsideMargin: 0.5, topMargin: 0.4, bottomMargin: 0.4, notes: 'Wreck/destructive: each page independent with creative prompt. Bleed so destruction covers everything.' }
};

// Smart defaults engine — returns preset based on niche/sub-niche/age
const BW_PRESETS = {
  'variety-puzzle:for-teens': {
    style: { humor: 'snarky', voice: 'energetic', visualStyle: 'comic-wimpy-kid', palette: 'comic-yellow', mascot: { has: true, type: 'pink cartoon brain with sunglasses + headphones' } },
    // Recalibrated 2026-05-01: was 30/30/60/25/25 = 170 puzzles in monolithic blocks (boring for teens).
    // New: 25/25/25/25/25 = 125 puzzles + pacing='mission-arc' interleaves them across 8-10 missions
    // with difficulty progression (easy → boss). 60 math dropped to 25 — felt like homework.
    content: { pageCount: 130, pacing: 'mission-arc', sections: [
      { name: 'Word Hunters',       type: 'wordsearch',  count: 25, difficulty: 'progressive', tagline: 'Find the words. Trust no one.' },
      { name: 'Number Ninjas',      type: 'sudoku',      count: 25, difficulty: 'progressive', tagline: "It's just numbers. (Plot twist: it's a trap.)" },
      { name: 'Math Squad',         type: 'math',        count: 25, difficulty: 'progressive', tagline: "Math that doesn't make you cry. We hope.", perPage: 20, mathType: 'mixed' },
      { name: 'Maze Runners',       type: 'mazes',       count: 25, difficulty: 'progressive', tagline: "If you get lost, that's kind of the point." },
      { name: 'Code Breakers',      type: 'cryptogram',  count: 25, difficulty: 'progressive', tagline: 'Decode messages. Become a spy. Annoy parents.' },
      // Picture Detectives (rebus) generator pending — set count > 0 once it exists
      { name: 'Picture Detectives', type: 'rebus',       count: 0,  difficulty: 'progressive', tagline: 'Read pictures. Confuse adults.' }
    ], frontMatter: { titlePage: true, copyright: true, intro: true }, backMatter: { solutions: true, crossPromo: true, aiDisclosure: true, reviewRequest: true } },
    // B&W @ $9.99 = ~$3.18/book margin (was $11.99 with 180pg; now 130pg lets us hit cheaper price point).
    technical: { trimSize: '6x9', interior: 'bw-standard', paper: 'cream', coverFinish: 'matte', formats: ['paperback','kindle'], pricing: { paperback: 9.99, kindle: 4.99 } },
    marketing: { titleHook: 'Mega Brain Games for Teens', subtitleFormula: '125+ Puzzles to Outsmart Boredom — Word Search, Sudoku, Math, Mazes & Cryptograms | Ages 11-15 | Volume 1' }
  },
  'word-search:large-print-seniors': {
    style: { humor: 'none', voice: 'calm', visualStyle: 'classic-clean', palette: 'aesthetic-cream', mascot: { has: false } },
    content: { pageCount: 130, sections: [{ name: 'Puzzles', type: 'wordsearch', count: 100, difficulty: 'easy' }], frontMatter: { titlePage: true, copyright: true }, backMatter: { solutions: true, crossPromo: true, aiDisclosure: true, reviewRequest: true } },
    technical: { trimSize: '8.5x11', interior: 'bw-standard', paper: 'cream', coverFinish: 'matte', formats: ['paperback','hardcover','kindle'], pricing: { paperback: 9.99, hardcover: 24.99, kindle: 2.99 } }
  },
  'journal-prompts:self-care-teens': {
    style: { humor: 'wholesome', voice: 'empoderante', visualStyle: 'aesthetic-pinterest', palette: 'pastel-calm', mascot: { has: false } },
    content: { pageCount: 150, sections: [
      { name: 'Vision Board', type: 'journal-prompt', count: 5, difficulty: 'n/a' },
      { name: 'Bucket List', type: 'journal-prompt', count: 5, difficulty: 'n/a' },
      { name: 'Mood Tracker', type: 'tracker', count: 12, difficulty: 'n/a' },
      { name: 'Habit Tracker', type: 'tracker', count: 12, difficulty: 'n/a' },
      { name: 'Goals', type: 'journal-prompt', count: 12, difficulty: 'n/a' },
      { name: 'Dear Future Me', type: 'journal-prompt', count: 4, difficulty: 'n/a' }
    ] },
    technical: { trimSize: 'letter', interior: 'color-standard', pricing: { paperback: 11.99, hardcover: 22.99, kindle: 3.99 } }
  },
  'coloring-book:adults-bold-easy': {
    style: { humor: 'none', voice: 'calm', visualStyle: 'bold-geometric', palette: 'earthy-warm', mascot: { has: false } },
    content: { pageCount: 60, sections: [{ name: 'Coloring Pages', type: 'coloring', count: 50, difficulty: 'n/a' }], frontMatter: { titlePage: true, copyright: true }, backMatter: { aiDisclosure: true, reviewRequest: true } },
    technical: { trimSize: '8.5x8.5', interior: 'bw-standard', paper: 'white', coverFinish: 'matte', formats: ['paperback'], pricing: { paperback: 7.99 } }
  },
  'destructive-journal:teens': {
    style: { humor: 'snarky', voice: 'energetic', visualStyle: 'punk-sketch', palette: 'dark-mode', mascot: { has: false } },
    content: { pageCount: 120, sections: [{ name: 'Destructive Prompts', type: 'creative-prompt', count: 100, difficulty: 'n/a' }] },
    technical: { trimSize: '6x9', interior: 'bw-standard', pricing: { paperback: 9.99, kindle: 2.99 } }
  }
};

function bwGetLayoutPreset(niche) {
  return BW_LAYOUT_PRESETS[niche] || BW_LAYOUT_PRESETS['variety-puzzle'];
}

// ====================== MASCOT SUGGESTIONS ======================
// Validated por estudio de top sellers reales en cada nicho.
const BW_MASCOT_SUGGESTIONS = {
  'variety-puzzle:for-teens': [
    { id: 'brain-cartoon-pink', name: '🧠 Brain Cartoon (pink, sunglasses + headphones)', desc: 'Animated brain with gamer personality. Wimpy Kid style.', why: 'Universal teen appeal, easy to animate, brand-able', refs: 'Inspired by Big Nate, Diary of a Wimpy Kid (Greg) mascots' },
    { id: 'robot-sidekick', name: '🤖 Robot Sidekick (retro neon)', desc: 'Wall-E-like but gamer robot, cyan/pink neon.', why: 'Appeals to gamer teens + STEM kids', refs: 'Mr. Robot/Bumblebee fan art style' },
    { id: 'detective-animal', name: '🦝 Detective Animal (raccoon/fox with magnifier)', desc: 'Animal with detective hat + magnifier, kid Sherlock vibe.', why: 'Connects with "detective puzzles" theme, cuter approach', refs: 'Animal Crossing characters style' },
    { id: 'pencil-with-face', name: '✏️ Pencil Squad (pencil, calculator, magnifier)', desc: 'Trio of animated objects with faces (not human)', why: 'Anti-cringe, avoids gender/ethnicity conflict', refs: 'Pixar shorts style' },
    { id: 'no-mascot', name: '— No mascot', desc: 'Doodles + typography + grid of samples only', why: 'Smart Kids/M Prefontaine sell top without mascot. Faster to produce.', refs: 'Smart Kids cover (1006 reviews)' }
  ],
  'word-search:large-print-seniors': [
    { id: 'no-mascot', name: '— No mascot (recommended)', desc: 'Top sellers for seniors DON\'T use mascot.', why: 'Older audience prefers clean design, mascot feels childish', refs: 'Funster, Brain Games (PIL)' },
    { id: 'classic-letters', name: '🔤 Letters Pattern', desc: 'Letters floating as decoration', why: 'Theming without mascot', refs: 'Clean puzzle book design' }
  ],
  'sudoku:any': [
    { id: 'no-mascot', name: '— No mascot (recommended)', desc: 'Sudoku books are grid-focused.', why: 'All top sellers without mascot', refs: 'Will Shortz, NYT Sudoku' }
  ],
  'coloring-book:adults-bold-easy': [
    { id: 'no-mascot', name: '— No mascot (mandatory)', desc: 'Coloring books DON\'T have mascots.', why: 'Each page is unique coloring image, mascot distracts', refs: 'Jade Summer, Coco Wyo' }
  ],
  'journal-prompts:self-care-teens': [
    { id: 'celestial-girl', name: '✨ Celestial Star Spirit (ethereal)', desc: 'Female character with stars + moons, Pinterest aesthetic style.', why: 'Aspirational for teen girl audience', refs: 'Genius Girls (Doc Enigma) uses similar' },
    { id: 'no-mascot', name: '— No mascot (aesthetic decoration)', desc: 'Elements only: stars, flowers, crystals, butterflies.', why: 'Pinterest aesthetic top sellers use decoration, not character', refs: 'Most self-care journals' },
    { id: 'pet-cat', name: '🐱 Pet cat with flowers', desc: 'Cute cat as journal companion.', why: 'Cat lovers = super loyal niche', refs: 'Top selling cat journals' }
  ],
  'planner:adhd': [
    { id: 'no-mascot', name: '— No mascot', desc: 'ADHD planners focus on function, not decoration', why: 'Adult audience seeks clear utility', refs: 'Future ADHD Planner' },
    { id: 'brain-friendly', name: '🧠 Brain mini (corners)', desc: 'Tiny brain in corners as subtle decoration', why: 'Thematic without overwhelming', refs: 'Modern ADHD planners' }
  ],
  'destructive-journal:teens': [
    { id: 'no-mascot', name: '— No mascot (anti-mascot vibe)', desc: 'Wreck/destructive journals are anti-cute.', why: 'Genre is aggressive/raw, mascot breaks tone', refs: 'Wreck This Journal (Keri Smith)' },
    { id: 'glitch-skull', name: '💀 Glitch skull (punk)', desc: 'Skull with glitch/static effect.', why: 'Teen punk/edgy subculture', refs: 'Punk zines' }
  ],
  'health-tracker:any': [
    { id: 'no-mascot', name: '— No mascot (mandatory)', desc: 'Health trackers are clinical.', why: 'Mascot makes serious product childish. Doctors recommend it.', refs: 'All medical/health trackers' }
  ],
  'workbook-edu:any-kids': [
    { id: 'owl-teacher', name: '🦉 Owl Teacher', desc: 'Owl with glasses and book.', why: 'Universal "smart" symbol, parents love it', refs: 'Hooked on Phonics, Modern Kid Press' },
    { id: 'animal-team', name: '🐶🐱 Animal Team (dog+cat+rabbit)', desc: 'Team of animals learning together.', why: 'Diversity without human gender/ethnicity', refs: 'PJ Masks, Paw Patrol' },
    { id: 'robot-helper', name: '🤖 Robot Helper', desc: 'Friendly robot that teaches.', why: 'STEM appeal, futuristic', refs: 'Various STEM workbooks' }
  ]
};

function bwGetMascotSuggestions(niche, subNiche) {
  return BW_MASCOT_SUGGESTIONS[`${niche}:${subNiche}`]
      || BW_MASCOT_SUGGESTIONS[`${niche}:any`]
      || BW_MASCOT_SUGGESTIONS[`${niche}:for-teens`]
      || [{ id: 'no-mascot', name: '— No mascot', desc: 'Safe default', why: 'Keep it simple to start', refs: '—' }];
}

// ====================== INTERIOR (B&W vs COLOR) RECOMMENDATIONS ======================
const BW_INTERIOR_REC = {
  'variety-puzzle': {
    recommended: 'bw-standard',
    recommendedPrice: 11.99,
    altPrice: 14.99,
    reason: 'Top sellers (Smart Kids 1006★, Wimpy Kid 300M+ copies) are B&W. Color at $14.99 gives NEGATIVE margin ($-5.86). For color you need $29.99+.',
    margin_at_recommended: 3.94,
    why_bw_wins: 'Wimpy Kid proved B&W with character art works perfectly. Healthy margin allows ads/discounts.'
  },
  'word-search': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: 14.99,
    reason: 'Word Search top sellers ALL B&W. Senior audience prefers high contrast black/white for readability.',
    margin_at_recommended: 2.74,
    why_bw_wins: 'Color in word search DON\'T improve UX. It\'s a cost waste.'
  },
  'sudoku': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: 12.99,
    reason: 'Sudoku 100% B&W industry standard. Color adds no value.',
    margin_at_recommended: 2.74,
    why_bw_wins: 'Mental audience — doesn\'t seek decoration'
  },
  'coloring-book': {
    recommended: 'bw-standard',
    recommendedPrice: 7.99,
    altPrice: null,
    reason: 'MANDATORY B&W. If you print in color, user can\'t color (already colored).',
    margin_at_recommended: 1.54,
    why_bw_wins: 'It\'s a product requirement, not optional.'
  },
  'activity-book': {
    recommended: 'color-standard',
    recommendedPrice: 14.99,
    altPrice: 9.99,
    reason: 'Activity books for KIDS justify color because competition (Genius Girls $14.52) uses color.',
    margin_at_recommended: -5.86,
    why_color_wins: '⚠️ Negative margin at $14.99 with color std. Raise to $19.99 (margin $0.94) or use B&W with character art.'
  },
  'journal-prompts': {
    recommended: 'bw-standard',
    recommendedPrice: 11.99,
    altPrice: 14.99,
    reason: 'B&W journals are 90% of market. Only premium aesthetic journals justify color.',
    margin_at_recommended: 3.94,
    why_bw_wins: 'Buyers value writing space, not expensive decoration.'
  },
  'planner': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: 14.99,
    reason: 'Planners B&W standard. Color only for premium aesthetic teen girls.',
    margin_at_recommended: 2.74,
    why_bw_wins: 'Functional > decorative'
  },
  'workbook-edu': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: null,
    reason: 'Educational workbooks for kids = B&W standard. Parents prefer low price.',
    margin_at_recommended: 2.74,
    why_bw_wins: 'Market super price-sensitive'
  },
  'destructive-journal': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: null,
    reason: 'Wreck This Journal (Keri Smith) sold millions in B&W. Color breaks destructive vibe.',
    margin_at_recommended: 2.74,
    why_bw_wins: 'B&W = rawness = on-brand'
  },
  'health-tracker': {
    recommended: 'bw-standard',
    recommendedPrice: 9.99,
    altPrice: null,
    reason: 'Health trackers = clinical = B&W industry standard',
    margin_at_recommended: 2.74,
    why_bw_wins: 'Color = toy. Buyers want serious medical tool.'
  },
  'kakuro': { recommended: 'bw-standard', recommendedPrice: 9.99, reason: 'Kakuro = grid puzzle, B&W standard', margin_at_recommended: 2.74, why_bw_wins: 'Standard' },
  'cryptogram': { recommended: 'bw-standard', recommendedPrice: 9.99, reason: 'Cryptogram = text puzzle, B&W standard', margin_at_recommended: 2.74, why_bw_wins: 'Standard' }
};

function bwGetInteriorRec(niche) {
  return BW_INTERIOR_REC[niche] || BW_INTERIOR_REC['variety-puzzle'];
}

// ====================== IMAGE PLAN per niche ======================
// Cuántas imágenes únicas se necesitan + qué se repite + qué páginas SIN imagen
const BW_IMAGE_PLAN = {
  'variety-puzzle': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 6,        // 1 por squad
    interiorBackgrounds: 0,    // páginas de puzzles SIN fondo (legibilidad)
    quotePages: 2,
    decorativePages: 1,        // welcome
    solutionsDivider: 1,
    repeatingTemplates: 0,
    pagesWithoutImage: '~190', // las páginas de puzzles
    totalUnique: 13,
    notes: 'Unique section dividers. Interior puzzles NO background. Solutions section no image.'
  },
  'word-search': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 1,
    interiorBackgrounds: 0,
    quotePages: 0,
    decorativePages: 0,
    solutionsDivider: 1,
    repeatingTemplates: 0,
    pagesWithoutImage: '~125',
    totalUnique: 5,
    notes: 'Minimal possible. Cover + title + 1 divider + solutions only. Puzzle pages 100% white.'
  },
  'sudoku': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 3,        // por dificultad: easy, medium, hard
    interiorBackgrounds: 0,
    quotePages: 0,
    decorativePages: 0,
    solutionsDivider: 1,
    repeatingTemplates: 0,
    pagesWithoutImage: '~120',
    totalUnique: 7,
    notes: 'Si separas por dificultad = 3 dividers. Si todo mixto = 1 divider.'
  },
  'coloring-book': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 0,
    interiorBackgrounds: 0,
    coloringPagesUnique: 50,   // CADA UNA ÚNICA — esto es lo costoso
    blankBacks: 50,            // backs en blanco
    repeatingTemplates: 0,
    pagesWithoutImage: '~50',  // los blank backs
    totalUnique: 53,
    notes: '⚠️ Coloring book = 50 unique images. Most image-intensive book type.'
  },
  'activity-book': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 5,
    interiorBackgrounds: 5,    // varias ilustraciones por sección
    quotePages: 3,
    decorativePages: 5,
    solutionsDivider: 1,
    repeatingTemplates: 2,
    pagesWithoutImage: '~50',
    totalUnique: 25,
    notes: 'Mix: unique dividers + some repeated templates.'
  },
  'journal-prompts': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 6,
    interiorBackgrounds: 0,    // solo decoración esquinas
    quotePages: 5,             // únicos
    decorativePages: 5,
    repeatingTemplates: 3,     // page templates: lined, dotted, blank with corners
    repeatTimesEach: 30,       // cada template se repite ~30 veces en 150 pgs
    pagesWithoutImage: '0',    // todas tienen al menos decoración mínima
    totalUnique: 19,
    notes: 'Page templates REPEAT. 3 templates × 30 reps = 90 pages. Unique: dividers + quotes + decorative.'
  },
  'planner': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 4,
    weeklyTemplate: 1,         // se repite por semana
    monthlyTemplate: 1,        // se repite 12 veces
    yearOverviewTemplate: 1,
    interiorBackgrounds: 0,
    repeatingTemplates: 3,
    pagesWithoutImage: '0',
    totalUnique: 10,
    notes: '⚠️ Planners son MUY repetitivos. 1 template weekly se repite 52 veces. Solo necesitas pocos uniques.'
  },
  'workbook-edu': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 5,
    exerciseTemplate: 1,       // template de ejercicio se repite
    interiorBackgrounds: 0,
    repeatingTemplates: 3,
    pagesWithoutImage: '~80',
    totalUnique: 10,
    notes: 'Exercise templates repeat. Practice pages use template.'
  },
  'destructive-journal': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 0,
    promptPagesUnique: 100,    // CADA prompt page tiene su propia ilustración
    repeatingTemplates: 0,
    pagesWithoutImage: '0',
    totalUnique: 103,
    notes: '⚠️ Destructive journal = more intense than coloring. Each prompt is unique illustration + creative text.'
  },
  'health-tracker': {
    coverFront: 1, coverBack: 1, spine: 1,
    titlePageBg: 1,
    sectionDividers: 1,
    trackerTemplate: 1,        // se repite mensualmente
    interiorBackgrounds: 0,
    repeatingTemplates: 1,
    pagesWithoutImage: '~110',
    totalUnique: 5,
    notes: 'Tracking template + cover only. Simplest.'
  }
};

function bwGetImagePlan(niche) {
  return BW_IMAGE_PLAN[niche] || BW_IMAGE_PLAN['variety-puzzle'];
}

// ====================== PAGE TREATMENT (overlays en páginas de contenido) ======================
// Decora puzzle pages SIN sacrificar legibilidad. 1 imagen reusada en muchas páginas.
const BW_PAGE_TREATMENT = {
  'variety-puzzle': {
    options: ['none', 'corner-ornaments', 'soft-background', 'decorative-frame'],
    recommended: 'corner-ornaments-per-section',
    onlyIfColorInterior: ['soft-background', 'decorative-frame'],
    safeZone: 0.5,  // inches reservados para contenido (sin decoración)
    notes: 'Recommend: 1 corner ornament per squad (brain with themed accessory). 6 images reused throughout book. Solutions section NO treatment.',
    extraImages: 6  // 1 por squad
  },
  'word-search:large-print-seniors': {
    options: ['none'],
    recommended: 'none',
    safeZone: 0.625,
    notes: 'FORBIDDEN. Seniors need maximum contrast. Any decoration reduces sales (1-star reviews "font too small").',
    extraImages: 0
  },
  'sudoku': {
    options: ['none', 'corner-ornaments'],
    recommended: 'none',
    safeZone: 0.625,
    notes: 'Sudoku is pure grid. Corner ornament max 1 (tiny, corner). Recommend: NO.',
    extraImages: 0
  },
  'coloring-book': {
    options: ['none'],
    recommended: 'none',
    notes: 'N/A — la imagen ES el contenido.',
    extraImages: 0
  },
  'activity-book': {
    options: ['none', 'corner-ornaments', 'soft-background', 'decorative-frame'],
    recommended: 'decorative-frame',
    onlyIfColorInterior: ['soft-background', 'decorative-frame'],
    safeZone: 0.5,
    notes: 'Activity books for kids justify themed frames. Genius Girls uses forest borders on each page.',
    extraImages: 5  // 1 por sección típica
  },
  'journal-prompts': {
    options: ['none', 'corner-ornaments', 'soft-background', 'decorative-frame'],
    recommended: 'soft-background-with-corners',
    onlyIfColorInterior: ['soft-background', 'decorative-frame'],
    safeZone: 0.5,
    notes: 'Journals premium pueden tener watercolor background al 8% + corner ornaments. Aesthetic feel.',
    extraImages: 3  // 3 templates de página rotando
  },
  'planner': {
    options: ['none', 'corner-ornaments', 'soft-background'],
    recommended: 'corner-ornaments',
    onlyIfColorInterior: ['soft-background'],
    safeZone: 0.5,
    notes: 'Planner pages need clear space for writing. Minimal corner ornaments only.',
    extraImages: 1
  },
  'workbook-edu': {
    options: ['none', 'corner-ornaments'],
    recommended: 'corner-ornaments',
    safeZone: 0.5,
    notes: 'Kids workbooks: small corner ornament (animated mascot) makes pages more fun. NO soft-bg (kids write over it).',
    extraImages: 1
  },
  'destructive-journal': {
    options: ['none', 'corner-ornaments', 'soft-background', 'decorative-frame'],
    recommended: 'unique-per-page',
    notes: 'Destructive journals are anti-formula. Each page unique (no reusing templates). This raises image count dramatically.',
    extraImages: 0  // ya contado en promptPagesUnique
  },
  'health-tracker': {
    options: ['none'],
    recommended: 'none',
    notes: 'Health trackers are clinical. No decoration.',
    extraImages: 0
  }
};

function bwGetPageTreatment(niche) {
  return BW_PAGE_TREATMENT[niche] || BW_PAGE_TREATMENT['variety-puzzle'];
}

// Compatibilidad: ¿se puede aplicar un treatment según el interior elegido?
function bwTreatmentAllowedForInterior(treatment, interiorId) {
  if (treatment === 'none') return true;
  // Corner ornaments (single OR per-section) are simple illustrations — work in B&W and color
  if (treatment === 'corner-ornaments') return true;
  if (treatment === 'corner-ornaments-per-section') return true;
  // soft-background and decorative-frame need color (B&W with gradients = muddy print)
  return interiorId && interiorId.startsWith('color-');
}

// ====================== STORAGE ======================

const BW_KEY = 'bw_projects';

function bwLoadAll() {
  try { return JSON.parse(localStorage.getItem(BW_KEY) || '{"active":null,"list":[]}'); }
  catch (e) { return { active: null, list: [] }; }
}
function bwSaveAll(data) {
  try {
    localStorage.setItem(BW_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    // Most likely QuotaExceededError — localStorage is ~5MB total
    if (e.name === 'QuotaExceededError' || /quota/i.test(e.message)) {
      const sizeKB = Math.round(JSON.stringify(data).length / 1024);
      const msg = `localStorage full (~${sizeKB} KB). Delete old projects, or remove uploaded images you don't need anymore.`;
      console.error(msg, e);
      if (typeof bwToast === 'function') bwToast('⚠ ' + msg);
      else alert(msg);
      return false;
    }
    console.error('localStorage write failed:', e);
    return false;
  }
}
function bwGetActive() {
  const all = bwLoadAll();
  return all.list.find(p => p.id === all.active) || null;
}
function bwSetActiveId(id) {
  const all = bwLoadAll(); all.active = id; bwSaveAll(all);
  // Sync to cloud so the other device sees the same active project.
  if (window.cs) window.cs.setActiveProject(id);
}
function bwUpsert(project) {
  const all = bwLoadAll();
  project.updatedAt = new Date().toISOString();
  const idx = all.list.findIndex(p => p.id === project.id);
  if (idx >= 0) all.list[idx] = project; else all.list.push(project);
  const ok = bwSaveAll(all);
  if (window.cs) window.cs.upsertProject(project);
  return ok;
}
function bwDelete(id) {
  const all = bwLoadAll();
  all.list = all.list.filter(p => p.id !== id);
  if (all.active === id) all.active = all.list[0]?.id || null;
  bwSaveAll(all);
  if (window.cs) {
    window.cs.deleteProject(id);
    if (all.active !== id) window.cs.setActiveProject(all.active);
  }
}

// ====================== SERIES MANAGEMENT ======================

// Parse "Vol N" / "Volume N" / "Vol. N" / "Vol N" from a title.
// Returns { volume: N, base: titleWithoutVolume } or null if no match.
function bwParseVolumeFromTitle(title) {
  if (!title) return null;
  const re = /\s*[—|\-:|]?\s*\b(?:vol(?:ume|\.)?)\s*(\d+)\b\s*$/i;
  const m = title.match(re);
  if (!m) return null;
  return {
    volume: parseInt(m[1]),
    base: title.replace(re, '').trim(),
  };
}

// Bump volume number in a title, replacing the existing N with newN.
// If no Vol N pattern exists, appends " — Vol {newN}".
function bwBumpVolumeInTitle(title, newN) {
  const parsed = bwParseVolumeFromTitle(title);
  if (parsed) {
    const re = /(\bvol(?:ume|\.)?\s*)\d+\b/i;
    return title.replace(re, (m, prefix) => `${prefix}${newN}`);
  }
  return `${title} — Vol ${newN}`;
}

// Auto-detect series from title for legacy projects (no series field).
// Mutates project in place. Returns true if series was set/changed.
function bwAutoDetectSeries(project) {
  if (project.series && project.series.name) return false;
  const title = project.marketing?.title || '';
  const parsed = bwParseVolumeFromTitle(title);
  if (parsed) {
    project.series = { name: parsed.base, volume: parsed.volume, parentBookId: null };
  } else {
    // Standalone book — treat as Vol 1 of its own title
    project.series = { name: title || 'Untitled', volume: 1, parentBookId: null };
  }
  return true;
}

// Returns all projects sharing the same series.name as `project`, sorted by volume.
function bwGetSeriesSiblings(project) {
  if (!project?.series?.name) return [project].filter(Boolean);
  const all = bwLoadAll();
  return all.list
    .filter(p => p.series?.name === project.series.name)
    .sort((a, b) => (a.series.volume || 0) - (b.series.volume || 0));
}

// Returns next volume number for a given series name.
function bwNextVolumeNumber(seriesName) {
  const all = bwLoadAll();
  const sib = all.list.filter(p => p.series?.name === seriesName);
  if (!sib.length) return 1;
  return Math.max(...sib.map(p => p.series.volume || 1)) + 1;
}

// Returns deep-cloned plain object via JSON round-trip (safe for our data — no functions/Date instances).
function bwDeepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

// MAIN: Duplicate current project as next volume.
// Copies: positioning, style (mascota/paleta/voz), technical (trim/interior/layout/pageTreatment/pricing),
//         marketing.subtitle, keywords, bisac, references, compliance flags.
// Resets: content (sections shape preserved, but title-specific puzzle inputs cleared),
//         marketing.description (Vol N+1 needs fresh hook), marketing.title (volume bumped).
// Sets: series.parentBookId = source.id, series.volume = N+1, currentStage = 3 (Content).
function bwDuplicateAsNextVolume(source) {
  if (!source) return null;
  bwAutoDetectSeries(source);
  const seriesName = source.series.name;
  const nextN = bwNextVolumeNumber(seriesName);

  const newTitle = bwBumpVolumeInTitle(source.marketing?.title || seriesName, nextN);

  const clone = {
    id: 'book-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    currentStage: 3,  // Skip straight to Content — that's what changes between volumes
    positioning: bwDeepClone(source.positioning) || {},
    style:       bwDeepClone(source.style) || {},
    technical:   bwDeepClone(source.technical) || {},
    content: {
      // Preserve full section structure (name, type, count, difficulty, tagline, perPage, mathType, etc.)
      // Section content (puzzles) is regenerated per volume — only the structural template carries over.
      pageCount: source.content?.pageCount,
      sections: (source.content?.sections || []).map(s => bwDeepClone(s)),
      frontMatter: bwDeepClone(source.content?.frontMatter) || {},
      backMatter: bwDeepClone(source.content?.backMatter) || {},
    },
    marketing: {
      title: newTitle,
      subtitle: source.marketing?.subtitle || '',
      description: '',  // RESET — needs fresh hook for Vol N+1
      keywords: bwDeepClone(source.marketing?.keywords) || ['','','','','','',''],
      bisac: bwDeepClone(source.marketing?.bisac) || [],
    },
    references: bwDeepClone(source.references) || [],
    compliance: bwDeepClone(source.compliance) || { aiDisclosed: false },
    // Carry over assets (section dividers, corner ornaments, welcome, quote, solutions divider)
    // The cover-front must be replaced by the user — but we copy as starting reference,
    // and the readiness check will continue to flag if user forgets to swap it.
    assets: bwDeepClone(source.assets) || {},
    series: {
      name: seriesName,
      volume: nextN,
      parentBookId: source.id,
    },
  };

  bwUpsert(clone);
  return clone;
}

// ====================== SMART DEFAULTS ======================

function bwGetPreset(niche, subNiche) {
  return BW_PRESETS[`${niche}:${subNiche}`] || BW_PRESETS[`${niche}:for-teens`] || null;
}

function bwApplyDefaults(project) {
  const preset = bwGetPreset(project.positioning.niche, project.positioning.subNiche);
  if (!preset) return project;
  // Only fill empty fields
  project.style = Object.assign({}, preset.style, project.style || {});
  project.content = Object.assign({}, preset.content, project.content || {});
  project.technical = Object.assign({}, preset.technical, project.technical || {});
  project.marketing = Object.assign({}, preset.marketing || {}, project.marketing || {});
  // AUTO-APPLY page treatment recommendation per niche
  if (!project.technical.pageTreatment) {
    const treat = bwGetPageTreatment(project.positioning.niche);
    if (treat?.recommended && treat.recommended !== 'unique-per-page') {
      // Solo aplica si es compatible con el interior elegido
      if (bwTreatmentAllowedForInterior(treat.recommended, project.technical.interior)) {
        project.technical.pageTreatment = treat.recommended;
      } else {
        // Fallback: corner-ornaments funciona en B&W también
        project.technical.pageTreatment = 'corner-ornaments';
      }
    }
  }
  // AUTO-APPLY layout preset
  if (!project.technical.layout) {
    project.technical.layout = bwGetLayoutPreset(project.positioning.niche);
  }
  return project;
}

// ====================== AUTHOR HELPERS ======================

const BW_CONTRIBUTOR_ROLES = ['Author','Editor','Foreword','Illustrator','Introduction','Narrator','Photographer','Preface','Translator'];

function bwAuthorFullName(a) {
  if (!a) return '';
  return [a.prefix, a.firstName, a.middleName, a.lastName].map(s => (s||'').trim()).filter(Boolean).join(' ');
}

function bwMigrateAuthorFields(project) {
  const p = project?.positioning;
  if (!p) return;
  if (!p.authorPrimary) p.authorPrimary = { prefix:'', firstName:'', middleName:'', lastName:'' };
  if (!Array.isArray(p.contributors)) p.contributors = [];
  // Backfill from legacy authorPenName if structured fields are empty
  if (!bwAuthorFullName(p.authorPrimary) && p.authorPenName) {
    const parts = p.authorPenName.trim().split(/\s+/);
    p.authorPrimary = {
      prefix: '',
      firstName: parts[0] || '',
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      lastName: parts.length > 1 ? parts[parts.length-1] : ''
    };
  }
  // Backfill from legacy coAuthor if no contributors
  if (p.coAuthor && p.contributors.length === 0) {
    const parts = p.coAuthor.trim().split(/\s+/);
    p.contributors.push({
      role: 'Author',
      prefix: '',
      firstName: parts[0] || '',
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      lastName: parts.length > 1 ? parts[parts.length-1] : ''
    });
  }
}

function bwGetAuthorString(project) {
  bwMigrateAuthorFields(project);
  const p = project?.positioning;
  if (!p) return '';
  const primary = bwAuthorFullName(p.authorPrimary);
  const coAuthors = (p.contributors || [])
    .filter(c => (c.role || 'Author') === 'Author')
    .map(c => bwAuthorFullName(c))
    .filter(Boolean);
  if (primary && coAuthors.length) return [primary, ...coAuthors].join(' & ');
  return primary || coAuthors[0] || (p.authorPenName || '');
}

function bwAddContributor() {
  const p = bwCurrentProject.positioning;
  if (!Array.isArray(p.contributors)) p.contributors = [];
  if (p.contributors.length >= 9) { bwToast('KDP allows up to 9 contributors'); return; }
  p.contributors.push({ role:'Author', prefix:'', firstName:'', middleName:'', lastName:'' });
  bwUpsert(bwCurrentProject);
  bwRenderStage1(document.getElementById('bw-stage-content'));
}

function bwRemoveContributor(idx) {
  const p = bwCurrentProject.positioning;
  if (!Array.isArray(p.contributors)) return;
  p.contributors.splice(idx, 1);
  bwUpsert(bwCurrentProject);
  bwRenderStage1(document.getElementById('bw-stage-content'));
}

// ====================== COMPLIANCE ======================

function bwScoreCompliance(project) {
  const issues = [];
  let score = 100;

  // Stage 1
  if (!project.positioning?.niche)         { issues.push({sev:'error',stage:1,msg:'Select a niche'}); score -= 15; }
  if (!project.positioning?.ageMin)        { issues.push({sev:'warn',stage:1,msg:'Define target age'}); score -= 5; }
  if (!bwGetAuthorString(project)) { issues.push({sev:'warn',stage:1,msg:'Primary author missing — copyright page will say "The Author"'}); score -= 8; }
  // Stage 3
  const pc = project.content?.pageCount;
  if (!pc || pc < 24)         { issues.push({sev:'error',stage:3,msg:'KDP minimum 24 pages'}); score -= 20; }
  else if (pc > 828)          { issues.push({sev:'error',stage:3,msg:'KDP maximum 828 pages'}); score -= 20; }
  // Stage 4 — pricing margin (KDP 2026 real formula)
  const t = project.technical;
  const fmts = t?.formats || [];
  // Paperback margin
  if (fmts.includes('paperback') && t?.interior && t?.pricing?.paperback && project.content?.pageCount) {
    const printCost = bwCalcPrintCost(t.interior, project.content.pageCount, t.trimSize, 'paperback');
    const royalty = (t.pricing.paperback * 0.6) - printCost;
    if (royalty < 0)        { issues.push({sev:'error',stage:4,msg:`Paperback $${t.pricing.paperback} with ${project.content.pageCount}pg ${t.interior} = NEGATIVE margin ($${royalty.toFixed(2)}). Print cost = $${printCost.toFixed(2)}.`}); score -= 25; }
    else if (royalty < 1)   { issues.push({sev:'warn',stage:4,msg:`Paperback margin only $${royalty.toFixed(2)}/book. Print cost = $${printCost.toFixed(2)}. Consider raising price.`}); score -= 10; }
  }
  // Hardcover margin
  if (fmts.includes('hardcover') && t?.interior && t?.pricing?.hardcover && project.content?.pageCount) {
    const printCostHC = bwCalcPrintCost(t.interior, project.content.pageCount, t.trimSize, 'hardcover');
    const royaltyHC = (t.pricing.hardcover * 0.6) - printCostHC;
    if (royaltyHC < 0)      { issues.push({sev:'error',stage:4,msg:`Hardcover $${t.pricing.hardcover} with ${project.content.pageCount}pg ${t.interior} = NEGATIVE margin ($${royaltyHC.toFixed(2)}). Hardcover print cost = $${printCostHC.toFixed(2)} ($6.80 base + per-page).`}); score -= 25; }
    else if (royaltyHC < 1) { issues.push({sev:'warn',stage:4,msg:`Hardcover margin only $${royaltyHC.toFixed(2)}/book. Print cost = $${printCostHC.toFixed(2)}. Hardcover needs $24.99+ to make sense.`}); score -= 10; }
  }
  // Inside margin check
  if (t?.layout?.insideMargin && project.content?.pageCount) {
    const minMargin = bwGetMinInsideMargin(project.content.pageCount);
    if (t.layout.insideMargin < minMargin) {
      issues.push({sev:'error',stage:4,msg:`Inside margin ${t.layout.insideMargin}" insufficient for ${project.content.pageCount} pages. KDP requires minimum ${minMargin}".`});
      score -= 15;
    }
  }
  // Hardcover-specific KDP rules
  if (fmts.includes('hardcover')) {
    if (t?.trimSize === 'letter' || t?.trimSize === '8.5x11') {
      issues.push({sev:'error',stage:4,msg:'Hardcover does NOT support 8.5×11. Use 8.25×11 instead.'});
      score -= 15;
    }
    if (project.content?.pageCount && project.content.pageCount < 75) {
      issues.push({sev:'error',stage:4,msg:`Hardcover requires minimum 75 pages (you have ${project.content.pageCount}).`});
      score -= 15;
    }
    if (project.content?.pageCount && project.content.pageCount > 550) {
      issues.push({sev:'error',stage:4,msg:`Hardcover maximum 550 pages (you have ${project.content.pageCount}). Drop hardcover or split into volumes.`});
      score -= 15;
    }
  }
  // Stage 5 — title
  const m = project.marketing;
  if (m?.title && m.title.length > 200)    { issues.push({sev:'error',stage:5,msg:`Title is ${m.title.length} chars, KDP max 200`}); score -= 15; }
  if (!m?.title)                            { issues.push({sev:'warn',stage:5,msg:'Title missing'}); score -= 10; }
  if (!m?.bisac || m.bisac.length === 0)    { issues.push({sev:'warn',stage:5,msg:'Select at least 1 BISAC category'}); score -= 8; }
  if (m?.keywords && m?.title) {
    const titleLower = m.title.toLowerCase();
    const dups = m.keywords.filter(k => k && titleLower.includes(k.toLowerCase()));
    if (dups.length > 0) { issues.push({sev:'warn',stage:5,msg:`Keywords duplicate title words (waste): ${dups.join(', ')}`}); score -= 5; }
  }
  // AI disclosure
  if (project.style?.visualStyle && !project.compliance?.aiDisclosed) {
    issues.push({sev:'warn',stage:6,msg:'Check AI disclosure when uploading to KDP (mandatory if you use AI)'}); score -= 5;
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

// ====================== REFERENCES ======================

function bwAddReference(project, files, tags, notes) {
  if (!project.references) project.references = [];
  const ref = {
    id: 'ref-' + Date.now(),
    tags: tags || [],
    notes: notes || '',
    images: [],
    aiExtracted: null,
    appliedToStages: [],
    createdAt: new Date().toISOString()
  };
  return new Promise(resolve => {
    let pending = files.length;
    if (pending === 0) { project.references.push(ref); bwUpsert(project); resolve(ref); return; }
    Array.from(files).forEach(file => {
      const r = new FileReader();
      r.onload = (e) => {
        ref.images.push(e.target.result);
        if (--pending === 0) { project.references.push(ref); bwUpsert(project); resolve(ref); }
      };
      r.readAsDataURL(file);
    });
  });
}

function bwRemoveReference(project, refId) {
  project.references = (project.references || []).filter(r => r.id !== refId);
  bwUpsert(project);
}

function bwBuildClaudePrompt(project, ref) {
  const stage = project.currentStage || '?';
  const niche = project.positioning?.niche || 'sin definir';
  const title = project.marketing?.title || 'untitled';
  return `Analiza estas referencias visuales para mi libro KDP.

LIBRO: ${title}
NICHO: ${niche}
STAGE ACTUAL: ${stage}
TAGS QUE ME INTERESAN: ${ref.tags.join(', ')}
NOTAS: ${ref.notes || '(sin notas)'}

Por favor extrae y dame en formato JSON estructurado:
- paletteHex: array de 3-5 hex codes principales
- visualStyle: uno de [comic-wimpy-kid, aesthetic-pinterest, classic-clean, fantasy-ya, gaming-neon, retro-vintage, punk-sketch, watercolor-soft, bold-geometric, photorealistic]
- mood: array de adjetivos (ej: energetic, calm, mysterious)
- composition: descripción breve (centered mascot, edge-pattern, etc.)
- typography: descripción de la tipografía
- whatToCopy: qué de la referencia debo replicar
- whatToAvoid: qué de la referencia debo evitar

Las imágenes están guardadas en /Users/ld/kdp-book-factory/references/${project.id}/${ref.id}/`;
}

// ====================== UI RENDERING ======================

let bwCurrentProject = null;

function bwInit() {
  // One-time legacy cleanup (runs once, idempotent via flag).
  // Removes projects from before Stage 0 existed (orphans without a linking Book Idea).
  if (!localStorage.getItem('bw_legacy_cleaned_v1')) {
    try {
      const cur = bwLoadAll();
      const ideasRaw = localStorage.getItem('bw_book_ideas');
      const ideas = ideasRaw ? (JSON.parse(ideasRaw).list || []) : [];
      const linkedProjectIds = new Set(ideas.map(i => i.projectId).filter(Boolean));
      const beforeCount = cur.list.length;
      cur.list = cur.list.filter(p => linkedProjectIds.has(p.id));
      if (cur.list.length !== beforeCount) {
        cur.active = cur.list[0]?.id || null;
        bwSaveAll(cur);
        console.log(`[bw] Cleaned ${beforeCount - cur.list.length} legacy project(s) without an associated Book Idea`);
      }
    } catch (e) { console.warn('legacy cleanup failed:', e); }
    localStorage.setItem('bw_legacy_cleaned_v1', '1');
  }

  const all = bwLoadAll();
  if (all.list.length) {
    // Migration: backfill series field for legacy projects
    let dirty = false;
    all.list.forEach(p => { if (bwAutoDetectSeries(p)) dirty = true; });
    if (dirty) bwSaveAll(all);
    bwCurrentProject = bwGetActive();
  } else {
    // No projects yet — wizard stays hidden. User must complete Stage 0 + Apply first.
    bwCurrentProject = null;
  }
  bwRender();
}

function bwCreateProject(title, niche, subNiche) {
  const project = {
    id: 'book-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    currentStage: 1,
    positioning: { niche, subNiche, ageMin: 11, ageMax: 15, gender: 'unisex', language: 'en', market: 'amazon-us', buyerPersona: '', painPoint: '', differentiator: '', authorPrimary: { prefix:'', firstName:'', middleName:'', lastName:'' }, contributors: [], authorPenName: '', coAuthor: '', imprint: '' },
    style: {},
    content: {},
    technical: {},
    marketing: { title: title, subtitle: '', description: '', keywords: ['','','','','','',''], bisac: [] },
    references: [],
    compliance: { aiDisclosed: false },
    series: null,  // populated by bwAutoDetectSeries below
  };
  bwAutoDetectSeries(project);
  bwApplyDefaults(project);  // auto-aplica page treatment + layout per niche
  bwUpsert(project);
  return project;
}

function bwSwitchStage(stage) {
  if (!bwCurrentProject) return;
  bwCurrentProject.currentStage = stage;
  bwUpsert(bwCurrentProject);
  bwRender();
  // Scroll to wizard top so user lands on the stage they just clicked, not the
  // Stage 0 dashboard above. Without this, switching stages leaves the viewport
  // wherever the user was previously scrolling.
  const nav = document.getElementById('bw-stages-nav');
  if (nav && typeof nav.scrollIntoView === 'function') {
    nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function bwUpdate(path, value) {
  if (!bwCurrentProject) return;
  const parts = path.split('.');
  let obj = bwCurrentProject;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
  bwUpsert(bwCurrentProject);
  bwRenderCompliance();
  // Notify external views (Imágenes IA tab, etc.) so they stay in sync with
  // every wizard change. Listeners decide whether they need to refresh.
  document.dispatchEvent(new CustomEvent('bw:project-updated', {
    detail: { path, value, projectId: bwCurrentProject.id },
  }));
}

function bwToast(msg) {
  const t = document.getElementById('bw-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

function bwRender() {
  const app = document.getElementById('bw-app');
  const header = document.getElementById('bw-header');
  // Self-heal: if storage has an active project but the module-scoped variable is
  // null (e.g. caller updated localStorage via bwSetActiveId but couldn't assign
  // bwCurrentProject from outside this module), pull it back in before rendering.
  if (!bwCurrentProject) {
    const active = bwGetActive();
    if (active) bwCurrentProject = active;
  }
  if (!bwCurrentProject) {
    // Empty state: hide wizard chrome, leave Stage 0 panel above as the only entry point
    if (header) header.innerHTML = '';
    if (app) app.style.display = 'none';
    return;
  }
  if (app) app.style.display = '';
  bwRenderHeader();
  bwRenderStageNav();
  bwRenderStageContent();
  bwRenderSeriesPanel();
  bwRenderCompliance();
}

// Quick % progress estimate per project (used in series panel)
function bwProjectProgress(p) {
  let done = 0, total = 6;
  if (p.positioning?.niche && p.positioning?.ageMin) done++;
  if (p.style?.visualStyle && p.style?.palette) done++;
  if (p.content?.pageCount && p.content?.sections?.length) done++;
  if (p.technical?.trimSize && p.technical?.interior && p.technical?.pricing?.paperback) done++;
  if (p.marketing?.title && p.marketing?.description && (p.marketing?.bisac?.length || 0) > 0) done++;
  if (p.compliance?.aiDisclosed !== undefined && p.status === 'published') done++;
  return Math.round((done / total) * 100);
}

function bwRenderSeriesPanel() {
  const el = document.getElementById('bw-series-panel');
  if (!el || !bwCurrentProject) { if (el) el.innerHTML = ''; return; }
  const sibs = bwGetSeriesSiblings(bwCurrentProject);
  if (sibs.length < 2) {
    // Only 1 volume → show subtle hint to duplicate
    el.innerHTML = `
      <div class="bw-series-card">
        <div class="bw-series-card-title">📚 This series</div>
        <div class="bw-series-empty">Only Vol 1 so far. When you finish, click <strong>"Duplicate as Vol 2"</strong> to reuse all decisions.</div>
      </div>
    `;
    return;
  }
  const items = sibs.map(p => {
    const isActive = p.id === bwCurrentProject.id;
    const pct = bwProjectProgress(p);
    const statusBadge = p.status === 'published' ? '✅' : (pct >= 80 ? '🟢' : (pct >= 40 ? '🟡' : '⚪'));
    return `
      <div class="bw-series-vol ${isActive ? 'active' : ''}" data-id="${p.id}">
        <div class="bw-series-vol-head">
          <span class="bw-series-vol-num">Vol ${p.series.volume}</span>
          <span class="bw-series-vol-status">${statusBadge} ${pct}%</span>
        </div>
        <div class="bw-series-vol-title">${p.marketing?.title || 'Untitled'}</div>
      </div>
    `;
  }).join('');
  el.innerHTML = `
    <div class="bw-series-card">
      <div class="bw-series-card-title">📚 Serie: ${bwCurrentProject.series.name}</div>
      <div class="bw-series-list">${items}</div>
    </div>
  `;
  el.querySelectorAll('.bw-series-vol').forEach(v => {
    v.addEventListener('click', () => {
      bwSetActiveId(v.dataset.id);
      bwCurrentProject = bwGetActive();
      bwRender();
    });
  });
}

function bwRenderHeader() {
  const el = document.getElementById('bw-header');
  if (!el) return;
  const all = bwLoadAll();

  // Group projects by series.name for the select
  const groups = {};
  all.list.forEach(p => {
    const key = p.series?.name || 'Sin serie';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  Object.keys(groups).forEach(k => groups[k].sort((a, b) => (a.series?.volume || 0) - (b.series?.volume || 0)));

  const optsHtml = Object.entries(groups).map(([name, books]) => {
    const opts = books.map(p => {
      const v = p.series?.volume ? ` (Vol ${p.series.volume})` : '';
      const label = (p.marketing?.title || 'Untitled');
      return `<option value="${p.id}" ${p.id === all.active ? 'selected' : ''}>${label}${v}</option>`;
    }).join('');
    return books.length > 1 ? `<optgroup label="📚 ${name}">${opts}</optgroup>` : opts;
  }).join('');

  // Series info for badge + duplicate button
  const cur = bwCurrentProject;
  const seriesName = cur?.series?.name || '';
  const curVol = cur?.series?.volume || 1;
  const nextVol = seriesName ? bwNextVolumeNumber(seriesName) : (curVol + 1);
  const sibCount = seriesName ? bwGetSeriesSiblings(cur).length : 1;

  const seriesBadge = seriesName
    ? `<span class="bw-series-badge" title="Serie">📚 ${seriesName} · Vol ${curVol}${sibCount > 1 ? ` de ${sibCount}` : ''}</span>`
    : '';

  el.innerHTML = `
    <div class="bw-header-row">
      <select id="bw-project-select">${optsHtml}</select>
      ${seriesBadge}
      <button class="bw-btn bw-btn-ghost" id="bw-new-book">+ New book</button>
      <button class="bw-btn bw-btn-primary" id="bw-duplicate-vol" title="Creates Vol ${nextVol} reusing style, palette, mascot, layout and pricing. You only change the content.">📖 Duplicate as Vol ${nextVol}</button>
      <button class="bw-btn bw-btn-ghost" id="bw-pair-device" title="Share this workspace with your phone or tablet">📱 Pair device</button>
      <button class="bw-btn bw-btn-ghost" id="bw-export-project">⬇️ Export JSON</button>
      <button class="bw-btn bw-btn-ghost" id="bw-delete-project">🗑️ Delete</button>
    </div>
  `;
  document.getElementById('bw-project-select').addEventListener('change', e => { bwSetActiveId(e.target.value); bwCurrentProject = bwGetActive(); bwRender(); });
  document.getElementById('bw-new-book').addEventListener('click', () => bwPromptNewBook());
  document.getElementById('bw-duplicate-vol').addEventListener('click', () => bwDuplicateVolHandler());
  document.getElementById('bw-pair-device').addEventListener('click', () => bwShowPairDialog());
  document.getElementById('bw-export-project').addEventListener('click', () => bwExportJson());
  document.getElementById('bw-delete-project').addEventListener('click', () => { if (confirm('Delete book?')) { bwDelete(bwCurrentProject.id); bwCurrentProject = bwGetActive(); bwRender(); } });
}

// Pairing dialog — shows the workspace's invite_code so the user can enter it
// on another device (phone, second laptop) to share the same books + images.
// The other device pastes the code into the same dialog and clicks Join.
function bwShowPairDialog() {
  const code = window.cs?.getInviteCode() || '(loading…)';
  const ready = window.cs?.isReady();
  if (!ready) {
    bwToast('Cloud sync is still loading — try again in a second.');
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'bw-modal-overlay';
  overlay.innerHTML = `
    <div class="bw-modal bw-pair-modal">
      <h3>📱 Pair another device</h3>
      <p class="bw-pair-section-title">Share this workspace</p>
      <p class="bw-pair-help">On your other device, open this same site and paste the code below.</p>
      <div class="bw-pair-code">${code}</div>
      <button class="bw-btn bw-btn-primary" id="bw-pair-copy">📋 Copy code</button>
      <hr class="bw-pair-hr"/>
      <p class="bw-pair-section-title">Or join an existing workspace</p>
      <p class="bw-pair-help">If you already paired this device on another browser, paste the code here:</p>
      <div class="bw-pair-join-row">
        <input type="text" id="bw-pair-input" placeholder="XXXXXXXX" maxlength="8" autocapitalize="characters"/>
        <button class="bw-btn bw-btn-primary" id="bw-pair-join">Join</button>
      </div>
      <p class="bw-pair-warn">⚠ Joining a different workspace replaces your current books with that workspace's books.</p>
      <button class="bw-btn bw-btn-ghost" id="bw-pair-close">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#bw-pair-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#bw-pair-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(code).then(() => bwToast('Code copied ✅'));
  });
  overlay.querySelector('#bw-pair-join').addEventListener('click', async () => {
    const v = overlay.querySelector('#bw-pair-input').value.trim().toUpperCase();
    if (!v || v.length !== 8) {
      bwToast('Code must be 8 characters');
      return;
    }
    try {
      await window.cs.joinWorkspace(v);
      overlay.remove();
      bwToast('✓ Joined workspace. Reloading…');
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      bwToast('Error: ' + e.message);
    }
  });
}

function bwDuplicateVolHandler() {
  if (!bwCurrentProject) return;
  const next = bwDuplicateAsNextVolume(bwCurrentProject);
  if (!next) return;
  bwSetActiveId(next.id);
  bwCurrentProject = next;
  bwRender();
  bwToast(`✓ Vol ${next.series.volume} created. Just fill in content (Stage 3).`);
}

function bwPromptNewBook() {
  const title = prompt('New book title:');
  if (!title) return;
  const project = bwCreateProject(title, 'variety-puzzle', 'for-teens');
  bwSetActiveId(project.id);
  bwCurrentProject = project;
  bwRender();
  bwToast('Book created. Fill in the stages.');
}

function bwExportJson() {
  if (!bwCurrentProject) return;
  const blob = new Blob([JSON.stringify(bwCurrentProject, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${bwCurrentProject.id}.json`; a.click();
  URL.revokeObjectURL(url);
}

function bwRenderStageNav() {
  const el = document.getElementById('bw-stages-nav');
  if (!el) return;
  const stages = ['Positioning','Style','Content','Technical','Marketing','Auto-Production'];
  el.innerHTML = stages.map((name, i) => `
    <button class="bw-stage-btn ${bwCurrentProject?.currentStage === (i+1) ? 'active' : ''}" data-stage="${i+1}">
      <span class="bw-stage-num">${i+1}</span>
      <span class="bw-stage-name">${name}</span>
    </button>
  `).join('');
  el.querySelectorAll('.bw-stage-btn').forEach(btn => {
    btn.addEventListener('click', () => bwSwitchStage(parseInt(btn.dataset.stage)));
  });
}

function bwRenderStageContent() {
  const el = document.getElementById('bw-stage-content');
  if (!el || !bwCurrentProject) return;
  const stage = bwCurrentProject.currentStage || 1;
  // Apply stage color class
  el.className = 'bw-stage-' + stage;
  if (stage === 1) bwRenderStage1(el);
  else if (stage === 2) bwRenderStage2(el);
  else if (stage === 3) bwRenderStage3(el);
  else if (stage === 4) bwRenderStage4(el);
  else if (stage === 5) bwRenderStage5(el);
  else if (stage === 6) bwRenderStage6(el);
}

// ============ STAGE 1: POSITIONING ============
function bwRenderStage1(el) {
  const p = bwCurrentProject.positioning;
  const niche = BW_NICHES.find(n => n.id === p.niche);
  const fillCls = (v) => v ? 'bw-field-filled' : '';
  el.innerHTML = `
    <span class="bw-stage-badge">🎯 STAGE 1 / 6 — POSITIONING</span>
    <h3>Who buys, what problem does it solve, where is it sold?</h3>
    <p class="bw-help">This is the foundation. Define niche and audience before anything visual.</p>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">📌</span>Niche & Market</div>
      <div class="bw-grid">
        <div class="bw-field bw-field-required ${fillCls(p.niche)}">
          <label>Main niche</label>
          <select id="bw-f-niche">
            ${BW_NICHES.map(n => `<option value="${n.id}" ${n.id === p.niche ? 'selected' : ''}>${n.name}</option>`).join('')}
          </select>
        </div>
        <div class="bw-field bw-field-required ${fillCls(p.subNiche)}">
          <label>Sub-niche</label>
          <select id="bw-f-subniche">
            ${(niche?.subs || []).map(s => `<option value="${s}" ${s === p.subNiche ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="bw-field ${fillCls(p.market)}">
          <label>KDP Market</label>
          <select id="bw-f-market">
            <option value="amazon-us" ${p.market === 'amazon-us' ? 'selected' : ''}>Amazon.com US</option>
            <option value="amazon-es" ${p.market === 'amazon-es' ? 'selected' : ''}>Amazon.es</option>
            <option value="amazon-mx" ${p.market === 'amazon-mx' ? 'selected' : ''}>Amazon.com.mx</option>
            <option value="multi" ${p.market === 'multi' ? 'selected' : ''}>Multi-market</option>
          </select>
        </div>
        <div class="bw-field ${fillCls(p.language)}">
          <label>Language</label>
          <select id="bw-f-lang">
            <option value="en" ${p.language === 'en' ? 'selected' : ''}>English</option>
            <option value="es" ${p.language === 'es' ? 'selected' : ''}>Spanish</option>
            <option value="bilingual" ${p.language === 'bilingual' ? 'selected' : ''}>Bilingual EN/ES</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">👥</span>Audience</div>
      <div class="bw-grid">
        <div class="bw-field bw-field-required ${fillCls(p.ageMin)}">
          <label>Min age</label>
          <input type="number" id="bw-f-agemin" value="${p.ageMin ?? ''}" min="0" max="100" placeholder="11" />
        </div>
        <div class="bw-field bw-field-required ${fillCls(p.ageMax)}">
          <label>Max age</label>
          <input type="number" id="bw-f-agemax" value="${p.ageMax ?? ''}" min="0" max="100" placeholder="15" />
        </div>
        <div class="bw-field ${fillCls(p.gender)}">
          <label>Target gender</label>
          <select id="bw-f-gender">
            <option value="unisex" ${p.gender === 'unisex' ? 'selected' : ''}>Unisex</option>
            <option value="female" ${p.gender === 'female' ? 'selected' : ''}>Female</option>
            <option value="male" ${p.gender === 'male' ? 'selected' : ''}>Male</option>
          </select>
        </div>
        <div class="bw-field ${fillCls(p.buyerPersona)}">
          <label>Buyer persona — who buys?</label>
          <input type="text" id="bw-f-buyer" value="${p.buyerPersona || ''}" placeholder="e.g. parents + grandparents for gift" />
        </div>
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">💡</span>Promise & Differentiation</div>
      <div class="bw-grid">
        <div class="bw-field bw-field-wide ${fillCls(p.painPoint)}">
          <label>Pain point — what problem does it solve?</label>
          <input type="text" id="bw-f-pain" value="${p.painPoint || ''}" placeholder="e.g. teen boredom on long trips" />
        </div>
        <div class="bw-field bw-field-wide ${fillCls(p.differentiator)}">
          <label>Differentiator — what makes you unique?</label>
          <input type="text" id="bw-f-diff" value="${p.differentiator || ''}" placeholder="e.g. anti-cringe humor + Brain Squad gamified across 6 missions" />
        </div>
      </div>
    </div>

    ${(() => {
      bwMigrateAuthorFields(bwCurrentProject);
      const ap = p.authorPrimary || {};
      const contribs = p.contributors || [];
      const previewName = bwGetAuthorString(bwCurrentProject);
      const roleOpts = BW_CONTRIBUTOR_ROLES.map(r => `<option value="${r}">${r}</option>`).join('');
      const contribRow = (c, i) => `
        <div class="bw-contrib-row" data-idx="${i}" style="background:#FBF6EC;border:1px solid #E5DCC9;border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:13px;color:#7A5230">Contributor ${i+1}</strong>
            <button type="button" class="bw-btn bw-btn-ghost" style="padding:4px 10px;font-size:12px" onclick="bwRemoveContributor(${i})">✕ Remove</button>
          </div>
          <div style="display:grid;grid-template-columns:140px 90px 1fr 1fr 1fr;gap:8px">
            <div class="bw-field"><label style="font-size:11px">Role</label>
              <select id="bw-c-role-${i}">${BW_CONTRIBUTOR_ROLES.map(r => `<option value="${r}" ${(c.role||'Author')===r?'selected':''}>${r}</option>`).join('')}</select>
            </div>
            <div class="bw-field"><label style="font-size:11px">Prefix</label>
              <input type="text" id="bw-c-prefix-${i}" value="${c.prefix||''}" placeholder="Mr/Ms/Dr" />
            </div>
            <div class="bw-field"><label style="font-size:11px">First name</label>
              <input type="text" id="bw-c-first-${i}" value="${c.firstName||''}" placeholder="First" />
            </div>
            <div class="bw-field"><label style="font-size:11px">Middle name</label>
              <input type="text" id="bw-c-mid-${i}" value="${c.middleName||''}" placeholder="(optional)" />
            </div>
            <div class="bw-field"><label style="font-size:11px">Last name</label>
              <input type="text" id="bw-c-last-${i}" value="${c.lastName||''}" placeholder="Last" />
            </div>
          </div>
        </div>`;
      return `
    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">✍️</span>Authors (used on cover, copyright + back matter)</div>
      <p class="bw-help" style="margin:-4px 0 10px 0">This mirrors KDP's author entry: one Primary Author and up to 9 contributors with roles (Author, Illustrator, Editor, etc). Two co-authors? Set both as role <em>Author</em> — the cover will show <em>Name 1 &amp; Name 2</em>.</p>

      <div style="background:#F6FAEF;border:1px solid #C8D4B8;border-radius:8px;padding:14px;margin-bottom:14px">
        <strong style="font-size:13px;color:#5A6E48;display:block;margin-bottom:10px">PRIMARY AUTHOR <span style="color:var(--error)">*</span></strong>
        <div style="display:grid;grid-template-columns:90px 1fr 1fr 1fr;gap:8px">
          <div class="bw-field"><label style="font-size:11px">Prefix</label>
            <input type="text" id="bw-ap-prefix" value="${ap.prefix||''}" placeholder="Mr/Ms/Dr" />
          </div>
          <div class="bw-field ${fillCls(ap.firstName)}"><label style="font-size:11px">First name *</label>
            <input type="text" id="bw-ap-first" value="${ap.firstName||''}" placeholder="e.g. Lily" />
          </div>
          <div class="bw-field"><label style="font-size:11px">Middle name</label>
            <input type="text" id="bw-ap-mid" value="${ap.middleName||''}" placeholder="(optional)" />
          </div>
          <div class="bw-field ${fillCls(ap.lastName)}"><label style="font-size:11px">Last name *</label>
            <input type="text" id="bw-ap-last" value="${ap.lastName||''}" placeholder="e.g. Columbus" />
          </div>
        </div>
      </div>

      ${contribs.length ? `<strong style="font-size:13px;color:#7A5230;display:block;margin-bottom:8px">CONTRIBUTORS (${contribs.length}/9)</strong>` : ''}
      ${contribs.map((c,i) => contribRow(c,i)).join('')}

      <button type="button" class="bw-btn bw-btn-ghost" onclick="bwAddContributor()" style="margin-top:4px">+ Add another contributor</button>

      <div class="bw-grid" style="margin-top:14px">
        <div class="bw-field ${fillCls(p.imprint)}">
          <label>Imprint / Publisher (optional)</label>
          <input type="text" id="bw-f-imprint" value="${p.imprint || ''}" placeholder="e.g. Brainy Books Press" />
        </div>
      </div>

      ${previewName ? `<p class="bw-help" style="margin-top:10px;padding:8px 12px;background:#FBF6EC;border-radius:6px"><strong>Cover &amp; copyright preview:</strong> ${previewName}</p>` : ''}
    </div>`;
    })()}

    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-primary" onclick="bwSwitchStage(2)">Stage 2 — Style →</button>
    </div>
  `;
  // Wire change handlers
  ['niche','subniche','agemin','agemax','gender','lang','market','buyer','pain','diff','imprint'].forEach(id => {
    const el2 = document.getElementById('bw-f-' + id);
    if (!el2) return;
    el2.addEventListener('change', () => bwStage1Save());
    if (el2.tagName === 'INPUT') el2.addEventListener('blur', () => bwStage1Save());
  });
  // Author primary + contributors
  ['bw-ap-prefix','bw-ap-first','bw-ap-mid','bw-ap-last'].forEach(id => {
    const el2 = document.getElementById(id);
    if (!el2) return;
    el2.addEventListener('blur', () => bwStage1Save());
  });
  (bwCurrentProject.positioning?.contributors || []).forEach((_, i) => {
    ['role','prefix','first','mid','last'].forEach(k => {
      const el2 = document.getElementById('bw-c-'+k+'-'+i);
      if (!el2) return;
      const ev = el2.tagName === 'SELECT' ? 'change' : 'blur';
      el2.addEventListener(ev, () => bwStage1Save());
    });
  });
}

function bwStage1Save() {
  const p = bwCurrentProject.positioning;
  p.niche = document.getElementById('bw-f-niche').value;
  p.subNiche = document.getElementById('bw-f-subniche').value;
  p.ageMin = parseInt(document.getElementById('bw-f-agemin').value) || null;
  p.ageMax = parseInt(document.getElementById('bw-f-agemax').value) || null;
  p.gender = document.getElementById('bw-f-gender').value;
  p.language = document.getElementById('bw-f-lang').value;
  p.market = document.getElementById('bw-f-market').value;
  p.buyerPersona = document.getElementById('bw-f-buyer').value;
  p.painPoint = document.getElementById('bw-f-pain').value;
  p.differentiator = document.getElementById('bw-f-diff').value;
  // Structured author fields
  if (!p.authorPrimary) p.authorPrimary = { prefix:'', firstName:'', middleName:'', lastName:'' };
  p.authorPrimary.prefix     = document.getElementById('bw-ap-prefix')?.value || '';
  p.authorPrimary.firstName  = document.getElementById('bw-ap-first')?.value || '';
  p.authorPrimary.middleName = document.getElementById('bw-ap-mid')?.value || '';
  p.authorPrimary.lastName   = document.getElementById('bw-ap-last')?.value || '';
  if (!Array.isArray(p.contributors)) p.contributors = [];
  p.contributors.forEach((c, i) => {
    c.role       = document.getElementById('bw-c-role-'+i)?.value   || 'Author';
    c.prefix     = document.getElementById('bw-c-prefix-'+i)?.value || '';
    c.firstName  = document.getElementById('bw-c-first-'+i)?.value  || '';
    c.middleName = document.getElementById('bw-c-mid-'+i)?.value    || '';
    c.lastName   = document.getElementById('bw-c-last-'+i)?.value   || '';
  });
  // Keep legacy mirrors in sync so older code paths still work
  p.authorPenName = bwAuthorFullName(p.authorPrimary);
  const firstAuthorContrib = (p.contributors || []).find(c => (c.role||'Author') === 'Author');
  p.coAuthor = firstAuthorContrib ? bwAuthorFullName(firstAuthorContrib) : '';
  p.imprint = document.getElementById('bw-f-imprint')?.value || '';
  bwUpsert(bwCurrentProject);
  bwRenderCompliance();
  // If niche changed, rerender to update sub-niche dropdown
  bwRenderStage1(document.getElementById('bw-stage-content'));
}

function bwApplyPresetClick() {
  bwApplyDefaults(bwCurrentProject);
  bwUpsert(bwCurrentProject);
  bwRender();
  bwToast('Smart defaults applied ⚡');
}

function bwApplyInteriorRec() {
  const rec = bwGetInteriorRec(bwCurrentProject.positioning?.niche);
  if (!bwCurrentProject.technical) bwCurrentProject.technical = {};
  bwCurrentProject.technical.interior = rec.recommended;
  if (!bwCurrentProject.technical.pricing) bwCurrentProject.technical.pricing = {};
  bwCurrentProject.technical.pricing.paperback = rec.recommendedPrice;
  bwUpsert(bwCurrentProject);
  bwRender();
  bwToast('Recommendation applied: ' + rec.recommended + ' @ $' + rec.recommendedPrice);
}

// ============ STAGE 2: STYLE ============
function bwRenderStage2(el) {
  const s = bwCurrentProject.style || {};
  el.innerHTML = `
    <h3>🎨 Stage 2 — Tone & Style</h3>
    <p class="bw-help">How the book feels and looks.</p>
    <div class="bw-section">
      <label>Humor *</label>
      <div class="bw-radio-grid">
        ${BW_HUMOR.map(h => `
          <label class="bw-radio-card ${s.humor === h.id ? 'selected' : ''}">
            <input type="radio" name="bw-humor" value="${h.id}" ${s.humor === h.id ? 'checked' : ''}>
            <div class="bw-radio-card-name">${h.name}</div>
            <div class="bw-radio-card-desc">${h.desc}</div>
          </label>
        `).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Voice</label>
      <div class="bw-pill-row">
        ${BW_VOICE.map(v => `<button class="bw-pill ${s.voice === v.id ? 'selected' : ''}" data-voice="${v.id}">${v.name}</button>`).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Estilo visual *</label>
      <div class="bw-style-grid">
        ${BW_VISUAL_STYLES.map(vs => `
          <button class="bw-style-card ${s.visualStyle === vs.id ? 'selected' : ''}" data-vs="${vs.id}">
            <span class="bw-style-emoji">${vs.emoji}</span>
            <span class="bw-style-name">${vs.name}</span>
            <span class="bw-style-tags">${vs.tags.join(' · ')}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Paleta *</label>
      <div class="bw-palette-grid">
        ${BW_PALETTES.map(pal => `
          <button class="bw-palette-card ${s.palette === pal.id ? 'selected' : ''}" data-pal="${pal.id}">
            <div class="bw-palette-swatches">${pal.colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>
            <span class="bw-palette-name">${pal.name}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Mascot — strategic suggestions for your niche</label>
      <div class="bw-help-small" style="margin-bottom:10px;">Based on study of real top sellers in your niche. Click an option to select.</div>
      <div class="bw-mascot-grid">
        ${(bwGetMascotSuggestions(bwCurrentProject.positioning?.niche, bwCurrentProject.positioning?.subNiche) || []).map(m => `
          <button class="bw-mascot-card ${(s.mascot?.id === m.id || (m.id === 'no-mascot' && !s.mascot?.has)) ? 'selected' : ''}" data-mascot="${m.id}">
            <div class="bw-mascot-name">${m.name}</div>
            <div class="bw-mascot-desc">${m.desc}</div>
            <div class="bw-mascot-why"><b>Why:</b> ${m.why}</div>
            <div class="bw-mascot-refs"><b>Refs:</b> ${m.refs}</div>
          </button>
        `).join('')}
      </div>
      <input type="text" id="bw-mascot-desc" value="${s.mascot?.type || ''}" placeholder="Or describe custom mascot (e.g. pink brain with sunglasses + headphones)" style="margin-top:10px;width:100%;padding:8px;" />
    </div>
    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-ghost" onclick="bwSwitchStage(1)">← Stage 1</button>
      <button class="bw-btn bw-btn-primary" onclick="bwSwitchStage(3)">Stage 3 — Content →</button>
    </div>
  `;
  // Wire events
  el.querySelectorAll('input[name="bw-humor"]').forEach(r => r.addEventListener('change', e => { bwUpdate('style.humor', e.target.value); bwRenderStage2(el); }));
  el.querySelectorAll('[data-voice]').forEach(b => b.addEventListener('click', () => { bwUpdate('style.voice', b.dataset.voice); bwRenderStage2(el); }));
  el.querySelectorAll('[data-vs]').forEach(b => b.addEventListener('click', () => { bwUpdate('style.visualStyle', b.dataset.vs); bwRenderStage2(el); }));
  el.querySelectorAll('[data-pal]').forEach(b => b.addEventListener('click', () => { bwUpdate('style.palette', b.dataset.pal); bwRenderStage2(el); }));
  el.querySelectorAll('[data-mascot]').forEach(b => b.addEventListener('click', () => {
    const mid = b.dataset.mascot;
    const suggestions = bwGetMascotSuggestions(bwCurrentProject.positioning?.niche, bwCurrentProject.positioning?.subNiche);
    const picked = suggestions.find(s => s.id === mid);
    bwUpdate('style.mascot', { has: mid !== 'no-mascot', id: mid, type: picked?.desc || '', name: picked?.name || '' });
    bwRenderStage2(el);
  }));
  const md = document.getElementById('bw-mascot-desc');
  if (md) md.addEventListener('blur', e => bwUpdate('style.mascot', { ...(bwCurrentProject.style?.mascot || {}), type: e.target.value }));
}

// ============ STAGE 3: CONTENT ============
function bwRenderStage3(el) {
  const c = bwCurrentProject.content || {};
  const sections = c.sections || [];
  const pacing = c.pacing || 'sequential';
  const pacingOpts = [
    { id:'sequential',  name:'Sequential blocks',                   desc:'All puzzles of one type together (workbook style). Good for adults/seniors who pick a section.' },
    { id:'mission-arc', name:'Mission arc ⭐ (recommended for teens)', desc:'4-8 themed missions, each with mixed puzzle types interleaved. Best engagement.' },
    { id:'rotating',    name:'Rotating mix (coming soon)',           desc:'1 of each type, repeat. Currently falls back to Mission arc until dedicated logic ships.', soon: true },
    { id:'boss-build',  name:'Boss-build progression (coming soon)', desc:'Easy → medium → hard → final boss. Currently falls back to Mission arc until dedicated logic ships.', soon: true }
  ];
  el.innerHTML = `
    <h3>📚 Stage 3 — Content Structure</h3>
    <p class="bw-help">What goes inside the book — and how it flows.</p>
    <div class="bw-grid">
      <div class="bw-field">
        <label>Total pages (24-828 KDP)</label>
        <input type="number" id="bw-c-pages" value="${c.pageCount || 200}" min="24" max="828" />
      </div>
      <div class="bw-field">
        <label>Difficulty levels</label>
        <select id="bw-c-difficulty">
          <option value="easy">Easy only</option>
          <option value="easy-medium" selected>Easy → Medium</option>
          <option value="mixed">Mixed (Easy → Hard)</option>
          <option value="hard">Hard / Expert</option>
          <option value="progressive">Progressive (easy → boss)</option>
        </select>
      </div>
    </div>

    <div class="bw-card" style="margin-top:14px">
      <div class="bw-card-title"><span class="bw-card-title-icon">🌀</span>Pacing — how puzzles are arranged inside the book</div>
      <p class="bw-help" style="margin:-2px 0 12px 0">Big mistake of most teen activity books: 30 word searches in a row, then 30 sudoku in a row → kids abandon at page 40. Mission arc fixes that by interleaving.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${pacingOpts.map(o => `
          <button type="button" data-pacing="${o.id}" class="bw-btn ${pacing===o.id ? 'bw-btn-primary' : 'bw-btn-ghost'}" style="text-align:left;padding:12px;height:auto;display:block;white-space:normal">
            <strong>${o.name}</strong>
            <div style="font-size:11px;font-weight:normal;margin-top:4px;opacity:0.85">${o.desc}</div>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Secciones</label>
      <div id="bw-sections-list">
        ${sections.map((sec, i) => `
          <div class="bw-section-row">
            <input type="text" data-i="${i}" data-k="name" value="${sec.name}" placeholder="Section name" />
            <input type="text" data-i="${i}" data-k="type" value="${sec.type}" placeholder="Type" />
            <input type="number" data-i="${i}" data-k="count" value="${sec.count}" placeholder="Count" />
            <button data-rm="${i}">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="bw-btn bw-btn-ghost" onclick="bwAddSection()">+ Add section</button>
    </div>
    <div class="bw-section">
      <label>Front matter</label>
      ${['titlePage','copyright','intro','tableOfContents','characterCreation'].map(k => `
        <label class="bw-check"><input type="checkbox" data-fm="${k}" ${c.frontMatter?.[k] ? 'checked' : ''}/> ${k}</label>
      `).join('')}
    </div>
    <div class="bw-section">
      <label>Back matter</label>
      ${['solutions','crossPromo','aiDisclosure','reviewRequest','aboutAuthor'].map(k => `
        <label class="bw-check"><input type="checkbox" data-bm="${k}" ${c.backMatter?.[k] ? 'checked' : ''}/> ${k}</label>
      `).join('')}
    </div>
    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-ghost" onclick="bwSwitchStage(2)">← Stage 2</button>
      <button class="bw-btn bw-btn-primary" onclick="bwSwitchStage(4)">Stage 4 — Technical →</button>
    </div>
  `;
  document.getElementById('bw-c-pages').addEventListener('blur', e => bwUpdate('content.pageCount', parseInt(e.target.value)));
  el.querySelectorAll('[data-pacing]').forEach(b => b.addEventListener('click', () => {
    bwUpdate('content.pacing', b.dataset.pacing);
    bwRenderStage3(el);
  }));
  el.querySelectorAll('[data-fm]').forEach(c2 => c2.addEventListener('change', e => { const fm = bwCurrentProject.content?.frontMatter || {}; fm[c2.dataset.fm] = e.target.checked; bwUpdate('content.frontMatter', fm); }));
  el.querySelectorAll('[data-bm]').forEach(c2 => c2.addEventListener('change', e => { const bm = bwCurrentProject.content?.backMatter || {}; bm[c2.dataset.bm] = e.target.checked; bwUpdate('content.backMatter', bm); }));
  el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { const ss = bwCurrentProject.content?.sections || []; ss.splice(parseInt(b.dataset.rm), 1); bwUpdate('content.sections', ss); bwRenderStage3(el); }));
  el.querySelectorAll('input[data-i]').forEach(inp => inp.addEventListener('blur', () => {
    const ss = [...(bwCurrentProject.content?.sections || [])];
    const i = parseInt(inp.dataset.i), k = inp.dataset.k;
    ss[i][k] = (k === 'count') ? parseInt(inp.value) : inp.value;
    bwUpdate('content.sections', ss);
  }));
}

function bwAddSection() {
  const ss = [...(bwCurrentProject.content?.sections || [])];
  ss.push({ name: 'New Section', type: 'wordsearch', count: 20, difficulty: 'mixed' });
  bwUpdate('content.sections', ss);
  bwRenderStage3(document.getElementById('bw-stage-content'));
}

// ============ STAGE 4: TECHNICAL & PRICING ============
function bwRenderStage4(el) {
  const t = bwCurrentProject.technical || {};
  const pageCount = bwCurrentProject.content?.pageCount || 200;
  const fmts = t.formats || [];
  const printCost = bwCalcPrintCost(t.interior || 'color-standard', pageCount, t.trimSize || '6x9', 'paperback');
  const printCostHC = bwCalcPrintCost(t.interior || 'color-standard', pageCount, t.trimSize || '6x9', 'hardcover');
  const royalty = ((t.pricing?.paperback || 0) * 0.6) - printCost;
  const royaltyHC = ((t.pricing?.hardcover || 0) * 0.6) - printCostHC;
  const showHardcover = fmts.includes('hardcover');
  const showPaperback = fmts.includes('paperback') || !fmts.length;
  const niche = bwCurrentProject.positioning?.niche;
  const layoutPreset = bwGetLayoutPreset(niche);
  const layout = t.layout || layoutPreset;
  const minInsideMargin = bwGetMinInsideMargin(pageCount);
  const isLarge = bwIsLargeTrim(t.trimSize || '6x9');
  const fillCls = (v) => v ? 'bw-field-filled' : '';

  // Build layout diagram pages 1-6 example
  const sectionDividerSide = layout.sectionDividerSide || 'recto';
  const spreadStrategy = layout.spreadStrategy || 'single';

  el.innerHTML = `
    <span class="bw-stage-badge">⚙️ STAGE 4 / 6 — TECHNICAL</span>
    <h3>KDP Compliance + Layout + Pricing</h3>
    <p class="bw-help">This is where we enforce KDP USA rules and calculate your real margin.</p>

    <div class="bw-card" style="border-left-color: var(--accent-secondary);">
      <div class="bw-card-title" style="color: var(--accent-secondary);"><span class="bw-card-title-icon">💡</span>Strategic recommendation for "${niche}"</div>
      <div style="font-size:13px; line-height:1.6;">
        ${(() => {
          const rec = bwGetInteriorRec(niche);
          const recPC = bwCalcPrintCost(rec.recommended, pageCount, t.trimSize || '6x9');
          const recRoy = (rec.recommendedPrice * 0.6) - recPC;
          return `
            <div style="margin-bottom:8px;"><b>My recommendation:</b> <span style="background: var(--accent-secondary-soft); color: var(--accent-secondary-dark); padding: 2px 8px; border-radius: 4px; font-weight: 600;">${BW_INTERIOR.find(i=>i.id===rec.recommended)?.name}</span> at <b>$${rec.recommendedPrice}</b></div>
            <div style="margin-bottom:8px;"><b>Real royalty:</b> <span style="color: ${recRoy > 1 ? 'var(--success)' : 'var(--error)'}; font-weight: 700;">$${recRoy.toFixed(2)}/book</span> (print cost $${recPC.toFixed(2)})</div>
            <div style="margin-bottom:8px;"><b>Reason:</b> ${rec.reason}</div>
            <div><b>Why B&W wins in this niche:</b> ${rec.why_bw_wins || rec.why_color_wins || '—'}</div>
            <button class="bw-btn bw-btn-primary" style="margin-top:10px;" onclick="bwApplyInteriorRec()">⚡ Apply this recommendation</button>
          `;
        })()}
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">📐</span>Trim Size & Physical Format</div>
      <div class="bw-grid">
        <div class="bw-field ${fillCls(t.trimSize)}">
          <label>Trim size</label>
          <select id="bw-t-trim">
            ${BW_TRIM_SIZES.map(ts => `<option value="${ts.id}" ${ts.id === t.trimSize ? 'selected' : ''}>${ts.name} — ${ts.desc}</option>`).join('')}
          </select>
        </div>
        <div class="bw-field ${fillCls(t.interior)}">
          <label>Interior</label>
          <select id="bw-t-interior">
            ${BW_INTERIOR.map(i => `<option value="${i.id}" ${i.id === t.interior ? 'selected' : ''}>${i.name} (~$${i.printCost})</option>`).join('')}
          </select>
        </div>
        <div class="bw-field ${fillCls(t.paper)}">
          <label>Paper</label>
          <select id="bw-t-paper">
            <option value="white" ${t.paper === 'white' ? 'selected' : ''}>White</option>
            <option value="cream" ${t.paper === 'cream' ? 'selected' : ''}>Cream</option>
          </select>
        </div>
        <div class="bw-field ${fillCls(t.coverFinish)}">
          <label>Cover finish</label>
          <select id="bw-t-cover">
            <option value="matte" ${t.coverFinish === 'matte' ? 'selected' : ''}>Matte (recommended)</option>
            <option value="glossy" ${t.coverFinish === 'glossy' ? 'selected' : ''}>Glossy</option>
          </select>
        </div>
      </div>
      <div class="bw-section">
        <label>Formats que vas a publicar</label>
        ${['paperback','hardcover','kindle'].map(f => `
          <label class="bw-check"><input type="checkbox" data-fmt="${f}" ${(t.formats || []).includes(f) ? 'checked' : ''}/> ${f.charAt(0).toUpperCase() + f.slice(1)}</label>
        `).join('')}
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">📖</span>Page Layout — KDP USA Coherence</div>
      <div class="bw-layout-rules">
        <b>KDP USA rules applied to "${niche || 'your book'}":</b>
        <ul>
          <li><b>Binding:</b> Left-binding (English/USA standard)</li>
          <li><b>Page 1 (title):</b> Recto = right page (odd)</li>
          <li><b>Section dividers:</b> ${sectionDividerSide === 'recto' ? '✅ Always on recto (right page/odd) — auto-inserts blank page if needed' : 'Any side'}</li>
          <li><b>Spread strategy:</b> ${spreadStrategy === 'single' ? 'Independent pages (each has own content)' : spreadStrategy === 'one-sided' ? '⚠️ ONE-SIDED — coloring images ONLY on right page, left blank to prevent marker bleed-through' : spreadStrategy === 'spread-related' ? '2-page spreads (left + right related, e.g: prompt-write or week view)' : spreadStrategy === 'spread-week' ? 'Weekly spread (Mon-Wed left, Thu-Sun right)' : 'Mixed (depends on section)'}</li>
          <li><b>Bleed:</b> ${layout.bleed ? '✅ Yes (full bleed for covers + section dividers, +0.125" on each edge)' : '❌ No (keep margins for readability)'}</li>
          <li><b>Inside margin (gutter spine):</b> ${layout.insideMargin}" — wider so the spine doesn't eat the content</li>
          <li><b>Outside margin:</b> ${layout.outsideMargin}"</li>
        </ul>
      </div>
      <div class="bw-layout-diagram">
        <b style="font-size:12px;">Example of the first pages of your book:</b>
        <div class="bw-layout-pages">
          <div class="bw-layout-page verso"><span class="bw-layout-side">VERSO ←</span><span class="bw-layout-page-num">(inside cover)</span><span class="bw-layout-page-type">blank or copyright</span></div>
          <div class="bw-layout-page recto"><span class="bw-layout-side">→ RECTO</span><span class="bw-layout-page-num">Page 1</span><span class="bw-layout-page-type">Title page</span></div>
          <div class="bw-layout-page verso"><span class="bw-layout-side">VERSO ←</span><span class="bw-layout-page-num">Page 2</span><span class="bw-layout-page-type">Copyright</span></div>
          <div class="bw-layout-page recto"><span class="bw-layout-side">→ RECTO</span><span class="bw-layout-page-num">Page 3</span><span class="bw-layout-page-type">${spreadStrategy === 'one-sided' ? 'First coloring page' : 'Section divider'}</span></div>
          <div class="bw-layout-page verso"><span class="bw-layout-side">VERSO ←</span><span class="bw-layout-page-num">Page 4</span><span class="bw-layout-page-type">${spreadStrategy === 'one-sided' ? '⚠️ Blank (avoids bleed-through)' : 'Content'}</span></div>
          <div class="bw-layout-page recto"><span class="bw-layout-side">→ RECTO</span><span class="bw-layout-page-num">Page 5</span><span class="bw-layout-page-type">${spreadStrategy === 'one-sided' ? 'Second coloring page' : 'Content'}</span></div>
        </div>
        <div style="font-size:11px; color: var(--text-muted); margin-top:6px;">
          <b style="color: var(--accent-primary-dark)">Note:</b> ${layout.notes}
        </div>
      </div>
    </div>

    <div class="bw-card" style="border-left-color: var(--accent-tertiary);">
      <div class="bw-card-title" style="color: #B08550;"><span class="bw-card-title-icon">🖼️</span>Page Treatment — decoration on content pages</div>
      <div style="font-size:13px; line-height:1.6;">
        ${(() => {
          const treat = bwGetPageTreatment(niche);
          const current = t.pageTreatment || 'none';
          const interiorOk = (opt) => bwTreatmentAllowedForInterior(opt, t.interior);
          return `
            <p class="bw-help-small" style="margin-bottom:10px;">Decorate puzzle/exercise pages WITHOUT sacrificing readability. One template image gets reused across many pages (efficient).</p>
            <div class="bw-treatment-grid">
              ${[
                {id: 'none', emoji: '⬜', name: 'None', desc: 'Clean white pages (maximum readability)'},
                {id: 'corner-ornaments', emoji: '🌿', name: 'Corner ornaments', desc: '1 small illustration in corner (~12% page area). Works B&W and color.'},
                {id: 'soft-background', emoji: '🎨', name: 'Soft background (5-10% opacity)', desc: 'Subtle pattern behind content. COLOR INTERIOR ONLY.'},
                {id: 'decorative-frame', emoji: '🖼️', name: 'Decorative frame', desc: 'Themed frame (vines, geometry, etc). COLOR INTERIOR ONLY. Genius Girls style.'},
                {id: 'corner-ornaments-per-section', emoji: '✨', name: 'Per-section ornaments', desc: 'Different corner ornament per squad. More images but more thematic.'}
              ].map(o => {
                const allowed = treat.options.includes(o.id) || o.id === treat.recommended;
                const interiorAllowed = interiorOk(o.id);
                const isRecommended = o.id === treat.recommended;
                const isSelected = current === o.id;
                const disabled = !allowed || !interiorAllowed;
                return `
                  <button class="bw-treatment-card ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''} ${disabled ? 'disabled' : ''}"
                          data-treat="${o.id}" ${disabled ? 'disabled' : ''}>
                    <div class="bw-treat-emoji">${o.emoji}</div>
                    <div class="bw-treat-name">${o.name}${isRecommended ? ' ⭐' : ''}</div>
                    <div class="bw-treat-desc">${o.desc}</div>
                    ${disabled && !interiorAllowed ? '<div class="bw-treat-warning">⚠️ Requires color interior</div>' : ''}
                    ${disabled && allowed === false ? '<div class="bw-treat-warning">Not recommended for this niche</div>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
            <div class="bw-layout-rules" style="margin-top:12px;">
              <b>📐 Compliance rules I apply:</b>
              <ul>
                <li><b>Safe zone:</b> ${treat.safeZone || 0.5}" from each edge — content NEVER touches decoration</li>
                <li><b>Solutions section:</b> ALWAYS clean, no treatment (readability of answers)</li>
                <li><b>B&W interior:</b> only allows "corner-ornaments" or "none" — gradients turn muddy in B&W print</li>
                <li><b>Niche note:</b> ${treat.notes}</li>
              </ul>
            </div>
          `;
        })()}
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title"><span class="bw-card-title-icon">💵</span>Pricing & Royalty</div>
      <div class="bw-grid">
        <div class="bw-field ${fillCls(t.pricing?.paperback)}"><label>Paperback ($)</label><input type="number" step="0.01" id="bw-t-pp" value="${t.pricing?.paperback ?? ''}" placeholder="14.99" /></div>
        <div class="bw-field ${fillCls(t.pricing?.hardcover)}"><label>Hardcover ($)</label><input type="number" step="0.01" id="bw-t-ph" value="${t.pricing?.hardcover ?? ''}" placeholder="24.99" /></div>
        <div class="bw-field ${fillCls(t.pricing?.kindle)}"><label>Kindle ($)</label><input type="number" step="0.01" id="bw-t-pk" value="${t.pricing?.kindle ?? ''}" placeholder="4.99" /></div>
      </div>
      ${showPaperback ? `
      <div class="bw-royalty-box">
        <div><b>Real royalty per paperback sale (KDP 2026):</b></div>
        <div class="bw-royalty-amount ${royalty < 0 ? 'neg' : (royalty < 1 ? 'warn' : 'good')}">
          $${royalty.toFixed(2)} / book
        </div>
        <div class="bw-royalty-formula">
          ($${(t.pricing?.paperback || 0).toFixed(2)} × 60%) − $${printCost.toFixed(2)} print cost
          <br>Print cost = $0.85 base + $${(BW_INTERIOR.find(i=>i.id===(t.interior||'color-standard'))?.perPage || 0).toFixed(3)}/pg × ${pageCount}pg ${isLarge ? '+ $0.006/pg large trim surcharge' : ''}
        </div>
      </div>` : ''}
      ${showHardcover ? `
      <div class="bw-royalty-box" style="margin-top:10px;background:#FBF6EC;border-color:#D4A574">
        <div><b>Real royalty per hardcover sale (KDP 2026):</b></div>
        <div class="bw-royalty-amount ${royaltyHC < 0 ? 'neg' : (royaltyHC < 1 ? 'warn' : 'good')}">
          $${royaltyHC.toFixed(2)} / book
        </div>
        <div class="bw-royalty-formula">
          ($${(t.pricing?.hardcover || 0).toFixed(2)} × 60%) − $${printCostHC.toFixed(2)} print cost
          <br>Hardcover print cost = $6.80 base + $${(BW_INTERIOR.find(i=>i.id===(t.interior||'color-standard'))?.perPage || 0).toFixed(3)}/pg × ${pageCount}pg
          <br><span style="color:#A56F2A">⚠️ Hardcover needs $24.99+ list price to make sense. KDP rules: min 75 pgs, max 550 pgs, NOT 8.5×11.</span>
        </div>
      </div>` : ''}
      <div class="bw-layout-rules" style="margin-top:14px;">
        <b>📐 Inside margin (gutter) required by KDP for ${pageCount} pgs:</b> minimum <b>${minInsideMargin}"</b>
        <br><span style="font-size:11px; color: var(--text-secondary);">Scales with pages: ≤150pg=0.375", 151-300=0.5", 301-500=0.625", 501-700=0.75", 700+=0.875"</span>
      </div>
    </div>

    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-ghost" onclick="bwSwitchStage(3)">← Stage 3</button>
      <button class="bw-btn bw-btn-primary" onclick="bwSwitchStage(5)">Stage 5 — Marketing →</button>
    </div>
  `;
  // Save layout preset to project on first render
  if (!t.layout) {
    bwUpdate('technical.layout', layoutPreset);
  }
  // Wire up Page Treatment buttons
  el.querySelectorAll('[data-treat]:not([disabled])').forEach(b => {
    b.addEventListener('click', () => {
      bwUpdate('technical.pageTreatment', b.dataset.treat);
      bwRenderStage4(el);
    });
  });
  document.getElementById('bw-t-trim').addEventListener('change', e => { bwUpdate('technical.trimSize', e.target.value); bwRenderStage4(el); });
  document.getElementById('bw-t-interior').addEventListener('change', e => { bwUpdate('technical.interior', e.target.value); bwRenderStage4(el); });
  document.getElementById('bw-t-paper').addEventListener('change', e => bwUpdate('technical.paper', e.target.value));
  document.getElementById('bw-t-cover').addEventListener('change', e => bwUpdate('technical.coverFinish', e.target.value));
  el.querySelectorAll('[data-fmt]').forEach(c => c.addEventListener('change', () => {
    const fmts = el.querySelectorAll('[data-fmt]:checked');
    bwUpdate('technical.formats', Array.from(fmts).map(f => f.dataset.fmt));
    bwRenderStage4(el);
  }));
  ['pp','ph','pk'].forEach(k => {
    const map = { pp: 'paperback', ph: 'hardcover', pk: 'kindle' };
    document.getElementById('bw-t-' + k).addEventListener('blur', e => {
      const pricing = Object.assign({}, bwCurrentProject.technical?.pricing || {});
      pricing[map[k]] = parseFloat(e.target.value) || 0;
      bwUpdate('technical.pricing', pricing);
      bwRenderStage4(el);
    });
  });
}

// ============ STAGE 5: MARKETING ============
function bwRenderStage5(el) {
  const m = bwCurrentProject.marketing || {};
  const niche = bwCurrentProject.positioning?.niche;
  const bisacSuggested = BW_BISAC_SUGGESTED[niche] || [];
  const titleLen = (m.title || '').length;
  el.innerHTML = `
    <h3>📣 Stage 5 — Marketing & SEO</h3>
    <p class="bw-help">How buyers find your book on Amazon.</p>
    <div class="bw-section">
      <label>Title (max 200 chars) — <span class="bw-counter ${titleLen > 200 ? 'err' : ''}">${titleLen}/200</span></label>
      <input type="text" id="bw-m-title" value="${m.title || ''}" maxlength="200" />
    </div>
    <div class="bw-section">
      <label>Subtitle (after the ":")</label>
      <input type="text" id="bw-m-subtitle" value="${m.subtitle || ''}" />
    </div>
    <div class="bw-section">
      <label>Description (HTML allowed — &lt;b&gt;, &lt;br&gt;)</label>
      <textarea id="bw-m-desc" rows="8">${m.description || ''}</textarea>
      <div class="bw-help-small">📝 Recommended template: 1 strong hook + 5-7 benefit bullets + CTA</div>
    </div>
    <div class="bw-section">
      <label>Backend Keywords (7 slots — KDP indexes up to 7 phrases)</label>
      <div class="bw-keywords-grid">
        ${[0,1,2,3,4,5,6].map(i => `<input type="text" data-kw="${i}" value="${m.keywords?.[i] || ''}" placeholder="Keyword ${i+1}" />`).join('')}
      </div>
    </div>
    <div class="bw-section">
      <label>Amazon Store Categories (3 max — KDP 2026)</label>
      <div class="bw-help-small" style="margin-bottom:8px;">⚠️ Amazon dropped BISAC codes in 2023. Now it's 3 Amazon Store categories per format (paperback, hardcover, kindle = 3 each). Hard limit — you can't email to request more.</div>
      ${bisacSuggested.map((c, i) => `
        <label class="bw-check"><input type="checkbox" data-bisac="${c}" ${(m.bisac || []).includes(c) ? 'checked' : ''}/> ${c}</label>
      `).join('')}
      <input type="text" id="bw-m-bisac-custom" placeholder="Or type custom category..." style="margin-top:8px;width:100%;padding:8px;" />
    </div>
    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-ghost" onclick="bwSwitchStage(4)">← Stage 4</button>
      <button class="bw-btn bw-btn-primary" onclick="bwSwitchStage(6)">Stage 6 — Auto-Production →</button>
    </div>
  `;
  document.getElementById('bw-m-title').addEventListener('input', e => bwUpdate('marketing.title', e.target.value));
  document.getElementById('bw-m-subtitle').addEventListener('blur', e => bwUpdate('marketing.subtitle', e.target.value));
  document.getElementById('bw-m-desc').addEventListener('blur', e => bwUpdate('marketing.description', e.target.value));
  el.querySelectorAll('[data-kw]').forEach(inp => inp.addEventListener('blur', () => {
    const kws = [...(bwCurrentProject.marketing?.keywords || [])];
    while (kws.length < 7) kws.push('');
    kws[parseInt(inp.dataset.kw)] = inp.value;
    bwUpdate('marketing.keywords', kws);
  }));
  el.querySelectorAll('[data-bisac]').forEach(c => c.addEventListener('change', () => {
    const checked = el.querySelectorAll('[data-bisac]:checked');
    bwUpdate('marketing.bisac', Array.from(checked).map(c2 => c2.dataset.bisac));
  }));
  // re-render on title input for char counter
  document.getElementById('bw-m-title').addEventListener('input', () => {
    const c = document.querySelector('.bw-counter');
    const v = document.getElementById('bw-m-title').value.length;
    if (c) { c.textContent = `${v}/200`; c.classList.toggle('err', v > 200); }
  });
}

// ============ STAGE 6: AUTO-PRODUCTION ============
function bwRenderStage6(el) {
  const p = bwCurrentProject;
  const pal = BW_PALETTES.find(x => x.id === p.style?.palette);
  const vs = BW_VISUAL_STYLES.find(x => x.id === p.style?.visualStyle);
  const ni = BW_NICHES.find(n => n.id === p.positioning?.niche);
  el.innerHTML = `
    <span class="bw-stage-badge">🤖 STAGE 6 / 6 — AUTO-PRODUCTION</span>
    <h3>Summary + Pre-Publish Checklist KDP 2026</h3>
    <p class="bw-help">Before uploading to KDP, verify this critical checklist.</p>

    <div class="bw-card" style="border-left-color: var(--error);">
      <div class="bw-card-title" style="color: var(--error);">⚠️ AI DISCLOSURE (Mandatory 2026)</div>
      <div style="font-size:13px; line-height:1.6;">
        Amazon tightened enforcement in 2026. <b>If you use AI images (covers, dividers, interior) or AI-generated text, you MUST declare it</b> when uploading to KDP under "AI Content Disclosure".
        <br><br>
        <b>Your book uses:</b><br>
        ${(p.references?.length || 0) > 0 || p.style?.visualStyle ? '✅ AI-generated images (Flux/OpenArt) → mark "AI Generated Images" on KDP' : '— no AI images'}<br>
        — AI-assisted text (Claude helped with prompts/titles/marketing) → <b>NO declaration required</b> (assisted, not generated)<br>
        <br>
        <b>Penalty if you DON'T declare:</b> Amazon removes your book without warning + suspends your account + holds pending royalties. Their detection system does it automatically.
        <br><br>
        <label class="bw-check"><input type="checkbox" id="bw-ai-disclosed" ${p.compliance?.aiDisclosed ? 'checked' : ''}/> <b>I confirm I will mark AI disclosure when uploading to KDP</b></label>
      </div>
    </div>

    <div class="bw-card" style="border-left-color: var(--accent-tertiary);">
      <div class="bw-card-title" style="color: var(--accent-tertiary-dark, #B08550);"><span class="bw-card-title-icon">🖼️</span>Image Plan — how many you need</div>
      <div style="font-size:13px; line-height:1.7;">
        ${(() => {
          const plan = bwGetImagePlan(p.positioning?.niche);
          const treat = bwGetPageTreatment(p.positioning?.niche);
          const treatType = p.technical?.pageTreatment || 'none';
          // calc extra images from treatment
          const treatExtras = treatType === 'none' ? 0
            : treatType === 'corner-ornaments' ? 1
            : treatType === 'corner-ornaments-per-section' ? (treat.extraImages || 6)
            : treatType === 'soft-background' ? 1
            : treatType === 'decorative-frame' ? (treat.extraImages || 1)
            : 0;
          const totalWithTreat = plan.totalUnique + treatExtras;
          return `
            <div style="margin-bottom:10px;"><b>Total unique images to generate:</b> <span style="background: var(--accent-tertiary-soft); color: #8B6F47; padding: 2px 10px; border-radius: 12px; font-weight: 700;">${totalWithTreat}</span> (${plan.totalUnique} base + ${treatExtras} page treatment)</div>
            <table style="width:100%; font-size:12px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid var(--border-light);"><th style="text-align:left; padding:4px 0;">Type</th><th style="text-align:right;">Quantity</th></tr>
              ${plan.coverFront ? `<tr><td style="padding:3px 0;">Cover front</td><td style="text-align:right;">${plan.coverFront}</td></tr>` : ''}
              ${plan.coverBack ? `<tr><td>Cover back</td><td style="text-align:right;">${plan.coverBack}</td></tr>` : ''}
              ${plan.spine ? `<tr><td>Spine (calculated by KDP)</td><td style="text-align:right;">${plan.spine}</td></tr>` : ''}
              ${plan.titlePageBg ? `<tr><td>Title page background</td><td style="text-align:right;">${plan.titlePageBg}</td></tr>` : ''}
              ${plan.sectionDividers ? `<tr><td>Section dividers</td><td style="text-align:right;">${plan.sectionDividers}</td></tr>` : ''}
              ${plan.coloringPagesUnique ? `<tr><td><b>Unique coloring pages</b></td><td style="text-align:right;"><b>${plan.coloringPagesUnique}</b></td></tr>` : ''}
              ${plan.promptPagesUnique ? `<tr><td><b>Unique prompt pages</b></td><td style="text-align:right;"><b>${plan.promptPagesUnique}</b></td></tr>` : ''}
              ${plan.quotePages ? `<tr><td>Quote pages</td><td style="text-align:right;">${plan.quotePages}</td></tr>` : ''}
              ${plan.decorativePages ? `<tr><td>Decorative pages</td><td style="text-align:right;">${plan.decorativePages}</td></tr>` : ''}
              ${plan.solutionsDivider ? `<tr><td>Solutions divider</td><td style="text-align:right;">${plan.solutionsDivider}</td></tr>` : ''}
              ${plan.weeklyTemplate ? `<tr><td>Weekly template (repeats ~52x)</td><td style="text-align:right;">${plan.weeklyTemplate}</td></tr>` : ''}
              ${plan.monthlyTemplate ? `<tr><td>Monthly template (repeats 12x)</td><td style="text-align:right;">${plan.monthlyTemplate}</td></tr>` : ''}
              ${plan.exerciseTemplate ? `<tr><td>Exercise template (repeats)</td><td style="text-align:right;">${plan.exerciseTemplate}</td></tr>` : ''}
              ${plan.trackerTemplate ? `<tr><td>Tracker template (repeats monthly)</td><td style="text-align:right;">${plan.trackerTemplate}</td></tr>` : ''}
              ${plan.repeatingTemplates > 0 && !plan.weeklyTemplate ? `<tr><td>Repeating templates</td><td style="text-align:right;">${plan.repeatingTemplates}</td></tr>` : ''}
              ${treatExtras > 0 ? `<tr style="background: var(--accent-tertiary-soft);"><td><b>Page treatment (${treatType})</b><br><span style="font-size:10px;">↳ Reused on ALL puzzle pages</span></td><td style="text-align:right;"><b>${treatExtras}</b></td></tr>` : ''}
            </table>
            <div style="margin-top:10px; padding: 8px 10px; background: var(--bg-elevated); border-radius: 4px;">
              <div><b>Pages WITHOUT image:</b> ${plan.pagesWithoutImage}</div>
              <div><b>Repeating templates:</b> ${plan.repeatingTemplates}</div>
              <div style="margin-top:6px; color: var(--text-secondary); font-size:11px;"><b>Notes:</b> ${plan.notes}</div>
            </div>
            <div style="margin-top:10px; padding: 10px; background: var(--accent-secondary-soft); border-radius: 4px; font-size:12px;">
              <b>💰 OpenArt cost estimate:</b> ${plan.totalUnique} images × 3 samples = ${plan.totalUnique * 3} generations × ~15 credits = ~${plan.totalUnique * 45} credits. You have 23,840 credits = plenty for several books.
            </div>
          `;
        })()}
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title">📊 Book Summary</div>
      <div class="bw-summary">
        <div><b>Book:</b> ${p.marketing?.title || '—'}</div>
        <div><b>Niche:</b> ${ni?.name || '—'} / ${p.positioning?.subNiche || '—'}</div>
        <div><b>Audience:</b> ${p.positioning?.ageMin || '?'}-${p.positioning?.ageMax || '?'} ${p.positioning?.gender || ''}</div>
        <div><b>Style:</b> ${vs?.name || '—'} / Palette: ${pal?.name || '—'}</div>
        <div><b>Pages:</b> ${p.content?.pageCount || '—'} / ${p.content?.sections?.length || 0} sections</div>
        <div><b>Format:</b> ${p.technical?.trimSize || '—'} ${p.technical?.interior || '—'}</div>
        <div><b>Real print cost:</b> $${bwCalcPrintCost(p.technical?.interior || 'color-standard', p.content?.pageCount || 200, p.technical?.trimSize || '6x9').toFixed(2)}</div>
        <div><b>Price:</b> $${p.technical?.pricing?.paperback || '—'} / $${p.technical?.pricing?.hardcover || '—'} / $${p.technical?.pricing?.kindle || '—'}</div>
        <div><b>References saved:</b> ${(p.references || []).length}</div>
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title">✅ Pre-Publish Checklist KDP 2026</div>
      <div style="font-size:13px; line-height:2;">
        <label class="bw-check"><input type="checkbox" /> AI disclosure confirmed on KDP upload</label><br>
        <label class="bw-check"><input type="checkbox" /> Title verified in USPTO Class 016 (no trademark violations)</label><br>
        <label class="bw-check"><input type="checkbox" /> Order KDP PRINT PROOF before "Publish" — verify actual printed quality</label><br>
        <label class="bw-check"><input type="checkbox" /> Cover wrap (front + spine + back) with correct bleed — use <a href="https://kdp.amazon.com/cover-calculator" target="_blank" style="color: var(--accent-primary);">KDP Cover Calculator</a></label><br>
        <label class="bw-check"><input type="checkbox" /> Spine width calculated by pages + paper (auto in KDP Cover Calculator)</label><br>
        <label class="bw-check"><input type="checkbox" /> 3 Amazon Store Categories chosen (firm — can't ask for more)</label><br>
        <label class="bw-check"><input type="checkbox" /> 7 backend keywords complete, no duplicate title words</label><br>
        <label class="bw-check"><input type="checkbox" /> Look Inside auto-enable (check which pages display)</label><br>
        <label class="bw-check"><input type="checkbox" /> ISBN — KDP free OR use your own ISBN (if you want to distribute outside Amazon)</label><br>
        <label class="bw-check"><input type="checkbox" /> Imprint name (publisher) — optional but recommended for branding</label><br>
        <label class="bw-check"><input type="checkbox" /> A+ Content (if you have Brand Registry) — increases conversion 25%+</label><br>
        <label class="bw-check"><input type="checkbox" /> Series page setup if publishing Vol 1 (KDP auto-link when you upload Vol 2)</label><br>
        <label class="bw-check"><input type="checkbox" /> Back matter includes: solutions, cross-promo, AI disclosure note, review request</label><br>
        <label class="bw-check"><input type="checkbox" /> Inside margin respected (minimum by pages — wizard already validates)</label><br>
        <label class="bw-check"><input type="checkbox" /> Bleed configured in ALL images touching edge (0.125" extra)</label>
      </div>
    </div>

    <div class="bw-card">
      <div class="bw-card-title">🔧 Next manual steps</div>
      <div class="bw-handoff-card">
        <span class="bw-handoff-num">1</span>
        <div>
          <b>🎨 Generate images</b><br>
          Go to the "AI Images" tab — complete the panels (cover + section dividers + quote + welcome + solutions).
        </div>
      </div>
      <div class="bw-handoff-card">
        <span class="bw-handoff-num">2</span>
        <div>
          <b>🧩 Upload images to Stage 6 → Compile</b><br>
          Once you have your generated images, upload them in the Assets Manager below. Then click "Compile Interior PDF" and "Compile Cover Wrap PDF".
          <ul style="margin:6px 0 0 18px;font-size:12px;">
            ${(p.content?.sections || []).map(s => `<li>${s.name} → ${s.count} ${s.type} puzzles</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="bw-handoff-card">
        <span class="bw-handoff-num">3</span>
        <div>
          <b>📋 Upload to KDP</b><br>
          1. <a href="https://kdp.amazon.com" target="_blank" style="color: var(--accent-primary);">kdp.amazon.com</a> → Create new Paperback<br>
          2. Fill in title, subtitle, description, keywords, categories from the marketing package you generated here<br>
          3. <b>MARK AI Content Disclosure</b><br>
          4. Upload manuscript PDF + cover wrap PDF<br>
          5. Pricing → use the prices we validated here<br>
          6. Order print proof BEFORE clicking Publish<br>
          7. Once proof is OK → Publish
        </div>
      </div>
    </div>
    <div class="bw-summary">
      <div><b>Book:</b> ${p.marketing?.title || '—'}</div>
      <div><b>Niche:</b> ${ni?.name || '—'} / ${p.positioning?.subNiche || '—'}</div>
      <div><b>Audience:</b> ${p.positioning?.ageMin || '?'}-${p.positioning?.ageMax || '?'} ${p.positioning?.gender || ''}</div>
      <div><b>Style:</b> ${vs?.name || '—'} / Palette: ${pal?.name || '—'}</div>
      <div><b>Pages:</b> ${p.content?.pageCount || '—'} / ${p.content?.sections?.length || 0} sections</div>
      <div><b>Format:</b> ${p.technical?.trimSize || '—'} ${p.technical?.interior || '—'}</div>
      <div><b>Price:</b> $${p.technical?.pricing?.paperback || '—'} / $${p.technical?.pricing?.hardcover || '—'} / $${p.technical?.pricing?.kindle || '—'}</div>
      <div><b>References saved:</b> ${(p.references || []).length}</div>
    </div>

    <!-- ============ COVER GENERATOR (fal.ai) ============ -->
    <div class="bw-card" style="border-left-color: var(--accent-secondary);">
      <div class="bw-card-title" style="color: var(--accent-secondary);"><span class="bw-card-title-icon">🎨</span>Cover Generator (fal.ai · Ideogram-v2)</div>
      <p class="bw-help-small">Auto-generates 3 cover variants from your cluster + title. ~$0.20 per book. Pick one or regenerate.</p>
      <div id="bw-covergen-host"></div>
    </div>

    <!-- ============ INTERIOR GENERATOR (fal.ai · Phase B) ============ -->
    <div class="bw-card" style="border-left-color: var(--accent-tertiary);">
      <div class="bw-card-title" style="color: var(--accent-tertiary);"><span class="bw-card-title-icon">🖼️</span>Interior Images Generator (fal.ai)</div>
      <p class="bw-help-small">Auto-generate dividers, welcome, quote, solutions, and ornaments. Generate ALL or test individually. ~$0.10 per image.</p>
      <div id="bw-intgen-host"></div>
    </div>

    <!-- ============ ASSETS MANAGER ============ -->
    <div class="bw-card" style="border-left-color: var(--accent-secondary);">
      <div class="bw-card-title" style="color: var(--accent-secondary);"><span class="bw-card-title-icon">🖼️</span>Upload generated images</div>
      <p class="bw-help-small">Once you've generated images in OpenArt, upload them here. The platform automatically merges them into the PDF.</p>
      <div id="bw-storage-bar" style="margin-bottom:12px"></div>
      <div id="bw-assets-grid" class="bw-assets-grid"></div>
    </div>

    <!-- ============ COMPILE BUTTONS ============ -->
    <div class="bw-card" style="border-left-color: var(--accent-primary);">
      <div class="bw-card-title" style="color: var(--accent-primary);"><span class="bw-card-title-icon">📄</span>Compile KDP-ready book</div>
      <p class="bw-help-small">Generate the final PDFs ready to upload to KDP. Review before downloading.</p>
      <div id="bw-compile-readiness" class="bw-readiness"></div>
      <div class="bw-actions-row" style="margin-top: 12px;">
        <button class="bw-btn bw-btn-primary" id="bw-btn-compile-interior" style="background: var(--accent-primary) !important;">📖 Compile Interior PDF</button>
        <button class="bw-btn bw-btn-primary" id="bw-btn-compile-cover" style="background: var(--accent-tertiary) !important; color: var(--text-primary) !important;">🎨 Compile Cover Wrap PDF</button>
      </div>
      <div id="bw-compile-progress" class="bw-compile-progress"></div>
    </div>

    <div class="bw-actions-row">
      <button class="bw-btn bw-btn-ghost" onclick="bwSwitchStage(5)">← Stage 5</button>
      <button class="bw-btn bw-btn-ghost" onclick="bwExportJson()">⬇️ Export project JSON</button>
    </div>
  `;
  // Wire AI disclosure checkbox
  const aiCheck = document.getElementById('bw-ai-disclosed');
  if (aiCheck) aiCheck.addEventListener('change', e => bwUpdate('compliance.aiDisclosed', e.target.checked));

  // Render assets grid + compile buttons
  bwRenderAssetsGrid();
  bwRenderCompileReadiness();
  document.getElementById('bw-btn-compile-interior').addEventListener('click', () => bwHandleCompileInterior());
  document.getElementById('bw-btn-compile-cover').addEventListener('click', () => bwHandleCompileCover());

  // Cover Generator + Interior Generator
  bwRenderCoverGen();
  bwRenderInteriorGen();
}

// ============ COVER GENERATOR (fal.ai) ============

function bwRenderCoverGen() {
  const host = document.getElementById('bw-covergen-host');
  if (!host) return;
  const hasKey = (typeof igHasKey === 'function') && igHasKey();
  const project = bwCurrentProject;
  const titleSet = !!(project?.marketing?.title);

  if (!hasKey) {
    host.innerHTML = `
      <div class="bw-covergen-keyform">
        <p class="bw-help-small">Paste your fal.ai API key. <a href="https://fal.ai/dashboard/keys" target="_blank" style="color:var(--accent-primary)">Get one here</a> ($1 free credit).</p>
        <div style="display:flex; gap:8px;">
          <input type="password" id="bw-falai-key-input" placeholder="fal_xxxxxxxxxxxxxxxxxxxxxxxx" style="flex:1; padding:8px 10px; border:1px solid var(--border-default); border-radius:6px;" />
          <button class="bw-btn bw-btn-primary" id="bw-falai-key-save">Save key</button>
        </div>
        <p class="bw-help-small" style="margin-top:6px">Stored only in your browser (localStorage). Never sent to any other server.</p>
      </div>
    `;
    document.getElementById('bw-falai-key-save').addEventListener('click', () => {
      const v = document.getElementById('bw-falai-key-input').value.trim();
      if (!v) { bwToast('Paste your fal.ai key first'); return; }
      igSetApiKey(v);
      bwToast('✓ API key saved');
      bwRenderCoverGen();
    });
    return;
  }

  if (!titleSet) {
    host.innerHTML = `<p class="bw-help-small">⚠️ Apply a Stage 0 cluster (or fill Stage 5 title) before generating covers — the prompt needs the title.</p>`;
    return;
  }

  const variants = project._coverVariants || [];
  host.innerHTML = `
    <div class="bw-actions-row" style="margin-bottom:12px">
      <button class="bw-btn bw-btn-primary" id="bw-covergen-go">🎨 Generate 3 cover variants</button>
      <button class="bw-btn bw-btn-ghost" id="bw-covergen-clear-key">🔑 Change API key</button>
    </div>
    <div id="bw-covergen-grid" class="bw-covergen-grid">${
      variants.map((v, i) => bwCoverVariantHtml(v, i)).join('')
    }</div>
  `;

  document.getElementById('bw-covergen-go').addEventListener('click', () => bwHandleGenerateCovers());
  document.getElementById('bw-covergen-clear-key').addEventListener('click', () => {
    if (!confirm('Remove the saved fal.ai API key from this browser?')) return;
    igClearApiKey();
    bwRenderCoverGen();
  });
  // Wire variant action buttons
  document.querySelectorAll('[data-cover-use]').forEach(btn => btn.addEventListener('click', () => bwUseCoverVariant(parseInt(btn.dataset.coverUse))));
  document.querySelectorAll('[data-cover-regen]').forEach(btn => btn.addEventListener('click', () => bwRegenerateCoverVariant(parseInt(btn.dataset.coverRegen))));
}

function bwCoverVariantHtml(v, idx) {
  const status = v.status || (v.url ? 'done' : v.error ? 'error' : 'pending');
  const body = status === 'pending' ? `<div class="bw-covergen-loading">⏳ Generating…</div>`
    : status === 'error' ? `<div class="bw-covergen-error">❌ ${v.error || 'Failed'}<br><small>Click regenerate to retry.</small></div>`
    : `<img src="${v.url}" alt="Variant ${v.label}" />`;
  return `
    <div class="bw-covergen-variant" data-idx="${idx}">
      <div class="bw-covergen-label"><b>${v.id || (idx+1)}</b> · ${v.label || 'Variant'}</div>
      <div class="bw-covergen-canvas">${body}</div>
      <div class="bw-covergen-actions">
        ${v.url ? `<button class="bw-btn bw-btn-primary" data-cover-use="${idx}">✓ Use this</button>` : ''}
        <button class="bw-btn bw-btn-ghost" data-cover-regen="${idx}">🔄 Regenerate</button>
      </div>
    </div>
  `;
}

async function bwHandleGenerateCovers() {
  if (!bwCurrentProject) return;
  // Initialize with 3 pending placeholders so the user sees progress
  const variants = igBuildCoverPrompts(bwCurrentProject).map(v => ({ ...v, status: 'pending', url: null, error: null }));
  bwCurrentProject._coverVariants = variants;
  bwRenderCoverGen();

  // Generate in parallel; update each variant as it completes
  await Promise.all(variants.map(async (_, i) => {
    try {
      const url = await igGenerateOne({ prompt: variants[i].prompt, style: variants[i].style });
      variants[i].url = url;
      variants[i].status = 'done';
    } catch (e) {
      variants[i].error = e.message;
      variants[i].status = 'error';
    }
    bwRenderCoverGen();  // re-render after each completion
  }));
}

async function bwRegenerateCoverVariant(idx) {
  if (!bwCurrentProject?._coverVariants?.[idx]) return;
  const v = bwCurrentProject._coverVariants[idx];
  v.status = 'pending'; v.url = null; v.error = null;
  bwRenderCoverGen();
  try {
    const url = await igGenerateOne({ prompt: v.prompt, style: v.style });
    v.url = url; v.status = 'done';
  } catch (e) {
    v.error = e.message; v.status = 'error';
  }
  bwRenderCoverGen();
}

async function bwUseCoverVariant(idx) {
  if (!bwCurrentProject?._coverVariants?.[idx]?.url) return;
  const v = bwCurrentProject._coverVariants[idx];
  bwToast('Saving cover image…');
  try {
    const dataUrl = await igUrlToDataUrl(v.url);
    const processed = await igDataUrlToProcessed(dataUrl);
    const ok = bcSaveAsset(bwCurrentProject, 'cover-front', processed);
    if (!ok) { bwToast('❌ Save failed (storage full?). Try Clear unused images.'); return; }
    bwCurrentProject._coverVariants = null;
    bwToast('✓ Cover saved as cover-front asset');
    bwRender();
  } catch (e) {
    bwToast('❌ Failed to save: ' + e.message);
  }
}

// ============ INTERIOR GENERATOR (fal.ai · Phase B) ============
//
// State stored on bwCurrentProject._interiorGen[slotId] = { url, status, error }.
// "Use this" persists to project.assets via bcSaveAsset, then clears state.

function bwRenderInteriorGen() {
  const host = document.getElementById('bw-intgen-host');
  if (!host || !bwCurrentProject) return;
  const hasKey = (typeof igHasKey === 'function') && igHasKey();
  if (!hasKey) {
    host.innerHTML = `<p class="bw-help-small">⚠️ Save your fal.ai API key in the Cover Generator card first — interior gen reuses it.</p>`;
    return;
  }
  if (typeof igBuildInteriorPrompts !== 'function') {
    host.innerHTML = `<p class="bw-help-small">image-gen.js missing. Reload the page.</p>`;
    return;
  }

  const slots = igBuildInteriorPrompts(bwCurrentProject);
  if (!slots.length) {
    host.innerHTML = `<p class="bw-help-small">No interior slots required for this project. Add sections in Stage 3 first.</p>`;
    return;
  }

  const state = bwCurrentProject._interiorGen || {};
  const missingCount = slots.filter(s => !bcGetAsset(bwCurrentProject, s.slotId) && state[s.slotId]?.status !== 'done').length;

  host.innerHTML = `
    <div class="bw-actions-row" style="margin-bottom:12px">
      <button class="bw-btn bw-btn-primary" id="bw-intgen-all" ${missingCount === 0 ? 'disabled' : ''}>🚀 Generate ALL missing (${missingCount})</button>
      <button class="bw-btn bw-btn-ghost" id="bw-intgen-clear" ${Object.keys(state).length === 0 ? 'disabled' : ''}>🗑️ Clear unused previews</button>
    </div>
    <div class="bw-intgen-grid">
      ${slots.map(s => bwInteriorSlotHtml(s, state[s.slotId])).join('')}
    </div>
  `;

  document.getElementById('bw-intgen-all').addEventListener('click', () => bwHandleGenerateAllInteriors());
  document.getElementById('bw-intgen-clear').addEventListener('click', () => {
    bwCurrentProject._interiorGen = {};
    bwRenderInteriorGen();
  });
  document.querySelectorAll('[data-int-gen]').forEach(btn => btn.addEventListener('click', () => bwHandleGenerateOneInterior(btn.dataset.intGen)));
  document.querySelectorAll('[data-int-use]').forEach(btn => btn.addEventListener('click', () => bwUseInterior(btn.dataset.intUse)));
  document.querySelectorAll('[data-int-regen]').forEach(btn => btn.addEventListener('click', () => bwHandleGenerateOneInterior(btn.dataset.intRegen)));
}

function bwInteriorSlotHtml(slot, st) {
  const saved = bcGetAsset(bwCurrentProject, slot.slotId);
  const status = st?.status || (saved ? 'saved' : 'idle');
  let body = '';
  if (status === 'pending') {
    body = `<div class="bw-covergen-loading">⏳ Generating…</div>`;
  } else if (status === 'error') {
    body = `<div class="bw-covergen-error">❌ ${st.error || 'Failed'}</div>`;
  } else if (status === 'done' && st?.url) {
    body = `<img src="${st.url}" alt="${slot.label}" />`;
  } else if (status === 'saved') {
    body = `<img src="${saved}" alt="${slot.label}" /><div class="bw-intgen-savedbadge">✓ saved</div>`;
  } else {
    body = `<div class="bw-intgen-empty">no preview</div>`;
  }

  let actions = '';
  if (status === 'done') {
    actions = `
      <button class="bw-btn bw-btn-primary bw-covergen-use" data-int-use="${slot.slotId}">✓ Use this</button>
      <button class="bw-btn bw-btn-ghost" data-int-regen="${slot.slotId}">🔄</button>
    `;
  } else if (status === 'saved') {
    actions = `<button class="bw-btn bw-btn-ghost" data-int-gen="${slot.slotId}">🔄 Regenerate</button>`;
  } else if (status === 'error') {
    actions = `<button class="bw-btn bw-btn-ghost" data-int-gen="${slot.slotId}">🔄 Retry</button>`;
  } else if (status === 'pending') {
    actions = `<button class="bw-btn bw-btn-ghost" disabled>…</button>`;
  } else {
    actions = `<button class="bw-btn bw-btn-primary" data-int-gen="${slot.slotId}">🎨 Generate</button>`;
  }

  return `
    <div class="bw-intgen-slot" data-slot-id="${slot.slotId}">
      <div class="bw-intgen-slotlabel">${slot.label}</div>
      <div class="bw-intgen-canvas">${body}</div>
      <div class="bw-intgen-actions">${actions}</div>
    </div>
  `;
}

async function bwHandleGenerateOneInterior(slotId) {
  if (!bwCurrentProject) return;
  const slot = igBuildInteriorPrompts(bwCurrentProject).find(s => s.slotId === slotId);
  if (!slot) return;
  bwCurrentProject._interiorGen = bwCurrentProject._interiorGen || {};
  bwCurrentProject._interiorGen[slotId] = { status: 'pending', url: null, error: null };
  bwRenderInteriorGen();
  try {
    const url = await igGenerateInteriorOne(slot);
    bwCurrentProject._interiorGen[slotId] = { status: 'done', url, error: null };
  } catch (e) {
    bwCurrentProject._interiorGen[slotId] = { status: 'error', url: null, error: e.message };
  }
  bwRenderInteriorGen();
}

async function bwHandleGenerateAllInteriors() {
  if (!bwCurrentProject) return;
  const slots = igBuildInteriorPrompts(bwCurrentProject);
  bwCurrentProject._interiorGen = bwCurrentProject._interiorGen || {};
  // Skip slots already saved or already done in preview state
  const todo = slots.filter(s => {
    if (bcGetAsset(bwCurrentProject, s.slotId)) return false;
    const st = bwCurrentProject._interiorGen[s.slotId];
    if (st?.status === 'done' || st?.status === 'pending') return false;
    return true;
  });
  if (!todo.length) { bwToast('Nothing to generate — all slots saved or in preview.'); return; }
  bwToast(`Generating ${todo.length} images in parallel…`);
  todo.forEach(s => { bwCurrentProject._interiorGen[s.slotId] = { status: 'pending', url: null, error: null }; });
  bwRenderInteriorGen();

  await Promise.all(todo.map(async slot => {
    try {
      const url = await igGenerateInteriorOne(slot);
      bwCurrentProject._interiorGen[slot.slotId] = { status: 'done', url, error: null };
    } catch (e) {
      bwCurrentProject._interiorGen[slot.slotId] = { status: 'error', url: null, error: e.message };
    }
    bwRenderInteriorGen();
  }));
  const ok = todo.filter(s => bwCurrentProject._interiorGen[s.slotId].status === 'done').length;
  bwToast(`✓ Generated ${ok}/${todo.length}. Click "Use this" to save each.`);
}

async function bwUseInterior(slotId) {
  const st = bwCurrentProject?._interiorGen?.[slotId];
  if (!st?.url) return;
  bwToast(`Saving ${slotId}…`);
  try {
    const dataUrl = await igUrlToDataUrl(st.url);
    const processed = await igDataUrlToProcessed(dataUrl);
    const ok = bcSaveAsset(bwCurrentProject, slotId, processed);
    if (!ok) { bwToast('❌ Save failed (storage full?). Try Clear unused images.'); return; }
    delete bwCurrentProject._interiorGen[slotId];
    bwToast(`✓ ${slotId} saved`);
    bwRender();  // refreshes assets grid + readiness
  } catch (e) {
    bwToast('❌ Failed to save: ' + e.message);
  }
}

// ============ ASSETS MANAGER ============

// Returns slot IDs in project.assets that are NOT in the current required slots
// (orphans from deleted sections, changed page treatment, etc).
function bwGetUnusedAssetSlots(project) {
  const required = new Set(bcGetRequiredSlots(project).map(s => s.id));
  const present = Object.keys(project.assets || {});
  return present.filter(id => !required.has(id));
}

function bwCleanupUnusedAssets(project) {
  const unused = bwGetUnusedAssetSlots(project);
  if (unused.length === 0) return { removed: [], freedBytes: 0 };
  let freedBytes = 0;
  unused.forEach(id => {
    const dataUrl = project.assets?.[id]?.dataUrl || '';
    freedBytes += dataUrl.length;
    delete project.assets[id];
  });
  bwUpsert(project);
  return { removed: unused, freedBytes };
}

function bwGetStorageStats() {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    totalBytes += (k.length + (localStorage.getItem(k) || '').length);
  }
  // Chrome localStorage cap is ~10 MB (UTF-16 → ~5MB chars). We display chars × 2 estimate.
  const usedKB = Math.round((totalBytes * 2) / 1024);
  const capKB = 10240; // Chrome cap
  const pct = Math.min(100, Math.round((usedKB / capKB) * 100));
  return { usedKB, capKB, pct };
}

function bwRenderStorageBar() {
  const el = document.getElementById('bw-storage-bar');
  if (!el || !bwCurrentProject) return;
  const stats = bwGetStorageStats();
  const unused = bwGetUnusedAssetSlots(bwCurrentProject);
  const projectKB = Math.round(JSON.stringify(bwCurrentProject).length / 1024);
  const color = stats.pct >= 85 ? '#C8602F' : stats.pct >= 60 ? '#D4A574' : '#8B9D7E';
  el.innerHTML = `
    <div style="background:#FBF6EC;border:1px solid #E5DCC9;border-radius:8px;padding:10px 12px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong>Storage usage</strong>
        <span style="color:${color}">${stats.usedKB} KB / ~${stats.capKB} KB (${stats.pct}%)</span>
      </div>
      <div style="background:#E5DCC9;height:6px;border-radius:3px;overflow:hidden">
        <div style="background:${color};width:${stats.pct}%;height:100%"></div>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <span style="color:#7A5230">This project: <strong>${projectKB} KB</strong></span>
        ${unused.length ? `<span style="color:#C8602F">· ${unused.length} unused image${unused.length>1?'s':''} taking space</span>` : `<span style="color:#8B9D7E">· no unused images</span>`}
        <button class="bw-btn bw-btn-ghost" style="padding:4px 10px;font-size:11px;margin-left:auto" onclick="bwHandleCleanupUnused()" ${unused.length ? '' : 'disabled'}>🧹 Clear unused images</button>
        <button class="bw-btn bw-btn-ghost" style="padding:4px 10px;font-size:11px" onclick="bwShowStorageBreakdown()">📊 Breakdown</button>
      </div>
    </div>`;
}

function bwHandleCleanupUnused() {
  const unused = bwGetUnusedAssetSlots(bwCurrentProject);
  if (!unused.length) { bwToast('Nothing to clean up'); return; }
  if (!confirm(`Remove ${unused.length} unused image${unused.length>1?'s':''} from this project?\n\nThese are orphan images from deleted sections or old page treatments — not used in the compile.`)) return;
  const { freedBytes } = bwCleanupUnusedAssets(bwCurrentProject);
  bwToast(`✓ Removed ${unused.length} image${unused.length>1?'s':''} — freed ${Math.round(freedBytes/1024)} KB`);
  bwRenderAssetsGrid();
  bwRenderStorageBar();
  bwRenderCompileReadiness();
}

function bwShowStorageBreakdown() {
  const all = bwLoadAll();
  const lines = (all.list || []).map(p => {
    const kb = Math.round(JSON.stringify(p).length / 1024);
    const imgs = Object.keys(p.assets || {}).length;
    const isActive = p.id === all.active;
    return `${isActive ? '★ ' : '  '}${(p.marketing?.title || p.id).slice(0, 50).padEnd(52)} ${String(kb).padStart(5)} KB  (${imgs} img)`;
  });
  alert(`Storage breakdown — all projects:\n\n${lines.join('\n')}\n\n★ = currently active\n\nTo delete a project, switch to it via the header dropdown then click 🗑️ Delete.`);
}

function bwRenderAssetsGrid() {
  const el = document.getElementById('bw-assets-grid');
  if (!el || !bwCurrentProject) return;
  if (typeof bcGetRequiredSlots !== 'function') {
    el.innerHTML = '<p style="color:var(--text-muted);">⚠️ book-compile.js no cargado</p>';
    return;
  }
  bwRenderStorageBar();
  const slots = bcGetRequiredSlots(bwCurrentProject);
  el.innerHTML = slots.map(slot => {
    const dataUrl = bcGetAsset(bwCurrentProject, slot.id);
    const required = slot.required ? '<span class="bw-asset-required">*</span>' : '';
    if (dataUrl) {
      return `
        <div class="bw-asset-card filled" data-slot="${slot.id}">
          <div class="bw-asset-thumb" style="background-image: url('${dataUrl}')"></div>
          <div class="bw-asset-info">
            <div class="bw-asset-label">${slot.label}${required}</div>
            <div class="bw-asset-actions">
              <button class="bw-btn-tiny" data-action="replace" data-slot="${slot.id}">🔄 Replace</button>
              <button class="bw-btn-tiny bw-btn-danger" data-action="remove" data-slot="${slot.id}">🗑️</button>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="bw-asset-card empty" data-slot="${slot.id}" data-action="upload">
          <div class="bw-asset-thumb empty">
            <span class="bw-asset-plus">+</span>
          </div>
          <div class="bw-asset-info">
            <div class="bw-asset-label">${slot.label}${required}</div>
            <div class="bw-asset-desc">${slot.desc}</div>
          </div>
        </div>
      `;
    }
  }).join('');

  el.querySelectorAll('[data-action="upload"], [data-action="replace"]').forEach(card => {
    const slot = card.dataset.slot || card.closest('[data-slot]')?.dataset?.slot;
    card.addEventListener('click', e => {
      e.stopPropagation();
      bwTriggerAssetUpload(slot);
    });
  });
  el.querySelectorAll('[data-action="remove"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Delete this image?')) {
        bcRemoveAsset(bwCurrentProject, btn.dataset.slot);
        bwRenderAssetsGrid();
        bwRenderCompileReadiness();
      }
    });
  });
}

function bwTriggerAssetUpload(slotId) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    bwToast('Processing image...');
    try {
      const processed = await bcProcessUploadedImage(file, bwCurrentProject.technical?.trimSize);
      const saved = bcSaveAsset(bwCurrentProject, slotId, processed);
      if (saved) {
        bwToast(`✓ Image saved (${processed.sizeKB} KB)`);
      }
      // If !saved, bcSaveAsset / bwSaveAll already showed the quota toast and rolled back
      bwRenderAssetsGrid();
      bwRenderCompileReadiness();
    } catch (err) {
      console.error(err);
      bwToast('Error processing image: ' + err.message);
    }
  };
  inp.click();
}

// ============ COMPILE READINESS ============
function bwRenderCompileReadiness() {
  const el = document.getElementById('bw-compile-readiness');
  if (!el || !bwCurrentProject) return;
  const p = bwCurrentProject;
  const checks = [];
  checks.push({ ok: !!p.positioning?.niche, msg: 'Stage 1 — Niche selected' });
  checks.push({ ok: !!bwGetAuthorString(p), msg: 'Stage 1 — Primary author (used in copyright)' });
  checks.push({ ok: !!p.style?.visualStyle && !!p.style?.palette, msg: 'Stage 2 — Style + Palette' });
  // At least 1 section with count > 0 needed
  const hasContent = (p.content?.sections || []).some(s => (s.count || 0) > 0);
  checks.push({ ok: hasContent, msg: 'Stage 3 — At least one section with count > 0' });
  checks.push({ ok: !!p.technical?.trimSize && !!p.technical?.interior, msg: 'Stage 4 — Trim size + Interior chosen' });
  // Margin sanity check
  if (p.technical?.pricing?.paperback && p.content?.pageCount && p.technical?.interior) {
    const pc = bwCalcPrintCost(p.technical.interior, p.content.pageCount, p.technical.trimSize);
    const royalty = (p.technical.pricing.paperback * 0.6) - pc;
    checks.push({ ok: royalty > 0.5, msg: `Stage 4 — Positive margin (current: $${royalty.toFixed(2)}/book)` });
  }
  checks.push({ ok: !!p.marketing?.title, msg: 'Stage 5 — Title' });
  const coverFront = !!bcGetAsset(p, 'cover-front');
  checks.push({ ok: coverFront, msg: 'Cover front image uploaded (Stage 6)' });
  const failed = checks.filter(c => !c.ok);
  if (failed.length === 0) {
    el.innerHTML = '<div class="bw-readiness-ok">✓ Ready to compile</div>';
  } else {
    el.innerHTML = `<div class="bw-readiness-warn">
      <b>Before compiling, complete:</b>
      <ul>${failed.map(f => `<li>❌ ${f.msg}</li>`).join('')}</ul>
    </div>`;
  }
}

// ============ COMPILE HANDLERS ============
async function bwHandleCompileInterior() {
  if (!bwCurrentProject) return;
  if (typeof bwCompileBook !== 'function') { bwToast('book-compile.js not loaded'); return; }
  const prog = document.getElementById('bw-compile-progress');
  prog.innerHTML = `<div class="bw-progress-bar"><div class="bw-progress-fill" id="bw-cprog-fill"></div></div><div class="bw-progress-text" id="bw-cprog-text">Starting...</div>`;
  try {
    const doc = await bwCompileBook(bwCurrentProject, {
      onProgress: (pct, msg) => {
        const fill = document.getElementById('bw-cprog-fill');
        const text = document.getElementById('bw-cprog-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = `${Math.round(pct)}% — ${msg}`;
      },
    });
    // Auto-sync pageCount with actual compiled PDF (KDP requires exact match in upload form)
    const actualPages = doc.internal.getNumberOfPages();
    if (bwCurrentProject.content?.pageCount !== actualPages) {
      if (!bwCurrentProject.content) bwCurrentProject.content = {};
      bwCurrentProject.content.pageCount = actualPages;
      bwUpsert(bwCurrentProject);
      bwToast(`Page count auto-updated to ${actualPages} (matches your compiled PDF)`);
    }
    const blobUrl = bcDocToBlobURL(doc);
    bwShowPreviewModal(blobUrl, 'interior', doc, bwCurrentProject);
    prog.innerHTML = '<div class="bw-readiness-ok">✓ Interior PDF compiled — review in preview</div>';
  } catch (err) {
    console.error(err);
    prog.innerHTML = `<div class="bw-readiness-warn">❌ Error: ${err.message}</div>`;
  }
}

async function bwHandleCompileCover() {
  if (!bwCurrentProject) return;
  if (typeof bwCompileCoverWrap !== 'function') { bwToast('book-compile.js not loaded'); return; }
  const prog = document.getElementById('bw-compile-progress');
  prog.innerHTML = '<div class="bw-progress-text">Compiling cover wrap...</div>';
  try {
    const doc = await bwCompileCoverWrap(bwCurrentProject);
    const blobUrl = bcDocToBlobURL(doc);
    const spine = bcCalcSpineWidth(bwCurrentProject);
    bwShowPreviewModal(blobUrl, 'cover', doc, bwCurrentProject, { spineWidthIn: spine.inches });
    prog.innerHTML = `<div class="bw-readiness-ok">✓ Cover wrap compiled (spine: ${spine.inches.toFixed(3)}")</div>`;
  } catch (err) {
    console.error(err);
    prog.innerHTML = `<div class="bw-readiness-warn">❌ Error: ${err.message}</div>`;
  }
}

// ============ PREVIEW MODAL ============
function bwShowPreviewModal(blobUrl, type, doc, project, meta = {}) {
  let modal = document.getElementById('bw-preview-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'bw-preview-modal';
  modal.className = 'bw-modal';
  const title = type === 'cover' ? 'Cover Wrap Preview' : 'Interior PDF Preview';
  const filename = type === 'cover'
    ? `${project.marketing?.title?.replace(/[^a-z0-9]/gi, '_') || 'book'}_cover.pdf`
    : `${project.marketing?.title?.replace(/[^a-z0-9]/gi, '_') || 'book'}_interior.pdf`;
  const metaInfo = type === 'cover' && meta.spineWidthIn
    ? `<span class="bw-modal-meta">Spine: ${meta.spineWidthIn.toFixed(3)}" · ${project.content?.pageCount || 0} pgs · ${project.technical?.paper || 'cream'} paper</span>`
    : `<span class="bw-modal-meta">${project.content?.sections?.length || 0} sections · trim ${project.technical?.trimSize || '6x9'}</span>`;
  modal.innerHTML = `
    <div class="bw-modal-backdrop" onclick="document.getElementById('bw-preview-modal').remove()"></div>
    <div class="bw-modal-content">
      <div class="bw-modal-header">
        <div>
          <h3 class="bw-modal-title">📄 ${title}</h3>
          ${metaInfo}
        </div>
        <button class="bw-modal-close" onclick="document.getElementById('bw-preview-modal').remove()">✕</button>
      </div>
      <div class="bw-modal-body">
        <iframe src="${blobUrl}" class="bw-modal-iframe"></iframe>
      </div>
      <div class="bw-modal-footer">
        <button class="bw-btn bw-btn-ghost" onclick="document.getElementById('bw-preview-modal').remove()">Close (back to editing)</button>
        <button class="bw-btn bw-btn-primary" id="bw-modal-download">⬇️ Download PDF</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('bw-modal-download').addEventListener('click', () => {
    bcDownloadDoc(doc, filename);
  });
}

// ====================== REFERENCES SIDEBAR ======================

function bwRenderRefSidebar() {
  const el = document.getElementById('bw-refs');
  if (!el || !bwCurrentProject) return;
  const refs = bwCurrentProject.references || [];
  el.innerHTML = `
    <h4>📎 Referencias</h4>
    <p class="bw-help-small">Upload screenshots of books/covers/interiors you like. Claude can analyze them.</p>
    <div class="bw-ref-dropzone" id="bw-ref-dropzone">
      Drop screenshots aquí<br>
      <small>o click para seleccionar</small>
    </div>
    <div class="bw-ref-tags-input">
      <label>Tags (what do you want to extract):</label>
      <div class="bw-pill-row" id="bw-ref-tags-pills">
        ${['colors','cover-style','layout','typography','title-strategy','description','reviews-negative','pricing','structure'].map(t => `<button class="bw-pill bw-pill-tag" data-tag="${t}">${t}</button>`).join('')}
      </div>
      <textarea id="bw-ref-notes" placeholder="Notes: 'use this', 'avoid this', 'colors like this but brighter', etc." rows="2"></textarea>
    </div>
    <div class="bw-ref-list">
      ${refs.length === 0 ? '<p class="bw-empty">No references yet</p>' : refs.map(r => `
        <div class="bw-ref-card">
          <div class="bw-ref-imgs">${r.images.slice(0,3).map(img => `<img src="${img}" />`).join('')}${r.images.length > 3 ? `<span>+${r.images.length - 3}</span>` : ''}</div>
          <div class="bw-ref-meta">
            <div class="bw-ref-tags">${r.tags.map(t => `<span class="bw-tag">${t}</span>`).join('')}</div>
            ${r.notes ? `<div class="bw-ref-notes">"${r.notes}"</div>` : ''}
            ${r.aiExtracted ? `<div class="bw-ref-extracted">✅ Analyzed by Claude</div>` : `<button class="bw-btn bw-btn-tiny" onclick="bwCopyClaudePrompt('${r.id}')">📋 Copy Claude prompt</button>`}
            <button class="bw-btn bw-btn-tiny bw-btn-ghost" onclick="bwRemoveRef('${r.id}')">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  // Wire dropzone
  const dz = document.getElementById('bw-ref-dropzone');
  dz.addEventListener('click', () => bwTriggerRefUpload());
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('dragover');
    bwHandleRefFiles(e.dataTransfer.files);
  });
  // Tag pills
  el.querySelectorAll('.bw-pill-tag').forEach(p => p.addEventListener('click', () => p.classList.toggle('selected')));
}

let bwPendingTags = [];
function bwTriggerRefUpload() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = e => bwHandleRefFiles(e.target.files);
  inp.click();
}

async function bwHandleRefFiles(files) {
  if (!files.length) return;
  const tags = Array.from(document.querySelectorAll('.bw-pill-tag.selected')).map(p => p.dataset.tag);
  const notes = document.getElementById('bw-ref-notes')?.value || '';
  const ref = await bwAddReference(bwCurrentProject, files, tags, notes);
  bwToast(`Reference saved with ${ref.images.length} image(s)`);
  bwRenderRefSidebar();
  // Auto copy Claude prompt
  bwCopyClaudePrompt(ref.id);
}

function bwCopyClaudePrompt(refId) {
  const ref = (bwCurrentProject.references || []).find(r => r.id === refId);
  if (!ref) return;
  const prompt = bwBuildClaudePrompt(bwCurrentProject, ref);
  navigator.clipboard.writeText(prompt).then(() => {
    bwToast('Prompt copied. Paste in chat with Claude + attach images');
  }).catch(() => bwToast('Failed to copy'));
}

function bwRemoveRef(refId) {
  if (!confirm('Delete reference?')) return;
  bwRemoveReference(bwCurrentProject, refId);
  bwRenderRefSidebar();
}

// ====================== COMPLIANCE SCORE ======================

function bwRenderCompliance() {
  const el = document.getElementById('bw-compliance');
  if (!el || !bwCurrentProject) return;
  const { score, issues } = bwScoreCompliance(bwCurrentProject);
  const color = score >= 90 ? 'good' : (score >= 70 ? 'warn' : 'bad');
  el.innerHTML = `
    <div class="bw-score ${color}">
      <div class="bw-score-num">${score}</div>
      <div class="bw-score-label">Compliance Score</div>
    </div>
    <div class="bw-issues">
      ${issues.length === 0 ? '<div class="bw-issue ok">✅ Todo en orden</div>' : issues.map(i => `
        <div class="bw-issue ${i.sev}">
          <span class="bw-issue-icon">${i.sev === 'error' ? '❌' : '⚠️'}</span>
          <span class="bw-issue-stage">Stage ${i.stage}</span>
          <span class="bw-issue-msg">${i.msg}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ====================== INIT ======================

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bw-app')) bwInit();
  if (typeof dd0Mount === 'function' && document.getElementById('dd0-root')) dd0Mount();
});
