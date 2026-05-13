// Decision Dashboard — Phase H Stage 0 UI
// Renders:
//   1. Stage 0 input form (niche, differentiator, pen name, 4 reference textareas)
//   2. Synthesis report cards
//   3. Decision dashboard (one screen with all final book decisions)
//
// Flow:
//   biCreate() -> dd0RenderStage0() -> Synthesize button -> bwSynthesizeAll()
//   -> dd0RenderDashboard() -> Apply All button -> bwApplyClusterToProject() -> wizard Stage 6
//
// Mounts into #dd0-root in index.html. The wizard's existing Stage 1-6 remains untouched.

// Mutates `idea` in-place: hard-resets every niche-dependent field when switching niches.
// Per-user decision (2026-05-06): on niche change, START FRESH — the user wants to re-pick
// differentiators from the new niche's filtered suggestions, not inherit anything stale.
//
// Cleared:
//   - research textareas A/B/C/D (text + parsed)  — cluster of OLD niche, useless for NEW
//   - synthesis result                            — derived from research
//   - decisions (title/subtitle/desc/price/etc)   — derived from synthesis + old niche
//   - differentiators (ALL — both catalog + custom) — user explicitly wants fresh pick
//   - status                                      — back to draft
// Preserved (NOT niche-dependent):
//   - id / createdAt / updatedAt                  — lifecycle metadata
//   - pen name / imprint (if ever stored)         — author identity, lives in Stage 1
function dd0ClearNicheDependentState(idea) {
  const counts = {
    research: ['A','B','C','D'].filter(L => (idea['group' + L + 'Text'] || '').trim().length > 0).length,
    diffs: (Array.isArray(idea.differentiators) ? idea.differentiators : []).length,
    synthesis: idea.synthesis ? 1 : 0,
    decisions: idea.decisions && Object.keys(idea.decisions).length ? 1 : 0,
  };
  ['A','B','C','D'].forEach(L => {
    idea['group' + L + 'Text'] = '';
    idea['group' + L + 'Parsed'] = null;
  });
  idea.differentiators = [];
  idea.synthesis = null;
  idea.decisions = {};
  idea.status = 'draft';
  return counts;
}

// Dynamic research briefs — populated with niche, audience hint, and active differentiators
// so the brief is self-contained (no manual fill-in required by the researcher).

function dd0AudienceHint(niche) {
  const m = (niche || '').match(/for-(teens?|tweens?|kids?|adults?|seniors?)/i);
  if (!m) return '';
  const w = m[1].toLowerCase();
  if (w.startsWith('teen')) return ' (audience: teens 11-15)';
  if (w.startsWith('tween')) return ' (audience: tweens 8-12)';
  if (w.startsWith('kid')) return ' (audience: kids 6-10)';
  if (w.startsWith('senior')) return ' (audience: seniors 60+)';
  if (w.startsWith('adult')) return ' (audience: adults 18+)';
  return '';
}

function dd0NicheLabel(niche) {
  const item = (window.RI_NICHE_CATALOG || []).find(n => n.id === niche);
  return item ? item.label : (niche || '[YOUR NICHE]');
}

function dd0BuildPrompt(letter, idea) {
  const niche = idea.niche || '';
  const label = dd0NicheLabel(niche);
  const audience = dd0AudienceHint(niche);
  const diffs = Array.isArray(idea.differentiators) ? idea.differentiators.filter(Boolean) : [];
  const cat = (window.RI_NICHE_CATALOG || []).find(n => n.id === niche);
  const searchQueries = cat?.searchQueries || [];
  const audienceConstraint = cat?.audienceConstraint || '';

  // Universal preamble injected at the top of every axis prompt — gives the
  // researcher (Sonnet/Haiku/etc.) explicit search queries and a hard audience
  // guard so they don't drift to wrong-audience adjacent niches.
  const targetCount = letter === 'D' ? 2 : 3;

  const timeBudgetBlock = `
TIME BUDGET: target ~90 seconds. STOP at the first ${targetCount} valid books — do not overshoot looking for "better" ones. Quality of extraction beats search optimization.
`;

  const preferredPathBlock = `
PREFERRED PATH: instead of running search queries, go directly to amazon.com/gp/bestsellers/books and drill into the closest category for this niche. The Best Sellers page is pre-sorted by BSR — top 30 books visible immediately. Use the search queries below ONLY as fallback if no relevant best-sellers category exists.
`;

  const searchBlock = searchQueries.length ? `
SEARCH QUERIES (fallback if best-sellers path doesn't fit, try in order until you find ${targetCount} valid books):
${searchQueries.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')}
` : '';

  const audienceBlock = audienceConstraint ? `
AUDIENCE CHECK (mandatory): ${audienceConstraint}
` : '';

  const fallbackBlock = `
IF YOU CAN'T FIND ${targetCount} VALID BOOKS: relax the BSR/review threshold (e.g. BSR < 250,000 OR 50+ reviews at 4.0⭐+) and note "RELAXED FILTER" in the result. Better ${targetCount} good-enough books than 0 perfect ones.
`;

  // Differentiator context block — only relevant for Groups A and B (visual + marketing).
  // For C (reception) and D (interior) we want unfiltered top books regardless of angle.
  const diffsBlockAB = diffs.length ? `

CONTEXT — what makes this book different (do NOT pick clones of these angles, we want references for the niche's competitive landscape):
${diffs.map(d => `  • ${d}`).join('\n')}` : '';

  switch (letter) {
    case 'A':
      return `Pick 3 books in the niche "${label}"${audience} with covers that stand out in thumbnail.
Filter: published 2024 or later AND (BSR top 30 in the niche OR 100+ reviews at 4.3⭐+).${diffsBlockAB}
${preferredPathBlock}${searchBlock}${audienceBlock}${timeBudgetBlock}${fallbackBlock}
For each book:
1. Amazon URL:
2. Pub date + BSR + review count (e.g. "Mar 2024 · BSR #12,450 · 487 reviews 4.6⭐"):
3. Cover image URL (right-click on the image → copy link):
4. Dominant color (1 word):
5. 2 accent colors:
6. Title typography (sans-serif bold / serif / handwritten / display):
7. Visible cover elements (mascot, sample puzzle, "Volume N" badge, age badge, etc.):
8. ONE LINE: why does this cover stand out vs others in the niche?
`;

    case 'B':
      return `Pick 3 books in the niche "${label}"${audience} with high-converting marketing copy.
Filter: published 2024 or later AND (BSR top 30 in the niche OR 100+ reviews at 4.3⭐+).${diffsBlockAB}
${preferredPathBlock}${searchBlock}${audienceBlock}${timeBudgetBlock}${fallbackBlock}
For each book:
1. Amazon URL:
2. Pub date + BSR + review count (e.g. "Mar 2024 · BSR #12,450 · 487 reviews 4.6⭐"):
3. Title (the bold line on the listing page):
4. Subtitle (separate KDP field — may be blank if the entire hook lives in the title):
5. Full description (copy-paste verbatim, preserve bullets and line breaks):
6. The ONE hook sentence that made you want to buy (copy-paste exact, no paraphrase):
`;

    case 'C':
      return `Pick 3 books in the niche "${label}"${audience} that are the most-loved in the niche, regardless of angle.
Filter: published 2024 or later AND 4.5⭐+ AND 100+ reviews.

IMPORTANT — pick DIFFERENT books than Groups A and B. Group C is about reception (what readers love/hate). If you find overlap, skip and look further down the bestseller list.

OUTPUT FORMAT — keep each book SHORT and STRUCTURED. No verbatim reviews, no cross-book insight tables. Just the data we need:
${preferredPathBlock}${searchBlock}${audienceBlock}${timeBudgetBlock}${fallbackBlock}
For each book:
1. Amazon URL:
2. Pub date + BSR + reviews + rating:
3. Page count:
4. Paperback price:
5. Hardcover price (or N/A):
6. Categories breadcrumb (the 3 "Best Seller in:" lines):
7. Top 3 praise themes (read 5⭐ reviews, give 3 SHORT 1-line themes — what readers celebrate. Example: "Solutions are easy to read in large print"):
8. Top 3 pain themes (read 1-3⭐ reviews, give 3 SHORT 1-line themes — what readers complain about. Example: "Too easy for older teens"):
9. ONE LINE: what makes people love this book beyond the cover/copy?
`;

    case 'D':
      return `Pick 2 books in the niche "${label}"${audience} with strong interior execution.
Ideally books with 5⭐ reviews mentioning "easy to read", "good size", "well laid out".
Filter: published 2024 or later AND (BSR top 30 in the niche OR 100+ reviews at 4.3⭐+).
${preferredPathBlock}${searchBlock}${audienceBlock}${timeBudgetBlock}${fallbackBlock}
For each book:
1. Amazon URL:
2. Pub date + BSR + review count (e.g. "Mar 2024 · BSR #12,450 · 487 reviews 4.6⭐"):
3. Trim size from product details (6×9 / 7×10 / 8.5×11 / other):
4. "Look Inside" SCREENSHOTS (5 image URLs):
   - Title page
   - "How to use" / intro page
   - One typical content page
   - Solutions / answer key page
   - Final page / back matter
5. Content font size (small / medium / large):
6. Layout: how many items per page? (1 / 2 / grid 4+):
7. Has "How to play / use" page? (Y/N):
8. Has author bio page? (Y/N):
9. Promotes other volumes at the end? (Y/N):
10. Solutions organized with index/headings or unordered?
11. ONE LINE: what does this interior do well that others don't?
`;
  }
  return '';
}

