// Book Ideas — Phase H storage layer
// Persists curated reference dumps + synthesis state per "book idea" so the user
// can save mid-research, come back later, and finish.
//
// Storage: IndexedDB (gigabytes available) with one-time migration from legacy
// localStorage 'bw_book_ideas' (5MB cap, was filling up too fast).
//
// Public API stays SYNC for backward compatibility — reads come from an in-memory
// cache that's hydrated on page load (sync warm-start from localStorage if any,
// then async override from IDB once it loads). Writes update cache immediately
// AND fire-and-forget persist to IDB. Race during the first ~10ms after boot:
// if a write happens before IDB load completes, we keep the writer's value (cache
// is the source of truth, IDB is the durability layer).
//
// Idea schema:
//   {
//     id, niche, differentiators[], penName, imprint, label?,
//     groupAText, groupAParsed, groupBText, groupBParsed,
//     groupCText, groupCParsed, groupDText, groupDParsed,
//     synthesis, decisions, projectId, status,
//     createdAt, updatedAt
//   }

const BI_LEGACY_KEY = 'bw_book_ideas';      // localStorage (deprecated)
const BI_IDB_NAME   = 'kdp-book-factory';
const BI_IDB_STORE  = 'book_ideas';
const BI_IDB_KEY    = 'all';                // single record holding {active,list}

// In-memory cache — single source of truth at runtime. IDB is durability only.
let _biCache = { active: null, list: [] };
let _biLoadedFromIdb = false;
let _biDbPromise = null;

