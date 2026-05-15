// Book Compile — KDP-ready PDF end-to-end orchestrator.
// Combines frontmatter + section dividers (uploaded images) + puzzle pages (legacy generators)
// + solutions + back-matter in ONE PDF respecting KDP 2026 layout, bleed, and margins.
// Asset storage: project.assets[slotId] = { dataUrl, type, uploadedAt }

// ====================== CONSTANTS ======================

const BC_DPI = 300;
const BC_BLEED = 9;        // 0.125" en points (72pt = 1in)

// Paper thickness para spine width calc (KDP oficial)
const BC_PAPER_THICKNESS = {
  white: 0.002252,    // 60# white
  cream: 0.0025,      // 55# cream (default puzzle books)
};

// Trim sizes en pulgadas (matchea con BW_TRIM_SIZES)
const BC_TRIMS_IN = {
  '5x8':       [5, 8],
  '5.25x8':    [5.25, 8],
  '5.5x8.5':   [5.5, 8.5],
  '6x9':       [6, 9],
  '6.14x9.21': [6.14, 9.21],
  '6.69x9.61': [6.69, 9.61],
  '7x10':      [7, 10],
  '7.44x9.69': [7.44, 9.69],
  '7.5x9.25':  [7.5, 9.25],
  '8x10':      [8, 10],
  '8.25x6':    [8.25, 6],
  '8.25x11':   [8.25, 11],   // hardcover-friendly
  '8.5x8.5':   [8.5, 8.5],
  'letter':    [8.5, 11],
};

// Inches → points
function bcIn(inches) { return inches * 72; }

// Trim in points
function bcGetTrimPts(trimId) {
  const [w, h] = BC_TRIMS_IN[trimId] || BC_TRIMS_IN['6x9'];
  return [bcIn(w), bcIn(h)];
}

// Inside margin mínimo según pgs (KDP rules)
function bcMinInsideMargin(pageCount) {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.5;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.75;
  return 0.875;
}

// ====================== ASSET HELPERS ======================

// Slots posibles (catálogo extendido cuando agreguemos otros nichos)
const BC_ASSET_SLOTS = {
  'cover-front':       { label: 'Cover front', required: true,  desc: 'Front cover (300 DPI with bleed)' },
  'cover-back':        { label: 'Cover back',  required: false, desc: 'Back cover (optional, can be color + text only)' },
  'welcome':           { label: 'Welcome page', required: false, desc: 'Welcome page' },
  'quote':             { label: 'Quote page',  required: false, desc: 'Quote/inspiration page mid-book' },
  'solutions-divider': { label: 'Solutions divider', required: false, desc: 'Divider before solutions section' },
  // Section dividers generated dynamically: section-divider-{sectionIdx}
  // Corner ornaments generated: corner-ornament-{sectionIdx} or corner-ornament (if global treatment)
};

// Returns slots the project needs based on sections + page treatment
function bcGetRequiredSlots(project) {
  const slots = [
    { id: 'cover-front', ...BC_ASSET_SLOTS['cover-front'] },
    { id: 'cover-back',  ...BC_ASSET_SLOTS['cover-back'] },
    { id: 'welcome',     ...BC_ASSET_SLOTS['welcome'] },
  ];
  (project.content?.sections || []).forEach((s, i) => {
    slots.push({
      id: `section-divider-${i}`,
      label: `${s.name} — divider`,
      required: false,
      desc: `Full-page divider for section "${s.name}"`,
    });
  });
  // Page treatment corner ornaments
  const treat = project.technical?.pageTreatment;
  if (treat === 'corner-ornaments') {
    slots.push({ id: 'corner-ornament', label: 'Corner ornament (global)', required: false, desc: 'Top corner ornament — reused across all puzzle pages' });
  } else if (treat === 'corner-ornaments-per-section') {
    (project.content?.sections || []).forEach((s, i) => {
      slots.push({ id: `corner-ornament-${i}`, label: `${s.name} — ornament`, required: false, desc: 'Corner ornament for this section' });
    });
  }
  slots.push({ id: 'quote', ...BC_ASSET_SLOTS['quote'] });
  slots.push({ id: 'solutions-divider', ...BC_ASSET_SLOTS['solutions-divider'] });
  return slots;
}

// Read asset by id
function bcGetAsset(project, slotId) {
  return project.assets?.[slotId]?.dataUrl || null;
}

