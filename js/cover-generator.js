// Cover Generator Module - Basic covers with text and colors

const COVER_PALETTES = [
    { bg: '#1a1a2e', text: '#e0e0ff', accent: '#667eea' },
    { bg: '#0d1b2a', text: '#e0fbfc', accent: '#3d5a80' },
    { bg: '#2d0a31', text: '#f0e6f6', accent: '#9b59b6' },
    { bg: '#1b2d1b', text: '#d4edda', accent: '#28a745' },
    { bg: '#2d1b1b', text: '#f8d7da', accent: '#dc3545' },
    { bg: '#1b1b2d', text: '#d6d6f5', accent: '#6c63ff' },
    { bg: '#2d2a1b', text: '#fff3cd', accent: '#ffc107' },
    { bg: '#f5f5dc', text: '#2c2c2c', accent: '#8b4513' },
    { bg: '#ffffff', text: '#1a1a1a', accent: '#e74c3c' },
    { bg: '#fdf2e9', text: '#2c3e50', accent: '#e67e22' },
];

const COVER_PATTERNS = {
    dots: function(doc, pw, ph, color) {
        doc.setFillColor(color);
        for (let y = 20; y < ph; y += 30) {
            for (let x = 20; x < pw; x += 30) {
                doc.circle(x, y, 1.5, 'F');
            }
        }
    },
    lines: function(doc, pw, ph, color) {
        doc.setDrawColor(color);
        doc.setLineWidth(0.3);
        for (let y = 0; y < ph; y += 15) {
            doc.line(0, y, pw, y);
        }
    },
    border: function(doc, pw, ph, color) {
        doc.setDrawColor(color);
        doc.setLineWidth(4);
        doc.rect(20, 20, pw - 40, ph - 40);
        doc.setLineWidth(1);
        doc.rect(30, 30, pw - 60, ph - 60);
    },
    geometric: function(doc, pw, ph, color) {
        doc.setDrawColor(color);
        doc.setLineWidth(0.5);
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * pw;
            const y = Math.random() * ph;
            const size = 20 + Math.random() * 40;
            if (i % 3 === 0) doc.circle(x, y, size);
            else if (i % 3 === 1) doc.rect(x, y, size, size);
            else doc.triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2);
        }
    },
    minimal: function() { /* intentionally empty */ },
};

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function generateCover() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('cv-title').value || 'My Book Title';
    const subtitle = document.getElementById('cv-subtitle').value || '';
    const author = document.getElementById('cv-author').value || '';
    const paletteIdx = parseInt(document.getElementById('cv-palette').value);
    const pattern = document.getElementById('cv-pattern').value;
    const pageSize = document.getElementById('cv-pagesize').value;

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });

    const palette = COVER_PALETTES[paletteIdx] || COVER_PALETTES[0];
    const [bgR, bgG, bgB] = hexToRgb(palette.bg);
    const [txtR, txtG, txtB] = hexToRgb(palette.text);
    const [accR, accG, accB] = hexToRgb(palette.accent);

    // Background
    doc.setFillColor(bgR, bgG, bgB);
    doc.rect(0, 0, pw, ph, 'F');

    // Pattern
    const patternColor = `rgb(${accR},${accG},${accB})`;
    doc.setDrawColor(accR, accG, accB);
    doc.setFillColor(accR, accG, accB);
    if (COVER_PATTERNS[pattern]) {
        COVER_PATTERNS[pattern](doc, pw, ph, patternColor);
    }

    // Accent bar
    doc.setFillColor(accR, accG, accB);
    doc.rect(0, ph * 0.35, pw, 4, 'F');
    doc.rect(0, ph * 0.65, pw, 4, 'F');

    // Title
    doc.setTextColor(txtR, txtG, txtB);
    doc.setFont('helvetica', 'bold');
    const titleSize = title.length > 30 ? 28 : (title.length > 20 ? 34 : 42);
    doc.setFontSize(titleSize);
    doc.text(title, pw / 2, ph * 0.48, { align: 'center', maxWidth: pw - 80 });

    // Subtitle
    if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(subtitle, pw / 2, ph * 0.56, { align: 'center', maxWidth: pw - 80 });
    }

    // Author
    if (author) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(author, pw / 2, ph * 0.85, { align: 'center' });
    }

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`Cover_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`);
}

function generateCoverBatch() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('cv-title').value || 'My Book Title';
    const subtitle = document.getElementById('cv-subtitle').value || '';
    const author = document.getElementById('cv-author').value || '';
    const pageSize = document.getElementById('cv-pagesize').value;
    const [pw, ph] = getPageDimensions(pageSize);

    const patterns = Object.keys(COVER_PATTERNS);

    for (let i = 0; i < 5; i++) {
        const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
        const palette = COVER_PALETTES[i % COVER_PALETTES.length];
        const [bgR, bgG, bgB] = hexToRgb(palette.bg);
        const [txtR, txtG, txtB] = hexToRgb(palette.text);
        const [accR, accG, accB] = hexToRgb(palette.accent);

        doc.setFillColor(bgR, bgG, bgB);
        doc.rect(0, 0, pw, ph, 'F');

        doc.setDrawColor(accR, accG, accB);
        doc.setFillColor(accR, accG, accB);
        COVER_PATTERNS[patterns[i % patterns.length]](doc, pw, ph);

        doc.setFillColor(accR, accG, accB);
        doc.rect(0, ph * 0.35, pw, 4, 'F');
        doc.rect(0, ph * 0.65, pw, 4, 'F');

        doc.setTextColor(txtR, txtG, txtB);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(38);
        doc.text(title, pw/2, ph*0.48, { align: 'center', maxWidth: pw - 80 });
        if (subtitle) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(16);
            doc.text(subtitle, pw/2, ph*0.56, { align: 'center', maxWidth: pw - 80 });
        }
        if (author) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.text(author, pw/2, ph*0.85, { align: 'center' });
        }

        doc.save(`Cover_variant_${i+1}.pdf`);
    }
}
