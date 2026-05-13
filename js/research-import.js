// Research Import — Phase H Stage 0
// Parses 4 reference groups (A=Visual, B=Marketing, C=Reception, D=Interior),
// synthesizes a niche cluster, applies the cluster to a wizard project.
//
// Storage: book ideas live in localStorage 'bw_book_ideas' (managed by book-ideas.js).
// This module is pure logic — no DOM. UI lives in decision-dashboard.js + index.html Stage 0.

// ====================== CURATED STRATEGIC CATALOGS ======================
// Curated from KDP research up to 2026-Q2. Not a live API — these are
// expert-curated picks based on what's currently working in KDP US.

const RI_NICHE_CATALOG = [
  // 🔥 Hot 2026
  { id: 'variety-puzzle:for-teens', category: 'hot', label: 'Variety Puzzle — Teens (11-15)',
    why: 'Wimpy Kid format works. Anti-cringe humor + mascot wins. Series-friendly.',
    priceRange: '$9.99-$11.99 PB', competitors: 'Smart Kids (1006★), PIL Brain Games',
    seasonality: 'Evergreen, Dec + summer travel spike', difficulty: 'Medium',
    searchQueries: ['puzzle book teens 11-15', 'brain games teens', 'activity book ages 12 13 14'],
    audienceConstraint: 'ages 11-15 / teen / tween — REJECT if listing says ages 8-12, ages 6-9, or "children" only' },
  { id: 'planner:adhd', category: 'hot', label: 'Planner — ADHD Adult',
    why: 'Growing 3x YoY post-pandemic. Specialized layout = pricing power.',
    priceRange: '$14.99-$19.99 PB', competitors: 'Future ADHD Planner',
    seasonality: 'Q1 (resolutions) + back-to-school', difficulty: 'High',
    searchQueries: ['ADHD planner adults', 'ADHD daily planner undated', 'neurodivergent planner adults'],
    audienceConstraint: 'adults with ADHD — REJECT if for kids/teens, generic planner without ADHD-specific layout, or therapy workbook' },
  { id: 'journal-prompts:self-care-teens', category: 'hot', label: 'Journal — Self-Care Teen Girls',
    why: 'Pinterest aesthetic. Repeat purchase via series. Strong gift market.',
    priceRange: '$11.99-$14.99 (color)', competitors: 'Genius Girls, Doc Enigma',
    seasonality: 'Back-to-school, Christmas', difficulty: 'Medium',
    searchQueries: ['self care journal teen girls', 'teen girl journal prompts confidence', 'journal for teen girls 13-17'],
    audienceConstraint: 'teen girls 13-17 — REJECT if for adult women, kids under 12, or boys-targeted' },
  { id: 'coloring-book:cottagecore', category: 'hot', label: 'Coloring Book — Cottagecore (adults)',
    why: 'Trending Q2 2026 Pinterest aesthetic. Premium positioning.',
    priceRange: '$7.99-$9.99', competitors: 'Jade Summer, Coco Wyo',
    seasonality: 'Q2/Q3 spike', difficulty: 'High (original art)',
    searchQueries: ['cottagecore coloring book adults', 'cottage core coloring book', 'aesthetic coloring book cottage'],
    audienceConstraint: 'adults — REJECT if kids coloring or non-cottagecore aesthetic (mandalas, animals only, etc.)' },

  // 📈 Evergreen
  { id: 'word-search:large-print-seniors', category: 'evergreen', label: 'Word Search — Large Print Seniors',
    why: 'Loyal audience. Hardcover gift market real. Easy production.',
    priceRange: '$9.99 PB / $24.99 HC', competitors: 'PIL, Funster, Brain Games',
    seasonality: 'Evergreen, Christmas gifting', difficulty: 'Low (production) / High (differentiation)',
    searchQueries: ['large print word search seniors', 'word search large print elderly', 'word search big print adults'],
    audienceConstraint: 'seniors / elderly / large print — REJECT if standard print or for kids' },
  { id: 'sudoku:large-print', category: 'evergreen', label: 'Sudoku — Large Print',
    why: 'Loyal niche. Same audience as word-search senior.',
    priceRange: '$9.99 PB / $19.99 HC', competitors: 'Will Shortz, NYT Sudoku',
    seasonality: 'Evergreen', difficulty: 'Low',
    searchQueries: ['large print sudoku adults', 'sudoku large print easy', 'sudoku puzzles large print seniors'],
    audienceConstraint: 'adults / seniors with LARGE PRINT — REJECT if standard print, for kids, or pocket-size' },
  { id: 'journal-prompts:gratitude', category: 'evergreen', label: 'Gratitude Journal — 90-day',
    why: '90-day format = commitment-friendly. Five Minute Journal alternatives strong.',
    priceRange: '$9.99', competitors: 'Five Minute Journal alternatives',
    seasonality: 'New Year spike, evergreen', difficulty: 'Low',
    searchQueries: ['gratitude journal 90 day', 'daily gratitude journal adults', 'five minute journal alternative'],
    audienceConstraint: 'adults — REJECT if for kids/teens; this is adult gratitude practice (typically 30-90 day format)' },
  { id: 'coloring-book:adults-bold-easy', category: 'evergreen', label: 'Coloring Book — Bold Designs (anxiety/seniors)',
    why: 'Stress-relief positioning. Bigger lines = senior-friendly. $7.99 entry.',
    priceRange: '$7.99', competitors: 'Jade Summer (anxiety series)',
    seasonality: 'Evergreen', difficulty: 'Medium',
    searchQueries: ['bold easy coloring book adults', 'stress relief coloring book simple', 'coloring book thick lines easy'],
    audienceConstraint: 'adults beginners / seniors — REJECT if intricate detailed coloring or kids coloring' },
  { id: 'destructive-journal:teens', category: 'evergreen', label: 'Wreck/Destructive Journal — Teens',
    why: 'Wreck This Journal disrupted niche. Anti-mainstream tone. Loyal repeat buyers.',
    priceRange: '$9.99', competitors: 'Wreck This Journal (Keri Smith)',
    seasonality: 'Evergreen', difficulty: 'Medium (tone critical)',
    searchQueries: ['wreck this journal teen', 'destroy this book teen', 'creative chaos journal teen'],
    audienceConstraint: 'teens 13-17 — REJECT if for kids under 12 or marketed as adult mindfulness' },

  // 💡 Underserved
  { id: 'workbook-edu:bilingual-en-es', category: 'underserved', label: 'Educational Workbook — Bilingual EN/ES',
    why: 'Hispanic parent market underserved. Lower English-only competition.',
    priceRange: '$9.99', competitors: 'Modern Kid Press',
    seasonality: 'Back-to-school', difficulty: 'Medium',
    searchQueries: ['bilingual workbook spanish english kids', 'bilingual activity book children', 'spanish english workbook elementary'],
    audienceConstraint: 'kids learning EN/ES — REJECT if monolingual workbook or adult ESL/Spanish course' },
  { id: 'health-tracker:menopause', category: 'underserved', label: 'Health Tracker — Menopause',
    why: 'Demographic underserved. Specialized = pricing power. Word-of-mouth strong.',
    priceRange: '$12.99-$16.99', competitors: 'Few — small competitive set',
    seasonality: 'Evergreen', difficulty: 'Medium',
    searchQueries: ['menopause symptom tracker journal', 'menopause log book', 'perimenopause tracker'],
    audienceConstraint: 'women in menopause / perimenopause — REJECT if generic health tracker, pregnancy, or fertility log' },
  { id: 'activity-book:for-kids-8-12', category: 'underserved', label: 'Activity Book — Kids 8-12 (travel)',
    why: 'Travel + screen-detox angle. Color justifies $14.99. Parents buy.',
    priceRange: '$9.99-$14.99', competitors: 'Highlights, Klutz',
    seasonality: 'Summer + Christmas spike', difficulty: 'Medium',
    searchQueries: ['activity book kids 8-12 travel', 'travel activity book kids', 'screen free activity book kids'],
    audienceConstraint: 'kids ages 8-12 — REJECT if for toddlers (under 6), teens, or adults' },
];