// Compress image on upload: max width = trim.width @ 300DPI with bleed, JPEG q=0.85
async function bcProcessUploadedImage(file, trimId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const [tw, th] = bcGetTrimPts(trimId || '6x9');
        // Target: inches × 300 dpi (with extra bleed)
        const wIn = (tw + BC_BLEED * 2) / 72;
        const hIn = (th + BC_BLEED * 2) / 72;
        const targetW = Math.min(img.width, Math.round(wIn * BC_DPI));
        const targetH = Math.min(img.height, Math.round(hIn * BC_DPI));
        const scale = Math.min(targetW / img.width, targetH / img.height, 1);
        const finalW = Math.round(img.width * scale);
        const finalH = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalW, finalH);
        ctx.drawImage(img, 0, 0, finalW, finalH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({ dataUrl, width: finalW, height: finalH, sizeKB: Math.round(dataUrl.length / 1024 * 0.75) });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Save asset to project. With cloud sync available, uploads the binary to
// Supabase Storage and stores `{ url, dataUrl (in-memory), width, height, ...}`
// in the project — only the URL is persisted to the cloud DB (cs.upsertProject
// strips dataUrl before sending). Without cloud (offline), falls back to the
// pure-base64 path which lives in localStorage as before.
//
// Returns true on success. Returns false on localStorage quota error (caller
// should display a warning and the in-memory state is rolled back).
function bcSaveAsset(project, slotId, processed) {
  if (!project.assets) project.assets = {};
  const previousAsset = project.assets[slotId];  // for rollback
  project.assets[slotId] = {
    dataUrl: processed.dataUrl,
    width: processed.width,
    height: processed.height,
    sizeKB: processed.sizeKB,
    uploadedAt: new Date().toISOString(),
  };
  const ok = bwUpsert(project);
  if (!ok) {
    if (previousAsset) project.assets[slotId] = previousAsset;
    else delete project.assets[slotId];
    return false;
  }
  // Fire-and-forget cloud upload. dataUrl stays in memory for compile/UI.
  if (window.cs && window.cs.isReady()) {
    window.cs.uploadAsset(project.id, slotId, processed.dataUrl, 'image/jpeg')
      .then((url) => {
        // Patch the asset with the canonical URL so other devices can fetch it.
        if (project.assets[slotId]) {
          project.assets[slotId].url = url;
          bwUpsert(project); // re-sync now that we have the URL
        }
      })
      .catch((err) => {
        console.warn(`[cloud] Asset upload failed for ${slotId}:`, err.message);
        // dataUrl is still saved locally — compile still works on this device.
      });
  }
  return true;
}

function bcRemoveAsset(project, slotId) {
  if (!project.assets) return;
  const wasCloud = !!project.assets[slotId]?.url;
  delete project.assets[slotId];
  bwUpsert(project);
  if (wasCloud && window.cs) {
    window.cs.deleteAsset(project.id, slotId).catch(() => { /* best-effort */ });
  }
}

// ====================== PAGE HELPERS ======================

// Draw full-page image with bleed (cover dividers, etc.)
function bcDrawFullPageImage(doc, dataUrl, tw, th) {
  if (!dataUrl) return;
  // Full bleed: image covers trim + bleed (jsPDF page dimensions are trim, so we extend)
  doc.addImage(dataUrl, 'JPEG', -BC_BLEED, -BC_BLEED, tw + BC_BLEED * 2, th + BC_BLEED * 2);
}

// Center text horizontally
function bcCenterText(doc, text, y, opts = {}) {
  const tw = doc.internal.pageSize.getWidth();
  doc.text(text, tw / 2, y, { align: 'center', ...opts });
}

// Apply corner ornament to puzzle page (top-right, ~12% page area)
function bcApplyCornerOrnament(doc, dataUrl, tw, th) {
  if (!dataUrl) return;
  const ornSize = bcIn(0.9);  // ~0.9" square
  const x = tw - bcIn(0.4) - ornSize;
  const y = bcIn(0.25);
  try {
    doc.addImage(dataUrl, 'JPEG', x, y, ornSize, ornSize);
  } catch (e) { /* skip on error */ }
}

// ====================== FRONT MATTER ======================

function bcRenderTitlePage(doc, project, tw, th) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, tw, th, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(40, 40, 40);
  bcCenterText(doc, project.marketing?.title || 'Untitled', th / 2 - 30);
  if (project.marketing?.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    bcCenterText(doc, project.marketing.subtitle, th / 2 + 8);
  }
  if (project.series?.name) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    bcCenterText(doc, `${project.series.name} — Volume ${project.series.volume}`, th / 2 + 40);
  }
}

function bcRenderCopyrightPage(doc, project, tw, th) {
  const year = new Date().getFullYear();
  const author = (typeof bwGetAuthorString === 'function' ? bwGetAuthorString(project) : project.positioning?.authorPenName) || 'The Author';
  const imprint = project.positioning?.imprint || '';
  const aiNote = project.compliance?.aiDisclosed
    ? '\n\nAI Content Disclosure: This book contains AI-generated images and/or text. AI tools were used in the creation of cover art and interior illustrations. All puzzle content was generated procedurally.'
    : '';
  const lines = [
    `Copyright © ${year}${author ? ' ' + author : ''}`,
    '',
    'All rights reserved.',
    '',
    'No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews.',
    '',
    imprint ? `Published by ${imprint}` : '',
    '',
    `First Edition, ${year}`,
    aiNote,
  ].filter(Boolean);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const margin = bcIn(0.75);
  let y = bcIn(1.2);
  lines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, tw - margin * 2);
    wrapped.forEach(l => { doc.text(l, margin, y); y += 12; });
  });
}

function bcRenderAIDisclosurePage(doc, project, tw, th) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  bcCenterText(doc, 'About AI in This Book', bcIn(1.2));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const margin = bcIn(0.75);
  const text = `Some illustrations and cover artwork in this book were created with assistance from AI image generation tools, refined and curated by the author.

Puzzle content (word search grids, sudoku boards, math problems, mazes, cryptograms) is generated procedurally and is not AI-generated text.

We believe in transparency about how books are made. If you have questions or concerns, please reach out via the review section.`;
  const lines = doc.splitTextToSize(text, tw - margin * 2);
  let y = bcIn(2);
  lines.forEach(l => { doc.text(l, margin, y); y += 16; });
}

