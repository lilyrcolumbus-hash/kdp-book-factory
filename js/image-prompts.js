// =============================================================
// IMAGE PROMPT GENERATOR
// Generates detailed, niche-specific Midjourney/DALL-E prompts
// Each call produces a unique combination so no two books look alike
// =============================================================

const IMAGE_PROMPTS = {

    // ---------------------------------------------------------
    // ADHD PLANNER NICHE
    // ---------------------------------------------------------
    adhd: {
        label: 'ADHD Planner',
        description: 'Calmante, no abrumador, neutro/boho, profesional pero amigable',

        // Style variations - each generates a distinct visual identity
        styles: [
            {
                name: 'Boho Neutral Watercolor',
                bgPrompt: 'Soft watercolor background for ADHD productivity planner, warm cream paper texture (#F5F0E8), very subtle washes of sage green and dusty terracotta in opposite corners, hand-painted boho aesthetic, plenty of empty space in the center for journaling, calming and non-overwhelming, minimal abstract organic shapes, no text, no people, no faces, soft natural lighting, high resolution print quality, 300 DPI, professional book interior background',
                illustrations: [
                    'Minimal line art illustration of an abstract human brain silhouette filled with delicate botanical leaves and tiny stars, single continuous line drawing in warm charcoal (#3C3A36) on transparent background, boho minimalist style, hand-drawn aesthetic, no shading, no color fill, vector style',
                    'Minimal line art illustration of a coffee cup with steam forming small swirls and one tiny star, single line drawing in warm charcoal on transparent background, hand-drawn boho style, represents morning routine, no color fill',
                    'Minimal line art illustration of a small potted plant with three leaves and one trailing vine, single continuous line in warm charcoal on transparent background, boho minimalist, represents growth and self-care, no color fill',
                    'Minimal line art illustration of three small five-pointed stars of varying sizes scattered diagonally, hand-drawn imperfect lines in warm charcoal on transparent background, represents priorities and focus, no color fill',
                    'Minimal line art illustration of a heart shape made from a single continuous wavy line in warm charcoal on transparent background, boho hand-drawn style, represents self-compassion, no color fill',
                    'Minimal line art horizontal divider made of small dots, dashes and one tiny leaf in the center, warm charcoal on transparent background, boho aesthetic, separates sections',
                    'Minimal line art illustration of a crescent moon with three small stars beside it, single line hand-drawn in warm charcoal on transparent background, boho style, represents evening routine and reflection, no color fill',
                ],
                coverPrompt: 'Book cover background for ADHD planner, cream paper texture, large soft watercolor wash of sage green and terracotta in bottom right corner, abstract botanical line art of leaves in top left, plenty of empty space in upper center for title, boho neutral aesthetic, calming, professional KDP book cover, 8.5x11 inch ratio, no text',
                palette: { cream: '#F5F0E8', sand: '#E8DCC4', mocha: '#8B7355', sage: '#A8B5A0', terracotta: '#C08B6D', dustyRose: '#D4A5A0', charcoal: '#3C3A36', softGray: '#B8B3A8' },
                fonts: { display: 'Playfair Display', body: 'Lato', accent: 'Caveat' },
            },
            {
                name: 'Minimal Botanical',
                bgPrompt: 'Minimal botanical background for ADHD planner, off-white paper (#FAF7F2), single thin sage green (#9CAF88) botanical line art branch with small leaves running along the left edge only, lots of empty white space, Scandinavian minimalist aesthetic, calm and uncluttered, no text, no people, soft and airy, professional book interior background, 300 DPI',
                illustrations: [
                    'Minimal botanical line art of a single olive branch with five small leaves, thin sage green lines (#9CAF88) on transparent background, Scandinavian minimalist style, no shading',
                    'Minimal line art of a small eucalyptus sprig with rounded leaves, thin sage green lines on transparent background, Scandinavian style',
                    'Minimal line art of three vertical wheat stalks of varying heights, thin sage green lines on transparent background, minimalist',
                    'Minimal line art geometric circle with a single leaf inside, thin sage green lines on transparent background, represents focus',
                    'Minimal line art of a small sun with eight short rays, thin warm amber (#D4A574) lines on transparent background, minimalist',
                    'Minimal line art horizontal line with one small leaf in the center, sage green on transparent background, divider element',
                    'Minimal line art of a small mountain range with three peaks, thin charcoal lines on transparent background, represents goals',
                ],
                coverPrompt: 'Minimalist book cover background for ADHD planner, off-white paper, single sage green botanical branch with leaves curving from bottom left to top right, vast empty space for title placement, Scandinavian minimalist aesthetic, calm and professional, 8.5x11 ratio, no text',
                palette: { offWhite: '#FAF7F2', linen: '#EFE9DC', sage: '#9CAF88', amber: '#D4A574', taupe: '#A89684', clay: '#B5896A', charcoal: '#3C3A36', mist: '#D8D4CC' },
                fonts: { display: 'Cormorant Garamond', body: 'Inter', accent: 'Dancing Script' },
            },
            {
                name: 'Earth Tone Geometric',
                bgPrompt: 'Geometric minimalist background for ADHD productivity planner, warm beige (#EEE5D6) base, large soft circle of muted terracotta (#B5765A) in top right corner with low opacity, single thin charcoal line crossing diagonally, Bauhaus inspired, calm and grounding, modern earthy aesthetic, no text, no people, plenty of negative space, professional book interior, 300 DPI',
                illustrations: [
                    'Minimal geometric illustration of three concentric circles in muted terracotta and sage tones, transparent background, modern Bauhaus style, represents priorities',
                    'Minimal geometric illustration of a half circle and a small full circle side by side in earth tones, transparent background, modern minimalist',
                    'Minimal geometric illustration of three vertical bars of varying heights in muted earth tones (terracotta, sage, mustard), transparent background, represents progress tracking',
                    'Minimal geometric illustration of an arch shape with a small dot inside, charcoal outline on transparent background, modern minimalist',
                    'Minimal geometric illustration of a triangle and circle overlapping in muted earth tones, transparent background, Bauhaus inspired',
                    'Minimal geometric horizontal divider made of one long line and three small squares, charcoal on transparent background',
                    'Minimal geometric illustration of a sun made from a circle and short straight lines, warm mustard yellow on transparent background, modern style',
                ],
                coverPrompt: 'Modern geometric book cover background for ADHD planner, warm beige base, large terracotta half circle in bottom right, sage green small circle in top left, single thin charcoal diagonal line, Bauhaus inspired, plenty of empty space center for title, professional KDP cover, 8.5x11 ratio, no text',
                palette: { beige: '#EEE5D6', cream: '#F7F1E5', terracotta: '#B5765A', sage: '#9CAF88', mustard: '#C9A96E', charcoal: '#3C3A36', rust: '#9B5D3F', stone: '#C7BCAE' },
                fonts: { display: 'Archivo', body: 'Work Sans', accent: 'Caveat' },
            },
        ],
    },

    // ---------------------------------------------------------
    // SENIOR NICHE (large print, accessible, friendly)
    // ---------------------------------------------------------
    senior: {
        label: 'Senior / Large Print',
        description: 'Alto contraste, fácil de leer, amigable, nostálgico, no infantil',

        styles: [
            {
                name: 'Vintage Garden',
                bgPrompt: 'Vintage garden background for senior activity book, soft cream paper (#FBF6EC) with subtle aged texture, very pale watercolor wash of dusty pink roses and pale green leaves in the top right corner only, lots of empty white space in the center for puzzles or activities, traditional cottage garden aesthetic, nostalgic and warm, high contrast clean center area, no text, no people, soft warm lighting, professional book interior background, 300 DPI, large print friendly',
                illustrations: [
                    'Vintage botanical illustration of a single rose with two leaves, soft watercolor in dusty pink and sage green, traditional cottage garden style, transparent background, high contrast outlines, suitable for senior readers',
                    'Vintage botanical illustration of a small daisy with five petals and yellow center, soft watercolor style, transparent background, traditional and nostalgic',
                    'Vintage illustration of a small bird perched on a branch with one leaf, soft watercolor in sage and cream tones, transparent background, traditional garden bird like a robin or sparrow',
                    'Vintage illustration of a teacup and saucer with steam, soft watercolor in cream and pale blue, transparent background, nostalgic English tea aesthetic',
                    'Vintage illustration of a butterfly with delicate wings in pale blue and cream, soft watercolor, transparent background, traditional garden style',
                    'Vintage decorative horizontal divider with small flowers and curves, soft sage green watercolor on transparent background, traditional ornamental',
                    'Vintage illustration of a small bouquet of three flowers tied with a ribbon, soft watercolor in dusty pink, sage and cream, transparent background, nostalgic',
                ],
                coverPrompt: 'Vintage cottage garden book cover background for senior activity book, cream aged paper texture, soft watercolor border of roses, daisies and leaves around the edges in dusty pink and sage green, large empty cream space in the center for the title, nostalgic and warm, traditional aesthetic, high readability, professional KDP cover, 8.5x11 ratio, no text',
                palette: { cream: '#FBF6EC', ivory: '#F5EDD8', dustyPink: '#D9A5A0', sage: '#9CAF88', paleBlue: '#B8C9D4', warmBrown: '#7A5C3F', gold: '#C9A96E', charcoal: '#2E2A24' },
                fonts: { display: 'Playfair Display', body: 'Merriweather', accent: 'Great Vibes' },
            },
            {
                name: 'Classic High Contrast',
                bgPrompt: 'Clean classic background for senior large print book, pure off-white paper (#FCFAF5), single thin elegant border frame in deep navy blue (#2C4A6B) with small ornamental corners, vast empty white space inside the frame for puzzles or text, traditional and elegant aesthetic, high contrast for easy reading, no text, no people, professional book interior, 300 DPI, accessibility friendly',
                illustrations: [
                    'Classic ornamental decorative element in deep navy blue, traditional Victorian flourish style, transparent background, high contrast, elegant',
                    'Classic illustration of a vintage pocket watch with chain, line art in deep navy blue on transparent background, nostalgic and traditional',
                    'Classic illustration of an open book with bookmark, line art in deep navy blue on transparent background, traditional library aesthetic',
                    'Classic illustration of a small steam train, simple line art in deep navy blue on transparent background, nostalgic Americana style',
                    'Classic illustration of a vintage compass with cardinal points, line art in deep navy blue on transparent background, traditional',
                    'Classic ornamental horizontal divider with center medallion and curling vines, navy blue on transparent background, Victorian style',
                    'Classic illustration of a quill pen and inkwell, line art in deep navy blue on transparent background, traditional writing aesthetic',
                ],
                coverPrompt: 'Classic elegant book cover background for senior large print book, off-white paper, ornamental navy blue frame with Victorian flourishes in corners, large empty cream space center for title, traditional and dignified, high contrast for visibility, professional KDP cover, 8.5x11 ratio, no text',
                palette: { offWhite: '#FCFAF5', cream: '#F5EFE0', navy: '#2C4A6B', burgundy: '#7B2D3F', forest: '#3D5A47', gold: '#B8924C', charcoal: '#1F1B17', stone: '#C9C2B5' },
                fonts: { display: 'Playfair Display', body: 'Lora', accent: 'Italianno' },
            },
            {
                name: 'Sunny Coastal',
                bgPrompt: 'Sunny coastal background for senior activity book, light sandy cream (#FAF2E1), very soft watercolor wash of pale ocean blue and sandy beige in the bottom edge suggesting a horizon, plenty of clear empty space above, calming beach aesthetic, warm and uplifting, high contrast clean area for content, no text, no people, soft natural light, professional book interior, 300 DPI',
                illustrations: [
                    'Soft watercolor illustration of a seashell with delicate ridges in cream and pale pink, transparent background, coastal aesthetic, high contrast',
                    'Soft watercolor illustration of a sailboat with a triangular sail on calm water, in pale blue and cream, transparent background, peaceful coastal scene',
                    'Soft watercolor illustration of a starfish in warm coral and sand colors, transparent background, beach aesthetic',
                    'Soft watercolor illustration of a lighthouse with red and white stripes on a small cliff, transparent background, classic coastal',
                    'Soft watercolor illustration of a seagull in flight with simple silhouette, charcoal lines on transparent background, coastal',
                    'Soft watercolor horizontal divider of three small waves in pale blue, transparent background, coastal aesthetic',
                    'Soft watercolor illustration of a sun rising over wavy water in warm yellow and pale blue, transparent background, peaceful morning coastal',
                ],
                coverPrompt: 'Sunny coastal book cover background for senior activity book, sandy cream paper, soft watercolor scene of ocean waves and sun on the horizon at the bottom, seagulls in the upper sky, large empty sky area in the center for title, warm and uplifting, professional KDP cover, 8.5x11 ratio, no text',
                palette: { sand: '#FAF2E1', cream: '#F4E8CC', oceanBlue: '#7FA8C4', coral: '#E89B7A', warmYellow: '#E8C56B', driftwood: '#9C7B5C', deepBlue: '#3B5F7A', charcoal: '#2E2A24' },
                fonts: { display: 'Libre Baskerville', body: 'Source Sans 3', accent: 'Sacramento' },
            },
        ],
    },
};

