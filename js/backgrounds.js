// Background Art System
// Draws decorative elements on PDF pages using jsPDF drawing commands
// No external images needed — all vector-based for crisp print at 300 DPI

// ============ THEME ELEMENT LIBRARIES ============

const THEME_ELEMENTS = {
    animals: {
        name: 'Animals',
        corners: drawAnimalCorners,
        border: drawAnimalBorder,
        header: drawAnimalHeader,
        watermark: drawAnimalWatermark,
        colors: { primary: [101, 78, 50], secondary: [160, 130, 90], accent: [200, 165, 115] },
    },
    nature: {
        name: 'Nature / Botanical',
        corners: drawNatureCorners,
        border: drawNatureBorder,
        header: drawNatureHeader,
        watermark: drawNatureWatermark,
        colors: { primary: [60, 120, 60], secondary: [100, 160, 80], accent: [140, 190, 110] },
    },
    religious: {
        name: 'Religious / Spiritual',
        corners: drawReligiousCorners,
        border: drawReligiousBorder,
        header: drawReligiousHeader,
        watermark: drawReligiousWatermark,
        colors: { primary: [70, 60, 110], secondary: [140, 120, 180], accent: [200, 180, 120] },
    },
    vintage: {
        name: 'Vintage / Retro',
        corners: drawVintageCorners,
        border: drawVintageBorder,
        header: drawVintageHeader,
        watermark: drawVintageWatermark,
        colors: { primary: [120, 90, 60], secondary: [170, 140, 100], accent: [200, 175, 130] },
    },
    kids: {
        name: 'Kids / Playful',
        corners: drawKidsCorners,
        border: drawKidsBorder,
        header: drawKidsHeader,
        watermark: drawKidsWatermark,
        colors: { primary: [60, 140, 200], secondary: [255, 140, 60], accent: [100, 200, 100] },
    },
    geometric: {
        name: 'Geometric / Modern',
        corners: drawGeometricCorners,
        border: drawGeometricBorder,
        header: drawGeometricHeader,
        watermark: drawGeometricWatermark,
        colors: { primary: [50, 50, 70], secondary: [100, 100, 130], accent: [150, 150, 180] },
    },
};

// ============ MAIN ENTRY POINT ============

function drawPageBackground(doc, theme, style, pw, ph, pageNum, totalPages) {
    if (style === 'none' || !theme) return;
    const pack = THEME_ELEMENTS[theme];
    if (!pack) return;

    // Save state manually since saveGraphicsState may not exist
    const _prevDrawColor = doc.getDrawColor && doc.getDrawColor();
    const _prevFillColor = doc.getFillColor && doc.getFillColor();

    if (style === 'subtle') {
        // Corners on every page + border every 3rd page
        pack.corners(doc, pw, ph, 0.12);
        if (pageNum % 3 === 0) {
            pack.border(doc, pw, ph, 0.08);
        }
    } else if (style === 'full') {
        // Full art: watermark every 4th page, border every page, header + corners always
        pack.corners(doc, pw, ph, 0.18);
        pack.border(doc, pw, ph, 0.12);
        pack.header(doc, pw, ph, 0.15);
        if (pageNum % 4 === 0) {
            pack.watermark(doc, pw, ph, 0.06);
        }
    }

    // Reset to black defaults after drawing backgrounds
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(0, 0, 0);
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.5);
}

function drawTitlePageBackground(doc, theme, style, pw, ph) {
    if (style === 'none' || !theme) return;
    const pack = THEME_ELEMENTS[theme];
    if (!pack) return;

    // Save state manually since saveGraphicsState may not exist
    const _prevDrawColor = doc.getDrawColor && doc.getDrawColor();
    const _prevFillColor = doc.getFillColor && doc.getFillColor();
    pack.border(doc, pw, ph, 0.20);
    pack.corners(doc, pw, ph, 0.25);
    if (style === 'full') {
        pack.watermark(doc, pw, ph, 0.08);
    }
    // Reset to black defaults after drawing backgrounds
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(0, 0, 0);
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.5);
}