function _biOpenDb() {
  if (_biDbPromise) return _biDbPromise;
  _biDbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(BI_IDB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(BI_IDB_STORE)) db.createObjectStore(BI_IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _biDbPromise;
}

async function _biReadFromIdb() {
  const db = await _biOpenDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BI_IDB_STORE, 'readonly');
    const store = tx.objectStore(BI_IDB_STORE);
    const req = store.get(BI_IDB_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function _biWriteToIdb(data) {
  const db = await _biOpenDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BI_IDB_STORE, 'readwrite');
    const store = tx.objectStore(BI_IDB_STORE);
    const req = store.put(data, BI_IDB_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Boot init — sync warm-start from localStorage so UI renders immediately, then
// async IDB load merges with cache (no overwrite). Merge strategy: union by id,
// newer updatedAt wins on conflict. This protects ideas the user creates during
// the boot window (between sync init and async IDB read completing).
function _biInit() {
  // Warm-start from legacy localStorage
  try {
    const ls = localStorage.getItem(BI_LEGACY_KEY);
    if (ls) {
      const parsed = JSON.parse(ls);
      if (parsed && Array.isArray(parsed.list)) _biCache = parsed;
    }
  } catch (e) { /* ignore */ }

  // Async load from IDB → merge with cache → garbage-collect duplicate empty ideas
  _biReadFromIdb().then(idbData => {
    _biLoadedFromIdb = true;
    const merged = _biMergeStates(_biCache, idbData);
    // Garbage-collect: keep at most ONE truly-empty idea (no niche, no diffs, no research).
    // Multiple empty ideas pile up when dd0Mount auto-creates on every boot before IDB loads.
    const cleaned = _biGcEmpties(merged);
    const changed = JSON.stringify(cleaned) !== JSON.stringify(idbData || {});
    _biCache = cleaned;
    if (changed) {
      _biWriteToIdb(_biCache).catch(e => console.warn('[book-ideas] post-merge persist failed:', e));
    }
    try { localStorage.removeItem(BI_LEGACY_KEY); } catch (e) { /* ignore */ }
    if (typeof dd0Render === 'function') dd0Render();
  }).catch(e => {
    console.warn('[book-ideas] IDB unavailable, will use localStorage fallback:', e);
  });
}

// True if an idea has no user input at all — a phantom from auto-create on boot.
function _biIsEmpty(i) {
  if (!i) return true;
  if (i.niche) return false;
  if (Array.isArray(i.differentiators) && i.differentiators.length) return false;
  if (i.penName || i.imprint || i.label) return false;
  if (i.synthesis) return false;
  if (['A','B','C','D'].some(L => (i['group' + L + 'Text'] || '').trim().length > 0)) return false;
  return true;
}

// Garbage-collect empty ideas:
//   - if active is an empty idea, keep just that one (user may be typing)
//   - else if ALL ideas are empty, keep the newest one (so empty state isn't shown)
//   - else (real ideas exist alongside empties), drop ALL empties — they're junk
function _biGcEmpties(state) {
  const empties = state.list.filter(_biIsEmpty);
  if (empties.length === 0) return state;
  const activeIsEmpty = !!state.list.find(i => i.id === state.active && _biIsEmpty(i));
  const allEmpty = state.list.length === empties.length;
  let keepId = null;
  if (activeIsEmpty) {
    keepId = state.active;
  } else if (allEmpty) {
    keepId = empties.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0].id;
  }
  const list = state.list.filter(i => !_biIsEmpty(i) || i.id === keepId);
  const active = list.find(i => i.id === state.active) ? state.active : (list[0]?.id || null);
  return { active, list };
}

// Union of two {active, list} states. Newer updatedAt wins per id; both lists
// preserved entirely (no overwrite). Active id picks the one that exists in the
// merged list, preferring `a.active` (typically the cache where the user just
// clicked "+ New") over `b.active`.
function _biMergeStates(a, b) {
  const aSafe = (a && Array.isArray(a.list)) ? a : { active: null, list: [] };
  const bSafe = (b && Array.isArray(b.list)) ? b : { active: null, list: [] };
  const byId = new Map();
  aSafe.list.forEach(i => byId.set(i.id, i));
  bSafe.list.forEach(bIdea => {
    const aIdea = byId.get(bIdea.id);
    if (!aIdea) { byId.set(bIdea.id, bIdea); return; }
    const aTs = new Date(aIdea.updatedAt || 0).getTime();
    const bTs = new Date(bIdea.updatedAt || 0).getTime();
    if (bTs > aTs) byId.set(bIdea.id, bIdea);
  });
  // Preserve A's order first (recent creates appear last where user expects them),
  // then append any IDB-only ideas not already in A
  const seen = new Set();
  const list = [];
  aSafe.list.forEach(i => { if (!seen.has(i.id)) { list.push(byId.get(i.id)); seen.add(i.id); } });
  bSafe.list.forEach(i => { if (!seen.has(i.id)) { list.push(byId.get(i.id)); seen.add(i.id); } });
  // Active resolution
  const ids = new Set(list.map(i => i.id));
  const active = (aSafe.active && ids.has(aSafe.active)) ? aSafe.active
               : (bSafe.active && ids.has(bSafe.active)) ? bSafe.active
               : (list[0]?.id || null);
  return { active, list };
}

function biLoadAll() {
  return _biCache;
}

function biSaveAll(data) {
  _biCache = data;
  // Fire-and-forget IDB write. If IDB fails, fall back to localStorage so we
  // don't lose data entirely.
  _biWriteToIdb(data).catch(e => {
    console.error('[book-ideas] IDB write failed, falling back to localStorage:', e);
    try {
      localStorage.setItem(BI_LEGACY_KEY, JSON.stringify(data));
    } catch (lsErr) {
      const msg = `Storage full (${Math.round(JSON.stringify(data).length / 1024)} KB). Delete some ideas.`;
      console.error(msg, lsErr);
      if (typeof bwToast === 'function') bwToast('⚠ ' + msg);
    }
  });
  return true;
}

function biList() {
  return biLoadAll().list;
}

// Idempotent migration — converts legacy `differentiator: string` → `differentiators: array`
function biMigrate(idea) {
  if (!idea) return idea;
  if (!Array.isArray(idea.differentiators)) {
    if (typeof idea.differentiator === 'string' && idea.differentiator.trim()) {
      idea.differentiators = idea.differentiator.split(/\s*\+\s*|\s*·\s*|\s*,\s*/).filter(Boolean);
    } else {
      idea.differentiators = [];
    }
  }
  return idea;
}

function biGet(id) {
  return biMigrate(biLoadAll().list.find(i => i.id === id) || null);
}

function biGetActive() {
  const all = biLoadAll();
  return biMigrate(all.list.find(i => i.id === all.active) || null);
}

function biSetActiveId(id) {
  const all = biLoadAll();
  all.active = id;
  biSaveAll(all);
  if (window.cs) window.cs.setActiveIdea(id);
}

// Use a counter+timestamp+random suffix to guarantee uniqueness even on rapid
// successive clicks (Date.now() alone collides if user clicks twice in <1ms).
let _biIdCounter = 0;
function _biGenerateId() {
  _biIdCounter = (_biIdCounter + 1) % 1000;
  return 'idea-' + Date.now() + '-' + _biIdCounter.toString().padStart(3, '0');
}

function biCreate({ niche = '', differentiators = [], penName = '', imprint = '' } = {}) {
  const idea = {
    id: _biGenerateId(),
    niche, differentiators, penName, imprint,
    groupAText: '', groupAParsed: null,
    groupBText: '', groupBParsed: null,
    groupCText: '', groupCParsed: null,
    groupDText: '', groupDParsed: null,
    synthesis: null,
    decisions: null,
    projectId: null,
    status: 'research',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  biUpsert(idea);
  biSetActiveId(idea.id);
  return idea;
}

function biUpsert(idea) {
  const all = biLoadAll();
  idea.updatedAt = new Date().toISOString();
  const idx = all.list.findIndex(i => i.id === idea.id);
  if (idx >= 0) all.list[idx] = idea; else all.list.push(idea);
  const ok = biSaveAll(all);
  if (window.cs) window.cs.upsertIdea(idea);
  return ok;
}

function biDelete(id) {
  const all = biLoadAll();
  all.list = all.list.filter(i => i.id !== id);
  if (all.active === id) all.active = all.list[0]?.id || null;
  biSaveAll(all);
  if (window.cs) {
    window.cs.deleteIdea(id);
    window.cs.setActiveIdea(all.active);
  }
}

function biRename(id, label) {
  const idea = biGet(id);
  if (!idea) return;
  idea.label = label;
  biUpsert(idea);
}

// Convenience — compute a human-readable label from idea state
function biLabel(idea) {
  if (idea.label) return idea.label;
  if (idea.synthesis?.decisions?.titleProposals?.[0]) return idea.synthesis.decisions.titleProposals[0];
  if (idea.niche) return idea.niche;
  return 'Untitled idea';
}

// Status badge for dropdown
function biStatusBadge(idea) {
  switch (idea.status) {
    case 'research': return '🔍';
    case 'synthesized': return '🧪';
    case 'applied': return '✅';
    case 'compiled': return '📘';
    default: return '·';
  }
}

if (typeof window !== 'undefined') {
  window.biLoadAll = biLoadAll;
  window.biList = biList;
  window.biGet = biGet;
  window.biGetActive = biGetActive;
  window.biSetActiveId = biSetActiveId;
  window.biCreate = biCreate;
  window.biUpsert = biUpsert;
  window.biDelete = biDelete;
  window.biRename = biRename;
  window.biLabel = biLabel;
  window.biStatusBadge = biStatusBadge;
  window.biIsEmpty = _biIsEmpty;
  window.biSaveAll = biSaveAll;
}

// Boot
_biInit();