const RI_DIFFERENTIATOR_PATTERNS = [
  { id: 'large-print-indexed', label: 'Large print + indexed solutions',
    why: 'Kills the #1 puzzle book complaint. Instant credibility for senior + 50+ market.',
    niches: ['variety-puzzle','word-search','sudoku','kakuro','cryptogram'] },
  { id: 'mascot-narrative', label: 'Mascot + narrative wrapper',
    why: 'Wimpy Kid path. Turns generic puzzles into a "world" → repeat purchase.',
    niches: ['variety-puzzle','activity-book'] },
  { id: 'mission-quest', label: 'Mission/Quest gamification',
    why: 'Splits content by difficulty arc — engagement for kids/teens. Boss level = climax.',
    niches: ['variety-puzzle','activity-book','workbook-edu'] },
  { id: 'anti-cringe-humor', label: 'Anti-cringe humor for teens',
    why: 'Beats sterile competition. Self-aware tone = teen approval (Wimpy Kid wins).',
    niches: ['variety-puzzle','destructive-journal','journal-prompts'] },
  { id: 'bilingual-en-es', label: 'Bilingual EN/ES',
    why: 'Underserved Hispanic market. Less competition. Word-search/sudoku translate easily.',
    niches: ['variety-puzzle','word-search','workbook-edu','activity-book'] },
  { id: 'qr-leadmagnet', label: 'Back-page QR → email lead magnet',
    why: 'Builds email list from each book. Long-term defense vs Amazon.',
    niches: 'all' },
  { id: 'hardcover-edition', label: 'Hardcover edition (gift positioning)',
    why: '+30% margin. Hardcover gifts have higher avg order value.',
    niches: ['variety-puzzle','word-search','coloring-book','journal-prompts','planner'] },
  { id: 'series-volumes', label: 'Branded series with volume numbers',
    why: 'Repeat sales. KDP "Part of series" widget. Vol 1-5 = compounding revenue.',
    niches: 'all' },
  { id: 'pinterest-aesthetic', label: 'Pinterest aesthetic (girls 13-17)',
    why: 'Pinterest = free traffic source. Strong visual identity = brand recall.',
    niches: ['journal-prompts','planner'] },
  { id: 'wellness-wrapper', label: 'Stress-relief / mindfulness framing',
    why: 'Reframes content as wellness. Higher perceived value, premium pricing.',
    niches: ['coloring-book','journal-prompts'] },
  { id: 'expert-endorsed', label: 'Expert-endorsed (psychologist/teacher)',
    why: 'Authority signal. Justifies premium price for journals/planners.',
    niches: ['journal-prompts','planner','workbook-edu','health-tracker'] },
  { id: 'large-trim', label: 'Larger trim (8.5×11) for readability',
    why: 'Beats 6×9 competitors on readability for seniors. Easier to find solutions.',
    niches: ['word-search','sudoku','planner'] },
  { id: 'puzzle-difficulty-key', label: 'Visual difficulty key on every puzzle',
    why: 'Reduces frustration. ⭐⭐⭐ markers help readers self-pace.',
    niches: ['variety-puzzle','sudoku','kakuro','cryptogram'] },
  { id: 'mood-tracker-builtin', label: 'Mood / progress tracker built into journal',
    why: 'Adds tangible "completion" feel. Higher 5⭐ rate.',
    niches: ['journal-prompts','planner','health-tracker'] },
  { id: 'progressive-difficulty', label: 'Progressive difficulty arc (easy → boss)',
    why: 'Hooks reader for full book. ⭐ markers help readers self-pace + feel growth.',
    niches: ['variety-puzzle','sudoku','kakuro','workbook-edu','activity-book'] },
  { id: 'themed-content', label: 'Themed content (animals / sports / pop)',
    why: 'Beats generic books. Cooking / animals / Christmas themes get instant niche fit.',
    niches: ['word-search','variety-puzzle','coloring-book','activity-book','cryptogram'] },
  { id: 'pop-culture-tie-in', label: 'Pop-culture tie-in (gaming / streaming)',
    why: 'Trending references = teen approval. Refresh annually for new releases.',
    niches: ['variety-puzzle','destructive-journal','journal-prompts'] },
  { id: 'companion-qr', label: 'QR → digital companion (audio / video / app)',
    why: 'Bridges print + digital. Kids/teens love unlock-style content.',
    niches: ['variety-puzzle','activity-book','workbook-edu','journal-prompts'] },
  { id: 'dyslexia-friendly', label: 'Dyslexia-friendly font (OpenDyslexic)',
    why: 'Kills barrier for ~10% of readers. Loyal niche audience + parent-recommended.',
    niches: ['workbook-edu','activity-book','journal-prompts','variety-puzzle'] },
  { id: 'seasonal-edition', label: 'Seasonal edition (Christmas / Halloween / Summer)',
    why: 'Predictable demand spikes. Same content, swap theme = new SKU.',
    niches: 'all' },
  { id: '90day-program', label: '90-day structured program',
    why: 'Habit formation timeline. Buyers commit because deadline feels achievable.',
    niches: ['journal-prompts','planner','health-tracker','workbook-edu'] },
  { id: 'mini-rewards-stickers', label: 'Mini-rewards / stickers / badges page',
    why: 'Tangible progress for kids. Parents love it. Increases completion rate.',
    niches: ['activity-book','workbook-edu','planner'] },
  { id: 'dual-color-print', label: 'Dual-color interior (B&W + accent)',
    why: 'Looks premium without color print cost. Kid books look "alive" at $9.99 margin.',
    niches: ['variety-puzzle','activity-book','workbook-edu'] },
  { id: 'accessibility-high-contrast', label: 'High-contrast / accessibility-first design',
    why: 'WCAG-style contrast = senior + low-vision usable. Kindle Vella indexes well.',
    niches: ['word-search','sudoku','journal-prompts','health-tracker'] },
  { id: 'series-recurring-character', label: 'Recurring character across series volumes',
    why: 'Story continuity drives Vol 2-N sales. Kids return for the character.',
    niches: ['variety-puzzle','activity-book','workbook-edu'] },
  { id: 'evidence-based-research', label: 'Evidence-based / cites research',
    why: 'Authority for premium pricing. Doctors / teachers recommend it.',
    niches: ['journal-prompts','planner','health-tracker','workbook-edu'] },
  { id: 'daily-quote-page', label: 'Daily quote / micro-content on each spread',
    why: 'Tangible "give" beyond the prompt. Pinterest-shareable photo content.',
    niches: ['journal-prompts','planner'] },
  { id: 'cross-section-theme', label: 'One unified theme across ALL puzzle types',
    why: 'E.g. all word-searches + sudoku + mazes share "haunted house" theme. Memorable.',
    niches: ['variety-puzzle','activity-book'] },
  { id: 'mom-daughter-edition', label: 'Mom-daughter (or duo) edition',
    why: 'Two-perspective format. Stronger gifting + repeat purchase via shared activity.',
    niches: ['journal-prompts','activity-book'] },
];

const RI_IMPRINT_PATTERNS = [
  { label: 'Brainy Books Press',  fits: 'puzzle / educational / activity' },
  { label: 'Cozy Quill Press',     fits: 'journal / wellness / mindfulness' },
  { label: 'WildPath Studio',      fits: 'coloring / cottagecore / aesthetic' },
  { label: 'Mission Mindful',      fits: 'planner / ADHD / health-tracker' },
  { label: 'Hearthstone Editions', fits: 'evergreen / senior / large-print' },
  { label: 'Lemon & Linden Co.',   fits: 'kids / activity / education' },
];

const RI_PEN_NAME_TIPS = [
  'Memorable + searchable: avoid generic "John Smith" (impossible to find on Amazon)',
  'First name + middle initial + last name reads more authoritative ("Lily R Columbus")',
  'Reusable across volumes and niches — pick something brand-able for 5+ books',
  'Match the niche tone: senior-friendly = warm/classic; teen = energetic single name OK',
];

// ====================== STOP WORDS (for keyword extraction) ======================
const RI_STOPWORDS = new Set([
  'the','a','an','and','or','but','of','for','with','to','in','on','at','by','from','as','is','are','was','were',
  'be','been','being','this','that','these','those','it','its','your','you','my','our','we','they','them',
  'i','he','she','his','her','him','will','would','could','should','can','may','might','do','does','did',
  'have','has','had','not','no','yes','if','then','than','so','too','very','just','only','also','more','most',
  'less','few','many','some','any','each','every','all','one','two','three','book','books','volume','vol',
  'over','under','about','into','out','up','down','off','through','before','after','again'
]);

// ====================== UTILITIES ======================

