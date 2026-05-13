// Image Workflow — guides manual generation in OpenArt and tracks progress per book.
// Storage: localStorage keyed by 'iw_<bookId>'. Images stored as base64.

const IW_BOOKS = {
  'mega-brain-games-vol1': {
    title: 'Mega Brain Games for Teens — Vol 1',
    pages: [
      {
        id: 'cover-front',
        emoji: '📘',
        name: 'Cover Front',
        outputFile: 'cover-front.png',
        prompt: 'Book cover for a fun teen puzzle book aged 11-15, comic book illustrative style. Vibrant solid bright YELLOW background (#FFD93D) covering the entire page. CENTER: large cartoon mascot character — a cute pink cartoon brain (#FF6B9D) with personality, wearing big black sunglasses, wide friendly grin, blue gaming headphones over the top, with cartoon arms holding a yellow pencil in one hand and giving a thumbs up with the other. Mascot drawn with THICK BOLD BLACK OUTLINES in classic comic book illustration style, like Wimpy Kid or Big Nate. Around the mascot: explosive burst of colorful doodles radiating outward — comic action lines, speech bubbles, small puzzle pieces in cyan blue (#4ECDC4) coral red (#FF6B6B) lime green (#95E1D3) and electric blue (#2B6CB0), scattered numbers (3, 7, 9, 5), lightning bolts, four-pointed stars, simple maze patterns, dice, padlocks. All elements drawn with thick black outlines and flat bright color fills. Composition: mascot in lower center, title space reserved at top 30%. KDP 6x9 paperback cover, full bleed. No text, no letters, no words.'
      },
      {
        id: 'cover-back',
        emoji: '📗',
        name: 'Cover Back',
        outputFile: 'cover-back.png',
        prompt: 'Book back cover for a teen puzzle book, comic book style matching the front cover. Solid bright YELLOW background (#FFD93D) covering the entire page. EDGES only: comic book burst doodles in cyan blue (#4ECDC4), coral red (#FF6B6B), lime green (#95E1D3), and electric blue (#2B6CB0) — small puzzle pieces, lightning bolts, four-pointed stars, dice, padlocks, question marks, exclamation marks, speech bubbles, scattered numbers. Drawn with thick bold black outlines and flat color fills. Center-left two-thirds reserved as clean yellow area for description text. Lower-right corner reserved blank for ISBN barcode. Top-right corner: small cute pink brain mascot (#FF6B9D) with sunglasses and blue headphones giving a small wave, occupying about 12% of corner area. Comic book Wimpy Kid Big Nate vibe, high energy. KDP 6x9 paperback back cover, full bleed. No text, no letters, no words.'
      },
      {
        id: 'p001-welcome',
        emoji: '👋',
        name: 'Welcome Page (p1)',
        outputFile: 'p001-welcome.png',
        prompt: 'Book interior welcome page for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. White background with subtle paper texture. Decorative cluster ONLY in top-right corner: cute pink brain mascot character (#FF6B9D) waving hello with a wide friendly grin, wearing big black sunglasses and blue gaming headphones, occupying about 18% of corner area. Around the mascot small sparkle stars and an empty speech bubble in cyan blue (#4ECDC4) and coral red (#FF6B6B). Bottom-left corner: small cluster of doodles — dice, lightbulb, lightning bolt, question marks, in mixed colors with thick black outlines. Center 70% of page kept clean white only for welcome text overlay. Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p003-divider-word-hunters',
        emoji: '🔍',
        name: 'Squad 1: Word Hunters (p3)',
        outputFile: 'p003-divider-word-hunters.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — drawn as a detective on a case in a dynamic crouching pose, holding a large vintage magnifying glass examining something on the floor. ENVIRONMENT: floating alphabet letter shapes scattered across the page like clues in sage green and coral red, with a curving dotted trail snaking through the scene. Speech bubbles with question marks floating around. Floor has a light pastel sage green wash suggesting a "search zone". Mascot is focal point in lower-center. Thick bold black outlines, flat color fills, comic book illustration style. Top 25% kept clean white (for section title overlay). Bottom 12% clean white (for page number). KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p034-divider-number-ninjas',
        emoji: '🥷',
        name: 'Squad 2: Number Ninjas (p34)',
        outputFile: 'p034-divider-number-ninjas.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — dressed as a ninja with black headband across forehead and black ninja outfit, in a DRAMATIC MID-JUMP ACTION POSE, kicking with one leg while holding a calculator like a throwing weapon. ENVIRONMENT: DARK NAVY BLUE NIGHT SKY background gradient with rooftop silhouettes at the very bottom edge, motion lines streaking diagonally across the scene. Floating numbers (1-9) zooming through the air with motion blur effects, plus mini ninja stars and small grid squares. Bright cyan blue and red accents pop against the dark blue. Background has a NIGHT MOOD with deep navy wash, NOT white. Top 25% kept lighter blue (for section title overlay). Bottom 12% lighter (for page number). Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p065-divider-math-squad',
        emoji: '🎓',
        name: 'Squad 3: Math Squad (p65)',
        outputFile: 'p065-divider-math-squad.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — wearing a graduation mortarboard cap with tassel, standing confidently in front of a DARK GREEN CHALKBOARD covered with white chalk-drawn math equations, formulas, plus minus multiplication division equals symbols, π infinity percentage fraction lines. Mascot holds a giant yellow pencil pointing up like a teacher\'s pointer, with a wide proud grin. ENVIRONMENT: dark green chalkboard fills the middle 60% of background, light yellow color wash on the floor area. Color palette: chalkboard green + chalk white + yellow pencil + cyan accents. Different from white pages — chalkboard dominates the scene. Top 25% kept clean white above the chalkboard (for section title overlay). Bottom 12% clean (for page number). Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p096-divider-maze-runners',
        emoji: '🏃',
        name: 'Squad 4: Maze Runners (p96)',
        outputFile: 'p096-divider-maze-runners.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — running fast through a giant 3D-PERSPECTIVE MAZE with tall ORANGE/CORAL maze walls visible on both sides forming corridors, in a panicked-but-determined dash pose with sneakers in mid-stride and motion lines streaking behind. ENVIRONMENT: orange and coral red maze walls forming corridors with depth perspective, floor in light yellow with dotted footprint trail behind the mascot. Multiple directional arrows floating in the air (some pointing wrong ways) suggesting confusion. Color palette: bright orange + coral red maze + yellow floor + blue accents. Maze environment DOMINATES the scene — totally different feel from white-bg squads. Top 25% kept lighter cream (for section title overlay). Bottom 12% lighter (for page number). Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p127-divider-code-breakers',
        emoji: '🕵️',
        name: 'Squad 5: Code Breakers (p127)',
        outputFile: 'p127-divider-code-breakers.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — dressed as a SPY in a tan trench coat and brown fedora hat, in a stealthy crouching sneaky pose, holding a small notebook with cipher symbols in one hand and a vintage magnifying glass in the other. ENVIRONMENT: DARK TEAL/DARK BLUE WALL BACKGROUND with cipher symbols, dots, dashes, geometric runes, hash marks, and mysterious code patterns drawn on the wall in chalk-white style. A bright SPOTLIGHT BEAM from above illuminates the mascot from a top corner. Color palette: dark teal navy wall + brass yellow spotlight + cream/white spotlight cone + coral red accents. NOIR SPY MOOD with dramatic lighting — clearly different from other squads. Top 25% kept clean cream/lighter (for section title overlay). Bottom 12% clean (for page number). Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p158-divider-picture-detectives',
        emoji: '🔎',
        name: 'Squad 6: Picture Detectives (p158)',
        outputFile: 'p158-divider-picture-detectives.png',
        prompt: 'Book interior page illustration for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. SCENE: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones — dressed as Sherlock Holmes with brown deerstalker hat and small cape, kneeling on the floor examining MULTIPLE colorful jigsaw puzzle pieces with a giant magnifying glass, in a curious investigation pose. ENVIRONMENT: floor COVERED with rainbow-colored jigsaw puzzle pieces of various sizes in cyan, coral, lime, yellow, purple, orange — the puzzle pieces are the dominant visual feature. Speech bubbles with picture clue icons (eye, sun, lightbulb, dice, book) floating above the mascot. A LIGHT PURPLE/LAVENDER WALL in the background. Color palette: rainbow puzzle pieces multi-color + lavender purple wall + brown Sherlock outfit. TREASURE HUNT VIBE with rainbow richness — totally different from other squads. Top 25% kept lighter (for section title overlay). Bottom 12% lighter (for page number). Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p180-quote-page',
        emoji: '💬',
        name: 'Quote Page (p180)',
        outputFile: 'p180-quote-page.png',
        prompt: 'Book interior decorative quote page for a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. White background with subtle paper texture covering 90% of page. Small decorative illustration in BOTTOM-RIGHT corner only: cute pink brain mascot character (#FF6B9D) with sunglasses and blue headphones, in a relaxed pose with thumbs up and a wide proud grin, occupying about 18% of bottom-right corner area. Around the mascot 2-3 small sparkle stars and a small empty speech bubble in cyan blue (#4ECDC4). Top-left small decorative cluster: 3-4 small four-pointed sparkle stars and a small lightning bolt in coral red (#FF6B6B). Center 75% of page kept clean white texture only for humorous quote text overlay. Thick bold black outlines, flat color fills, comic book illustration style. KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      },
      {
        id: 'p199-divider-solutions',
        emoji: '✅',
        name: 'Solutions Divider (p199)',
        outputFile: 'p199-divider-solutions.png',
        prompt: 'Book interior section divider for the solutions section of a teen puzzle book, Wimpy Kid / Big Nate cartoon style, COLOR. Centered illustration: cute pink brain mascot character (#FF6B9D) with big black sunglasses and blue gaming headphones, holding a giant green checkmark in one hand and giving a confident thumbs up with the other, in a victory celebration pose with a wide proud grin. Around the mascot scattered: small green checkmarks, sparkle stars, gold star icons, thumbs up icons, in cyan blue (#4ECDC4) and coral red (#FF6B6B). Thick bold black outlines, flat color fills, comic book illustration style, hand-drawn cartoon energy, high personality, like Diary of a Wimpy Kid book interior. White background with subtle paper texture. Top 25% kept clean white (for section title overlay). Bottom 12% clean white (for page number). KDP 6x9 color interior, 300 DPI. No text, no letters, no words.'
      }
    ]
  }
};

let iwActiveBook = 'mega-brain-games-vol1';

function iwStorageKey(bookId) {
  return 'iw_' + bookId;
}

function iwLoadState(bookId) {
  try {
    return JSON.parse(localStorage.getItem(iwStorageKey(bookId)) || '{}');
  } catch (e) {
    return {};
  }
}

function iwSaveState(bookId, state) {
  localStorage.setItem(iwStorageKey(bookId), JSON.stringify(state));
}

function iwSavePageImage(bookId, pageId, base64) {
  const state = iwLoadState(bookId);
  state[pageId] = { image: base64, savedAt: new Date().toISOString() };
  iwSaveState(bookId, state);
}

function iwClearPage(bookId, pageId) {
  const state = iwLoadState(bookId);
  delete state[pageId];
  iwSaveState(bookId, state);
}

function iwToast(msg) {
  const t = document.getElementById('iw-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

function iwOpenArt() {
  window.open('https://openart.ai/create', '_blank');
}

// Returns the active wizard project (if loaded). Used to resolve prompts
// against the user's actual mascot/palette/style choices.
function iwGetActiveProject() {
  try {
    if (typeof bwGetActive === 'function') return bwGetActive();
  } catch (e) { /* wizard not loaded */ }
  return null;
}

// The raw prompts in IW_BOOKS were tuned for the original pink-brain-mascot
// variety-puzzle:for-teens book. This function rewrites them to match the
// user's current project so the platform stays connected across books.
// - mascot=brain-cartoon-pink (or pink-brain text) → use as-is
// - mascot=any other type → substitute every brain mention with the user's mascot
// - mascot.has=false → strip mascot sentences and replace with object-only
//   composition (typography + themed icons).
function iwResolvePrompt(rawPrompt, project) {
  if (!rawPrompt) return rawPrompt;
  const proj = project || iwGetActiveProject();
  const m = proj?.style?.mascot;
  if (!m || m.has === false) {
    return iwPromptStripMascot(rawPrompt);
  }
  const isDefaultBrain = m.id === 'brain-cartoon-pink' || /pink.+brain/i.test(m.type || '');
  if (isDefaultBrain) return rawPrompt;
  return iwPromptSubstituteMascot(rawPrompt, m.type || m.name || 'cartoon mascot character');
}

function iwPromptSubstituteMascot(prompt, newDesc) {
  // Order matters — most-specific phrases first so the long descriptions are
  // replaced before generic "pink brain" fallbacks fire.
  return prompt
    .replace(
      /cute pink cartoon brain \(#FF6B9D\) with personality, wearing big black sunglasses, wide friendly grin, blue gaming headphones over the top/gi,
      newDesc
    )
    .replace(
      /cute pink brain mascot character \(#FF6B9D\) waving hello with a wide friendly grin, wearing big black sunglasses and blue gaming headphones/gi,
      `${newDesc} waving hello with a friendly expression`
    )
    .replace(
      /cute pink brain mascot character \(#FF6B9D\) with big black sunglasses and blue gaming headphones/gi,
      newDesc
    )
    .replace(
      /cute pink brain mascot \(#FF6B9D\) with sunglasses and blue headphones/gi,
      newDesc
    )
    .replace(
      /cute pink brain mascot character \(#FF6B9D\) with sunglasses and blue headphones/gi,
      newDesc
    )
    .replace(/cute pink brain mascot character \(#FF6B9D\)/gi, newDesc)
    .replace(/pink brain mascot/gi, 'mascot')
    .replace(/cute pink brain/gi, 'the mascot');
}

function iwPromptStripMascot(prompt) {
  // For no-mascot books, drop mascot sentences and substitute object-only
  // alternatives. Scenes (detective / ninja / chalkboard / maze / spy) stay —
  // the environment carries the section's theme without a character.
  return prompt
    .replace(
      /CENTER: large cartoon mascot character — [^.]+\./gi,
      'CENTER: bold composition of sample puzzles, decorative typography, and themed objects (no character).'
    )
    .replace(
      /SCENE: cute pink brain mascot character \(#FF6B9D\)[^.]+\./gi,
      'SCENE: composition of themed environment elements only — no character.'
    )
    .replace(
      /Centered illustration: cute pink brain mascot character[^.]+\./gi,
      'Centered illustration: composition of themed icons only — checkmarks, stars, decorative elements.'
    )
    .replace(
      /Small decorative illustration in BOTTOM-RIGHT corner only: cute pink brain mascot[^.]+\./gi,
      'Small decorative cluster in BOTTOM-RIGHT corner: stars, doodles, and themed icons only.'
    )
    .replace(
      /Decorative cluster ONLY in top-right corner: cute pink brain mascot[^.]+\./gi,
      'Decorative cluster ONLY in top-right corner: stars, doodles, and themed icons only.'
    )
    .replace(
      /Top-right corner: small cute pink brain mascot \(#FF6B9D\)[^.]+\./gi,
      'Top-right corner: small cluster of themed icons (puzzle pieces, stars, lightning bolts).'
    )
    .replace(/Mascot is focal point[^.]+\./gi, 'Themed objects are the focal point.')
    .replace(/Mascot drawn with THICK BOLD BLACK OUTLINES/gi, 'All elements drawn with thick bold black outlines')
    .replace(/Mascot holds [^.]+\./gi, '')
    .replace(/pink brain mascot/gi, 'themed composition')
    .replace(/the mascot/gi, 'the composition');
}

function iwCopyAndOpen(pageId) {
  const book = IW_BOOKS[iwActiveBook];
  const page = book.pages.find(p => p.id === pageId);
  if (!page) return;
  const finalPrompt = iwResolvePrompt(page.prompt);
  navigator.clipboard.writeText(finalPrompt).then(() => {
    iwToast('Prompt copiado. Abriendo OpenArt…');
    window.open('https://openart.ai/create', '_blank');
  }).catch(() => {
    iwToast('No se pudo copiar. Selecciona el prompt manualmente.');
  });
}

function iwCopyOnly(pageId) {
  const book = IW_BOOKS[iwActiveBook];
  const page = book.pages.find(p => p.id === pageId);
  if (!page) return;
  const finalPrompt = iwResolvePrompt(page.prompt);
  navigator.clipboard.writeText(finalPrompt).then(() => {
    iwToast('Prompt copiado ✅ Cmd+Tab a OpenArt → click el bookmarklet');
  }).catch(() => {
    iwToast('No se pudo copiar.');
  });
}

function iwHandleFile(file, pageId) {
  if (!file || !file.type.startsWith('image/')) {
    iwToast('Solo PNG/JPG soportado');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    iwSavePageImage(iwActiveBook, pageId, e.target.result);
    iwRender();
    iwToast('Imagen guardada ✅');
  };
  reader.readAsDataURL(file);
}

function iwReplacePage(pageId) {
  iwClearPage(iwActiveBook, pageId);
  iwRender();
}

function iwResetBook() {
  if (!confirm('Borrar todas las imágenes guardadas del libro actual?')) return;
  localStorage.removeItem(iwStorageKey(iwActiveBook));
  iwRender();
  iwToast('Libro reseteado');
}

async function iwExportZip() {
  if (typeof JSZip === 'undefined') {
    iwToast('JSZip no cargó. Recarga la página.');
    return;
  }
  const book = IW_BOOKS[iwActiveBook];
  const state = iwLoadState(iwActiveBook);
  const done = book.pages.filter(p => state[p.id] && state[p.id].image);
  if (done.length === 0) {
    iwToast('No hay imágenes para exportar');
    return;
  }
  const zip = new JSZip();
  for (const page of done) {
    const dataUrl = state[page.id].image;
    const base64 = dataUrl.split(',')[1];
    zip.file(page.outputFile, base64, { base64: true });
  }
  // include a manifest.json with the book info
  const manifest = {
    bookId: iwActiveBook,
    title: book.title,
    exportedAt: new Date().toISOString(),
    images: done.map(p => ({ id: p.id, file: p.outputFile, name: p.name }))
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = iwActiveBook + '-images.zip';
  a.click();
  URL.revokeObjectURL(url);
  iwToast('ZIP descargado: ' + done.length + ' imágenes');
}

// Model decision tree — derived from the project's actual state (mascot flag +
// niche), NOT from a static lookup. This avoids the failure where a recommended
// model has a character bias that overrides the project's mascot.
//
// Models actually available on OpenArt and what each is for:
//  - **Flux Dev**: base model, no character bias, follows prompts literally.
//    Correct choice whenever the cover has a non-human subject (mascot, object,
//    pattern, scene, line art). Will draw "pink brain with sunglasses" as a
//    pink brain — not silently substitute a human.
//  - **American comic sketch**: character LoRA (humans in comic style). Correct
//    only when the cover IS a human character (Genius Girls / La Bibli des
//    Ados direction). Will replace any non-human subject with a person.
//  - **Ideogram v2**: best when the cover image itself needs to render legible
//    text. Not used in this flow because we overlay text at compile time.
//
// All `negativePrompt`s for mascot routes include explicit "human face, person,
// girl, boy, child" guards to suppress character-LoRA leakage.

// Decision tree — reads project state and picks the model with NO guessing.
//
// Universe of OpenArt models we'll recommend (confirmed to exist):
//  - **Flux Dev** — base model, no character bias. Safe for: mascots, objects,
//    line art, scenes, photorealistic, minimalist, watercolor, anything where
//    the cover is NOT a human character.
//  - **American comic sketch** — character LoRA (humans, comic style). ONLY
//    used when the cover is a human character in comic-wimpy-kid style.
//
// Any other model name (CartoonStyle XL, Watercolor SDXL, ColoringBook XL,
// Animagine, DreamShaper, etc.) is NOT recommended here — those LoRA names
// vary on OpenArt and I won't risk sending the user to a model that may not
// exist verbatim.
//
// Rule of thumb: if the cover is a human character in comic style and has no
// mascot, "American comic sketch" beats Flux Dev (cleaner faces, comic lines).
// In every other case, Flux Dev wins because the style is prompt-controlled
// and we avoid silent character substitution.

function iwResolveModel(project) {
  const niche = project?.positioning?.niche || 'variety-puzzle';
  const brandKey = String(niche).split(':')[0];
  const hasMascot = !!project?.style?.mascot?.has;
  const mascotType = project?.style?.mascot?.type || 'mascot';
  const visualStyle = project?.style?.visualStyle || '';
  const palette = project?.style?.palette || '';

  // RULE 1 — Mascot ON → Flux Dev (always, no exceptions).
  // Reason: character LoRAs substitute mascots with humans silently. Flux Dev
  // draws "pink brain with sunglasses" as a pink brain.
  if (hasMascot) {
    return {
      model: 'Flux Dev',
      why: `Mascota detectada: "${mascotType}". Flux Dev sigue el prompt literal sin reemplazarla por una persona. Si eligieras "American comic sketch" (character LoRA), la mascota se convertiría en un humano automáticamente.`,
      negativePrompt: 'watermark, text, letters, words, human face, person, girl, boy, child, woman, man, photo realism, low quality, blurry',
    };
  }

  // RULE 2 — No mascot + comic visual style + character-driven niche → American comic sketch.
  // Reason: this is the exact case validated in your cluster (Genius Girls,
  // La Bibli des Ados use human teen characters in comic style).
  const isComicVisual = visualStyle === 'comic-wimpy-kid';
  const characterDrivenNiches = ['variety-puzzle', 'activity-book', 'workbook-edu', 'destructive-journal'];
  if (isComicVisual && characterDrivenNiches.includes(brandKey)) {
    return {
      model: 'American comic sketch',
      why: `Style "Comic Wimpy Kid" + niche character-driven sin mascota. "American comic sketch" es un character LoRA — dibuja teens humanos en comic style limpio (Genius Girls / La Bibli des Ados validados en tu cluster).`,
      negativePrompt: 'watermark, text, letters, words, photo realism, distorted letters, low quality, blurry, mascot, brain character, animal character',
    };
  }

  // RULE 3 — Coloring book → Flux Dev with line-art negatives.
  // Reason: any stylized LoRA introduces shading/color, which breaks coloring books.
  if (brandKey === 'coloring-book') {
    return {
      model: 'Flux Dev',
      why: `Coloring books necesitan line art puro (sin sombreado, sin color). Flux Dev respeta el prompt "black line art only"; las LoRAs estilizadas siempre meten shading.`,
      negativePrompt: 'color, shading, gradient, photo, realistic, watermark, text, sketch lines, hatching, human face, cartoon character',
    };
  }

  // RULE 4 — Photorealistic visual style → Flux Dev (handles photo natively).
  if (visualStyle === 'photorealistic') {
    return {
      model: 'Flux Dev',
      why: `Photorealistic style → Flux Dev produce fotos realistas sin sesgo cartoon.`,
      negativePrompt: 'watermark, text, letters, cartoon, anime, drawing, illustration, low quality',
    };
  }

  // RULE 5 — All other combinations → Flux Dev (safe default).
  // Reason: style is prompt-controlled. Flux Dev follows the prompt's
  // "watercolor pastel" or "minimalist geometric" or "grunge sketchbook"
  // descriptors literally. No LoRA needed.
  const styleHints = {
    'aesthetic-pinterest': 'aesthetic minimalist',
    'classic-clean': 'editorial limpio',
    'fantasy-ya': 'fantasy YA',
    'gaming-neon': 'gaming neon',
    'retro-vintage': 'retro vintage',
    'punk-sketch': 'punk sketchbook',
    'watercolor-soft': 'watercolor soft',
    'bold-geometric': 'bold geometric',
  };
  const styleLabel = styleHints[visualStyle] || visualStyle || 'default';
  return {
    model: 'Flux Dev',
    why: `Estilo "${styleLabel}" sin mascota — Flux Dev sigue el prompt literal. El look se controla con el texto del prompt, no con una LoRA específica.`,
    negativePrompt: 'watermark, text, letters, words, photo realism, low quality, blurry, distorted, human face',
  };
}

// Calculate the OpenArt setup card from the wizard's active project. Falls back
// to variety-puzzle defaults if no project is loaded (e.g. user opened the
// Images tab directly without going through Stage 0).
function iwGetOpenArtConfig() {
  let project = null;
  try {
    if (typeof bwGetActive === 'function') project = bwGetActive();
  } catch (e) { /* wizard not loaded */ }
  const niche = project?.positioning?.niche || 'variety-puzzle';
  const trim = project?.technical?.trimSize || '6x9';
  const brandKey = String(niche).split(':')[0];
  const resolved = iwResolveModel(project);
  const hasMascot = !!project?.style?.mascot?.has;
  const mascotType = project?.style?.mascot?.type || '';
  const visualStyle = project?.style?.visualStyle || '—';
  const palette = project?.style?.palette || '—';

  // Map trim → aspect ratio (OpenArt's portrait presets). Done here because
  // OpenArt doesn't let you type arbitrary ratios — you pick the closest preset.
  const trimAspects = {
    '6x9':    '2:3 portrait (1024×1536)',
    '7x10':   '7:10 portrait — pick 2:3 if not listed',
    '8.5x11': '17:22 portrait — pick 3:4 if not listed (1024×1365)',
    '5x8':    '5:8 portrait',
    '8x10':   '4:5 portrait (1024×1280)',
    '8.25x6': '11:8 landscape — pick 3:2 landscape',
  };
  const aspectRatio = trimAspects[trim] || `${trim} → pick Portrait / 2:3 if not listed`;

  return {
    model: resolved.model,
    why: resolved.why,
    aspectRatio,
    negativePrompt: resolved.negativePrompt,
    nicheUsed: brandKey,
    trimUsed: trim,
    hasMascot,
    mascotType,
    visualStyle,
    palette,
  };
}

function iwCopyNegativePrompt() {
  const cfg = iwGetOpenArtConfig();
  navigator.clipboard.writeText(cfg.negativePrompt).then(() => {
    iwToast('Negative prompt copiado ✅');
  }).catch(() => {
    iwToast('No se pudo copiar.');
  });
}

function iwRenderOpenArtConfig() {
  const cfg = iwGetOpenArtConfig();
  const mascotTag = cfg.hasMascot
    ? `<span class="iw-openart-config-tag">🐱 mascota: ${cfg.mascotType || 'sí'}</span>`
    : '<span class="iw-openart-config-tag iw-openart-config-tag-muted">sin mascota</span>';
  return `
    <div class="iw-openart-config">
      <div class="iw-openart-config-head">
        🎨 OpenArt Setup para este libro
        <span class="iw-openart-config-niche">${cfg.nicheUsed} · trim ${cfg.trimUsed}</span>
      </div>
      <div class="iw-openart-config-connected">
        <strong>Conectado a tus stages:</strong>
        niche=<code>${cfg.nicheUsed}</code> ·
        visual style=<code>${cfg.visualStyle}</code> ·
        palette=<code>${cfg.palette}</code> ·
        ${mascotTag}
      </div>
      <div class="iw-openart-config-grid">
        <div><strong>Model or Character:</strong> ${cfg.model}</div>
        <div><strong>Aspect ratio:</strong> ${cfg.aspectRatio}</div>
        <div class="iw-openart-config-neg">
          <strong>Negative prompt:</strong>
          <code>${cfg.negativePrompt}</code>
          <button class="iw-btn iw-btn-ghost" id="iw-copy-neg">📋 Copy negative</button>
        </div>
      </div>
      <div class="iw-openart-config-why">${cfg.why}</div>
      <div class="iw-openart-config-hint">Si cambias mascota / visual style / niche en Stages 1-2, esta card se actualiza automáticamente al volver a Imágenes IA. Image Guidance accordions → no se usan.</div>
    </div>
  `;
}

function iwRenderPanels() {
  const container = document.getElementById('iw-panels');
  if (!container) return;
  const book = IW_BOOKS[iwActiveBook];
  const state = iwLoadState(iwActiveBook);
  container.innerHTML = iwRenderOpenArtConfig();
  // Wire negative-prompt copy button
  const negBtn = container.querySelector('#iw-copy-neg');
  if (negBtn) negBtn.addEventListener('click', iwCopyNegativePrompt);
  book.pages.forEach((page, idx) => {
    const saved = state[page.id];
    const isDone = !!(saved && saved.image);
    const panel = document.createElement('div');
    panel.className = 'iw-panel' + (isDone ? ' done' : '');
    panel.innerHTML = `
      <div class="iw-panel-head">
        <span class="iw-panel-emoji">${page.emoji}</span>
        <span class="iw-panel-name">${idx + 1}. ${page.name}</span>
        <span class="iw-status ${isDone ? 'done' : 'pending'}">${isDone ? '✅ Done' : '⏳ Pending'}</span>
      </div>
      <div class="iw-prompt" id="iw-prompt-${page.id}">${iwResolvePrompt(page.prompt).replace(/</g, '&lt;')}</div>
      <div class="iw-panel-actions">
        <button class="iw-btn iw-btn-primary" data-action="copy-only" data-page="${page.id}" title="Solo copia el prompt — usa con OpenArt ya abierto + bookmarklet">📋 Copy</button>
        <button class="iw-btn iw-btn-ghost" data-action="copy-open" data-page="${page.id}" title="Copia el prompt y abre OpenArt en nueva pestaña">🚀 Copy + Open OpenArt</button>
        <button class="iw-btn iw-btn-ghost" data-action="upload" data-page="${page.id}">📁 Upload image</button>
        ${isDone ? `<button class="iw-btn iw-btn-ghost" data-action="replace" data-page="${page.id}">Replace</button>` : ''}
      </div>
      <div class="iw-dropzone" data-page="${page.id}">
        Drop image here or click to upload (PNG / JPG)
      </div>
      ${isDone ? `
        <div class="iw-thumb-row">
          <img class="iw-thumb" src="${saved.image}" alt="${page.name}" />
          <div class="iw-thumb-meta">
            <strong>${page.outputFile}</strong>
            Guardado: ${new Date(saved.savedAt).toLocaleString()}<br>
            Tamaño: ${Math.round(saved.image.length / 1024)} KB (base64)
          </div>
        </div>
      ` : ''}
    `;
    container.appendChild(panel);
  });

  // Wire up events (delegation per panel after innerHTML)
  container.querySelectorAll('button[data-action]').forEach(btn => {
    const pid = btn.dataset.page;
    const action = btn.dataset.action;
    btn.addEventListener('click', () => {
      if (action === 'copy-only') iwCopyOnly(pid);
      else if (action === 'copy-open') iwCopyAndOpen(pid);
      else if (action === 'upload') iwTriggerUpload(pid);
      else if (action === 'replace') iwReplacePage(pid);
    });
  });

  container.querySelectorAll('.iw-dropzone').forEach(zone => {
    const pid = zone.dataset.page;
    zone.addEventListener('click', () => iwTriggerUpload(pid));
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) iwHandleFile(file, pid);
    });
  });
}

function iwTriggerUpload(pageId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) iwHandleFile(file, pageId);
  };
  input.click();
}

function iwRenderProgress() {
  const book = IW_BOOKS[iwActiveBook];
  const state = iwLoadState(iwActiveBook);
  const total = book.pages.length;
  const done = book.pages.filter(p => state[p.id] && state[p.id].image).length;
  const fill = document.getElementById('iw-progress-fill');
  const text = document.getElementById('iw-progress-text');
  if (fill) fill.style.width = ((done / total) * 100) + '%';
  if (text) text.textContent = `${done}/${total} done`;
}

function iwRenderBookSelect() {
  const sel = document.getElementById('iw-book-select');
  if (!sel) return;
  sel.innerHTML = '';
  Object.keys(IW_BOOKS).forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = IW_BOOKS[id].title;
    if (id === iwActiveBook) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', (e) => {
    iwActiveBook = e.target.value;
    iwRender();
  });
}

function iwRender() {
  iwRenderProgress();
  iwRenderPanels();
}

document.addEventListener('DOMContentLoaded', () => {
  iwRenderBookSelect();
  iwRender();

  // Re-render Imágenes IA every time the user switches into the tab. This
  // ensures any change in the wizard (mascot, palette, visual style, niche,
  // trim) is reflected without a page reload. The tab handler in app.js only
  // toggles CSS classes — it doesn't know to refresh content.
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.dataset.tab === 'imagesai') {
      tab.addEventListener('click', () => {
        // Defer one tick so the class-toggle in app.js's handler runs first
        // and the panel becomes visible before we paint into it.
        setTimeout(iwRender, 0);
      });
    }
  });

  // Also re-render when the wizard updates the active project. bwUpdate fires
  // a custom event on document so any external view (Imágenes IA, future tabs)
  // can refresh in sync.
  document.addEventListener('bw:project-updated', () => {
    const tab = document.getElementById('imagesai');
    if (tab && tab.classList.contains('active')) iwRender();
  });
});
