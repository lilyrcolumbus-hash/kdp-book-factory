// Image Generation — Phase A (cover automation via fal.ai + Ideogram-v2)
//
// Why Ideogram-v2: it's the only mainstream model that renders TEXT (title,
// subtitle, "Vol N") without gibberish. Critical for KDP covers.
//
// Architecture:
//   - User stores fal.ai API key in localStorage (key 'falai_api_key')
//   - Sync endpoint POST → returns image URL hosted on fal.ai CDN
//   - User picks one of 3 variants → fetched + base64 → project.assets['cover-front']
//   - Other variants discarded to save localStorage space

const IG_KEY_STORAGE = 'falai_api_key';
const IG_ENDPOINT_IDEOGRAM = 'https://fal.run/fal-ai/ideogram/v2';
const IG_ENDPOINT_FLUX = 'https://fal.run/fal-ai/flux-pro/v1.1';
const IG_TIMEOUT_MS = 90000;

// ====================== API KEY MANAGEMENT ======================

function igGetApiKey() { return localStorage.getItem(IG_KEY_STORAGE) || ''; }
function igSetApiKey(k) { localStorage.setItem(IG_KEY_STORAGE, (k || '').trim()); }
function igClearApiKey() { localStorage.removeItem(IG_KEY_STORAGE); }
function igHasKey() { return !!igGetApiKey(); }

// ====================== PROMPT BUILDER ======================

// Build 3 distinct cover prompts for the project. Each variant has a different angle:
//   A: mascot-prominent (energetic, character-driven)
//   B: typography-driven (modern, editorial)
//   C: illustrated scene (atmospheric, narrative cover)
function igBuildCoverPrompts(project) {
  const m = project.marketing || {};
  const p = project.positioning || {};
  const s = project.style || {};
  const palette = s.clusterPalette || {};
  const dominant = palette.dominant || s.palette || 'teal';
  const accents = (palette.accents || []).slice(0, 2).filter(Boolean).join(' and ') || 'cream and ochre';
  const typography = palette.typography || 'bold sans-serif';
  const mascotDesc = s.mascot && s.mascot.has ? (s.mascot.type || 'pink cartoon brain mascot with sunglasses and headphones') : '';

  const titleText = (m.title || 'Brain Games').replace(/"/g, '\\"');
  const subtitleText = (m.subtitle || '').replace(/"/g, '\\"').slice(0, 120);
  const niche = (p.niche || '').replace(/-/g, ' ').replace(/:.*$/, '');

  // Common style spine — applied to all 3 variants for visual coherence
  const baseStyle = [
    'KDP paperback book cover',
    'vertical 6x9 ratio composition',
    `${dominant} dominant color`,
    `accent colors ${accents}`,
    `${typography} title typography`,
    'high contrast, eye-catching at thumbnail size',
    'professional book cover design',
    'no watermark, no stock photo, no real human face'
  ].join(', ');

  return [
    {
      id: 'A',
      label: 'Mascot prominent',
      prompt: `${baseStyle}. The title text "${titleText}" appears in large bold letters at the top, fully readable. ${mascotDesc ? `${mascotDesc} centered in the lower half in an energetic pose. ` : ''}Subtitle "${subtitleText}" smaller below the title. Comic book style, dynamic and fun composition, bright colors.`,
      style: 'DESIGN'
    },
    {
      id: 'B',
      label: 'Typography-driven',
      prompt: `${baseStyle}. The title text "${titleText}" dominates the cover with large stylized lettering occupying 60% of the canvas, perfectly legible. Subtitle "${subtitleText}" smaller centered below. Minimal abstract pattern background. ${mascotDesc ? `Small ${mascotDesc} icon in a corner. ` : ''}Modern editorial design, strong typography focus.`,
      style: 'DESIGN'
    },
    {
      id: 'C',
      label: 'Illustrated scene',
      prompt: `${baseStyle}. Atmospheric illustrated background scene related to ${niche} with floating ${niche} elements. ${mascotDesc ? `${mascotDesc} integrated naturally into the scene. ` : ''}The title "${titleText}" overlaid at the top in bold readable lettering. Subtitle "${subtitleText}" smaller. Editorial illustration style, narrative cover art.`,
      style: 'ILLUSTRATION'
    }
  ];
}

// ====================== FAL.AI CLIENT ======================

// Call fal.ai sync endpoint for one Ideogram-v2 generation.
// Returns the URL of the generated image hosted on fal.ai CDN.
async function igGenerateOne({ prompt, style = 'AUTO', aspectRatio = 'ASPECT_9_16', endpoint = IG_ENDPOINT_IDEOGRAM, negativePrompt }) {
  const key = igGetApiKey();
  if (!key) throw new Error('fal.ai API key missing — paste it in the Cover Generator card.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IG_TIMEOUT_MS);

  let resp;
  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: aspectRatio,
        style,
        expand_prompt: false,
        negative_prompt: negativePrompt || 'watermark, text artifact, blurry text, low quality, real human face, photo realistic person, distorted letters, gibberish text'
      }),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('fal.ai request timed out (90s). Try again or check your network.');
    throw new Error('Network error calling fal.ai: ' + e.message);
  }
  clearTimeout(timer);

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    if (resp.status === 401 || resp.status === 403) throw new Error('fal.ai rejected the API key. Verify it at fal.ai/dashboard/keys.');
    if (resp.status === 402) throw new Error('fal.ai out of credits. Top up at fal.ai/dashboard/billing.');
    throw new Error(`fal.ai API ${resp.status}: ${text.slice(0, 200) || resp.statusText}`);
  }
  const data = await resp.json();
  const url =
    data?.images?.[0]?.url ||
    data?.image?.url ||
    (Array.isArray(data?.output) ? data.output[0] : null);
  if (!url) throw new Error('fal.ai response missing image URL: ' + JSON.stringify(data).slice(0, 200));
  return url;
}