function riStripHtml(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function riNormalizeNumber(s) {
  if (s == null) return null;
  if (typeof s === 'number') return isFinite(s) ? s : null;
  const m = String(s).replace(/[$,\s]/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// Normalize a trim size string to KDP convention (e.g. "6 x 9 inches", "6×9", "6x9" → "6x9").
// Returns one of the canonical KDP trims, or '' if unrecognized.
function riNormalizeTrim(s) {
  if (!s) return '';
  const norm = String(s).toLowerCase().replace(/\s+|×|"|in\b|inches?/gi, '').replace(/x/g, 'x');
  const m = norm.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/);
  if (!m) return '';
  const w = parseFloat(m[1]), h = parseFloat(m[2]);
  // Match to closest canonical KDP trim
  const canonical = [
    [5, 8, '5x8'], [5.25, 8, '5.25x8'], [5.5, 8.5, '5.5x8.5'],
    [6, 9, '6x9'], [6.14, 9.21, '6.14x9.21'], [6.69, 9.61, '6.69x9.61'],
    [7, 10, '7x10'], [7.44, 9.69, '7.44x9.69'], [7.5, 9.25, '7.5x9.25'],
    [8, 10, '8x10'], [8.25, 11, '8.25x11'], [8.5, 11, '8.5x11'],
  ];
  let best = '', bestDist = Infinity;
  canonical.forEach(([cw, ch, id]) => {
    const dist = Math.abs(cw - w) + Math.abs(ch - h);
    if (dist < bestDist) { bestDist = dist; best = id; }
  });
  return bestDist <= 0.3 ? best : '';
}

function riMedian(nums) {
  const arr = nums.filter(n => typeof n === 'number' && isFinite(n)).slice().sort((a, b) => a - b);
  if (!arr.length) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function riCountTokens(text) {
  if (!text) return {};
  const tokens = String(text).toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  const counts = {};
  tokens.forEach(t => {
    if (RI_STOPWORDS.has(t)) return;
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
}

function riMergeCounts(a, b) {
  const out = { ...a };
  Object.keys(b).forEach(k => { out[k] = (out[k] || 0) + b[k]; });
  return out;
}

function riTopKeys(counts, n, minCount = 1) {
  return Object.entries(counts)
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

// ====================== PARSERS — accept structured JSON OR loose text ======================

// All parsers return { books: [...], warnings: [...] }. They tolerate:
//   - JSON array of objects with the expected keys
//   - "block per book" plain text where each numbered line "1. Field: value" maps to a key
function riTryJson(text) {
  if (!text || !text.trim()) return null;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : null);
  } catch (e) { return null; }
}

// Splits a free-text dump into book blocks. Books are separated by blank lines OR "Book N" / "1." starting a new block.
function riSplitTextBlocks(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let cur = [];
  let inHeaderLine = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Matches book separators including: "Book 1:", "BOOK 1 — PRIMARY", "📗 BOOK 1 — anything",
    // "Libro 1", "#1", "---", "===". Allows optional emoji prefix + trailing text after the marker.
    const isBookSep = /^\s*(?:[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]\s*)?(?:book\s*\d+|libro\s*\d+|#\s*\d+|---+|===+)/iu.test(line);
    const isBlank = !line.trim();
    if (isBookSep) {
      if (cur.length) blocks.push(cur.join('\n'));
      cur = [];
      continue;
    }
    if (isBlank) {
      // 2+ consecutive blanks = block separator
      if (cur.length && i + 1 < lines.length && !lines[i + 1].trim()) {
        blocks.push(cur.join('\n'));
        cur = [];
        continue;
      }
      cur.push(line);
      continue;
    }
    cur.push(line);
  }
  if (cur.length) blocks.push(cur.join('\n'));
  return blocks.filter(b => b.trim().length > 10);
}

// Looks for "Label: value" (case-insensitive) in a text block. Returns first match.
function riExtractField(block, labels) {
  for (const label of labels) {
    const re = new RegExp('(?:^|\\n)\\s*(?:\\d+[.\\)]\\s*)?' + label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '\\s*[:\\-]\\s*(.+?)(?=\\n\\s*(?:\\d+[.\\)]|[A-Z][a-zA-Z ]{2,30}\\s*:)|$)', 'is');
    const m = block.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

// Group A — Visual references
function bwParseVisualGroup(text) {
  const warnings = [];
  let books = riTryJson(text);
  if (!books) {
    books = riSplitTextBlocks(text).map(block => ({
      amazonUrl:       riExtractField(block, ['Amazon URL', 'URL', 'Amazon', 'product url']),
      coverImageUrl:   riExtractField(block, ['Cover image URL', 'Cover URL', 'Image URL', 'Cover image']),
      dominantColor:   riExtractField(block, ['Color dominante', 'Dominant color', 'Main color']),
      accentColors:    riExtractField(block, ['2 accent colors', 'Accent colors', '2 colores secundarios', 'Secondary colors', 'Colores secundarios']),
      typography:      riExtractField(block, ['Title typography', 'Typography', 'Tipografía', 'Font']),
      elements:        riExtractField(block, ['Visible cover elements', 'Cover elements', 'Elements', 'Elementos']),
      whyItStandsOut:  riExtractField(block, ['Why it stands out', 'Why this stands out', 'ONE LINE', 'Una línea', 'Por qué', 'Why', 'Reason'])
    })).filter(b => b.coverImageUrl || b.amazonUrl || b.dominantColor);
  }
  // Normalize
  books = (books || []).map(b => ({
    amazonUrl: b.amazonUrl || b.url || '',
    coverImageUrl: b.coverImageUrl || b.coverUrl || b.image || '',
    dominantColor: (b.dominantColor || '').toLowerCase().trim(),
    accentColors: typeof b.accentColors === 'string'
      ? b.accentColors.split(/[,/]| and /i).map(s => s.trim().toLowerCase()).filter(Boolean)
      : (Array.isArray(b.accentColors) ? b.accentColors.map(s => String(s).toLowerCase().trim()) : []),
    typography: (b.typography || '').toLowerCase().trim(),
    elements: typeof b.elements === 'string'
      ? b.elements.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : (Array.isArray(b.elements) ? b.elements : []),
    whyItStandsOut: b.whyItStandsOut || b.why || ''
  }));
  if (books.length < 2) warnings.push(`Group A has only ${books.length} book(s) — need 3 for cluster`);
  return { books, warnings };
}

// Group B — Marketing references
function bwParseMarketingGroup(text) {
  const warnings = [];
  let books = riTryJson(text);
  if (!books) {
    books = riSplitTextBlocks(text).map(block => ({
      amazonUrl:   riExtractField(block, ['Amazon URL', 'URL', 'Amazon']),
      title:       riExtractField(block, ['Title', 'Título']),
      subtitle:    riExtractField(block, ['Subtitle', 'Subtítulo']),
      description: riExtractField(block, ['Full description', 'Description', 'Descripción']),
      hookSentence: riExtractField(block, ['ONE hook sentence', 'Hook sentence', 'The ONE hook sentence']),
      whyItSells:  riExtractField(block, ['Why it sells', 'ONE LINE', 'Una línea', 'Por qué', 'Why', 'Reason'])
    })).filter(b => b.title || b.description);
  }
  books = (books || []).map(b => ({
    amazonUrl: b.amazonUrl || b.url || '',
    title: riStripHtml(b.title || ''),
    subtitle: riStripHtml(b.subtitle || ''),
    description: riStripHtml(b.description || b.desc || ''),
    whyItSells: b.whyItSells || b.why || ''
  }));
  if (books.length < 2) warnings.push(`Group B has only ${books.length} book(s) — need 3 for cluster`);
  return { books, warnings };
}

// Group C — Reception references
function bwParseReceptionGroup(text) {
  const warnings = [];
  let books = riTryJson(text);
  if (!books) {
    books = riSplitTextBlocks(text).map(block => {
      const cats = riExtractField(block, ['Categories breadcrumb', 'Categorías', 'Categories', 'Breadcrumb']);
      const r5 = riExtractField(block, [
        'Top 3 praise themes', 'Praise themes',
        'Top 3 five-star reviews', 'Top 5 five-star reviews',
        'Top 3 reviews 5', 'Top 5 reviews 5',
        'five-star reviews', '5⭐', '5-star reviews', 'Reviews 5'
      ]);
      const rL = riExtractField(block, [
        'Top 3 pain themes', 'Pain themes',
        'Top 3 one-to-three-star reviews', 'Top 5 one-to-three-star reviews',
        'Top 3 reviews 1-3', 'Top 5 reviews 1-3',
        'one-to-three-star reviews', '1-3⭐', 'Low-star reviews', 'Reviews 1-3'
      ]);
      return {
        amazonUrl: riExtractField(block, ['Amazon URL', 'URL']),
        pageCount: riNormalizeNumber(riExtractField(block, ['Page count', 'Pages', 'Páginas'])),
        priceUSD_paperback: riNormalizeNumber(riExtractField(block, ['Paperback price', 'Precio paperback', 'Paperback'])),
        priceUSD_hardcover: riNormalizeNumber(riExtractField(block, ['Hardcover price', 'Precio hardcover', 'Hardcover'])),
        starRating: riExtractField(block, ['Star rating', 'Rating']),
        categories: cats ? cats.split(/[>›→\n,;]/).map(s => s.trim()).filter(Boolean) : [],
        reviews_5star: r5 ? r5.split(/\n\s*\n|(?:^|\n)\s*\d+[.\)]\s+/g).map(s => s.trim()).filter(s => s.length > 20) : [],
        reviews_lowstar: rL ? rL.split(/\n\s*\n|(?:^|\n)\s*\d+[.\)]\s+/g).map(s => s.trim()).filter(s => s.length > 20) : [],
        whyLoved: riExtractField(block, [
          'Why people love it beyond the cover/copy',
          'Why people love it beyond',
          'Why people love it',
          'What makes people love this book beyond',
          'What makes people love',
          'Why people love',
          'ONE LINE', 'Una línea', 'Por qué', 'Why', 'Reason'
        ])
      };
    }).filter(b => b.pageCount || b.priceUSD_paperback || (b.reviews_5star || []).length);
  }
  books = (books || []).map(b => ({
    amazonUrl: b.amazonUrl || b.url || '',
    pageCount: riNormalizeNumber(b.pageCount),
    priceUSD_paperback: riNormalizeNumber(b.priceUSD_paperback),
    priceUSD_hardcover: riNormalizeNumber(b.priceUSD_hardcover),
    starRating: b.starRating || '',
    categories: Array.isArray(b.categories) ? b.categories.map(s => String(s).trim()).filter(Boolean) : [],
    reviews_5star: Array.isArray(b.reviews_5star) ? b.reviews_5star : (Array.isArray(b.reviews_5star_top5) ? b.reviews_5star_top5 : []),
    reviews_lowstar: Array.isArray(b.reviews_lowstar) ? b.reviews_lowstar : (Array.isArray(b.reviews_lowstar_top5) ? b.reviews_lowstar_top5 : []),
    whyLoved: b.whyLoved || b.why || ''
  }));
  if (books.length < 2) warnings.push(`Group C has only ${books.length} book(s) — need 3 for cluster`);
  return { books, warnings };
}

// Group D — Interior / execution references
function bwParseInteriorGroup(text) {
  const warnings = [];
  let books = riTryJson(text);
  if (!books) {
    books = riSplitTextBlocks(text).map(block => ({
      amazonUrl:        riExtractField(block, ['Amazon URL', 'URL']),
      trimSize:         riExtractField(block, ['Trim size', 'Trim', 'Tamaño', 'Dimensions']),
      sampleImages:     riExtractField(block, ['Look Inside SCREENSHOTS', 'Look Inside', 'Screenshots', 'Sample images', 'Images']),
      fontSize:         riExtractField(block, ['Content font size', 'Font size', 'Tamaño de letra', 'Font']),
      itemsPerPage:     riExtractField(block, ['Layout', 'Items per page', 'how many items per page', 'Per page']),
      hasHowToUse:      riExtractField(block, ['Has "How to play / use" page', 'Has How to use page', 'How to play', 'How to use', '"How to use" page']),
      hasAuthorBio:     riExtractField(block, ['Has author bio page', 'Author bio', 'Bio page']),
      hasCrossPromo:    riExtractField(block, ['Promotes other volumes', 'Otros volúmenes', 'Cross-promo', 'Series promo']),
      solutionsLayout:  riExtractField(block, ['Solutions organized', 'Soluciones', 'Solutions', 'Answer key']),
      whatItDoesWell:   riExtractField(block, ['What does this interior do well', 'ONE LINE', 'Una línea', 'Por qué', 'Why', 'Reason'])
    })).filter(b => b.fontSize || b.itemsPerPage || b.amazonUrl);
  }
  const yes = (s) => /^\s*(y|yes|sí|si|true|1|si\b)/i.test(String(s || ''));
  books = (books || []).map(b => ({
    amazonUrl: b.amazonUrl || b.url || '',
    trimSize: riNormalizeTrim(b.trimSize || b.trim || ''),
    sampleImages: Array.isArray(b.sampleImages) ? b.sampleImages : (typeof b.sampleImages === 'string' ? b.sampleImages.split(/[\n,;]/).map(s => s.trim()).filter(Boolean) : []),
    fontSize: (b.fontSize || '').toLowerCase().trim(),
    itemsPerPage: (b.itemsPerPage || '').toLowerCase().trim(),
    hasHowToUse: typeof b.hasHowToUse === 'boolean' ? b.hasHowToUse : yes(b.hasHowToUse),
    hasAuthorBio: typeof b.hasAuthorBio === 'boolean' ? b.hasAuthorBio : yes(b.hasAuthorBio),
    hasCrossPromo: typeof b.hasCrossPromo === 'boolean' ? b.hasCrossPromo : yes(b.hasCrossPromo),
    solutionsLayout: (b.solutionsLayout || '').toLowerCase().trim(),
    whatItDoesWell: b.whatItDoesWell || b.why || ''
  }));
  if (books.length < 1) warnings.push('Group D has 0 books — need 2 for interior cluster');
  return { books, warnings };
}

// ====================== SYNTHESIZERS — one per axis ======================

function bwSynthesizeVisual(groupA) {
  const books = (groupA && groupA.books) || [];
  // Dominant color = mode across books
  const colorCounts = {};
  const accentCounts = {};
  const typoCounts = {};
  const elementCounts = {};
  books.forEach(b => {
    if (b.dominantColor) colorCounts[b.dominantColor] = (colorCounts[b.dominantColor] || 0) + 1;
    (b.accentColors || []).forEach(c => { if (c) accentCounts[c] = (accentCounts[c] || 0) + 1; });
    if (b.typography) typoCounts[b.typography] = (typoCounts[b.typography] || 0) + 1;
    (b.elements || []).forEach(e => {
      if (!e) return;
      const norm = String(e).toLowerCase().trim();
      elementCounts[norm] = (elementCounts[norm] || 0) + 1;
    });
  });
  const dominantColor = riTopKeys(colorCounts, 1)[0] || '';
  const accentColors = riTopKeys(accentCounts, 2);
  const typography = riTopKeys(typoCounts, 1)[0] || '';
  const commonElements = Object.entries(elementCounts)
    .filter(([, c]) => c >= Math.ceil(books.length / 2))
    .map(([k, c]) => ({ name: k, presence: c, ofTotal: books.length }));

  // OpenArt-ready prompt scaffolding
  const elementsTxt = commonElements.length
    ? commonElements.map(e => e.name).join(', ')
    : 'clean grid of sample puzzles';
  const openArtPrompt = [
    `Book cover, ${typography || 'bold sans-serif'} title, ${dominantColor || 'teal'} dominant`,
    accentColors.length ? `accent colors ${accentColors.join(' and ')}` : '',
    `featuring ${elementsTxt}`,
    'high contrast, KDP paperback cover, vertical 6x9 ratio, no text artifacts'
  ].filter(Boolean).join(', ');

  return {
    booksCount: books.length,
    dominantColor,
    accentColors,
    typography,
    commonElements,
    coverImageUrls: books.map(b => b.coverImageUrl).filter(Boolean),
    openArtPrompt,
    rawWhys: books.map(b => b.whyItStandsOut).filter(Boolean)
  };
}

function bwSynthesizeMarketing(groupB) {
  const books = (groupB && groupB.books) || [];
  // Title regex pattern: extract structure ("[Hook] for [Audience] Ages [X-Y]: [N]+ Items")
  const titleAnalysis = books.map(b => {
    const t = b.title || '';
    return {
      title: t,
      hasNumber: /\b\d{2,4}\+?\b/.test(t),
      hasAudience: /(teen|tween|kid|adult|senior|girl|boy|women|men|child|adhd)/i.test(t),
      hasAges: /\bages?\s*\d/i.test(t),
      hasVolume: /\bvol(?:ume|\.)?\s*\d/i.test(t),
      hasColon: t.includes(':'),
    };
  });

  // Keyword cluster from titles + subtitles + descriptions.
  // CRITICAL fix (2026-05-09): count UNIQUE BOOKS that mention each word, not total
  // occurrences. Previous logic let a single book leak its themes if it repeated a
  // word (e.g. one Road Trip book using "travel/road/trip" 4× each polluted the
  // cluster). Real cluster signal = the word appears across MULTIPLE books.
  const bookCounts = {};   // word → number of unique books containing it
  const totalCounts = {};  // word → total occurrences (for ranking ties)
  books.forEach(b => {
    const seenInBook = new Set();
    const tokens = riMergeCounts(
      riMergeCounts(riCountTokens(b.title || ''), riCountTokens(b.subtitle || '')),
      riCountTokens(b.description || '')
    );
    Object.entries(tokens).forEach(([word, count]) => {
      if (!seenInBook.has(word)) {
        bookCounts[word] = (bookCounts[word] || 0) + 1;
        seenInBook.add(word);
      }
      totalCounts[word] = (totalCounts[word] || 0) + count;
    });
  });
  // Require word to appear in 2+ unique books. With <2 books total, no cluster signal possible.
  const keywords = books.length >= 2
    ? Object.entries(bookCounts)
        .filter(([w, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1] || (totalCounts[b[0]] || 0) - (totalCounts[a[0]] || 0))
        .slice(0, 7)
        .map(([w]) => w)
    : [];

  // Hook line extraction — first sentence of each description that's not a bullet
  const descHooks = books.map(b => {
    const desc = (b.description || '').trim();
    if (!desc) return '';
    const firstSentence = desc.split(/[.!?]\s/)[0].trim();
    return firstSentence.length > 20 && firstSentence.length < 200 ? firstSentence : '';
  }).filter(Boolean);

  // Title proposals — 5 patterns derived from cluster
  const numbers = books.map(b => {
    const m = (b.title + ' ' + b.subtitle).match(/\b(\d{2,4})\+?\b/);
    return m ? parseInt(m[1]) : null;
  }).filter(Boolean);
  const medianNumber = riMedian(numbers);

  return {
    booksCount: books.length,
    titleAnalysis,
    titleSamples: books.map(b => b.title).filter(Boolean),
    subtitleSamples: books.map(b => b.subtitle).filter(Boolean),
    keywords,
    descHooks,
    medianNumber,
    rawWhys: books.map(b => b.whyItSells).filter(Boolean)
  };
}

function bwSynthesizeReception(groupC) {
  const books = (groupC && groupC.books) || [];
  const medianPages = riMedian(books.map(b => b.pageCount));
  const medianPriceP = riMedian(books.map(b => b.priceUSD_paperback));
  const medianPriceH = riMedian(books.map(b => b.priceUSD_hardcover));
  const hardcoverShare = books.filter(b => b.priceUSD_hardcover).length / Math.max(1, books.length);

  // Categories cluster — count exact strings (full breadcrumb segment)
  const catCounts = {};
  books.forEach(b => {
    (b.categories || []).forEach(c => {
      const norm = String(c).trim();
      if (!norm) return;
      catCounts[norm] = (catCounts[norm] || 0) + 1;
    });
  });
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  // Pain points clustering — count themes in low-star reviews
  const painLexicon = [
    { theme: 'Print too small', terms: ['small print', 'tiny', 'too small', 'hard to read', 'letra chica', 'small font'] },
    { theme: 'Solutions hard to find', terms: ['solutions', 'answers', 'answer key', 'no answers', "can't find solutions"] },
    { theme: 'Repetitive content', terms: ['repetitive', 'same', 'boring', 'monotonous'] },
    { theme: 'Errors / mistakes', terms: ['error', 'mistake', 'wrong answer', 'typo', 'unsolvable'] },
    { theme: 'Too expensive for content', terms: ['overpriced', 'too expensive', 'not worth', 'few pages'] },
    { theme: 'Bleed-through', terms: ['bleed', 'bleeds through', 'show through', 'thin paper'] },
    { theme: 'Difficulty mismatch', terms: ['too easy', 'too hard', 'not as advertised', 'wrong age'] },
    { theme: 'Binding / quality', terms: ['fell apart', 'binding', 'pages came out', 'cheap quality'] },
  ];
  const praiseLexicon = [
    { theme: 'Hours of entertainment', terms: ['hours', 'kept busy', 'kept entertained', 'long time', 'engaging'] },
    { theme: 'Travel / road trip friendly', terms: ['road trip', 'travel', 'plane', 'car ride', 'vacation'] },
    { theme: 'Variety keeps it interesting', terms: ['variety', 'different', 'mix of', 'all kinds', 'never bored'] },
    { theme: 'Great gift', terms: ['gift', 'present', 'birthday', 'christmas', 'stocking'] },
    { theme: 'Good for the price', terms: ['great value', 'worth', 'good price', 'affordable'] },
    { theme: 'Easy to read / good size', terms: ['easy to read', 'good size', 'large print', 'clear', 'readable'] },
    { theme: 'Educational / brain workout', terms: ['educational', 'learning', 'brain', 'mental', 'thinking'] },
    { theme: 'Good for specific age', terms: ['perfect for', 'just right', 'age appropriate', 'kept my'] },
  ];

  function clusterReviews(reviews, lexicon) {
    const corpus = (reviews || []).join(' ').toLowerCase();
    return lexicon.map(l => {
      const count = l.terms.reduce((acc, t) => acc + ((corpus.match(new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi')) || []).length), 0);
      return { theme: l.theme, count };
    }).filter(x => x.count > 0).sort((a, b) => b.count - a.count);
  }
  const allLow = books.flatMap(b => b.reviews_lowstar || []);
  const allHigh = books.flatMap(b => b.reviews_5star || []);
  const painPoints = clusterReviews(allLow, painLexicon);
  const praisePatterns = clusterReviews(allHigh, praiseLexicon);

  return {
    booksCount: books.length,
    medianPages,
    medianPriceP,
    medianPriceH,
    hardcoverShare,
    topCategories,
    painPoints,
    praisePatterns,
    rawWhys: books.map(b => b.whyLoved).filter(Boolean)
  };
}

function bwSynthesizeInterior(groupD) {
  const books = (groupD && groupD.books) || [];
  // Font size — large/medium/small consensus
  const sizeCounts = {};
  const itemsCounts = {};
  const trimCounts = {};
  let howTo = 0, bio = 0, promo = 0;
  let solGrouped = 0, solInOrder = 0;
  books.forEach(b => {
    if (b.trimSize) trimCounts[b.trimSize] = (trimCounts[b.trimSize] || 0) + 1;
    if (b.fontSize) {
      const norm = /large|grande|big/i.test(b.fontSize) ? 'large'
                : /medium|medio|standard/i.test(b.fontSize) ? 'medium'
                : /small|pequen/i.test(b.fontSize) ? 'small'
                : b.fontSize;
      sizeCounts[norm] = (sizeCounts[norm] || 0) + 1;
    }
    if (b.itemsPerPage) {
      const norm = /grid|cuadr/i.test(b.itemsPerPage) ? 'grid'
                : /\b2\b|two|dos/i.test(b.itemsPerPage) ? '2'
                : /\b1\b|one|uno/i.test(b.itemsPerPage) ? '1'
                : b.itemsPerPage;
      itemsCounts[norm] = (itemsCounts[norm] || 0) + 1;
    }
    if (b.hasHowToUse) howTo++;
    if (b.hasAuthorBio) bio++;
    if (b.hasCrossPromo) promo++;
    if (/group|agrupad|by.+type|por.+tipo/i.test(b.solutionsLayout)) solGrouped++;
    if (/order|page|orden|p[áa]gina/i.test(b.solutionsLayout)) solInOrder++;
  });
  const total = Math.max(1, books.length);
  return {
    booksCount: books.length,
    trimSize: riTopKeys(trimCounts, 1)[0] || '',
    fontSize: riTopKeys(sizeCounts, 1)[0] || '',
    itemsPerPage: riTopKeys(itemsCounts, 1)[0] || '',
    howToUseShare: howTo / total,
    authorBioShare: bio / total,
    crossPromoShare: promo / total,
    solutionsGroupedShare: solGrouped / total,
    solutionsInOrderShare: solInOrder / total,
    sampleImageUrls: books.flatMap(b => b.sampleImages || []),
    rawWhys: books.map(b => b.whatItDoesWell).filter(Boolean)
  };
}

// ====================== COMBINATOR — synthesizes all 4 + builds Decision Dashboard payload ======================

function bwSynthesizeAll({ groupA, groupB, groupC, groupD, niche, differentiator, differentiators, penName, imprint }) {
  // Accept either differentiator (string, legacy) or differentiators (array, new)
  const diffsArr = Array.isArray(differentiators) && differentiators.length
    ? differentiators.filter(Boolean)
    : (differentiator ? [differentiator] : []);
  const diffJoined = diffsArr.join(' + ');
  const diffPrimary = diffsArr[0] || '';

  const visual = bwSynthesizeVisual(groupA);
  const marketing = bwSynthesizeMarketing(groupB);
  const reception = bwSynthesizeReception(groupC);
  const interior = bwSynthesizeInterior(groupD);

  // Title proposals — 5 generated from marketing patterns + reception medians
  const audience = (niche && niche.includes(':for-')) ? niche.split(':for-')[1].replace(/-/g, ' ') : 'readers';
  const ageMatch = (niche || '').match(/(teens?|tweens?|kids?|adults?|seniors?)/i);
  const ageHint = ageMatch ? ` Ages ${audienceAgeRange(ageMatch[1])}` : '';
  const itemCount = marketing.medianNumber ? `${marketing.medianNumber}+` : '125+';
  const nicheLabel = nicheToLabel(niche);
  const brandKey = (niche || '').split(':')[0];

  // Title prefix: prefer a brand-name-like differentiator. Catalog differentiators
  // like "Mascot + narrative wrapper" or "Tone: teen-savage" describe *style*, not
  // brand — using them as a title prefix produces titles like "Mascot: 150+ Puzzles…".
  // When the differentiator is a generic catalog term, fall back to a niche-specific
  // brand name. Users can still override with a custom title.
  const GENERIC_DIFF_TERMS = /\b(mascot|narrative|wrapper|tone|format|theme|layout|illustration|illustrated|aesthetic|minimalist|vintage|modern|interleaved|progressive|difficulty|paper|hardcover|paperback|cover|interior|font|color|colour|black\s*and\s*white|bw)\b/i;
  const BRAND_FALLBACK = {
    'variety-puzzle': 'Brain Squad',
    'word-search': 'Word Quest',
    'sudoku': 'Number Ninja',
    'coloring-book': 'Color Garden',
    'journal-prompts': 'Soul Letters',
    'planner': 'Daily Compass',
    'workbook-edu': 'Smart Steps',
    'destructive-journal': 'Wreck Squad',
    'health-tracker': 'Body Log',
    'activity-book': 'Boredom Buster',
  };
  const brandFallback = BRAND_FALLBACK[brandKey] || `Mega ${nicheLabel}`;
  const diffCleaned = (diffPrimary || '').replace(/\.$/, '').replace(/\s*\+\s*.*$/, '').trim();
  const diffLooksGeneric = !diffCleaned || GENERIC_DIFF_TERMS.test(diffCleaned);
  const titlePrefix = diffLooksGeneric ? brandFallback : diffCleaned;
  const titleProposals = [
    `${titlePrefix}: ${itemCount} ${nicheLabel} for ${capitalize(audience)}${ageHint}`,
    `Mega ${nicheLabel} for ${capitalize(audience)}: ${itemCount} ${nicheLabel}${ageHint}`,
    `${nicheLabel} Quest for ${capitalize(audience)}${ageHint}: ${itemCount} ${nicheLabel}`,
    `The Ultimate ${capitalize(audience)} ${nicheLabel} Book: ${itemCount} ${nicheLabel}`,
    `Smart ${capitalize(audience)} ${nicheLabel} Lab: ${itemCount} Activities${ageHint}`
  ];

  // Subtitle: niche-specific hook (lists actual content types + value-prop angle)
  // beats the generic "150+ X designed for Y" fallback. Praise patterns appended
  // only when reception has 2+ books (real signal, not single-book leak).
  const praiseTop = (reception.praisePatterns || []).slice(0, 2).map(p => p.theme.toLowerCase()).join(' & ');
  const SUBTITLE_HOOK_BY_NICHE = {
    'variety-puzzle': `${itemCount} word searches, sudoku, mazes, math & cryptograms — screen-free fun for ${audience}${ageHint.toLowerCase()}`,
    'word-search':    `${itemCount} big-print themed puzzles for ${audience}${ageHint.toLowerCase()} — solutions in the back`,
    'sudoku':         `${itemCount} puzzles from easy to expert — progressive challenge for ${audience}${ageHint.toLowerCase()}`,
    'coloring-book':  `${itemCount} hand-illustrated pages — single-sided, no bleed-through`,
    'journal-prompts': `${itemCount} undated prompts — judgment-free, designed to make you actually think`,
    'planner':        `${itemCount} undated weeks with focus blocks and habit tracker — built for ${audience}`,
    'workbook-edu':   `${itemCount} exercises, concept-by-concept — no fluff, answers included`,
    'destructive-journal': `${itemCount} prompts that invite you to rip, scribble, and destroy`,
    'health-tracker': `${itemCount} daily logs — patterns, notes, no app required`,
    'activity-book':  `${itemCount} mixed activities — hours of screen-free fun for ${audience}${ageHint.toLowerCase()}`,
  };
  const subtitleHook = SUBTITLE_HOOK_BY_NICHE[brandKey];
  const defaultSubtitle = subtitleHook
    ? (reception.booksCount >= 2 && praiseTop ? `${subtitleHook}. ${capitalize(praiseTop)}.` : subtitleHook)
    : `${itemCount} ${nicheLabel.toLowerCase()} designed for ${audience}${ageHint.toLowerCase()}${praiseTop ? ' — ' + praiseTop : ''}`;

  // Description — built from niche + differentiators + audience, with praise/pain
  // pulled in only if multi-book consensus exists. Avoids leaking specific hook
  // sentences from a single book in Group B (e.g. one travel book leaking
  // "are we there yet?" into a generic teen puzzle book description).
  const painList = (reception.painPoints || []).slice(0, 3).map(p => p.theme);
  const praiseList = (reception.praisePatterns || []).slice(0, 3).map(p => p.theme);

  // Niche-aware hook templates (no specific themes, just niche tone)
  const nicheHookTemplates = {
    'variety-puzzle': `Tired of puzzle books that talk down to ${audience} like they're 8? Same.`,
    'word-search':    `Looking for word search puzzles you can actually read without squinting?`,
    'sudoku':         `Sudoku puzzles designed to challenge your brain, not your eyes.`,
    'coloring-book':  `Slow down, breathe, and color something beautiful.`,
    'journal-prompts': `What if your journal could actually help you figure things out?`,
    'planner':        `A planner built for how you actually work, not how a productivity guru thinks you should.`,
    'workbook-edu':   `Learning that doesn't feel like homework.`,
    'destructive-journal': `Rules are boring. Rip, scribble, destroy — make this book yours.`,
    'health-tracker': `Track what matters. Notice the patterns. Take control.`,
    'activity-book':  `Fun for ${audience} — no screens required.`,
  };
  const nicheBase = nicheLabel.toLowerCase().split(/[\s—–-]/)[0] || nicheLabel.toLowerCase();
  const nicheKey = Object.keys(nicheHookTemplates).find(k => (niche || '').startsWith(k));
  const hookLine = nicheKey ? nicheHookTemplates[nicheKey]
    : `${itemCount} ${nicheLabel.toLowerCase()} designed for ${audience} who want more than the basics.`;

  // Whats-inside bullets: prefer praise themes (validated by reviews), fallback to differentiator-derived
  const insideBullets = praiseList.length
    ? praiseList.slice(0, 4).map(p => `• ${p.charAt(0).toUpperCase() + p.slice(1)}`)
    : [
        `• ${itemCount} ${nicheLabel.toLowerCase()} for ${audience}`,
        `• Mixed difficulty — interleaved, not 30 of the same type in a row`,
        `• Solutions in the back`,
      ];

  // Differentiator block — woven into the closing
  const diffBlock = diffJoined
    ? `\nWhat makes this different: ${diffJoined}.`
    : '';

  // Pain-point reassurance only if there are 2+ pain themes across reviews (real signal)
  const painBlock = painList.length >= 2
    ? `\nWe fixed what readers complained about most: ${painList.slice(0, 2).join(', ').toLowerCase()}.`
    : '';

  // Closing CTA — niche-flexible
  const ctaBlock = /teen|tween|kid|child/.test(audience)
    ? `\nGreat for screen-free time, road trips, summer boredom, or as a gift that doesn't scream "I gave up."`
    : `\nA practical, no-fluff ${nicheLabel.toLowerCase()} you'll actually use.`;

  const description = [
    hookLine,
    '',
    `What's inside:`,
    ...insideBullets,
    diffBlock,
    painBlock,
    ctaBlock
  ].filter(s => s !== '').join('\n').replace(/\n{3,}/g, '\n\n');

  // Pricing recommendations
  const recommendedPriceP = reception.medianPriceP || 9.99;
  const recommendedPriceH = reception.medianPriceH || (recommendedPriceP + 5);
  const enableHardcover = reception.hardcoverShare >= 0.4;

  // Page count target
  const targetPages = reception.medianPages || 130;

  // Interior recommendation snapshot
  const interiorRec = {
    trimSize: interior.trimSize || '6x9', // Default to 6x9 if cluster doesn't specify
    fontSize: interior.fontSize === 'small' ? 'large' : (interior.fontSize || 'large'), // upgrade to large if cluster says small (always fix that pain)
    itemsPerPage: interior.itemsPerPage || '1',
    addHowToUse: interior.howToUseShare >= 0.5,
    addAuthorBio: interior.authorBioShare >= 0.5,
    addCrossPromo: interior.crossPromoShare >= 0.5,
    solutionsGrouped: interior.solutionsGroupedShare >= interior.solutionsInOrderShare
  };

  // Warnings
  const warnings = [];
  const totalBooks = visual.booksCount + marketing.booksCount + reception.booksCount + interior.booksCount;
  if (visual.booksCount < 3) warnings.push(`⚠️ Group A: only ${visual.booksCount} book(s) — visual cluster fragile`);
  if (marketing.booksCount < 3) warnings.push(`⚠️ Group B: only ${marketing.booksCount} book(s) — marketing patterns fragile`);
  if (reception.booksCount < 3) warnings.push(`⚠️ Group C: only ${reception.booksCount} book(s) — reception cluster fragile`);
  if (interior.booksCount < 2) warnings.push(`⚠️ Group D: only ${interior.booksCount} book(s) — interior cluster fragile`);
  if (!totalBooks) warnings.push(`No books parsed — check input format`);
  if (recommendedPriceP < 4) warnings.push(`⚠️ Median price ${recommendedPriceP} is suspiciously low — verify input`);

  return {
    niche,
    differentiator: diffJoined,
    differentiators: diffsArr,
    penName: penName || '',
    imprint: imprint || '',
    visual,
    marketing,
    reception,
    interior,
    decisions: {
      titleProposals,
      defaultSubtitle,
      description,
      recommendedPriceP,
      recommendedPriceH,
      enableHardcover,
      targetPages,
      categories: reception.topCategories,
      keywords: marketing.keywords,
      painPoints: painList,
      praisePatterns: praiseList,
      interiorRec,
      coverPrompt: visual.openArtPrompt
    },
    warnings,
    synthesizedAt: new Date().toISOString()
  };
}

// ====================== APPLY CLUSTER TO PROJECT ======================
// Mutates a wizard project with the user's confirmed dashboard decisions.
// Decisions object structure (from decision-dashboard.js):
//   { selectedTitle, subtitle, description, paperbackPrice, hardcoverPrice,
//     hardcoverEnabled, pageCount, categories[], keywords[], coverPrompt,
//     interiorRec{fontSize,itemsPerPage,addHowToUse,addAuthorBio,addCrossPromo,solutionsGrouped} }
function bwApplyClusterToProject(project, synthesis, decisions) {
  if (!project) return project;
  const d = decisions || {};

  // Stage 1 — positioning
  const diffOut = (Array.isArray(synthesis.differentiators) && synthesis.differentiators.length)
    ? synthesis.differentiators.join(' + ')
    : synthesis.differentiator;
  if (diffOut) project.positioning.differentiator = diffOut;
  if (Array.isArray(synthesis.differentiators)) project.positioning.differentiators = synthesis.differentiators;
  if (synthesis.penName) {
    // Split "Name 1 & Name 2" — first becomes Primary Author, rest become contributors with role 'Author'
    const names = synthesis.penName.split(/\s*&\s*/).map(s => s.trim()).filter(Boolean);
    if (names[0]) {
      const p = _riParsePenName(names[0]);
      project.positioning.authorPrimary = Object.assign(project.positioning.authorPrimary || {}, p);
      project.positioning.authorPenName = synthesis.penName;
    }
    if (names.length > 1) {
      project.positioning.contributors = project.positioning.contributors || [];
      const existing = new Set(project.positioning.contributors.map(c => `${c.firstName||''} ${c.lastName||''}`.trim()));
      names.slice(1).forEach(n => {
        const p = _riParsePenName(n);
        const full = `${p.firstName} ${p.lastName||''}`.trim();
        if (!existing.has(full)) {
          project.positioning.contributors.push({
            role: 'Author', prefix: '',
            firstName: p.firstName || '', middleName: p.middleName || '', lastName: p.lastName || ''
          });
        }
      });
    }
  }
  if (synthesis.imprint) project.positioning.imprint = synthesis.imprint;
  if ((synthesis.reception?.painPoints || []).length) {
    project.positioning.painPoint = synthesis.reception.painPoints[0].theme;
  }

  // Stage 2 — style: leave existing palette unless visual cluster has clear dominant + accents
  if (synthesis.visual?.dominantColor) {
    project.style = project.style || {};
    project.style.clusterPalette = {
      dominant: synthesis.visual.dominantColor,
      accents: synthesis.visual.accentColors,
      typography: synthesis.visual.typography
    };
  }

  // If user picked "Mascot ..." as differentiator, flip mascot.has=true so cover gen
  // includes the mascot in prompts. Type is niche-defaulted; user can override in Stage 2.
  const diffsForMascot = Array.isArray(synthesis.differentiators) ? synthesis.differentiators : [];
  const wantsMascot = diffsForMascot.some(d => /mascot/i.test(d));
  if (wantsMascot) {
    project.style = project.style || {};
    project.style.mascot = project.style.mascot || {};
    project.style.mascot.has = true;
    if (!project.style.mascot.type) {
      // Niche-aware default
      const niche = synthesis.niche || '';
      if (/variety-puzzle|activity-book/.test(niche)) project.style.mascot.type = 'pink cartoon brain mascot with sunglasses and headphones';
      else if (/journal/.test(niche)) project.style.mascot.type = 'celestial spirit mascot, pastel colors, mystical vibe';
      else if (/word-search|sudoku/.test(niche)) project.style.mascot.type = 'wise owl mascot with reading glasses';
      else if (/coloring/.test(niche)) project.style.mascot.type = '';  // coloring books don't use mascots
      else project.style.mascot.type = 'friendly cartoon character mascot';
    }
  }

  // Stage 3 — content: page count target
  project.content = project.content || {};
  if (d.pageCount || synthesis.decisions.targetPages) {
    project.content.pageCount = d.pageCount || synthesis.decisions.targetPages;
  }
  // Interior recommendations
  const irec = d.interiorRec || synthesis.decisions.interiorRec;
  if (irec) {
    project.content.interiorRec = {
      trimSize: irec.trimSize,
      fontSize: irec.fontSize,
      itemsPerPage: irec.itemsPerPage,
      addHowToUse: !!irec.addHowToUse,
      addAuthorBio: !!irec.addAuthorBio,
      addCrossPromo: !!irec.addCrossPromo,
      solutionsGrouped: !!irec.solutionsGrouped
    };
    project.content.frontMatter = Object.assign({ titlePage: true, copyright: true }, project.content.frontMatter || {}, {
      intro: !!irec.addHowToUse
    });
    project.content.backMatter = Object.assign({ solutions: true, aiDisclosure: true, reviewRequest: true }, project.content.backMatter || {}, {
      crossPromo: !!irec.addCrossPromo,
      authorBio: !!irec.addAuthorBio
    });
  }

  // Stage 4 — pricing + trim
  project.technical = project.technical || {};
  if (irec && irec.trimSize) project.technical.trimSize = irec.trimSize;
  project.technical.pricing = project.technical.pricing || {};
  const priceP = (d.paperbackPrice != null ? d.paperbackPrice : synthesis.decisions.recommendedPriceP);
  if (priceP) project.technical.pricing.paperback = priceP;
  const hcEnabled = (d.hardcoverEnabled != null ? d.hardcoverEnabled : synthesis.decisions.enableHardcover);
  const priceH = (d.hardcoverPrice != null ? d.hardcoverPrice : synthesis.decisions.recommendedPriceH);
  if (hcEnabled && priceH) project.technical.pricing.hardcover = priceH;
  project.technical.formats = Array.from(new Set([...(project.technical.formats || ['paperback','kindle']), ...(hcEnabled ? ['hardcover'] : [])]));

  // Stage 5 — marketing
  project.marketing = project.marketing || {};
  if (d.selectedTitle || synthesis.decisions.titleProposals[0]) {
    project.marketing.title = d.selectedTitle || synthesis.decisions.titleProposals[0];
  }
  if (d.subtitle || synthesis.decisions.defaultSubtitle) {
    project.marketing.subtitle = d.subtitle || synthesis.decisions.defaultSubtitle;
  }
  if (d.description || synthesis.decisions.description) {
    project.marketing.description = d.description || synthesis.decisions.description;
  }
  const cats = d.categories || synthesis.decisions.categories || [];
  if (cats.length) project.marketing.bisac = cats.slice(0, 3);
  let kws = d.keywords || synthesis.decisions.keywords || [];
  // If cluster produced no valid keywords (e.g. Group B had <2 books), fall back to
  // niche-derived seed keywords. Better generic-but-relevant than book-specific leaks.
  if (kws.length < 4) {
    kws = _riSeedKeywordsForNiche(synthesis.niche || '', kws);
  }
  if (kws.length) {
    project.marketing.keywords = Array(7).fill('').map((_, i) => kws[i] || '');
  }

  // Cover prompt for Stage 6
  project.coverPrompt = d.coverPrompt || synthesis.decisions.coverPrompt;

  // Sync series volume to title if title was newly selected
  if (typeof bwAutoDetectSeries === 'function') bwAutoDetectSeries(project);

  // Mark ingestion
  project.research = {
    importedAt: synthesis.synthesizedAt,
    niche: synthesis.niche,
    summary: {
      visualBooks: synthesis.visual.booksCount,
      marketingBooks: synthesis.marketing.booksCount,
      receptionBooks: synthesis.reception.booksCount,
      interiorBooks: synthesis.interior.booksCount
    }
  };
  project.updatedAt = new Date().toISOString();
  if (typeof bwUpsert === 'function') bwUpsert(project);
  return project;
}

// ====================== HELPERS ======================
// Parse a single pen name like "Lily R. Columbus" into {firstName, middleName, lastName}.
// Smart-detect middle initial: middle part is ≤2 chars OR ends with period.
// Niche-derived backend keyword seeds. Used when Group B is sparse and the cluster
// keyword extraction produces fewer than 4 valid signals. These are KDP-style backend
// keywords (full phrases, not single words) — what a buyer types into Amazon search.
// Merges with whatever cluster signals exist (clusterKws first, then niche fills the rest).
function _riSeedKeywordsForNiche(niche, clusterKws) {
  const seeds = {
    'variety-puzzle:for-teens': [
      'puzzle book for teens', 'brain games for teens', 'activity book ages 11 15',
      'gift for 12 year old', 'gift for 13 year old', 'screen free activity teens',
      'summer activity book teens'
    ],
    'word-search:large-print-seniors': [
      'large print word search seniors', 'word search puzzle book elderly',
      'brain games for seniors', 'gift for grandma', 'cognitive exercise seniors',
      'word find large print', 'big print puzzle book'
    ],
    'sudoku:large-print': [
      'large print sudoku adults', 'sudoku puzzle book seniors',
      'easy sudoku large print', 'brain training sudoku', 'logic puzzle adults',
      'gift for puzzle lovers', 'sudoku for beginners'
    ],
    'journal-prompts:self-care-teens': [
      'journal for teen girls', 'self care journal teen', 'confidence journal girls',
      'gift for teen girl', 'mindfulness journal teens', 'gratitude journal teen',
      'self esteem journal girls'
    ],
    'journal-prompts:gratitude': [
      'gratitude journal for women', 'daily gratitude journal', '90 day journal',
      'mindfulness journal adults', 'gift for women', 'self help journal',
      'positive thinking journal'
    ],
    'coloring-book:cottagecore': [
      'cottagecore coloring book', 'aesthetic coloring book adults',
      'cottage coloring book', 'relaxing coloring book', 'mushroom coloring book',
      'gift for women', 'pinterest aesthetic'
    ],
    'coloring-book:adults-bold-easy': [
      'bold easy coloring book adults', 'simple coloring book seniors',
      'thick lines coloring book', 'stress relief coloring', 'large print coloring',
      'gift for grandma', 'beginner coloring book'
    ],
    'destructive-journal:teens': [
      'wreck this journal teen', 'creative journal for teens', 'destroy this book',
      'gift for teen', 'anti boring journal', 'creative chaos journal',
      'unconventional journal'
    ],
    'planner:adhd': [
      'adhd planner adults', 'adhd daily planner', 'undated adhd planner',
      'neurodivergent planner', 'executive function planner', 'adhd workbook adults',
      'time management adhd'
    ],
    'workbook-edu:bilingual-en-es': [
      'bilingual workbook spanish english', 'spanish english activity book',
      'libro bilingue niños', 'spanish workbook kids', 'english spanish learning',
      'bilingual education book', 'libro de actividades'
    ],
    'health-tracker:menopause': [
      'menopause symptom tracker', 'menopause journal', 'perimenopause tracker',
      'hot flash tracker', 'menopause log book', 'gift for women 50',
      'hormone tracker journal'
    ],
    'activity-book:for-kids-8-12': [
      'activity book kids 8-12', 'travel activity book kids', 'screen free kids',
      'gift for 10 year old', 'puzzle book for kids', 'summer workbook kids',
      'road trip activity book'
    ],
  };
  const fallback = ['activity book', 'gift idea', 'puzzle book', 'fun book', 'creative book'];
  const seedList = seeds[niche] || fallback;
  // Merge: keep cluster keywords first (real cluster signal), fill remainder with seeds
  const merged = [];
  const seen = new Set();
  (clusterKws || []).forEach(k => { if (k && !seen.has(k.toLowerCase())) { merged.push(k); seen.add(k.toLowerCase()); } });
  seedList.forEach(k => { if (merged.length < 7 && !seen.has(k.toLowerCase())) { merged.push(k); seen.add(k.toLowerCase()); } });
  return merged.slice(0, 7);
}

function _riParsePenName(s) {
  if (!s) return { firstName: '', lastName: '' };
  const parts = String(s).trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };
  // 3+ parts: detect middle initial
  const mid = parts[1];
  if (mid.length <= 2 || mid.endsWith('.')) {
    return { firstName: parts[0], middleName: mid, lastName: parts.slice(2).join(' ') };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function audienceAgeRange(word) {
  const w = word.toLowerCase();
  if (w.startsWith('teen')) return '11-15';
  if (w.startsWith('tween')) return '8-12';
  if (w.startsWith('kid') || w.startsWith('child')) return '6-10';
  if (w.startsWith('senior')) return '60+';
  if (w.startsWith('adult')) return '18+';
  return '';
}

function nicheToLabel(niche) {
  if (!niche) return 'Puzzles';
  const base = niche.split(':')[0];
  const map = {
    'variety-puzzle': 'Puzzles',
    'word-search': 'Word Searches',
    'sudoku': 'Sudoku',
    'coloring-book': 'Coloring Pages',
    'activity-book': 'Activities',
    'journal-prompts': 'Journal Prompts',
    'planner': 'Planner Pages',
    'workbook-edu': 'Exercises',
    'kakuro': 'Kakuro Puzzles',
    'cryptogram': 'Cryptograms',
    'health-tracker': 'Trackers',
    'destructive-journal': 'Prompts'
  };
  return map[base] || 'Puzzles';
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// Expose for debugging in DevTools
if (typeof window !== 'undefined') {
  window.RI_NICHE_CATALOG = RI_NICHE_CATALOG;
  window.RI_DIFFERENTIATOR_PATTERNS = RI_DIFFERENTIATOR_PATTERNS;
  window.RI_IMPRINT_PATTERNS = RI_IMPRINT_PATTERNS;
  window.RI_PEN_NAME_TIPS = RI_PEN_NAME_TIPS;
  window.bwParseVisualGroup = bwParseVisualGroup;
  window.bwParseMarketingGroup = bwParseMarketingGroup;
  window.bwParseReceptionGroup = bwParseReceptionGroup;
  window.bwParseInteriorGroup = bwParseInteriorGroup;
  window.bwSynthesizeVisual = bwSynthesizeVisual;
  window.bwSynthesizeMarketing = bwSynthesizeMarketing;
  window.bwSynthesizeReception = bwSynthesizeReception;
  window.bwSynthesizeInterior = bwSynthesizeInterior;
  window.bwSynthesizeAll = bwSynthesizeAll;
  window.bwApplyClusterToProject = bwApplyClusterToProject;
}