function bcRenderWelcomePage(doc, project, tw, th) {
  const img = bcGetAsset(project, 'welcome');
  if (img) {
    bcDrawFullPageImage(doc, img, tw, th);
  } else {
    // Fallback texto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    bcCenterText(doc, 'Welcome', th / 2 - 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    const tagline = project.marketing?.subtitle || 'Time to outsmart boredom.';
    bcCenterText(doc, tagline, th / 2 + 10);
  }
}

// ====================== SECTION DIVIDER ======================

function bcRenderSectionDivider(doc, project, section, sectionIdx, tw, th) {
  const img = bcGetAsset(project, `section-divider-${sectionIdx}`);
  if (img) {
    bcDrawFullPageImage(doc, img, tw, th);
  } else {
    // Fallback estilizado
    doc.setFillColor(245, 240, 230);
    doc.rect(0, 0, tw, th, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(40, 40, 40);
    bcCenterText(doc, section.name.toUpperCase(), th / 2 - 20);
    if (section.tagline) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(13);
      bcCenterText(doc, section.tagline, th / 2 + 20);
    }
  }
}

// ====================== PUZZLE PAGES ======================

// Wrapper that calls appropriate generator by section.type.
// Returns array of puzzles with solutions for use in solutions section.
// opts: { startIdx, renderCount } let the caller render a slice of the section
// (used by mission-arc pacing to interleave puzzles across missions).
async function bcRenderPuzzlesForSection(doc, project, section, sectionIdx, tw, th, opts = {}) {
  const type = section.type || 'word-search';
  const fullCount = section.count || 10;
  const startIdx = Math.max(0, opts.startIdx | 0);
  const renderCount = Math.max(0, Math.min(opts.renderCount ?? (fullCount - startIdx), fullCount - startIdx));
  if (renderCount === 0) return [];
  const count = renderCount; // legacy local name kept below for minimal diff
  const difficulty = section.difficulty || 'medium';
  const margin = bcIn(0.75);
  const ornamentImg = bcGetAsset(project, `corner-ornament-${sectionIdx}`)
    || bcGetAsset(project, 'corner-ornament');

  const puzzles = [];

  if (type === 'word-search' || type === 'wordsearch') {
    const gridSize = section.gridSize || 15;
    const wordsPerPuzzle = Math.floor(gridSize * 0.8);
    // Rotate themes for variety across puzzles. Section can specify a list via section.themes
    const rotateThemes = section.themes && section.themes.length ? section.themes
      : ['animals', 'food', 'nature', 'sports', 'travel', 'science', 'music', 'space', 'ocean'];
    for (let k = 0; k < count; k++) {
      const i = startIdx + k; // global index within the section
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      // Get fresh batch of words per puzzle (avoids buggy slicing of static pool)
      const theme = rotateThemes[i % rotateThemes.length];
      const words = section.words && section.words.length
        ? section.words.slice(0, wordsPerPuzzle)
        : (typeof getWordsForTheme === 'function'
          ? getWordsForTheme(theme, wordsPerPuzzle)
          : ['BRAIN', 'PUZZLE', 'GAME', 'WORD', 'SEARCH', 'FIND', 'SOLVE', 'THINK', 'MIND', 'CLUE']);
      const puzzle = createWordSearchGrid(gridSize, words);
      puzzles.push({ idx: i + 1, type, puzzle, words, theme });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `Puzzle ${i + 1} — ${theme.toUpperCase()}`, margin);
      const gridArea = Math.min(tw - margin * 2, th - margin * 2 - bcIn(2));
      const cellSize = gridArea / gridSize;
      const startX = (tw - gridArea) / 2;
      const startY = margin + bcIn(0.3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          doc.text(puzzle.grid[r][c], startX + c * cellSize + cellSize / 2,
            startY + r * cellSize + cellSize / 2 + 4, { align: 'center' });
        }
      }
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.4);
      for (let i2 = 0; i2 <= gridSize; i2++) {
        doc.line(startX, startY + i2 * cellSize, startX + gridArea, startY + i2 * cellSize);
        doc.line(startX + i2 * cellSize, startY, startX + i2 * cellSize, startY + gridArea);
      }
      // Words to find
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('FIND THESE WORDS:', tw / 2, startY + gridArea + bcIn(0.3), { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const wordsLine = puzzle.placed.join('   ·   ');
      const lines = doc.splitTextToSize(wordsLine, tw - margin * 2);
      let wy = startY + gridArea + bcIn(0.5);
      lines.forEach(l => { doc.text(l, tw / 2, wy, { align: 'center' }); wy += 12; });
    }
  } else if (type === 'sudoku') {
    const perPage = section.perPage || 1;
    const totalPages = Math.ceil(count / perPage);
    let idx = startIdx;
    for (let p = 0; p < totalPages; p++) {
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      const onPage = Math.min(perPage, (startIdx + count) - idx);
      if (perPage === 1) {
        const s = createSudokuPuzzle(difficulty);
        puzzles.push({ idx: idx + 1, type, puzzle: s.puzzle, solution: s.solution });
        const size = Math.min(tw - margin * 2, th - margin * 2 - bcIn(1));
        const sx = (tw - size) / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        bcCenterText(doc, `Puzzle ${idx + 1}`, margin);
        drawSudokuOnPage(doc, s.puzzle, sx, margin + bcIn(0.4), size, 16);
        idx++;
      } else {
        for (let i = 0; i < onPage; i++) {
          const s = createSudokuPuzzle(difficulty);
          puzzles.push({ idx: idx + 1, type, puzzle: s.puzzle, solution: s.solution });
          const size = Math.min(tw - margin * 2, (th - margin * 2 - bcIn(1.5)) / perPage - bcIn(0.3));
          const sx = (tw - size) / 2;
          const sy = margin + bcIn(0.4) + i * (size + bcIn(0.5));
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          bcCenterText(doc, `Puzzle ${idx + 1}`, sy - bcIn(0.1));
          drawSudokuOnPage(doc, s.puzzle, sx, sy, size, 12);
          idx++;
        }
      }
    }
  } else if (type === 'math' || type === 'math-puzzles') {
    const perPage = section.perPage || 20;
    const totalPages = Math.ceil(count / perPage);
    let n = startIdx;
    for (let p = 0; p < totalPages; p++) {
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `Math Break`, margin);
      const onPage = Math.min(perPage, (startIdx + count) - n);
      const cols = perPage <= 15 ? 2 : 3;
      const rows = Math.ceil(perPage / cols);
      const colW = (tw - margin * 2) / cols;
      const rowH = (th - margin * 2 - bcIn(0.5)) / rows;
      for (let i = 0; i < onPage; i++) {
        const problem = generateMathProblem(section.mathType || 'mixed', difficulty);
        puzzles.push({ idx: n + 1, type, problem });
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = margin + c * colW + 8;
        const y = margin + bcIn(0.4) + r * rowH + rowH / 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.text(`${n + 1}.  ${problem.text}_____`, x, y);
        n++;
      }
    }
  } else if (type === 'maze' || type === 'mazes') {
    for (let k = 0; k < count; k++) {
      const i = startIdx + k;
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      const dimens = { easy: [10, 10], medium: [15, 15], hard: [20, 20], expert: [25, 25] }[difficulty] || [15, 15];
      const maze = generateMaze(dimens[0], dimens[1]);
      puzzles.push({ idx: i + 1, type, maze, dimens });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `Maze ${i + 1}`, margin);
      const totalW = tw - margin * 2;
      const totalH = th - margin * 2 - bcIn(0.6);
      drawMazeOnPage(doc, maze, margin, margin + bcIn(0.4), totalW, totalH);
    }
  } else if (type === 'cryptogram' || type === 'cryptograms') {
    const QUOTES = (typeof CRYPTOGRAM_QUOTES !== 'undefined') ? CRYPTOGRAM_QUOTES : [
      'BELIEVE YOU CAN AND YOU ARE HALFWAY THERE',
      'STAY CURIOUS NEVER STOP LEARNING',
    ];
    for (let k = 0; k < count; k++) {
      const i = startIdx + k;
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      const quote = QUOTES[i % QUOTES.length];
      const crypt = createCryptogram(quote);
      puzzles.push({ idx: i + 1, type, crypt });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `Cryptogram ${i + 1}`, margin);
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      const wrapped = doc.splitTextToSize(crypt.encoded, tw - margin * 2);
      let y = margin + bcIn(1.2);
      wrapped.forEach(l => { doc.text(l, tw / 2, y, { align: 'center' }); y += 22; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      bcCenterText(doc, '— Decode the message —', y + bcIn(0.3));
    }
  } else if (type === 'rebus' || type === 'picture-rebus') {
    // Rebus generator pendiente — placeholder
    for (let k = 0; k < count; k++) {
      const i = startIdx + k;
      doc.addPage();
      bcApplyCornerOrnament(doc, ornamentImg, tw, th);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `Rebus ${i + 1}`, margin);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      bcCenterText(doc, '(Picture-puzzle generator pending — placeholder page)', th / 2);
      puzzles.push({ idx: i + 1, type, placeholder: true });
    }
  } else {
    // Unknown type — placeholder
    for (let k = 0; k < count; k++) {
      const i = startIdx + k;
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      bcCenterText(doc, `${section.name} ${i + 1}`, margin);
      puzzles.push({ idx: i + 1, type, unknown: true });
    }
  }

  return puzzles;
}