// ============ UTILITY DRAWING FUNCTIONS ============

function setColorWithOpacity(doc, rgb, opacity, fill) {
    const r = Math.round(rgb[0] + (255 - rgb[0]) * (1 - opacity));
    const g = Math.round(rgb[1] + (255 - rgb[1]) * (1 - opacity));
    const b = Math.round(rgb[2] + (255 - rgb[2]) * (1 - opacity));
    if (fill) {
        doc.setFillColor(r, g, b);
    } else {
        doc.setDrawColor(r, g, b);
    }
}

function drawLeaf(doc, cx, cy, size, angle, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(0.8);
    const rad = angle * Math.PI / 180;
    const tipX = cx + Math.cos(rad) * size;
    const tipY = cy + Math.sin(rad) * size;
    // Leaf body as two arcs approximated by curves
    const perpX = Math.cos(rad + Math.PI/2) * size * 0.3;
    const perpY = Math.sin(rad + Math.PI/2) * size * 0.3;
    // Draw leaf outline
    doc.lines([
        [size * 0.3 * Math.cos(rad) + perpX, size * 0.3 * Math.sin(rad) + perpY,
         size * 0.7 * Math.cos(rad) + perpX * 0.5, size * 0.7 * Math.sin(rad) + perpY * 0.5,
         tipX - cx, tipY - cy]
    ], cx, cy);
    doc.lines([
        [size * 0.3 * Math.cos(rad) - perpX, size * 0.3 * Math.sin(rad) - perpY,
         size * 0.7 * Math.cos(rad) - perpX * 0.5, size * 0.7 * Math.sin(rad) - perpY * 0.5,
         tipX - cx, tipY - cy]
    ], cx, cy);
    // Center vein
    doc.line(cx, cy, tipX, tipY);
}

function drawStar(doc, cx, cy, outerR, innerR, points, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, true);
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(0.5);
    const step = Math.PI / points;
    let path = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = i * step - Math.PI / 2;
        path.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
    }
    // Draw as lines
    for (let i = 0; i < path.length; i++) {
        const next = (i + 1) % path.length;
        doc.line(path[i][0], path[i][1], path[next][0], path[next][1]);
    }
}

function drawHeart(doc, cx, cy, size, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(0.8);
    // Simple heart with lines
    const s = size;
    doc.line(cx, cy + s * 0.3, cx - s * 0.5, cy - s * 0.1);
    doc.line(cx - s * 0.5, cy - s * 0.1, cx - s * 0.3, cy - s * 0.4);
    doc.line(cx - s * 0.3, cy - s * 0.4, cx, cy - s * 0.15);
    doc.line(cx, cy - s * 0.15, cx + s * 0.3, cy - s * 0.4);
    doc.line(cx + s * 0.3, cy - s * 0.4, cx + s * 0.5, cy - s * 0.1);
    doc.line(cx + s * 0.5, cy - s * 0.1, cx, cy + s * 0.3);
}

function drawCross(doc, cx, cy, size, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(1.2);
    doc.line(cx, cy - size, cx, cy + size);
    doc.line(cx - size * 0.7, cy - size * 0.3, cx + size * 0.7, cy - size * 0.3);
}

function drawCirclePattern(doc, cx, cy, radius, count, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(0.5);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        doc.circle(x, y, radius * 0.15);
    }
}

function drawDottedLine(doc, x1, y1, x2, y2, dotSpacing, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, true);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dots = Math.floor(dist / dotSpacing);
    for (let i = 0; i <= dots; i++) {
        const t = i / dots;
        doc.circle(x1 + dx * t, y1 + dy * t, 0.8, 'F');
    }
}