// Refresh the 4 <pre> prompt blocks in place (does NOT touch textareas, so user typing is preserved)
function dd0RefreshPrompts(idea) {
  ['A','B','C','D'].forEach(letter => {
    const pre = document.getElementById('dd0-prompt-' + letter);
    if (pre) pre.textContent = dd0BuildPrompt(letter, idea);
  });
  const mega = document.getElementById('dd0-prompt-MEGA');
  if (mega) mega.textContent = dd0BuildMegaPrompt(idea);
}

// MEGA prompt — combines all 4 axes into a single Sonnet run. Saves ~70% time
// vs running A/B/C/D separately. Output uses '===SECTION X===' separators that
// dd0SplitMegaResponse parses back into the 4 group textareas.
function dd0BuildMegaPrompt(idea) {
  const niche = idea.niche || '';
  const label = dd0NicheLabel(niche);
  const audience = dd0AudienceHint(niche);
  const diffs = Array.isArray(idea.differentiators) ? idea.differentiators.filter(Boolean) : [];
  const cat = (window.RI_NICHE_CATALOG || []).find(n => n.id === niche);
  const searchQueries = cat?.searchQueries || [];
  const audienceConstraint = cat?.audienceConstraint || '';

  const diffsList = diffs.length
    ? diffs.map(d => `  • ${d}`).join('\n')
    : '  (none specified)';

  const queriesBlock = searchQueries.length
    ? `\nSEARCH QUERIES (fallback if best-sellers path doesn't fit):\n${searchQueries.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')}\n`
    : '';

  return `MEGA RESEARCH — all 4 axes in one run.

Niche: "${label}"${audience}
Differentiators (avoid clones in sections A and B):
${diffsList}

GOAL: Find 8-11 books distributed across 4 sections. Books in section C must be DIFFERENT from A/B. Book in D focuses on interior execution.

PREFERRED PATH: go directly to amazon.com/gp/bestsellers/books and drill into the closest category for this niche. Pre-sorted by BSR.
${queriesBlock}
AUDIENCE CHECK (mandatory): ${audienceConstraint || 'verify niche audience match'}

TIME BUDGET: ~3 minutes total. STOP at first valid books per section. Quality of extraction beats search optimization.

IF YOU CAN'T FIND BOOKS for any section: relax the BSR/review threshold (BSR < 250,000 OR 50+ reviews at 4.0⭐+) and note "RELAXED FILTER" inline.

==========================================
RESPOND USING THESE EXACT SEPARATORS:
==========================================

===SECTION A — VISUAL (3 covers)===

For each of the 3 books with covers that stand out in thumbnail:
1. Amazon URL:
2. Pub date + BSR + reviews:
3. Cover image URL:
4. Dominant color (1 word):
5. 2 accent colors:
6. Title typography (sans-serif bold / serif / handwritten / display):
7. Visible cover elements (mascot, sample puzzle, "Volume N" badge, age badge, etc.):
8. ONE LINE: why does this cover stand out?

===SECTION B — MARKETING (3 copy)===

For each of the 3 books with high-converting marketing copy:
1. Amazon URL:
2. Pub date + BSR + reviews:
3. Title (the bold line on the listing page):
4. Subtitle (separate KDP field):
5. Full description (copy-paste verbatim, preserve bullets):
6. The ONE hook sentence that made you want to buy:

===SECTION C — RECEPTION (3 most-loved, DIFFERENT from A/B)===

Pick 3 most-loved books regardless of angle (4.5⭐+ AND 100+ reviews). MUST be different from A/B. For each:
1. Amazon URL:
2. Pub date + BSR + reviews + rating:
3. Page count:
4. Paperback price:
5. Hardcover price (or N/A):
6. Categories breadcrumb (the 3 "Best Seller in:" lines):
7. Top 3 praise themes (3 SHORT 1-line themes from 5⭐ reviews):
8. Top 3 pain themes (3 SHORT 1-line themes from 1-3⭐ reviews):
9. ONE LINE: what makes people love this book?

===SECTION D — INTERIOR (2 best execution)===

Pick 2 books with strong interior execution (mentioned "easy to read", "well laid out" in reviews). For each:
1. Amazon URL:
2. Pub date + BSR + reviews:
3. Trim size from product details (6×9 / 7×10 / 8.5×11 / other):
4. "Look Inside" SCREENSHOTS (5 image URLs: title, intro, content, solutions, back matter):
5. Content font size (small / medium / large):
6. Layout: items per page (1 / 2 / grid 4+):
7. Has "How to play / use" page (Y/N):
8. Has author bio page (Y/N):
9. Promotes other volumes (Y/N):
10. Solutions organized (index/headings or unordered):
11. ONE LINE: what does this interior do well?
`;
}