// Generate 3 cover variants in parallel. Calls onProgress(index, status, url) for each.
async function igGenerateCoverVariants(project, onProgress) {
  const variants = igBuildCoverPrompts(project);
  if (typeof onProgress === 'function') variants.forEach((v, i) => onProgress(i, 'pending', null));
  const results = await Promise.all(
    variants.map(async (v, i) => {
      try {
        const url = await igGenerateOne({ prompt: v.prompt, style: v.style });
        if (typeof onProgress === 'function') onProgress(i, 'done', url);
        return { ...v, url, error: null };
      } catch (e) {
        if (typeof onProgress === 'function') onProgress(i, 'error', null, e.message);
        return { ...v, url: null, error: e.message };
      }
    })
  );
  return results;
}

// Fetch a fal.ai CDN URL → base64 dataURL so it can persist in localStorage
async function igUrlToDataUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to fetch generated image: HTTP ' + resp.status);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert image to base64'));
    reader.readAsDataURL(blob);
  });
}

// Build the {dataUrl,width,height,sizeKB} shape that bcSaveAsset expects.
// Without this, bcGetAsset returns null (looks up .dataUrl on a bare string).
function igDataUrlToProcessed(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({
      dataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      sizeKB: Math.round(dataUrl.length / 1024 * 0.75),
    });
    img.onerror = () => reject(new Error('Could not decode generated image'));
    img.src = dataUrl;
  });
}

// ====================== INTERIOR PROMPTS (Phase B) ======================
//
// Builds prompts for every required slot EXCEPT cover-front (handled by Phase A
// covergen, picks 1 of 3 variants). For interior we generate exactly one image
// per slot — the user can regenerate a single slot if they don't like the result.
//
// Slot type → endpoint choice:
//   - section-divider, welcome, solutions-divider, quote: Ideogram-v2 (text rendering)
//   - corner-ornament-*, cover-back: Flux-pro (no text needed, cleaner illustrations)