function drawSwirl(doc, cx, cy, maxR, turns, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, false);
    doc.setLineWidth(0.6);
    let prevX = cx, prevY = cy;
    const steps = turns * 30;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * Math.PI * 2;
        const r = t * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        doc.line(prevX, prevY, x, y);
        prevX = x;
        prevY = y;
    }
}

function drawPawPrint(doc, cx, cy, size, rgb, opacity) {
    setColorWithOpacity(doc, rgb, opacity, true);
    // Main pad
    doc.ellipse(cx, cy + size * 0.15, size * 0.35, size * 0.28, 'F');
    // Toes
    const toePositions = [
        [-0.3, -0.25], [0.3, -0.25], [-0.15, -0.45], [0.15, -0.45]
    ];
    for (const [tx, ty] of toePositions) {
        doc.circle(cx + tx * size, cy + ty * size, size * 0.12, 'F');
    }
}

// ============ ANIMALS THEME ============

function drawAnimalCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.animals.colors;
    const s = 18;
    // Paw prints in corners
    drawPawPrint(doc, 30, 30, s, c.primary, opacity);
    drawPawPrint(doc, pw - 30, 30, s, c.primary, opacity);
    drawPawPrint(doc, 30, ph - 30, s, c.secondary, opacity);
    drawPawPrint(doc, pw - 30, ph - 30, s, c.secondary, opacity);
}

function drawAnimalBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.animals.colors;
    const m = 20;
    // Paw print trail along top and bottom
    for (let x = 60; x < pw - 40; x += 50) {
        drawPawPrint(doc, x, m, 8, c.accent, opacity);
    }
    for (let x = 80; x < pw - 40; x += 50) {
        drawPawPrint(doc, x, ph - m, 8, c.accent, opacity);
    }
}

function drawAnimalHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.animals.colors;
    setColorWithOpacity(doc, c.secondary, opacity, false);
    doc.setLineWidth(1);
    // Decorative line with paw
    doc.line(40, 50, pw / 2 - 20, 50);
    doc.line(pw / 2 + 20, 50, pw - 40, 50);
    drawPawPrint(doc, pw / 2, 48, 12, c.primary, opacity);
}

function drawAnimalWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.animals.colors;
    // Large centered paw
    drawPawPrint(doc, pw / 2, ph / 2, 60, c.accent, opacity * 0.5);
}

// ============ NATURE THEME ============

function drawNatureCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.nature.colors;
    const s = 25;
    // Leaf clusters in corners
    drawLeaf(doc, 25, 30, s, -45, c.primary, opacity);
    drawLeaf(doc, 35, 20, s * 0.7, -30, c.secondary, opacity);

    drawLeaf(doc, pw - 25, 30, s, -135, c.primary, opacity);
    drawLeaf(doc, pw - 35, 20, s * 0.7, -150, c.secondary, opacity);

    drawLeaf(doc, 25, ph - 30, s, 45, c.primary, opacity);
    drawLeaf(doc, 35, ph - 20, s * 0.7, 30, c.secondary, opacity);

    drawLeaf(doc, pw - 25, ph - 30, s, 135, c.primary, opacity);
    drawLeaf(doc, pw - 35, ph - 20, s * 0.7, 150, c.secondary, opacity);
}

function drawNatureBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.nature.colors;
    // Vine-like dotted border
    drawDottedLine(doc, 25, 15, pw - 25, 15, 8, c.secondary, opacity);
    drawDottedLine(doc, 25, ph - 15, pw - 25, ph - 15, 8, c.secondary, opacity);
    drawDottedLine(doc, 15, 25, 15, ph - 25, 8, c.accent, opacity);
    drawDottedLine(doc, pw - 15, 25, pw - 15, ph - 25, 8, c.accent, opacity);
}

function drawNatureHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.nature.colors;
    // Leaves along top
    for (let x = 50; x < pw - 30; x += 40) {
        const angle = -60 + Math.random() * 30;
        drawLeaf(doc, x, 18, 12, angle, c.primary, opacity);
    }
}

function drawNatureWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.nature.colors;
    // Large flower pattern center
    drawCirclePattern(doc, pw / 2, ph / 2, 50, 8, c.accent, opacity * 0.5);
    drawCirclePattern(doc, pw / 2, ph / 2, 30, 6, c.secondary, opacity * 0.4);
    doc.circle(pw / 2, ph / 2, 8);
}

// ============ RELIGIOUS THEME ============

function drawReligiousCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.religious.colors;
    // Small crosses in corners
    drawCross(doc, 25, 25, 10, c.primary, opacity);
    drawCross(doc, pw - 25, 25, 10, c.primary, opacity);
    drawCross(doc, 25, ph - 25, 10, c.secondary, opacity);
    drawCross(doc, pw - 25, ph - 25, 10, c.secondary, opacity);
}

function drawReligiousBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.religious.colors;
    // Elegant double-line border
    setColorWithOpacity(doc, c.accent, opacity, false);
    doc.setLineWidth(0.8);
    doc.rect(18, 18, pw - 36, ph - 36);
    doc.setLineWidth(0.3);
    doc.rect(22, 22, pw - 44, ph - 44);
}

function drawReligiousHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.religious.colors;
    // Cross centered with lines extending
    setColorWithOpacity(doc, c.accent, opacity, false);
    doc.setLineWidth(0.5);
    doc.line(40, 45, pw / 2 - 15, 45);
    doc.line(pw / 2 + 15, 45, pw - 40, 45);
    drawCross(doc, pw / 2, 42, 8, c.primary, opacity);
}

function drawReligiousWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.religious.colors;
    // Large soft cross
    drawCross(doc, pw / 2, ph / 2, 70, c.accent, opacity * 0.3);
    // Radiating lines
    setColorWithOpacity(doc, c.accent, opacity * 0.2, false);
    doc.setLineWidth(0.3);
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        doc.line(
            pw / 2 + Math.cos(angle) * 30,
            ph / 2 + Math.sin(angle) * 30,
            pw / 2 + Math.cos(angle) * 80,
            ph / 2 + Math.sin(angle) * 80
        );
    }
}

// ============ VINTAGE THEME ============

function drawVintageCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.vintage.colors;
    setColorWithOpacity(doc, c.primary, opacity, false);
    doc.setLineWidth(1);
    const s = 30;
    // Ornate corner brackets
    // Top-left
    doc.line(15, 15, 15, 15 + s);
    doc.line(15, 15, 15 + s, 15);
    drawSwirl(doc, 15 + s * 0.3, 15 + s * 0.3, 8, 1.5, c.secondary, opacity);
    // Top-right
    doc.line(pw - 15, 15, pw - 15, 15 + s);
    doc.line(pw - 15, 15, pw - 15 - s, 15);
    drawSwirl(doc, pw - 15 - s * 0.3, 15 + s * 0.3, 8, 1.5, c.secondary, opacity);
    // Bottom-left
    doc.line(15, ph - 15, 15, ph - 15 - s);
    doc.line(15, ph - 15, 15 + s, ph - 15);
    drawSwirl(doc, 15 + s * 0.3, ph - 15 - s * 0.3, 8, 1.5, c.secondary, opacity);
    // Bottom-right
    doc.line(pw - 15, ph - 15, pw - 15, ph - 15 - s);
    doc.line(pw - 15, ph - 15, pw - 15 - s, ph - 15);
    drawSwirl(doc, pw - 15 - s * 0.3, ph - 15 - s * 0.3, 8, 1.5, c.secondary, opacity);
}

function drawVintageBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.vintage.colors;
    setColorWithOpacity(doc, c.accent, opacity, false);
    doc.setLineWidth(0.5);
    // Triple line border
    doc.rect(12, 12, pw - 24, ph - 24);
    setColorWithOpacity(doc, c.secondary, opacity * 0.7, false);
    doc.setLineWidth(1.5);
    doc.rect(16, 16, pw - 32, ph - 32);
    setColorWithOpacity(doc, c.accent, opacity, false);
    doc.setLineWidth(0.5);
    doc.rect(20, 20, pw - 40, ph - 40);
}

function drawVintageHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.vintage.colors;
    // Ornamental divider
    setColorWithOpacity(doc, c.primary, opacity, false);
    doc.setLineWidth(0.5);
    doc.line(50, 48, pw / 2 - 25, 48);
    doc.line(pw / 2 + 25, 48, pw - 50, 48);
    // Diamond center
    setColorWithOpacity(doc, c.secondary, opacity, false);
    doc.setLineWidth(0.8);
    const cx = pw / 2, cy = 48;
    doc.line(cx - 8, cy, cx, cy - 6);
    doc.line(cx, cy - 6, cx + 8, cy);
    doc.line(cx + 8, cy, cx, cy + 6);
    doc.line(cx, cy + 6, cx - 8, cy);
}

function drawVintageWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.vintage.colors;
    // Concentric ornate circles
    setColorWithOpacity(doc, c.accent, opacity * 0.3, false);
    doc.setLineWidth(0.5);
    doc.circle(pw / 2, ph / 2, 60);
    doc.circle(pw / 2, ph / 2, 55);
    drawCirclePattern(doc, pw / 2, ph / 2, 45, 12, c.secondary, opacity * 0.3);
}

// ============ KIDS THEME ============

function drawKidsCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.kids.colors;
    // Stars in corners
    drawStar(doc, 25, 25, 12, 5, 5, c.primary, opacity);
    drawStar(doc, pw - 25, 25, 12, 5, 5, c.secondary, opacity);
    drawStar(doc, 25, ph - 25, 10, 4, 5, c.accent, opacity);
    drawStar(doc, pw - 25, ph - 25, 10, 4, 5, c.primary, opacity);
}

function drawKidsBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.kids.colors;
    const colors = [c.primary, c.secondary, c.accent];
    // Colorful circles along borders
    for (let x = 40; x < pw - 20; x += 25) {
        const col = colors[Math.floor(x / 25) % 3];
        setColorWithOpacity(doc, col, opacity, true);
        doc.circle(x, 12, 3, 'F');
        doc.circle(x, ph - 12, 3, 'F');
    }
    for (let y = 40; y < ph - 20; y += 25) {
        const col = colors[Math.floor(y / 25) % 3];
        setColorWithOpacity(doc, col, opacity, true);
        doc.circle(12, y, 3, 'F');
        doc.circle(pw - 12, y, 3, 'F');
    }
}

function drawKidsHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.kids.colors;
    // Stars trail across top
    for (let x = 50; x < pw - 30; x += 35) {
        const col = [c.primary, c.secondary, c.accent][Math.floor(x / 35) % 3];
        drawStar(doc, x, 20, 6 + Math.random() * 4, 3, 5, col, opacity);
    }
}

function drawKidsWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.kids.colors;
    // Big star center
    drawStar(doc, pw / 2, ph / 2, 50, 20, 5, c.secondary, opacity * 0.3);
    // Smaller stars around
    drawStar(doc, pw / 2 - 50, ph / 2 - 40, 15, 6, 5, c.primary, opacity * 0.25);
    drawStar(doc, pw / 2 + 55, ph / 2 - 30, 12, 5, 5, c.accent, opacity * 0.25);
    drawStar(doc, pw / 2 + 40, ph / 2 + 45, 18, 7, 5, c.primary, opacity * 0.25);
    drawStar(doc, pw / 2 - 45, ph / 2 + 35, 10, 4, 5, c.secondary, opacity * 0.25);
}

// ============ GEOMETRIC THEME ============