// ====================== SOLUTIONS SECTION ======================

function bcRenderSolutionsDivider(doc, project, tw, th) {
  const img = bcGetAsset(project, 'solutions-divider');
  if (img) {
    bcDrawFullPageImage(doc, img, tw, th);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    bcCenterText(doc, 'SOLUTIONS', th / 2 - 10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(13);
    bcCenterText(doc, '(no peeking until you give it a real try!)', th / 2 + 30);
  }
}

function bcRenderSolutionsForSection(doc, project, section, sectionPuzzles, tw, th) {
  const margin = bcIn(0.6);
  const type = section.type;

  if (type === 'word-search' || type === 'wordsearch') {
    // 2 soluciones por página (grid grande pero no full)
    let i = 0;
    while (i < sectionPuzzles.length) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      bcCenterText(doc, `${section.name} — Solutions`, margin);
      for (let slot = 0; slot < 2 && i < sectionPuzzles.length; slot++, i++) {
        const p = sectionPuzzles[i];
        const size = Math.min(tw - margin * 2, (th - margin * 2 - bcIn(0.5)) / 2 - bcIn(0.3));
        const sx = (tw - size) / 2;
        const sy = margin + bcIn(0.4) + slot * (size + bcIn(0.4));
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Sol. #${p.idx}`, sx + size / 2, sy - 4, { align: 'center' });
        const gridSize = p.puzzle.grid.length;
        const cellSize = size / gridSize;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const isSol = p.puzzle.solution[r][c];
            if (isSol) {
              doc.setFillColor(220, 220, 220);
              doc.rect(sx + c * cellSize, sy + r * cellSize, cellSize, cellSize, 'F');
            }
            doc.setTextColor(40, 40, 40);
            doc.text(p.puzzle.grid[r][c], sx + c * cellSize + cellSize / 2,
              sy + r * cellSize + cellSize / 2 + 3, { align: 'center' });
          }
        }
        doc.setDrawColor(180, 180, 180);
        for (let i2 = 0; i2 <= gridSize; i2++) {
          doc.line(sx, sy + i2 * cellSize, sx + size, sy + i2 * cellSize);
          doc.line(sx + i2 * cellSize, sy, sx + i2 * cellSize, sy + size);
        }
      }
    }
  } else if (type === 'sudoku') {
    // 4 sols por página
    let i = 0;
    while (i < sectionPuzzles.length) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      bcCenterText(doc, `${section.name} — Solutions`, margin);
      for (let slot = 0; slot < 4 && i < sectionPuzzles.length; slot++, i++) {
        const p = sectionPuzzles[i];
        const size = Math.min((tw - margin * 3) / 2, (th - margin * 2 - bcIn(0.5)) / 2 - bcIn(0.3));
        const col = slot % 2;
        const row = Math.floor(slot / 2);
        const sx = margin + col * (size + margin);
        const sy = margin + bcIn(0.4) + row * (size + bcIn(0.4));
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`Sol. #${p.idx}`, sx + size / 2, sy - 4, { align: 'center' });
        drawSudokuOnPage(doc, p.solution, sx, sy, size, 8);
      }
    }
  } else if (type === 'math' || type === 'math-puzzles') {
    // 40 respuestas por página en 4 columnas
    const perPage = 40;
    let i = 0;
    while (i < sectionPuzzles.length) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      bcCenterText(doc, `${section.name} — Answers`, margin);
      const cols = 4;
      const colW = (tw - margin * 2) / cols;
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      for (let slot = 0; slot < perPage && i < sectionPuzzles.length; slot++, i++) {
        const p = sectionPuzzles[i];
        const r = Math.floor(slot / cols);
        const c = slot % cols;
        const x = margin + c * colW;
        const y = margin + bcIn(0.4) + r * 14;
        doc.text(`${p.idx}. ${p.problem.answer}`, x, y);
      }
    }
  } else if (type === 'maze' || type === 'mazes') {
    // Las soluciones de los mazes serían dibujar el camino — para MVP lo skipeamos con nota
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    bcCenterText(doc, `${section.name} — Solutions`, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    bcCenterText(doc, '(Maze solutions: trace from blue dot to red dot — multiple valid paths)', th / 2);
  } else if (type === 'cryptogram' || type === 'cryptograms') {
    // Originals revealed
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    bcCenterText(doc, `${section.name} — Solutions`, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let y = margin + bcIn(0.5);
    sectionPuzzles.forEach(p => {
      const text = `${p.idx}. ${p.crypt.original}`;
      const wrapped = doc.splitTextToSize(text, tw - margin * 2);
      wrapped.forEach(l => { doc.text(l, margin, y); y += 13; });
      y += 4;
      if (y > th - margin) { doc.addPage(); y = margin + bcIn(0.4); }
    });
  } else if (type === 'rebus') {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    bcCenterText(doc, `${section.name} — Solutions`, margin);
    doc.setFont('helvetica', 'italic');
    bcCenterText(doc, '(rebus solutions placeholder)', th / 2);
  }
}

// ====================== BACK MATTER ======================

function bcRenderAboutAuthorPage(doc, project, tw, th) {
  const author = (typeof bwGetAuthorString === 'function' ? bwGetAuthorString(project) : project.positioning?.authorPenName) || 'The Author';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  bcCenterText(doc, 'About the Author', bcIn(1.2));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  const margin = bcIn(0.9);
  const text = project.marketing?.authorBio || `${author} creates puzzle and activity books designed to challenge minds without crossing into "boring textbook" territory.

Got feedback? A request for the next volume? Reach out via the review section — we read every one.

Thank you for picking up this book.`;
  const wrapped = doc.splitTextToSize(text, tw - margin * 2);
  let y = bcIn(2.2);
  wrapped.forEach(l => { doc.text(l, margin, y); y += 17; });
}

function bcRenderMoreBooksPage(doc, project, tw, th) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  bcCenterText(doc, 'More Books in This Series', bcIn(1.2));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  const margin = bcIn(0.9);
  let y = bcIn(2);

  // Get series siblings (other vols)
  let siblings = [];
  if (typeof bwGetSeriesSiblings === 'function' && project.series?.name) {
    siblings = bwGetSeriesSiblings(project).filter(p => p.id !== project.id);
  }

  if (siblings.length === 0) {
    doc.setFont('helvetica', 'italic');
    bcCenterText(doc, 'More volumes coming soon — stay tuned!', y);
    doc.setFont('helvetica', 'normal');
    bcCenterText(doc, `Search "${project.series?.name || project.marketing?.title}" on Amazon to be the first to know.`, y + 22);
    return;
  }

  doc.text(`If you enjoyed Volume ${project.series?.volume || 1}, check out:`, margin, y);
  y += bcIn(0.4);
  siblings.forEach(sib => {
    doc.setFont('helvetica', 'bold');
    doc.text(`Vol ${sib.series.volume}: ${sib.marketing?.title || 'Untitled'}`, margin, y);
    y += 16;
    if (sib.marketing?.subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(sib.marketing.subtitle, tw - margin * 2);
      wrapped.forEach(l => { doc.text(l, margin + bcIn(0.2), y); y += 12; });
      doc.setFontSize(12);
    }
    y += bcIn(0.2);
  });
  y += bcIn(0.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  bcCenterText(doc, 'Available on Amazon — search the title to find them.', y);
}

function bcRenderReviewRequestPage(doc, project, tw, th) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  bcCenterText(doc, 'One Quick Favor?', bcIn(1.5));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(50, 50, 50);
  const margin = bcIn(0.9);
  const text = `If this book helped you (or someone you know) outsmart boredom — would you take 30 seconds to leave an honest review on Amazon?

Reviews are how independent authors keep the lights on, and how new readers find books worth their time.

Just open Amazon → find this book → tap "Write a customer review."

Thank you. Seriously.`;
  const wrapped = doc.splitTextToSize(text, tw - margin * 2);
  let y = bcIn(2.5);
  wrapped.forEach(l => { doc.text(l, margin, y); y += 18; });
}