// Splits a MEGA response into 4 separate group texts. Robust to minor format
// drift in the separator (e.g. "Section A" vs "===SECTION A===").
function dd0SplitMegaResponse(text) {
  const result = { A: '', B: '', C: '', D: '' };
  if (!text) return result;
  // Split on lines that look like a section header — flexible regex.
  // Matches: "===SECTION A===", "Section A — Visual", "===A: VISUAL===", etc.
  const sectionRe = /(?:^|\n)\s*={0,5}\s*(?:section\s+)?([abcd])\b[^\n]*={0,5}\s*\n/gi;
  const matches = [];
  let m;
  while ((m = sectionRe.exec(text)) !== null) {
    matches.push({ letter: m[1].toUpperCase(), index: m.index, end: sectionRe.lastIndex });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].end;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    result[matches[i].letter] = text.slice(start, end).trim();
  }
  return result;
}

function dd0EscapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function dd0Mount() {
  const root = document.getElementById('dd0-root');
  if (!root) return;
  // Do NOT auto-create — IndexedDB loads async and dd0Mount runs before that
  // completes. Auto-creating here generates phantom "Untitled idea" rows on every
  // page reload. Empty state in dd0Render will show "+ New book idea" if no
  // active idea exists. The async IDB load fires its own dd0Render once data
  // arrives, which will then render the user's real ideas.
  dd0Render();
}

function dd0Render() {
  const root = document.getElementById('dd0-root');
  if (!root) return;
  const idea = biGetActive();
  if (!idea) {
    root.innerHTML = `<div class="dd0-empty-state"><p>No book idea yet.</p><button class="bw-btn bw-btn-primary" id="dd0-new">+ Start a new book idea</button></div>`;
    document.getElementById('dd0-new').addEventListener('click', () => { biCreate({}); dd0Render(); });
    return;
  }

  // Detect whether the wizard has any project applied — used to show a contextual hint
  const hasProject = (typeof bwLoadAll === 'function') && (bwLoadAll().list || []).length > 0;
  root.innerHTML = `
    <div class="dd0-shell">
      ${dd0RenderHeaderHtml(idea)}
      ${dd0RenderStage0Html(idea)}
      ${idea.synthesis ? dd0RenderDashboardHtml(idea) : ''}
      ${!hasProject ? `<div class="dd0-empty-hint">↓ Wizard stages will appear below once you click <strong>Apply all</strong>.</div>` : ''}
    </div>
  `;
  dd0WireHeader(idea);
  dd0WireStage0(idea);
  if (idea.synthesis) dd0WireDashboard(idea);
}

// ====================== HEADER (idea picker) ======================

// Header is uniform regardless of count — always shows current idea + "My ideas" button
// that opens a modal with the full list (switch / delete). Removes the asymmetric "1-idea
// vs many-ideas" UX which made saved ideas invisible until the user created a 2nd one.
function dd0RenderHeaderHtml(idea) {
  const count = biList().length;
  return `
    <div class="dd0-header">
      <span class="dd0-header-label">📚 Idea:</span>
      <strong class="dd0-header-name">${dd0EscapeHtml(biLabel(idea))}</strong>
      <span class="dd0-status">${biStatusBadge(idea)} ${dd0EscapeHtml(idea.status)}</span>
      <span class="dd0-header-spacer"></span>
      <button class="bw-btn bw-btn-ghost" id="dd0-show-ideas">📚 My ideas (${count})</button>
      <button class="bw-btn bw-btn-ghost" id="dd0-new-idea">+ New</button>
    </div>
  `;
}

function dd0WireHeader(idea) {
  const newBtn = document.getElementById('dd0-new-idea');
  if (newBtn) newBtn.addEventListener('click', () => {
    // If active idea is already empty, don't create another — reuse it.
    // Avoids accumulating empty drafts during a session.
    const active = biGetActive();
    if (active && typeof biIsEmpty === 'function' && biIsEmpty(active)) {
      if (typeof bwToast === 'function') bwToast('Already on a blank idea');
      return;
    }
    biCreate({ niche: '' });
    dd0Render();
  });
  const showBtn = document.getElementById('dd0-show-ideas');
  if (showBtn) showBtn.addEventListener('click', () => dd0OpenIdeasModal(idea));
}