function igBuildInteriorPrompts(project) {
  if (typeof bcGetRequiredSlots !== 'function') return [];
  const slots = bcGetRequiredSlots(project)
    .filter(s => s.id !== 'cover-front'); // covered by Phase A

  const m = project.marketing || {};
  const s = project.style || {};
  const c = project.content || {};
  const palette = s.clusterPalette || {};
  const dominant = palette.dominant || s.palette || 'teal';
  const accents = (palette.accents || []).slice(0, 2).filter(Boolean).join(' and ') || 'cream and ochre';
  const typography = palette.typography || 'bold sans-serif';
  const mascotDesc = s.mascot && s.mascot.has ? (s.mascot.type || 'pink cartoon brain mascot with sunglasses and headphones') : '';
  const visualStyle = s.visualStyle || 'comic-wimpy-kid';
  const styleNote = visualStyle.includes('comic') ? 'comic book illustration style, dynamic and fun' : 'editorial illustration style';

  const baseStyle = [
    `${dominant} dominant color`,
    `accent ${accents}`,
    `${typography} display lettering`,
    styleNote,
    'KDP interior page art, vertical 6x9 ratio',
    'no watermark, no real human face, no photorealism, no gibberish text'
  ].join(', ');

  const sections = c.sections || [];

  return slots.map(slot => {
    if (slot.id === 'cover-back') {
      const titleText = (m.title || 'Brain Games').replace(/"/g, '\\"');
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_FLUX,
        aspectRatio: 'ASPECT_9_16',
        style: 'AUTO',
        prompt: `${baseStyle}. Back cover of a paperback book. ${mascotDesc ? `${mascotDesc} small at the top, friendly pose. ` : ''}Empty area in the middle for description text overlay (clean negative space). Decorative pattern border. Bottom area reserved for barcode. Coherent with the front cover of "${titleText}".`
      };
    }

    if (slot.id === 'welcome') {
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_IDEOGRAM,
        aspectRatio: 'ASPECT_9_16',
        style: 'DESIGN',
        prompt: `${baseStyle}. Full-page welcome illustration. The text "WELCOME" appears in large bold lettering at the top, perfectly legible. ${mascotDesc ? `${mascotDesc} centered, waving in an inviting pose. ` : ''}Decorative elements floating around. Friendly, energetic, opening-page feel.`
      };
    }

    if (slot.id === 'quote') {
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_IDEOGRAM,
        aspectRatio: 'ASPECT_9_16',
        style: 'DESIGN',
        prompt: `${baseStyle}. Decorative full-page quote frame. Empty central area surrounded by ornamental border (vines, geometric, or pattern depending on style). ${mascotDesc ? `Small ${mascotDesc} icon in a corner. ` : ''}Reserve clean space in the middle for quote text overlay. Editorial poster look.`
      };
    }

    if (slot.id === 'solutions-divider') {
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_IDEOGRAM,
        aspectRatio: 'ASPECT_9_16',
        style: 'DESIGN',
        prompt: `${baseStyle}. Full-page section divider. The text "SOLUTIONS" in huge bold readable lettering at the top, perfectly legible. ${mascotDesc ? `${mascotDesc} pointing to a clipboard or check mark. ` : ''}Decorative pattern background. Closing-section feel.`
      };
    }

    // Section divider: section-divider-{idx}
    const sdMatch = slot.id.match(/^section-divider-(\d+)$/);
    if (sdMatch) {
      const idx = parseInt(sdMatch[1]);
      const sec = sections[idx] || {};
      const sectionName = (sec.name || `Section ${idx + 1}`).replace(/"/g, '\\"');
      const tagline = (sec.tagline || '').replace(/"/g, '\\"').slice(0, 100);
      const themeHint = igSectionThemeHint(sec.type);
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_IDEOGRAM,
        aspectRatio: 'ASPECT_9_16',
        style: 'DESIGN',
        prompt: `${baseStyle}. Full-page section divider. The title "${sectionName}" in huge bold lettering at the top, perfectly legible. ${tagline ? `Subtitle "${tagline}" smaller below. ` : ''}${themeHint} ${mascotDesc ? `${mascotDesc} themed for ${sec.type || 'this section'}, energetic pose. ` : ''}Decorative props related to ${sec.type || 'puzzles'} floating around. Opening-section feel.`
      };
    }

    // Corner ornament (per-section or global)
    const corMatch = slot.id.match(/^corner-ornament-(\d+)$/);
    if (corMatch || slot.id === 'corner-ornament') {
      const idx = corMatch ? parseInt(corMatch[1]) : -1;
      const sec = idx >= 0 ? (sections[idx] || {}) : null;
      const themeHint = sec ? igSectionThemeHint(sec.type) : '';
      return {
        slotId: slot.id,
        label: slot.label,
        endpoint: IG_ENDPOINT_FLUX,
        aspectRatio: 'ASPECT_1_1',
        style: 'AUTO',
        prompt: `Small decorative corner ornament illustration. ${dominant} and ${accents} colors. ${sec ? `Themed for ${sec.name || sec.type}: ${themeHint}` : 'Generic decorative motif'}. Simple, minimal, fits in a 1x1 inch area. Transparent or white background. ${styleNote}. No text.`
      };
    }

    // Fallback (shouldn't happen)
    return {
      slotId: slot.id,
      label: slot.label,
      endpoint: IG_ENDPOINT_IDEOGRAM,
      aspectRatio: 'ASPECT_9_16',
      style: 'DESIGN',
      prompt: `${baseStyle}. Decorative page art for "${slot.label}".`
    };
  });
}

// Per-section type theme hint to flavor prompts
function igSectionThemeHint(type) {
  switch ((type || '').toLowerCase()) {
    case 'wordsearch':  return 'Detective vibe with magnifying glass, scattered letters, search-themed iconography.';
    case 'sudoku':      return 'Number grid pattern, ninja-stealth vibe, cells with digits.';
    case 'math':        return 'Math symbols floating (+, −, ×, ÷, =), calculator energy.';
    case 'mazes':       return 'Maze paths, runner trails, labyrinth lines.';
    case 'cryptogram':  return 'Cipher symbols, secret-agent spy vibe, hidden code feel.';
    case 'rebus':       return 'Picture-puzzle vibe, mixed icons and emoji-like shapes.';
    case 'crossword':   return 'Crossword grid blocks, classic puzzle look.';
    default:            return 'Puzzle-themed iconography.';
  }
}

// Generate a single interior slot. Returns the fal.ai CDN URL.
async function igGenerateInteriorOne(slot) {
  return await igGenerateOne({
    prompt: slot.prompt,
    style: slot.style || 'DESIGN',
    aspectRatio: slot.aspectRatio || 'ASPECT_9_16',
    endpoint: slot.endpoint || IG_ENDPOINT_IDEOGRAM,
  });
}

// ====================== EXPORTS ======================

if (typeof window !== 'undefined') {
  window.igGetApiKey = igGetApiKey;
  window.igSetApiKey = igSetApiKey;
  window.igClearApiKey = igClearApiKey;
  window.igHasKey = igHasKey;
  window.igBuildCoverPrompts = igBuildCoverPrompts;
  window.igGenerateOne = igGenerateOne;
  window.igGenerateCoverVariants = igGenerateCoverVariants;
  window.igUrlToDataUrl = igUrlToDataUrl;
  window.igDataUrlToProcessed = igDataUrlToProcessed;
  window.igBuildInteriorPrompts = igBuildInteriorPrompts;
  window.igGenerateInteriorOne = igGenerateInteriorOne;
}