// ====================== MISSION ARC PACING ======================

// Default mission names — themed for "Brain Squad" but works for any teen-friendly book.
// If project.content.missions is set, those override these.
const BC_DEFAULT_MISSIONS = [
  { name: 'Mission 1: Recon',          tagline: 'Just a warm-up. We swear.' },
  { name: 'Mission 2: Field Training', tagline: 'Now it gets real.' },
  { name: 'Mission 3: Counterintel',   tagline: 'Decoded. Solved. Smug.' },
  { name: 'Mission 4: Squad Goals',    tagline: 'Teamwork: optional. Bragging rights: not.' },
  { name: 'Mission 5: Pressure Test',  tagline: 'Tick. Tick. Tick...' },
  { name: 'Mission 6: Final Approach', tagline: "Almost there. Don't blow it." },
  { name: 'Mission 7: Boss Level',     tagline: "Bring everything you've got." },
  { name: 'Mission 8: Victory Lap',    tagline: 'Brain mode: legendary.' },
];

function bcRenderMissionDivider(doc, mission, missionIdx, tw, th) {
  doc.addPage();
  doc.setFillColor(245, 240, 230);
  doc.rect(0, 0, tw, th, 'F');
  // Big mission badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(140, 90, 50);
  bcCenterText(doc, '— BRAIN SQUAD —', th / 2 - bcIn(0.7));
  doc.setFontSize(34);
  doc.setTextColor(40, 40, 40);
  bcCenterText(doc, mission.name.toUpperCase(), th / 2 - 10);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 90);
  bcCenterText(doc, mission.tagline, th / 2 + 24);
}