// =============================================================
// COMBINATION TRACKER (avoids repeating combos within session)
// =============================================================
const usedCombos = JSON.parse(localStorage.getItem('imagePromptUsedCombos') || '{}');

function pickStyle(niche) {
    const data = IMAGE_PROMPTS[niche];
    if (!data) return null;
    const used = usedCombos[niche] || [];
    const available = data.styles.filter((s, i) => !used.includes(i));
    const pool = available.length > 0 ? available : data.styles;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const idx = data.styles.indexOf(choice);
    if (!usedCombos[niche]) usedCombos[niche] = [];
    if (!usedCombos[niche].includes(idx)) usedCombos[niche].push(idx);
    if (usedCombos[niche].length >= data.styles.length) usedCombos[niche] = [];
    localStorage.setItem('imagePromptUsedCombos', JSON.stringify(usedCombos));
    return choice;
}

// =============================================================
// MAIN GENERATOR
// =============================================================
function generateImagePrompts() {
    const niche = document.getElementById('ip-niche').value;
    const data = IMAGE_PROMPTS[niche];
    if (!data) return;

    const style = pickStyle(niche);
    const out = document.getElementById('ip-output');
    out.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.innerHTML = `
        <h3>Nicho: ${data.label}</h3>
        <p style="color:#888;font-size:0.85rem;margin-bottom:14px">${data.description}</p>
        <h3>Estilo seleccionado: ${style.name}</h3>
        <p class="copy-hint">Cada generacion produce una combinacion diferente. Click en cualquier prompt para copiarlo.</p>
    `;
    out.appendChild(header);

    // Master Background
    const bgSection = document.createElement('div');
    bgSection.innerHTML = `<h3>1. Background Maestro (Midjourney / DALL-E)</h3>`;
    const bgItem = document.createElement('div');
    bgItem.className = 'meta-item';
    bgItem.textContent = style.bgPrompt + ' --ar 17:22 --v 6 --style raw';
    bgSection.appendChild(bgItem);
    out.appendChild(bgSection);

    // Cover
    const coverSection = document.createElement('div');
    coverSection.innerHTML = `<h3>2. Portada del Libro</h3>`;
    const coverItem = document.createElement('div');
    coverItem.className = 'meta-item';
    coverItem.textContent = style.coverPrompt + ' --ar 17:22 --v 6 --style raw';
    coverSection.appendChild(coverItem);
    out.appendChild(coverSection);

    // Illustrations
    const illSection = document.createElement('div');
    illSection.innerHTML = `<h3>3. Ilustraciones Pequeñas Reusables (${style.illustrations.length})</h3>`;
    style.illustrations.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'meta-item';
        item.textContent = `[Ilustracion ${i + 1}] ` + p + ' --ar 1:1 --v 6 --style raw --no background, color fill, text, watermark';
        illSection.appendChild(item);
    });
    out.appendChild(illSection);

    // Palette
    const paletteSection = document.createElement('div');
    paletteSection.innerHTML = `<h3>4. Paleta de Colores (Hex Codes)</h3>`;
    const paletteGrid = document.createElement('div');
    paletteGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:10px';
    Object.entries(style.palette).forEach(([name, hex]) => {
        const swatch = document.createElement('div');
        swatch.className = 'meta-item';
        swatch.style.cssText = `display:flex;align-items:center;gap:10px;cursor:pointer`;
        swatch.innerHTML = `<div style="width:28px;height:28px;background:${hex};border-radius:6px;border:1px solid #2a2a4a;flex-shrink:0"></div><div><div style="font-size:0.75rem;color:#888">${name}</div><div style="font-family:monospace;font-size:0.85rem">${hex}</div></div>`;
        swatch.onclick = () => {
            navigator.clipboard.writeText(hex);
            swatch.classList.add('copied');
            setTimeout(() => swatch.classList.remove('copied'), 1000);
        };
        paletteGrid.appendChild(swatch);
    });
    paletteSection.appendChild(paletteGrid);
    out.appendChild(paletteSection);

    // Fonts
    const fontSection = document.createElement('div');
    fontSection.innerHTML = `<h3>5. Fonts Recomendadas (Google Fonts)</h3>`;
    Object.entries(style.fonts).forEach(([role, name]) => {
        const item = document.createElement('div');
        item.className = 'meta-item';
        item.textContent = `${role.toUpperCase()}: ${name}`;
        fontSection.appendChild(item);
    });
    out.appendChild(fontSection);

    // Workflow note
    const note = document.createElement('div');
    note.style.cssText = 'background:#1e1e40;border:1px solid #3a3a5a;border-radius:8px;padding:14px;margin-top:18px;font-size:0.85rem;line-height:1.6';
    note.innerHTML = `
        <strong style="color:#667eea">Como usar:</strong><br>
        1. Copia el prompt del background y pegalo en Midjourney o DALL-E<br>
        2. Copia los prompts de ilustraciones uno por uno y generalas<br>
        3. Descarga las imagenes y subelas a Canva<br>
        4. Usa la paleta y fonts en tu plantilla<br>
        5. Cada vez que generes un libro nuevo, vuelve a hacer click en "Generar" para obtener un estilo distinto y NO repetir imagenes entre tus libros
    `;
    out.appendChild(note);
}