// Modal listing every saved idea — switch, delete, see status. Always available.
function dd0OpenIdeasModal(activeIdea) {
  const existing = document.getElementById('dd0-ideas-modal');
  if (existing) existing.remove();
  const list = biList();
  const rowsHtml = list.length ? list.map(i => {
    const isActive = i.id === activeIdea.id;
    const updated = i.updatedAt ? new Date(i.updatedAt).toLocaleDateString() : '—';
    const diffsCount = (i.differentiators || []).length;
    const researchCount = ['A','B','C','D'].filter(L => (i['group' + L + 'Text'] || '').trim().length > 0).length;
    return `
      <div class="dd0-idea-row ${isActive ? 'is-active' : ''}">
        <div class="dd0-idea-row-main">
          <div class="dd0-idea-row-name">${biStatusBadge(i)} ${dd0EscapeHtml(biLabel(i))} ${isActive ? '<span class="dd0-idea-active-mark">★ active</span>' : ''}</div>
          <div class="dd0-idea-row-meta">
            <span>${dd0EscapeHtml(i.status || 'draft')}</span> ·
            <span>${diffsCount} differentiator${diffsCount === 1 ? '' : 's'}</span> ·
            <span>${researchCount}/4 research blocks</span> ·
            <span>updated ${updated}</span>
          </div>
        </div>
        <div class="dd0-idea-row-actions">
          ${isActive ? '' : `<button class="bw-btn bw-btn-ghost" data-idea-switch="${i.id}">Switch</button>`}
          <button class="bw-btn bw-btn-ghost" data-idea-delete="${i.id}" title="Delete this idea">🗑️</button>
        </div>
      </div>
    `;
  }).join('') : '<p class="dd0-help-small">No saved ideas yet.</p>';

  const modal = document.createElement('div');
  modal.id = 'dd0-ideas-modal';
  modal.className = 'dd0-modal-backdrop';
  modal.innerHTML = `
    <div class="dd0-modal" role="dialog" aria-label="My saved ideas">
      <div class="dd0-modal-head">
        <strong>📚 My saved book ideas (${list.length})</strong>
        <button class="bw-btn bw-btn-ghost" id="dd0-modal-close">✕</button>
      </div>
      <div class="dd0-modal-body">${rowsHtml}</div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('dd0-modal-close').addEventListener('click', () => modal.remove());
  modal.querySelectorAll('[data-idea-switch]').forEach(btn =>
    btn.addEventListener('click', () => { biSetActiveId(btn.dataset.ideaSwitch); modal.remove(); dd0Render(); }));
  modal.querySelectorAll('[data-idea-delete]').forEach(btn =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.ideaDelete;
      const wasActive = id === activeIdea.id;
      biDelete(id);
      // Refresh in place — re-open modal with updated list, no popup
      modal.remove();
      const stillActive = biGetActive();
      if (stillActive) {
        dd0OpenIdeasModal(stillActive);
      }
      dd0Render();
    }));
}

// ====================== STAGE 0 — Reference Input ======================

function dd0RenderStage0Html(idea) {
  return `
    <div class="dd0-card">
      <div class="dd0-card-title">🎯 Stage 0 — Curated References</div>
      <p class="dd0-help">Run a market research pass to gather 11 reference books (3 visual + 3 marketing + 3 reception + 2 interior). Copy each research brief below, send it to a researcher (or AI), then paste the findings back here. Click Synthesize, and the platform proposes every book decision. <strong>Authors + imprint go in Stage 1</strong> (KDP requires structured fields there).</p>

      ${dd0RenderNichePickerHtml(idea.niche || '')}

      <div class="dd0-grid">
        <div class="dd0-field dd0-field-wide">
          <label>Differentiators <small style="color:var(--text-muted)">— pick 1-5; click chips to toggle on/off</small></label>
          <div id="dd0-diff-block">${dd0RenderDifferentiatorBlockHtml(idea)}</div>
        </div>
      </div>

      ${dd0RenderMegaBoxHtml(idea)}

      ${dd0RenderGroupBoxHtml('A', '🎨 Group A — VISUAL (3 covers)', idea.groupAText, idea.groupAParsed, idea)}
      ${dd0RenderGroupBoxHtml('B', '📝 Group B — MARKETING (3 copy)', idea.groupBText, idea.groupBParsed, idea)}
      ${dd0RenderGroupBoxHtml('C', '📚 Group C — RECEPTION (3 best-loved)', idea.groupCText, idea.groupCParsed, idea)}
      ${dd0RenderGroupBoxHtml('D', '🔧 Group D — INTERIOR (2 best execution)', idea.groupDText, idea.groupDParsed, idea)}

      <div class="dd0-actions">
        ${dd0RenderSynthesizeButtonHtml(idea)}
        <button class="bw-btn bw-btn-ghost" id="dd0-save-draft">💾 Save draft</button>
      </div>
    </div>
  `;
}

// MEGA mode UI — collapsible by default. Single prompt + single textarea + split button.
// Splitting auto-fills the 4 group textareas + parses them so user goes straight to Synthesize.
function dd0RenderMegaBoxHtml(idea) {
  const promptText = dd0BuildMegaPrompt(idea);
  return `
    <details class="dd0-group dd0-mega-box">
      <summary class="dd0-mega-summary">
        <strong>🪄 MEGA mode — 1 Sonnet run for all 4 axes (saves ~70% time)</strong>
      </summary>
      <div class="dd0-mega-body">
        <p class="dd0-help-small">Copy this single prompt → run once in Sonnet → paste the response below → click "Split into A/B/C/D". The 4 groups fill automatically and you click Synthesize.</p>

        <button class="dd0-prompt-toggle" data-mega-show>📋 Show MEGA prompt</button>
        <pre id="dd0-prompt-MEGA" class="dd0-prompt" style="display:none">${dd0EscapeHtml(promptText)}</pre>

        <label style="display:block; margin-top:10px; font-size:13px; font-weight:600">Paste Sonnet's MEGA response here:</label>
        <textarea id="dd0-text-MEGA" class="dd0-textarea" rows="8" placeholder="Paste the entire mega response (with ===SECTION A===, ===SECTION B===, etc. separators)..."></textarea>

        <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
          <button class="bw-btn bw-btn-primary" id="dd0-mega-split">✂️ Split into A/B/C/D</button>
          <span id="dd0-mega-status" class="dd0-help-small"></span>
        </div>
      </div>
    </details>
  `;
}

// Disabled when ALL 4 textareas are empty — synthesizing on empty research only
// produces stale defaults that look like real recommendations and confuse the user.
// (Synthesize click parses on the fly, so we check raw text length, not parsed count.)
function dd0RenderSynthesizeButtonHtml(idea) {
  const hasAny = ['A','B','C','D'].some(L => (idea['group' + L + 'Text'] || '').trim().length > 50);
  if (!hasAny) {
    return `<button class="bw-btn bw-btn-primary" id="dd0-synthesize" disabled title="Paste research findings in at least one group above first. Synthesizing without books only produces generic defaults.">🧪 Synthesize cluster — needs research</button>`;
  }
  return `<button class="bw-btn bw-btn-primary" id="dd0-synthesize">🧪 Synthesize cluster</button>`;
}

function dd0RenderGroupBoxHtml(letter, title, text, parsed, idea) {
  const safeText = dd0EscapeHtml(text || '');
  const promptId = 'dd0-prompt-' + letter;
  const taId = 'dd0-text-' + letter;
  const parsedSummary = parsed
    ? `<span class="dd0-parsed-ok">✓ Parsed ${parsed.books.length} book(s)${parsed.warnings && parsed.warnings.length ? ' · ' + parsed.warnings.join(' · ') : ''}</span>`
    : '<span class="dd0-parsed-empty">— not parsed yet —</span>';
  const dynamicPrompt = dd0BuildPrompt(letter, idea);
  return `
    <div class="dd0-group">
      <div class="dd0-group-head">
        <strong>${title}</strong>
        <button class="dd0-prompt-toggle" data-target="${promptId}">📋 Show research brief</button>
      </div>
      <pre class="dd0-prompt" id="${promptId}" style="display:none">${dd0EscapeHtml(dynamicPrompt)}</pre>
      <textarea id="${taId}" class="dd0-textarea" placeholder="Paste research findings here…">${safeText}</textarea>
      <div class="dd0-parse-row">
        <button class="bw-btn bw-btn-ghost" data-parse="${letter}">Parse this group</button>
        ${parsedSummary}
      </div>
    </div>
  `;
}

function dd0WireDifferentiatorBlock(idea) {
  function refresh() {
    const fresh = biGet(idea.id) || idea;
    const block = document.getElementById('dd0-diff-block');
    if (!block) return;
    block.innerHTML = dd0RenderDifferentiatorBlockHtml(fresh);
    dd0WireDifferentiatorBlock(fresh);
    // Refresh prompts so Group A/B context blocks reflect the new differentiator selection
    dd0RefreshPrompts(fresh);
  }
  function persist(arr) {
    const fresh = biGet(idea.id) || idea;
    fresh.differentiators = arr;
    biUpsert(fresh);
  }

  // Toggle a chip: add if missing, remove if present
  document.querySelectorAll('.dd0-chip[data-diff-toggle]').forEach(btn => {
    btn.onclick = () => {
      const fresh = biGet(idea.id) || idea;
      const sel = Array.isArray(fresh.differentiators) ? fresh.differentiators.slice() : [];
      const label = btn.dataset.diffToggle;
      const i = sel.indexOf(label);
      if (i >= 0) sel.splice(i, 1); else sel.push(label);
      persist(sel);
      refresh();
    };
  });

  // Remove a tag via "×"
  document.querySelectorAll('[data-tag-remove]').forEach(btn => {
    btn.onclick = () => {
      const fresh = biGet(idea.id) || idea;
      const sel = (fresh.differentiators || []).filter(s => s !== btn.dataset.tagRemove);
      persist(sel);
      refresh();
    };
  });

  // Custom input — Enter adds to list
  const custom = document.getElementById('dd0-diff-custom');
  if (custom) {
    custom.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const val = custom.value.trim();
      if (!val) return;
      const fresh = biGet(idea.id) || idea;
      const sel = Array.isArray(fresh.differentiators) ? fresh.differentiators.slice() : [];
      if (!sel.includes(val)) sel.push(val);
      persist(sel);
      custom.value = '';
      refresh();
    });
  }

}

function dd0RenderNichePickerHtml(currentNiche) {
  const cat = window.RI_NICHE_CATALOG || [];
  const groups = { hot: [], evergreen: [], underserved: [] };
  cat.forEach(n => { if (groups[n.category]) groups[n.category].push(n); });
  const labels = { hot: '🔥 Hot 2026', evergreen: '📈 Evergreen', underserved: '💡 Underserved' };
  const groupHtml = Object.keys(groups).map(g => groups[g].length ? `
    <optgroup label="${labels[g]}">
      ${groups[g].map(n => `<option value="${dd0EscapeHtml(n.id)}" ${n.id === currentNiche ? 'selected' : ''}>${dd0EscapeHtml(n.label)} · ${dd0EscapeHtml(n.priceRange)}</option>`).join('')}
    </optgroup>` : '').join('');
  const sel = cat.find(n => n.id === currentNiche);
  const infoHtml = sel ? `
    <div class="dd0-niche-info">
      <div><strong>Why:</strong> ${dd0EscapeHtml(sel.why)}</div>
      <div><strong>Top competitors:</strong> ${dd0EscapeHtml(sel.competitors)}</div>
      <div><strong>Seasonality:</strong> ${dd0EscapeHtml(sel.seasonality)} · <strong>Difficulty:</strong> ${dd0EscapeHtml(sel.difficulty)}</div>
    </div>` : `<div class="dd0-niche-info dd0-niche-info-empty">Pick a niche to see strategic context.</div>`;
  return `
    <div class="dd0-field dd0-field-wide" style="margin-bottom:14px">
      <label>Niche <small style="color:var(--text-muted)">— curated from KDP research 2026 (not live API)</small></label>
      <select id="dd0-niche">
        <option value="">— Pick a niche —</option>
        ${groupHtml}
      </select>
      <div id="dd0-niche-info-host">${infoHtml}</div>
    </div>
  `;
}

function dd0RenderDifferentiatorBlockHtml(idea) {
  const selected = Array.isArray(idea.differentiators) ? idea.differentiators : [];
  const niche = idea.niche || '';
  const patterns = window.RI_DIFFERENTIATOR_PATTERNS || [];
  const baseNiche = niche.split(':')[0];
  const filtered = patterns.filter(p => p.niches === 'all' || (Array.isArray(p.niches) && p.niches.includes(baseNiche)));
  const showList = filtered.length ? filtered : patterns.slice(0, 12);
  const tagsHtml = selected.length
    ? selected.map(s => `<span class="dd0-tag">${dd0EscapeHtml(s)}<button type="button" data-tag-remove="${dd0EscapeHtml(s)}" title="Remove">×</button></span>`).join('')
    : '<span class="dd0-tag-empty">No differentiators picked yet</span>';
  const chipsHtml = showList.map(p => {
    const isSel = selected.includes(p.label);
    return `<button type="button" class="dd0-chip ${isSel ? 'is-selected' : ''}" data-diff-toggle="${dd0EscapeHtml(p.label)}" title="${dd0EscapeHtml(p.why)}">${isSel ? '✓ ' : ''}${dd0EscapeHtml(p.label)}</button>`;
  }).join('');
  return `
    <div class="dd0-tags-host">${tagsHtml}</div>
    <input type="text" id="dd0-diff-custom" class="dd0-custom-input" placeholder="+ Custom differentiator (press Enter to add)" />
    <div class="dd0-chip-row dd0-chip-row-wrap">
      <small class="dd0-chip-row-label">${niche ? `💡 Top ${showList.length} for <strong>${dd0EscapeHtml(niche)}</strong> (click to toggle):` : '💡 Pick a niche above to see filtered suggestions:'}</small>
      ${chipsHtml}
    </div>
  `;
}

function dd0WireStage0(idea) {
  // Differentiator multi-select: chip toggles + tag removes + custom add
  dd0WireDifferentiatorBlock(idea);

  // Niche dropdown — full reset of every niche-dependent field.
  // What's niche-dependent: pasted research (A/B/C/D text + parsed), selected differentiators
  // from the curated chip catalog (custom-typed ones survive — user intent), synthesis output.
  const nicheEl = document.getElementById('dd0-niche');
  if (nicheEl) {
    nicheEl.addEventListener('change', () => {
      const fresh = biGet(idea.id) || idea;
      const prevNiche = fresh.niche || '';
      const newNiche = nicheEl.value;
      const isSwitch = prevNiche && newNiche && prevNiche !== newNiche;

      if (isSwitch) {
        const counts = dd0ClearNicheDependentState(fresh);
        if (typeof bwToast === 'function') {
          const parts = [];
          if (counts.research) parts.push(`${counts.research} research blocks`);
          if (counts.diffs) parts.push(`${counts.diffs} differentiators`);
          if (counts.synthesis) parts.push('synthesis');
          if (counts.decisions) parts.push('decisions');
          bwToast(parts.length ? `Niche changed → reset ${parts.join(', ')}` : 'Niche changed — fresh start');
        }
      }

      fresh.niche = newNiche;
      biUpsert(fresh);
      // Single re-render — all niche-dependent UI rebuilds from current state
      dd0Render();
    });
  }

  // Toggle prompt visibility — handles both group prompts (data-target) and the
  // MEGA prompt (data-mega-show toggle).
  document.querySelectorAll('.dd0-prompt-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target || (btn.hasAttribute('data-mega-show') ? 'dd0-prompt-MEGA' : null);
      if (!targetId) return;
      const tgt = document.getElementById(targetId);
      if (!tgt) return;
      const showing = tgt.style.display !== 'none';
      tgt.style.display = showing ? 'none' : 'block';
      const isMega = targetId === 'dd0-prompt-MEGA';
      const label = isMega ? 'MEGA prompt' : 'research brief';
      btn.textContent = showing ? `📋 Show ${label}` : `📋 Hide ${label}`;
      if (!showing) {
        navigator.clipboard?.writeText(tgt.textContent).then(() => {
          if (typeof bwToast === 'function') bwToast(`${isMega ? 'MEGA prompt' : 'Research brief'} copied to clipboard`);
        });
      }
    });
  });

  // MEGA Split button — parses pasted text into 4 groups, fills textareas, parses each.
  const splitBtn = document.getElementById('dd0-mega-split');
  if (splitBtn) {
    splitBtn.addEventListener('click', () => {
      const ta = document.getElementById('dd0-text-MEGA');
      const status = document.getElementById('dd0-mega-status');
      if (!ta || !ta.value.trim()) {
        if (status) status.textContent = '⚠️ Paste the MEGA response first';
        return;
      }
      const split = dd0SplitMegaResponse(ta.value);
      const fresh = biGet(idea.id) || idea;
      const filled = [];
      ['A','B','C','D'].forEach(L => {
        if (split[L] && split[L].trim().length > 30) {
          fresh['group' + L + 'Text'] = split[L];
          // Parse immediately
          const parser = ({ A: bwParseVisualGroup, B: bwParseMarketingGroup, C: bwParseReceptionGroup, D: bwParseInteriorGroup })[L];
          fresh['group' + L + 'Parsed'] = parser(split[L]);
          filled.push(L);
        }
      });
      biUpsert(fresh);
      if (filled.length === 0) {
        if (status) status.textContent = '❌ No sections detected. Make sure response uses ===SECTION A=== separators.';
        return;
      }
      if (status) status.textContent = `✓ Split + parsed sections: ${filled.join(', ')}`;
      if (typeof bwToast === 'function') bwToast(`✓ Filled ${filled.length} groups (${filled.join(', ')})`);
      // Re-render Stage 0 to populate the textareas + parse summaries + enable Synthesize
      dd0Render();
    });
  }

  // Save textareas on blur — also refresh the Synthesize button state since
  // its disabled/enabled depends on whether any group has content.
  ['A','B','C','D'].forEach(letter => {
    const ta = document.getElementById('dd0-text-' + letter);
    if (!ta) return;
    ta.addEventListener('blur', () => {
      const fresh = biGet(idea.id) || idea;
      fresh['group' + letter + 'Text'] = ta.value;
      biUpsert(fresh);
      // Re-render Synthesize button in place (text changed → button state may flip)
      const btn = document.getElementById('dd0-synthesize');
      if (btn) {
        const wrapper = btn.parentElement;
        if (wrapper) {
          const newHtml = dd0RenderSynthesizeButtonHtml(fresh);
          btn.outerHTML = newHtml;
          // Re-wire click handler since outerHTML replaces the node
          const newBtn = document.getElementById('dd0-synthesize');
          if (newBtn && !newBtn.disabled) {
            newBtn.addEventListener('click', () => dd0HandleSynthesize(fresh));
          }
        }
      }
    });
    // Also listen on input for live update (don't wait for blur)
    ta.addEventListener('input', () => {
      const btn = document.getElementById('dd0-synthesize');
      if (!btn) return;
      const hasAny = ta.value.trim().length > 50 || ['A','B','C','D'].some(L => {
        if (L === letter) return false;
        const otherTa = document.getElementById('dd0-text-' + L);
        return otherTa && otherTa.value.trim().length > 50;
      });
      if (hasAny && btn.disabled) {
        btn.disabled = false;
        btn.textContent = '🧪 Synthesize cluster';
        btn.removeAttribute('title');
      }
    });
  });

  // Per-group parse button
  document.querySelectorAll('[data-parse]').forEach(btn => {
    btn.addEventListener('click', () => {
      const letter = btn.dataset.parse;
      const fresh = biGet(idea.id) || idea;
      const text = document.getElementById('dd0-text-' + letter).value;
      fresh['group' + letter + 'Text'] = text;
      const parser = ({ A: bwParseVisualGroup, B: bwParseMarketingGroup, C: bwParseReceptionGroup, D: bwParseInteriorGroup })[letter];
      fresh['group' + letter + 'Parsed'] = parser(text);
      biUpsert(fresh);
      dd0Render();
    });
  });

  // Save draft
  document.getElementById('dd0-save-draft').addEventListener('click', () => {
    const fresh = biGet(idea.id) || idea;
    fresh.niche = document.getElementById('dd0-niche').value.trim();
    ['A','B','C','D'].forEach(letter => {
      fresh['group' + letter + 'Text'] = document.getElementById('dd0-text-' + letter).value;
    });
    biUpsert(fresh);
    if (typeof bwToast === 'function') bwToast('💾 Draft saved');
  });

  // Synthesize
  const synthBtn = document.getElementById('dd0-synthesize');
  if (synthBtn && !synthBtn.disabled) {
    synthBtn.addEventListener('click', () => dd0HandleSynthesize(idea));
  }
}

function dd0HandleSynthesize(idea) {
  const fresh = biGet(idea.id) || idea;
  // Pull latest values from UI
  const nicheEl = document.getElementById('dd0-niche');
  if (nicheEl) fresh.niche = nicheEl.value.trim();
  ['A','B','C','D'].forEach(letter => {
    const ta = document.getElementById('dd0-text-' + letter);
    if (ta) fresh['group' + letter + 'Text'] = ta.value;
  });
  // Parse each group
  fresh.groupAParsed = bwParseVisualGroup(fresh.groupAText);
  fresh.groupBParsed = bwParseMarketingGroup(fresh.groupBText);
  fresh.groupCParsed = bwParseReceptionGroup(fresh.groupCText);
  fresh.groupDParsed = bwParseInteriorGroup(fresh.groupDText);
  // Synthesize
  fresh.synthesis = bwSynthesizeAll({
    groupA: fresh.groupAParsed,
    groupB: fresh.groupBParsed,
    groupC: fresh.groupCParsed,
    groupD: fresh.groupDParsed,
    niche: fresh.niche,
    differentiators: fresh.differentiators || []
  });
  fresh.status = 'synthesized';
  // Initialize decisions with defaults so the dashboard fills cleanly
  fresh.decisions = fresh.decisions || {};
  if (!fresh.decisions.selectedTitle) fresh.decisions.selectedTitle = fresh.synthesis.decisions.titleProposals[0];
  if (!fresh.decisions.subtitle) fresh.decisions.subtitle = fresh.synthesis.decisions.defaultSubtitle;
  if (!fresh.decisions.description) fresh.decisions.description = fresh.synthesis.decisions.description;
  if (fresh.decisions.paperbackPrice == null) fresh.decisions.paperbackPrice = fresh.synthesis.decisions.recommendedPriceP;
  if (fresh.decisions.hardcoverPrice == null) fresh.decisions.hardcoverPrice = fresh.synthesis.decisions.recommendedPriceH;
  if (fresh.decisions.hardcoverEnabled == null) fresh.decisions.hardcoverEnabled = fresh.synthesis.decisions.enableHardcover;
  if (fresh.decisions.pageCount == null) fresh.decisions.pageCount = fresh.synthesis.decisions.targetPages;
  if (!fresh.decisions.categories) fresh.decisions.categories = (fresh.synthesis.decisions.categories || []).slice(0, 3);
  if (!fresh.decisions.keywords) fresh.decisions.keywords = (fresh.synthesis.decisions.keywords || []).slice(0, 7);
  if (!fresh.decisions.coverPrompt) fresh.decisions.coverPrompt = fresh.synthesis.decisions.coverPrompt;
  if (!fresh.decisions.interiorRec) fresh.decisions.interiorRec = { ...(fresh.synthesis.decisions.interiorRec || {}) };
  biUpsert(fresh);
  dd0Render();
  if (typeof bwToast === 'function') bwToast('✓ Cluster synthesized');
  setTimeout(() => {
    const dash = document.getElementById('dd0-dashboard');
    if (dash) dash.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ====================== DECISION DASHBOARD ======================

function dd0RenderDashboardHtml(idea) {
  const s = idea.synthesis;
  const d = idea.decisions || {};
  const v = s.visual; const m = s.marketing; const r = s.reception; const it = s.interior;
  const palette = [v.dominantColor, ...v.accentColors].filter(Boolean);
  const swatches = palette.map(c => `<span class="dd0-swatch" style="background:${dd0SafeColor(c)}" title="${dd0EscapeHtml(c)}">${dd0EscapeHtml(c)}</span>`).join('');
  const elements = (v.commonElements || []).map(e => `<li>${dd0EscapeHtml(e.name)} <small>(${e.presence}/${e.ofTotal})</small></li>`).join('');
  const titleOptions = (s.decisions.titleProposals || []).map((t, i) => `
    <label class="dd0-radio-row">
      <input type="radio" name="dd0-title" value="${dd0EscapeHtml(t)}" ${d.selectedTitle === t ? 'checked' : ''} />
      <span>${dd0EscapeHtml(t)}</span>
    </label>
  `).join('');
  const isCustom = d.selectedTitle && !s.decisions.titleProposals.includes(d.selectedTitle);
  const customTitleVal = isCustom ? d.selectedTitle : '';
  const cats = (d.categories || []).slice(0, 3);
  const kws = (d.keywords || []).slice(0, 7);
  const irec = d.interiorRec || {};
  const warnings = (s.warnings || []).map(w => `<li>${dd0EscapeHtml(w)}</li>`).join('');

  return `
    <div class="dd0-card" id="dd0-dashboard">
      <div class="dd0-card-title">🎯 Decision Dashboard — Finalize your book</div>
      ${warnings ? `<ul class="dd0-warnings">${warnings}</ul>` : ''}

      <div class="dd0-decision">
        <h4>🎨 Cover direction <small>(from Group A · ${v.booksCount} books)</small></h4>
        <div class="dd0-palette-row">${swatches || '<em>No palette extracted</em>'}</div>
        <div><strong>Typography:</strong> ${dd0EscapeHtml(v.typography || '—')}</div>
        ${elements ? `<div><strong>Common elements:</strong><ul class="dd0-inline-list">${elements}</ul></div>` : ''}
        <label>OpenArt prompt (editable):</label>
        <textarea id="dd0-d-coverPrompt" class="dd0-textarea-sm">${dd0EscapeHtml(d.coverPrompt || s.decisions.coverPrompt)}</textarea>
      </div>

      <div class="dd0-decision">
        <h4>📝 Title <small>(pick one or write your own)</small></h4>
        ${titleOptions}
        <label class="dd0-radio-row">
          <input type="radio" name="dd0-title" value="__custom__" ${isCustom ? 'checked' : ''} />
          <input type="text" id="dd0-title-custom" placeholder="Custom title…" value="${dd0EscapeHtml(customTitleVal)}" />
        </label>
      </div>

      <div class="dd0-decision">
        <h4>📝 Subtitle</h4>
        <textarea id="dd0-d-subtitle" class="dd0-textarea-sm">${dd0EscapeHtml(d.subtitle || s.decisions.defaultSubtitle)}</textarea>
      </div>

      <div class="dd0-decision">
        <h4>📝 Description</h4>
        <textarea id="dd0-d-description" class="dd0-textarea">${dd0EscapeHtml(d.description || s.decisions.description)}</textarea>
      </div>

      <div class="dd0-decision dd0-row">
        <div class="dd0-half">
          <h4>💰 Pricing <small>(median from Group C)</small></h4>
          <label>Paperback ($)</label>
          <input type="number" step="0.01" id="dd0-d-priceP" value="${d.paperbackPrice ?? s.decisions.recommendedPriceP}" />
          <label class="dd0-checkbox-row">
            <input type="checkbox" id="dd0-d-hcEnabled" ${(d.hardcoverEnabled ?? s.decisions.enableHardcover) ? 'checked' : ''} />
            <span>Enable hardcover</span>
          </label>
          <label>Hardcover ($)</label>
          <input type="number" step="0.01" id="dd0-d-priceH" value="${d.hardcoverPrice ?? s.decisions.recommendedPriceH}" />
        </div>
        <div class="dd0-half">
          <h4>📄 Page count <small>(median ${r.medianPages || '—'})</small></h4>
          <input type="number" id="dd0-d-pages" value="${d.pageCount ?? s.decisions.targetPages}" />
        </div>
      </div>

      <div class="dd0-decision">
        <h4>🏷️ Categories <small>(top 3 from Group C)</small></h4>
        ${[0,1,2].map(i => `<input type="text" data-cat="${i}" class="dd0-cat-input" value="${dd0EscapeHtml(cats[i] || '')}" placeholder="Category ${i+1}" />`).join('')}
      </div>

      <div class="dd0-decision">
        <h4>🔑 Keywords <small>(7 backend keywords)</small></h4>
        <div class="dd0-kw-grid">
          ${[0,1,2,3,4,5,6].map(i => `<input type="text" data-kw="${i}" value="${dd0EscapeHtml(kws[i] || '')}" placeholder="kw ${i+1}" />`).join('')}
        </div>
      </div>

      <div class="dd0-decision">
        <h4>🔧 Interior execution <small>(from Group D · ${it.booksCount} books)</small></h4>
        <label>Font size</label>
        <select id="dd0-d-fontSize">
          ${['large','medium','small'].map(o => `<option value="${o}" ${(irec.fontSize || s.decisions.interiorRec.fontSize) === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
        <label>Items per page</label>
        <select id="dd0-d-items">
          ${['1','2','grid'].map(o => `<option value="${o}" ${(irec.itemsPerPage || s.decisions.interiorRec.itemsPerPage) === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
        <label class="dd0-checkbox-row"><input type="checkbox" id="dd0-d-howTo" ${(irec.addHowToUse ?? s.decisions.interiorRec.addHowToUse) ? 'checked' : ''} /> Add "How to use" page</label>
        <label class="dd0-checkbox-row"><input type="checkbox" id="dd0-d-bio" ${(irec.addAuthorBio ?? s.decisions.interiorRec.addAuthorBio) ? 'checked' : ''} /> Add author bio page</label>
        <label class="dd0-checkbox-row"><input type="checkbox" id="dd0-d-promo" ${(irec.addCrossPromo ?? s.decisions.interiorRec.addCrossPromo) ? 'checked' : ''} /> Add "more in this series" cross-promo</label>
        <label class="dd0-checkbox-row"><input type="checkbox" id="dd0-d-solGroup" ${(irec.solutionsGrouped ?? s.decisions.interiorRec.solutionsGrouped) ? 'checked' : ''} /> Group solutions by puzzle type (vs page order)</label>
      </div>

      <div class="dd0-decision">
        <h4>⚠️ Pain points to AVOID <small>(clustered from Group C 1-3⭐)</small></h4>
        <ul>${(s.decisions.painPoints || []).map(p => `<li>${dd0EscapeHtml(p)}</li>`).join('') || '<li><em>None detected</em></li>'}</ul>
        <h4>✅ Praise themes <small>(clustered from Group C 5⭐)</small></h4>
        <ul>${(s.decisions.praisePatterns || []).map(p => `<li>${dd0EscapeHtml(p)}</li>`).join('') || '<li><em>None detected</em></li>'}</ul>
      </div>

      <div class="dd0-actions dd0-actions-final">
        <button class="bw-btn bw-btn-ghost" id="dd0-d-save">💾 Save decisions</button>
        <button class="bw-btn bw-btn-primary" id="dd0-d-apply">🚀 Apply all → fills Stages 1-6</button>
      </div>
    </div>
  `;
}

function dd0SafeColor(name) {
  if (!name) return '#888';
  if (/^#?[0-9a-f]{3,8}$/i.test(name)) return name.startsWith('#') ? name : '#' + name;
  // Map common color names to safe hex
  const map = {
    teal:'#319795', cyan:'#00B5D8', cream:'#F5E6D3', ochre:'#C8602F', red:'#E63946',
    blue:'#2B6CB0', yellow:'#FFD93D', green:'#4ECDC4', pink:'#FF6B9D', purple:'#7E57C2',
    black:'#1A1A2E', white:'#FAFAFA', orange:'#F1A33E', gray:'#888', grey:'#888',
    brown:'#8B6F47', beige:'#E8D5B7', sage:'#A8B89A', neon:'#00F0FF', gold:'#D4A574'
  };
  return map[String(name).toLowerCase()] || name;
}

function dd0CollectDecisions() {
  const titleRadios = document.getElementsByName('dd0-title');
  let selectedTitle = '';
  for (const r of titleRadios) {
    if (r.checked) {
      selectedTitle = r.value === '__custom__'
        ? (document.getElementById('dd0-title-custom').value.trim() || '')
        : r.value;
      break;
    }
  }
  const cats = Array.from(document.querySelectorAll('[data-cat]')).map(i => i.value.trim()).filter(Boolean);
  const kws = Array.from(document.querySelectorAll('[data-kw]')).map(i => i.value.trim());
  return {
    selectedTitle,
    subtitle: document.getElementById('dd0-d-subtitle').value.trim(),
    description: document.getElementById('dd0-d-description').value,
    paperbackPrice: parseFloat(document.getElementById('dd0-d-priceP').value) || null,
    hardcoverEnabled: document.getElementById('dd0-d-hcEnabled').checked,
    hardcoverPrice: parseFloat(document.getElementById('dd0-d-priceH').value) || null,
    pageCount: parseInt(document.getElementById('dd0-d-pages').value) || null,
    categories: cats,
    keywords: kws,
    coverPrompt: document.getElementById('dd0-d-coverPrompt').value.trim(),
    interiorRec: {
      fontSize: document.getElementById('dd0-d-fontSize').value,
      itemsPerPage: document.getElementById('dd0-d-items').value,
      addHowToUse: document.getElementById('dd0-d-howTo').checked,
      addAuthorBio: document.getElementById('dd0-d-bio').checked,
      addCrossPromo: document.getElementById('dd0-d-promo').checked,
      solutionsGrouped: document.getElementById('dd0-d-solGroup').checked
    }
  };
}

function dd0WireDashboard(idea) {
  document.getElementById('dd0-d-save').addEventListener('click', () => {
    const fresh = biGet(idea.id) || idea;
    fresh.decisions = dd0CollectDecisions();
    biUpsert(fresh);
    if (typeof bwToast === 'function') bwToast('💾 Decisions saved');
  });

  document.getElementById('dd0-d-apply').addEventListener('click', () => {
    const fresh = biGet(idea.id) || idea;
    fresh.decisions = dd0CollectDecisions();
    if (!fresh.decisions.selectedTitle) {
      alert('Please select or write a title before applying.');
      return;
    }
    // Create or update wizard project
    let project;
    if (fresh.projectId && typeof bwLoadAll === 'function') {
      project = bwLoadAll().list.find(p => p.id === fresh.projectId);
    }
    if (!project && typeof bwCreateProject === 'function') {
      const niche = (fresh.niche || 'variety-puzzle:for-teens');
      const [base, sub] = niche.split(':');
      project = bwCreateProject(fresh.decisions.selectedTitle, base || 'variety-puzzle', sub || 'for-teens');
      fresh.projectId = project.id;
    }
    if (!project) {
      alert('Wizard not loaded — cannot apply.');
      return;
    }
    bwApplyClusterToProject(project, fresh.synthesis, fresh.decisions);
    fresh.status = 'applied';
    biUpsert(fresh);
    if (typeof bwSetActiveId === 'function') bwSetActiveId(project.id);
    if (typeof bwGetActive === 'function') {
      window.bwCurrentProject = bwGetActive();
      window.bwCurrentProject.currentStage = 1;
      bwUpsert(window.bwCurrentProject);
      if (typeof bwRender === 'function') bwRender();
    }
    if (typeof bwToast === 'function') bwToast('✅ Applied — review Stage 1 to set authors, then continue forward');
    // Scroll to wizard
    const wizard = document.getElementById('bw-app');
    if (wizard) wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (typeof window !== 'undefined') {
  window.dd0Mount = dd0Mount;
  window.dd0Render = dd0Render;
}