// Mission arc compile: pre-compute a chunk schedule, then render mission-by-mission
// drawing slices from each section (interleaved). Returns allSectionPuzzles for solutions.
async function bcCompileMissionArc(doc, project, sections, tw, th, onProgress) {
  const active = sections
    .map((s, idx) => ({ section: s, sectionIdx: idx, remaining: s.count || 0 }))
    .filter(c => c.remaining > 0);
  if (active.length === 0) return [];

  // Mission count: aim for ~12 puzzles per mission, capped 4-8 missions
  const totalPuzzles = active.reduce((sum, c) => sum + c.remaining, 0);
  const numMissions = Math.max(4, Math.min(8, Math.round(totalPuzzles / 14)));

  // Pre-compute per-mission chunks per section (each section split as evenly as possible)
  // chunks[sectionIdx][missionIdx] = number of puzzles to render
  const chunks = active.map(c => {
    const base = Math.floor(c.remaining / numMissions);
    const extra = c.remaining - base * numMissions;
    return Array.from({ length: numMissions }, (_, m) => base + (m < extra ? 1 : 0));
  });

  // Per-section accumulator (puzzles array gathered across all missions for solutions)
  const accumulators = active.map(c => ({ section: c.section, sectionIdx: c.sectionIdx, puzzles: [] }));
  // Per-section running cursor (for startIdx in slice calls)
  const cursors = active.map(() => 0);

  for (let m = 0; m < numMissions; m++) {
    const mission = (project.content?.missions?.[m]) || BC_DEFAULT_MISSIONS[m] || { name: `Round ${m+1}`, tagline: '' };
    onProgress(15 + (m / numMissions) * 50, `${mission.name} — divider...`);
    bcRenderMissionDivider(doc, mission, m, tw, th);
    await new Promise(r => setTimeout(r, 0));

    for (let ci = 0; ci < active.length; ci++) {
      const slot = chunks[ci][m];
      if (slot <= 0) continue;
      const c = active[ci];
      onProgress(15 + (m / numMissions) * 50 + 2, `${mission.name} — ${slot} ${c.section.type} from "${c.section.name}"...`);
      const slicePuzzles = await bcRenderPuzzlesForSection(
        doc, project, c.section, c.sectionIdx, tw, th,
        { startIdx: cursors[ci], renderCount: slot }
      );
      accumulators[ci].puzzles.push(...slicePuzzles);
      cursors[ci] += slot;
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return accumulators;
}

// ====================== MAIN COMPILE ORCHESTRATOR ======================

// Ensure all asset dataUrls in the project are loaded into memory before
// compile starts. On the device that uploaded the images, dataUrls are already
// cached. On a paired device that just hydrated from cloud, assets have only
// `url` — this fetches each URL → dataUrl so jsPDF can embed them.
async function bcEnsureAssetsLoaded(project, onProgress) {
  if (!project?.assets || !window.cs) return;
  const slots = Object.keys(project.assets);
  const missing = slots.filter(id => {
    const a = project.assets[id];
    return a && a.url && !a.dataUrl;
  });
  if (missing.length === 0) return;
  if (onProgress) onProgress(2, `Fetching ${missing.length} image(s) from cloud...`);
  for (let i = 0; i < missing.length; i++) {
    const slotId = missing[i];
    const a = project.assets[slotId];
    try {
      a.dataUrl = await window.cs.fetchAssetAsDataUrl(a.url);
    } catch (e) {
      console.warn(`[compile] Could not fetch ${slotId}:`, e.message);
    }
  }
}

async function bwCompileBook(project, opts = {}) {
  if (!window.jspdf) throw new Error('jsPDF no cargado');
  const { jsPDF } = window.jspdf;
  const trimId = project.technical?.trimSize || '6x9';
  const [tw, th] = bcGetTrimPts(trimId);
  const doc = new jsPDF({ unit: 'pt', format: [tw, th], compress: true });
  const onProgress = opts.onProgress || (() => {});

  // If this device just hydrated from cloud, asset images may not be in memory
  // yet. Pull them down before we start drawing pages.
  await bcEnsureAssetsLoaded(project, onProgress);

  // ── FRONT MATTER
  onProgress(5, 'Title page...');
  bcRenderTitlePage(doc, project, tw, th);
  doc.addPage();

  onProgress(8, 'Copyright...');
  bcRenderCopyrightPage(doc, project, tw, th);

  if (project.compliance?.aiDisclosed) {
    doc.addPage();
    onProgress(11, 'AI disclosure...');
    bcRenderAIDisclosurePage(doc, project, tw, th);
  }

  doc.addPage();
  onProgress(13, 'Welcome page...');
  bcRenderWelcomePage(doc, project, tw, th);

  // ── CONTENT SECTIONS
  const sections = project.content?.sections || [];
  const pacing = project.content?.pacing || 'sequential';
  let allSectionPuzzles = [];

  // Mission-arc is the implemented interleaved mode. 'rotating' and 'boss-build'
  // currently fall back to mission-arc until their dedicated logic ships.
  const useInterleaved = ['mission-arc','rotating','boss-build'].includes(pacing);
  if (useInterleaved && sections.some(s => (s.count || 0) > 0)) {
    allSectionPuzzles = await bcCompileMissionArc(doc, project, sections, tw, th, onProgress);
  } else {
    // Sequential (default): all puzzles of one type, then next type, etc.
    const sectionsTotal = sections.length;
    for (let si = 0; si < sectionsTotal; si++) {
      const section = sections[si];
      if (!section.count || section.count <= 0) continue;
      const baseProg = 15 + (si / sectionsTotal) * 50;
      onProgress(baseProg, `Section "${section.name}" — divider...`);
      doc.addPage();
      bcRenderSectionDivider(doc, project, section, si, tw, th);
      await new Promise(r => setTimeout(r, 0));
      onProgress(baseProg + 2, `Section "${section.name}" — generating ${section.count} puzzles...`);
      const puzzles = await bcRenderPuzzlesForSection(doc, project, section, si, tw, th);
      allSectionPuzzles.push({ section, sectionIdx: si, puzzles });
    }
  }

  // ── SOLUTIONS (only if there are any puzzles)
  if (allSectionPuzzles.length > 0) {
    onProgress(70, 'Solutions section — divider...');
    doc.addPage();
    bcRenderSolutionsDivider(doc, project, tw, th);

    for (const sp of allSectionPuzzles) {
      if (!sp.puzzles?.length) continue;  // no puzzles → no solutions
      onProgress(72 + (allSectionPuzzles.indexOf(sp) / allSectionPuzzles.length) * 18, `Solutions for "${sp.section.name}"...`);
      bcRenderSolutionsForSection(doc, project, sp.section, sp.puzzles, tw, th);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // ── BACK MATTER
  onProgress(92, 'About the Author...');
  doc.addPage();
  bcRenderAboutAuthorPage(doc, project, tw, th);

  onProgress(95, 'More books in series...');
  doc.addPage();
  bcRenderMoreBooksPage(doc, project, tw, th);

  onProgress(98, 'Review request...');
  doc.addPage();
  bcRenderReviewRequestPage(doc, project, tw, th);

  onProgress(100, 'PDF ready');
  return doc;
}

// ====================== COVER WRAP COMPILE ======================

// Spine width = pageCount × paperThickness (en pulgadas, devolvemos puntos)
function bcCalcSpineWidth(project) {
  const paper = project.technical?.paper || 'cream';
  const pgs = project.content?.pageCount || 200;
  const thicknessIn = (BC_PAPER_THICKNESS[paper] || BC_PAPER_THICKNESS.cream) * pgs;
  return { inches: thicknessIn, points: bcIn(thicknessIn) };
}

async function bwCompileCoverWrap(project, opts = {}) {
  // Pull down any cloud-only asset images before drawing the cover wrap.
  await bcEnsureAssetsLoaded(project, opts.onProgress);
  if (!window.jspdf) throw new Error('jsPDF no cargado');
  const { jsPDF } = window.jspdf;
  const trimId = project.technical?.trimSize || '6x9';
  const [tw, th] = bcGetTrimPts(trimId);
  const spine = bcCalcSpineWidth(project);
  // KDP cover wrap dimensions:
  // Total width = (trim width × 2) + spine width + (bleed × 2)
  // Total height = trim height + (bleed × 2)
  const totalW = (tw * 2) + spine.points + (BC_BLEED * 2);
  const totalH = th + (BC_BLEED * 2);
  const doc = new jsPDF({ unit: 'pt', format: [totalW, totalH], compress: true });

  // Layout (with KDP convention):
  //   [bleed][back cover (tw)][spine][front cover (tw)][bleed]
  const backX = BC_BLEED;
  const spineX = BC_BLEED + tw;
  const frontX = BC_BLEED + tw + spine.points;

  // Background fill (fallback if no back image)
  doc.setFillColor(245, 240, 230);
  doc.rect(0, 0, totalW, totalH, 'F');

  // BACK COVER
  const backImg = bcGetAsset(project, 'cover-back');
  if (backImg) {
    doc.addImage(backImg, 'JPEG', 0, 0, BC_BLEED + tw, totalH);
  } else {
    // Fallback: title hook at top + description (or subtitle) + author
    doc.setTextColor(40, 40, 40);
    const margin = bcIn(0.6);
    const backLeft = BC_BLEED + margin;
    const backWidth = tw - margin * 2;
    let y = bcIn(1.2);
    // Hook (large)
    const hook = project.marketing?.subtitle || project.marketing?.title || 'Coming soon';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const hookLines = doc.splitTextToSize(hook, backWidth);
    hookLines.forEach(l => { doc.text(l, backLeft + backWidth / 2, y, { align: 'center' }); y += 24; });
    y += bcIn(0.3);
    // Description (medium)
    const desc = project.marketing?.description ||
      `A puzzle adventure for curious minds. ${project.content?.sections?.length || 0} themed sections to explore — and just enough humor to make you forget you're learning.`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const descLines = doc.splitTextToSize(desc.replace(/<[^>]+>/g, ' '), backWidth);
    descLines.slice(0, 18).forEach(l => { doc.text(l, backLeft, y); y += 15; });
    // Author at bottom
    const backAuthor = (typeof bwGetAuthorString === 'function' ? bwGetAuthorString(project) : project.positioning?.authorPenName) || '';
    if (backAuthor) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.text(`— ${backAuthor}`, backLeft + backWidth / 2, totalH - bcIn(0.8), { align: 'center' });
    }
  }

  // SPINE
  if (spine.points > bcIn(0.0625)) {  // Only render text if spine ≥ 1/16" (KDP rule: ≥80pgs)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(Math.min(14, spine.points * 0.4));
    doc.setTextColor(40, 40, 40);
    // Spine text: rotated 90° (reads top to bottom on left-binding USA standard)
    const spineCenterX = spineX + spine.points / 2;
    const spineCenterY = totalH / 2;
    const spineTitle = project.marketing?.title || 'Untitled';
    // For variety puzzle / non-fiction USA: title reads top-to-bottom (rotation -90)
    doc.text(spineTitle, spineCenterX, spineCenterY, { align: 'center', angle: 90 });
  }

  // FRONT COVER
  const frontImg = bcGetAsset(project, 'cover-front');
  if (frontImg) {
    doc.addImage(frontImg, 'JPEG', frontX, 0, tw + BC_BLEED, totalH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(40, 40, 40);
    const title = project.marketing?.title || 'Untitled';
    const wrapped = doc.splitTextToSize(title, tw - bcIn(1));
    let y = totalH / 2 - 30;
    wrapped.forEach(l => { doc.text(l, frontX + tw / 2, y, { align: 'center' }); y += 32; });
  }

  return doc;
}

// ====================== PUBLIC HELPERS ======================

// Triggers download
function bcDownloadDoc(doc, filename) {
  doc.save(filename);
}

// Returns blob URL for preview iframe
function bcDocToBlobURL(doc) {
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
