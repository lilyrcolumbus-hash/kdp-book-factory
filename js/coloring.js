// Coloring Book Builder Module

const COLORING_PROMPTS = {
    detailed: [
        'intricate {theme} with detailed patterns, adult coloring book page, black and white line art, no shading, clean outlines, white background',
        'beautiful {theme} surrounded by floral ornaments, adult coloring page, black outlines only, high detail, no grayscale, white background',
        'zentangle style {theme}, complex patterns, adult coloring book illustration, crisp black lines on white, no fill, no shading',
        '{theme} with mandala patterns in the background, adult coloring page, clean black line art, intricate details, pure white background',
        'decorative {theme} with swirls and botanical elements, adult coloring book, black and white only, detailed linework',
    ],
    simple: [
        'cute {theme} for kids coloring page, simple bold outlines, cartoon style, black and white, no shading, large spaces to color, white background',
        'friendly {theme} character, children coloring book page, thick black outlines, simple shapes, no details, white background',
        'happy {theme} in a simple scene, kids coloring page, bold lines, easy to color, cartoon style, black and white only',
        'adorable {theme} with big eyes, children coloring book illustration, very simple outlines, large areas, no shading',
        'playful {theme} for toddlers, very simple coloring page, extra thick lines, minimal detail, black and white',
    ],
    mandala: [
        'mandala with {theme} elements, circular symmetrical design, adult coloring page, black line art, intricate patterns, white background',
        'geometric mandala inspired by {theme}, radial symmetry, adult coloring book, clean black outlines, no shading, white background',
        '{theme} themed mandala with floral accents, highly detailed, coloring page for adults, black and white linework',
        'concentric mandala design featuring {theme} motifs, adult coloring illustration, precise black lines, pure white background',
        'ornate mandala combining {theme} and geometric shapes, adult coloring page, detailed line art, no grayscale',
    ],
    kawaii: [
        'kawaii {theme} with cute face expression, chibi style, coloring page, bold black outlines, simple, adorable, white background',
        'super cute kawaii {theme} with sparkles, coloring book page, clean black lines, simple shapes, no shading, white background',
        'adorable kawaii {theme} characters in a fun scene, coloring page, thick outlines, simple design, black and white only',
        'chibi style {theme} with happy expression, kawaii coloring book illustration, bold lines, minimal detail, white background',
        'cute kawaii {theme} with small accessories, coloring page for kids, simple black outlines, large areas to color',
    ],
    realistic: [
        'realistic {theme} illustration, coloring book page for adults, detailed black line art, anatomically correct, no shading, white background',
        'lifelike {theme} drawing, adult coloring page, fine detailed outlines, naturalistic style, black and white linework, no grayscale',
        'detailed realistic {theme} in natural setting, coloring book illustration, precise black lines, no fill, white background',
        'photorealistic style {theme}, adult coloring page, highly detailed line drawing, clean black outlines, no shading',
        'nature illustration of {theme}, scientific illustration style, coloring book page, detailed black linework, white background',
    ],
};

function generateColoringPrompts() {
    const theme = document.getElementById('cb-prompt-theme').value.trim();
    const style = document.getElementById('cb-prompt-style').value;
    const count = parseInt(document.getElementById('cb-prompt-count').value);

    if (!theme) { alert('Por favor ingresa un tema.'); return; }

    const templates = COLORING_PROMPTS[style];
    const output = document.getElementById('cb-prompts-output');
    output.style.display = 'block';

    const variations = [
        '', 'beautiful ', 'majestic ', 'enchanting ', 'stunning ', 'lovely ',
        'graceful ', 'charming ', 'elegant ', 'whimsical ', 'magical ',
        'exotic ', 'wild ', 'peaceful ', 'mysterious ', 'ancient ',
    ];

    let html = '<span class="copy-note">Haz clic en cualquier prompt para copiarlo al portapapeles</span>';
    for (let i = 0; i < count; i++) {
        const tpl = templates[i % templates.length];
        const variation = variations[i % variations.length];
        const prompt = tpl.replace('{theme}', variation + theme);
        html += `<div class="prompt-item">${i + 1}. ${prompt}</div>`;
    }
    output.innerHTML = html;
}

async function generateColoringBook() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('cb-title').value;
    const pageSize = document.getElementById('cb-pagesize').value;
    const addBlank = document.getElementById('cb-blank').value === 'yes';
    const files = document.getElementById('cb-images').files;

    if (!files || files.length === 0) {
        alert('Por favor sube al menos una imagen.');
        return;
    }

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 30;

    // Title page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw/2, ph/2 - 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${files.length} illustrations`, pw/2, ph/2 + 20, { align: 'center' });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imgData = await readFileAsDataURL(file);

        if (addBlank) {
            doc.addPage(); // blank page
        }
        doc.addPage();

        // Center image on page
        const maxW = pw - margin * 2;
        const maxH = ph - margin * 2;
        const img = await loadImage(imgData);
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const imgW = img.width * ratio;
        const imgH = img.height * ratio;
        const x = (pw - imgW) / 2;
        const y = (ph - imgH) / 2;

        doc.addImage(imgData, 'JPEG', x, y, imgW, imgH);
    }

    const date = new Date().toISOString().slice(0,10);
    doc.save(`ColoringBook_${date}.pdf`);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