function drawGeometricCorners(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.geometric.colors;
    setColorWithOpacity(doc, c.primary, opacity, false);
    doc.setLineWidth(1);
    const s = 25;
    // Geometric angle brackets
    doc.line(10, 10, 10, 10 + s);
    doc.line(10, 10, 10 + s, 10);
    doc.line(pw - 10, 10, pw - 10, 10 + s);
    doc.line(pw - 10, 10, pw - 10 - s, 10);
    doc.line(10, ph - 10, 10, ph - 10 - s);
    doc.line(10, ph - 10, 10 + s, ph - 10);
    doc.line(pw - 10, ph - 10, pw - 10, ph - 10 - s);
    doc.line(pw - 10, ph - 10, pw - 10 - s, ph - 10);
    // Small triangles
    setColorWithOpacity(doc, c.secondary, opacity, false);
    doc.setLineWidth(0.5);
    // Small triangles in corners
    doc.line(15, 15, 22, 15); doc.line(22, 15, 15, 22); doc.line(15, 22, 15, 15);
    doc.line(pw-15, 15, pw-22, 15); doc.line(pw-22, 15, pw-15, 22); doc.line(pw-15, 22, pw-15, 15);
    doc.line(15, ph-15, 22, ph-15); doc.line(22, ph-15, 15, ph-22); doc.line(15, ph-22, 15, ph-15);
    doc.line(pw-15, ph-15, pw-22, ph-15); doc.line(pw-22, ph-15, pw-15, ph-22); doc.line(pw-15, ph-22, pw-15, ph-15);
}

function drawGeometricBorder(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.geometric.colors;
    // Dashed line border
    setColorWithOpacity(doc, c.accent, opacity, false);
    doc.setLineWidth(0.8);
    const dashLen = 8;
    const gap = 5;
    // Top
    for (let x = 20; x < pw - 20; x += dashLen + gap) {
        doc.line(x, 10, Math.min(x + dashLen, pw - 20), 10);
    }
    // Bottom
    for (let x = 20; x < pw - 20; x += dashLen + gap) {
        doc.line(x, ph - 10, Math.min(x + dashLen, pw - 20), ph - 10);
    }
    // Left
    for (let y = 20; y < ph - 20; y += dashLen + gap) {
        doc.line(10, y, 10, Math.min(y + dashLen, ph - 20));
    }
    // Right
    for (let y = 20; y < ph - 20; y += dashLen + gap) {
        doc.line(pw - 10, y, pw - 10, Math.min(y + dashLen, ph - 20));
    }
}

function drawGeometricHeader(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.geometric.colors;
    setColorWithOpacity(doc, c.secondary, opacity, false);
    doc.setLineWidth(0.5);
    // Chevron pattern
    for (let x = 30; x < pw - 20; x += 20) {
        doc.line(x, 20, x + 10, 12);
        doc.line(x + 10, 12, x + 20, 20);
    }
}

function drawGeometricWatermark(doc, pw, ph, opacity) {
    const c = THEME_ELEMENTS.geometric.colors;
    setColorWithOpacity(doc, c.accent, opacity * 0.25, false);
    doc.setLineWidth(0.5);
    // Nested hexagons
    for (let r = 20; r <= 70; r += 15) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            points.push([pw / 2 + Math.cos(angle) * r, ph / 2 + Math.sin(angle) * r]);
        }
        for (let i = 0; i < 6; i++) {
            const next = (i + 1) % 6;
            doc.line(points[i][0], points[i][1], points[next][0], points[next][1]);
        }
    }
}

// ============ CONTENT SAFE ZONE ============
// Returns the margin adjustment needed when backgrounds are active
function getBackgroundMargins(style) {
    if (style === 'none') return { top: 0, bottom: 0, left: 0, right: 0 };
    if (style === 'subtle') return { top: 5, bottom: 5, left: 5, right: 5 };
    return { top: 15, bottom: 10, left: 8, right: 8 }; // full
}
