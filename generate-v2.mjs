import { jsPDF } from 'jspdf';
const pw = 612, ph = 792, margin = 40;
const w = pw - margin * 2;
const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });

// Colors
const C = {
    blue: [102, 126, 234], purple: [118, 75, 162], green: [76, 175, 80],
    amber: [255, 183, 77], coral: [255, 111, 97], pink: [236, 100, 170],
    teal: [0, 150, 136], text: [50, 50, 60], light: [150, 150, 170],
    line: [210, 210, 225], bg: [245, 245, 252],
};

function sc(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }
function sf(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
function sd(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }

// ── Background patterns for concentration ──
function bgCircles(doc) {
    doc.setGlobalAlpha && doc.setGState && doc.setGState(doc.GState({ opacity: 0.04 }));
    for (let i = 0; i < 25; i++) {
        const x = 50 + (i * 137) % (pw - 100);
        const y = 80 + (i * 193) % (ph - 160);
        const r = 15 + (i * 31) % 40;
        sf(doc, C.blue);
        doc.circle(x, y, r, 'F');
    }
    try { doc.setGState(doc.GState({ opacity: 1 })); } catch(e) {}
}

function bgDots(doc) {
    doc.setFillColor(220, 220, 235);
    for (let y = 30; y < ph - 20; y += 24) {
        for (let x = 30; x < pw - 20; x += 24) {
            doc.circle(x, y, 0.8, 'F');
        }
    }
}

function bgWaves(doc) {
    sd(doc, [230, 230, 245]);
    doc.setLineWidth(0.4);
    for (let y = 60; y < ph; y += 50) {
        for (let x = 0; x < pw; x += 4) {
            const yy = y + Math.sin(x / 30) * 8;
            if (x === 0) doc.line(x, yy, x + 4, y + Math.sin((x + 4) / 30) * 8);
            else doc.line(x, yy, x + 4, y + Math.sin((x + 4) / 30) * 8);
        }
    }
}

function bgGeometric(doc) {
    sd(doc, [235, 235, 248]);
    doc.setLineWidth(0.3);
    for (let i = 0; i < 12; i++) {
        const cx = 80 + (i * 151) % (pw - 160);
        const cy = 100 + (i * 197) % (ph - 200);
        const s = 20 + (i * 13) % 30;
        if (i % 3 === 0) {
            doc.rect(cx - s/2, cy - s/2, s, s);
        } else if (i % 3 === 1) {
            doc.circle(cx, cy, s/2);
        } else {
            doc.triangle(cx, cy - s/2, cx - s/2, cy + s/2, cx + s/2, cy + s/2);
        }
    }
}

function bgStars(doc) {
    doc.setFillColor(235, 235, 248);
    for (let i = 0; i < 30; i++) {
        const x = 25 + (i * 163) % (pw - 50);
        const y = 25 + (i * 211) % (ph - 50);
        const s = 3 + (i * 7) % 5;
        // Simple star as asterisk
        doc.setFontSize(s * 3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 225, 240);
        doc.text('*', x, y);
    }
    sc(doc, C.text);
}

function drawLine(doc, x1, y1, x2, y2) {
    doc.setLineWidth(0.3); sd(doc, C.line); doc.line(x1, y1, x2, y2);
}
function checkbox(doc, x, y, s) {
    doc.setLineWidth(0.5); sd(doc, C.line); doc.roundedRect(x, y, s, s, 2, 2);
}
function header(doc, text, x, y, w, color) {
    sf(doc, color || C.bg);
    doc.roundedRect(x, y - 12, w, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    sc(doc, C.blue); doc.text(text, x + 6, y); sc(doc, C.text);
}
function pageN(doc, n) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    sc(doc, C.light); doc.text(String(n), pw / 2, ph - 20, { align: 'center' }); sc(doc, C.text);
}

// Funny quotes array
const QUOTES = [
    '"My brain has too many tabs open." — Every ADHD human ever',
    '"I\'m not disorganized. I have a creative filing system." — You, probably',
    '"Today\'s goal: be slightly less chaotic than yesterday."',
    '"Remember: done is better than perfect. Also, snacks help."',
    '"If plan A didn\'t work, the alphabet has 25 more letters."',
    '"Your brain isn\'t broken. It\'s just running a different operating system."',
    '"Somewhere between \'I got this\' and \'What was I doing?\' is where I live."',
    '"Friendly reminder: you\'ve survived 100% of your worst days so far."',
    '"My attention span is like a goldfish on espresso."',
    '"Plot twist: you don\'t need to do everything today."',
    '"I came, I saw, I forgot what I was doing, I went back, I remembered."',
    '"Being an adult with ADHD is basically detective work on yourself."',
    '"I don\'t procrastinate. I just wait for the panic monster to show up."',
    '"My to-do list is more like a suggestion list."',
    '"Executive dysfunction? More like executive chaos party."',
];

function funnyQuote(doc, y, idx) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    sc(doc, C.coral);
    doc.text(QUOTES[idx % QUOTES.length], pw / 2, y, { align: 'center' });
    sc(doc, C.text);
}


// ═══════════════════════════════════════
// PAGE 1: TITLE (decorative)
// ═══════════════════════════════════════
bgStars(doc);
// Big decorative circles
sf(doc, [240, 235, 250]);
doc.circle(pw / 2, ph / 2, 180, 'F');
sf(doc, [235, 230, 248]);
doc.circle(pw / 2, ph / 2, 140, 'F');
sf(doc, [255, 255, 255]);
doc.circle(pw / 2, ph / 2, 100, 'F');

doc.setFont('helvetica', 'bold'); doc.setFontSize(36);
sc(doc, C.blue);
doc.text('ADHD Planner', pw / 2, ph / 2 - 30, { align: 'center' });
doc.setFont('helvetica', 'normal'); doc.setFontSize(16);
sc(doc, C.purple);
doc.text('Focus, Plan & Thrive', pw / 2, ph / 2 + 5, { align: 'center' });
doc.setFontSize(11);
sc(doc, C.light);
doc.text('A Gentle Undated Planner for Your Brilliant Brain', pw / 2, ph / 2 + 30, { align: 'center' });

// Fun subtitle
doc.setFont('helvetica', 'italic'); doc.setFontSize(10);
sc(doc, C.coral);
doc.text('"Because your brain deserves a planner that gets it."', pw / 2, ph / 2 + 60, { align: 'center' });

// Bottom decoration
sf(doc, C.amber);
doc.roundedRect(pw / 2 - 100, ph - 100, 200, 3, 1, 1, 'F');
doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
sc(doc, C.amber);
doc.text('NO DATES. NO GUILT. NO BORING PAGES.', pw / 2, ph - 80, { align: 'center' });

// ═══════════════════════════════════════
// PAGE 2: WELCOME (with humor)
// ═══════════════════════════════════════
doc.addPage();
bgDots(doc);
let y = margin + 20;
doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
sc(doc, C.blue);
doc.text('Hey, You Made It!', pw / 2, y, { align: 'center' });
y += 18;
doc.setFontSize(10); doc.setFont('helvetica', 'italic');
sc(doc, C.coral);
doc.text('(That\'s already an achievement. Seriously.)', pw / 2, y, { align: 'center' });
y += 28;

doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
sc(doc, C.text);
const intro = [
    'This planner was designed for brains like yours — the kind that can',
    'hyperfocus on Wikipedia for 4 hours but forget to eat lunch.',
    '',
    'Here\'s the deal:',
    '   - There are NO dates. Skip a day? A week? A month? Zero guilt.',
    '   - Each page tells you exactly what to do (revolutionary, right?).',
    '   - You only need to pick 3 things per day. THREE. That\'s it.',
    '   - If you finish all 3, you\'re basically a superhero.',
    '',
    'There\'s also brain dump pages for when your thoughts are like',
    '47 browser tabs open at once (we see you).',
];
for (const line of intro) { doc.text(line, margin + 10, y); y += 15; }
y += 8;

// Page types with fun descriptions
header(doc, 'WHAT\'S INSIDE THIS BAD BOY', margin, y, w);
y += 18;
const pages = [
    ['Daily Focus', 'Only 3 tasks. Because let\'s be honest, 47 was never realistic.'],
    ['Time Blocks', 'Morning / Afternoon / Evening. No hourly micromanagement BS.'],
    ['Brain Dump', 'Your mental junk drawer. Dump everything here. No judgment.'],
    ['Weekly Overview', 'For when you want to pretend you have your week together.'],
    ['Mood & Energy', 'Track your vibes. Discover you\'re a zombie on Tuesdays.'],
    ['Habit Tracker', 'Just 7 habits max. We\'re building momentum, not anxiety.'],
    ['Weekly Reflection', 'What worked? What flopped? What snacks helped?'],
];
doc.setFontSize(9);
for (const [title, desc] of pages) {
    if (y + 28 > ph - margin - 30) break;
    doc.setFont('helvetica', 'bold'); sc(doc, C.purple);
    doc.text(title, margin + 10, y);
    doc.setFont('helvetica', 'normal'); sc(doc, C.text);
    doc.text(' — ' + desc, margin + 10 + doc.getTextWidth(title), y);
    y += 20;
}
y += 12;
doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
sc(doc, C.amber);
doc.text('Pro tip: Use what helps. Ignore what doesn\'t. Eat snacks.', pw / 2, y, { align: 'center' });


// ═══════════════════════════════════════
// PAGE 3: WEEKLY OVERVIEW
// ═══════════════════════════════════════
doc.addPage();
bgGeometric(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Weekly Overview', margin, y);
doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
sc(doc, C.coral); doc.text('"Pretending I have my life together since page 3"', pw - margin, y, { align: 'right' });
sc(doc, C.text);
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 10;
doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
sc(doc, C.light); doc.text('Week of: _______________', margin, y);
sc(doc, C.text); y += 16;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayEmoji = ['(fresh start!)', '(you got this)', '(halfway hero)', '(almost there)', '(TGIF energy)', '(rest or chaos?)', '(recharge day)'];
const dayColors = [C.blue, C.teal, C.green, C.purple, C.coral, C.amber, C.pink];
const dayH = 68;

for (let d = 0; d < days.length; d++) {
    if (y + dayH > ph - margin - 65) break;
    // Color bar on left
    sf(doc, dayColors[d]);
    doc.roundedRect(margin, y, 5, dayH - 4, 2, 2, 'F');
    // Day header
    sf(doc, [248, 248, 255]);
    doc.roundedRect(margin + 8, y, w - 8, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    sc(doc, dayColors[d]); doc.text(days[d], margin + 14, y + 11);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7);
    sc(doc, C.light); doc.text(dayEmoji[d], margin + 14 + doc.getTextWidth(days[d] + '  '), y + 11);
    // Energy circles
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    sc(doc, C.light); doc.text('Energy:', pw - margin - 80, y + 11);
    sd(doc, C.line); doc.setLineWidth(0.4);
    for (let e = 0; e < 5; e++) doc.circle(pw - margin - 35 + e * 10, y + 8, 3.5);
    sc(doc, C.text);
    // Task lines
    const ly = y + 28;
    checkbox(doc, margin + 12, ly - 7, 8);
    drawLine(doc, margin + 24, ly + 1, pw / 2 - 5, ly + 1);
    checkbox(doc, pw / 2 + 4, ly - 7, 8);
    drawLine(doc, pw / 2 + 16, ly + 1, pw - margin, ly + 1);
    const ly2 = ly + 20;
    checkbox(doc, margin + 12, ly2 - 7, 8);
    drawLine(doc, margin + 24, ly2 + 1, pw / 2 - 5, ly2 + 1);
    y += dayH;
}

// Weekly wins
y += 6;
header(doc, 'WEEKLY WINS (even getting out of bed counts)', margin, y, w, [255, 248, 235]);
y += 16;
for (let i = 0; i < 3; i++) {
    sf(doc, C.amber); doc.circle(margin + 8, y, 2.5, 'F');
    drawLine(doc, margin + 16, y, pw - margin, y); y += 16;
}
pageN(doc, 1);
funnyQuote(doc, ph - 32, 0);

// ═══════════════════════════════════════
// PAGE 4: DAILY FOCUS (the star page)
// ═══════════════════════════════════════
doc.addPage();
bgWaves(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Daily Focus', margin, y);
doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
sc(doc, C.light); doc.text('Date: ___ / ___ / ______', pw - margin, y, { align: 'right' });
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 12;

// Funny instruction
doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
sc(doc, C.coral);
doc.text('Pick only 3 things. THREE. Not 47. If you finish all 3, do a victory dance.', margin, y);
sc(doc, C.text); y += 18;

// TOP 3 with numbered circles
header(doc, 'TOP 3 PRIORITIES (yes, only 3. breathe.)', margin, y, w, [240, 245, 255]);
y += 16;
for (let i = 0; i < 3; i++) {
    sf(doc, C.blue); doc.circle(margin + 10, y - 2, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), margin + 10, y + 1, { align: 'center' });
    sc(doc, C.text);
    drawLine(doc, margin + 24, y + 1, pw - margin, y + 1);
    y += 28;
}
y += 6;

// TIME BLOCKS with fun labels
header(doc, 'TIME BLOCKS (when are you a human vs. a zombie?)', margin, y, w, [255, 245, 235]);
y += 16;
const blocks = [
    { label: 'Morning', sub: '6-12h', desc: '"Brain is warming up..."', color: C.amber },
    { label: 'Afternoon', sub: '12-5pm', desc: '"Peak chaos or peak focus?"', color: C.blue },
    { label: 'Evening', sub: '5-9pm', desc: '"Wind down mode activated"', color: C.purple },
];
const blockH = 52;
for (const b of blocks) {
    sf(doc, b.color);
    doc.roundedRect(margin, y, 6, blockH, 2, 2, 'F');
    // Header area with gradient-like effect
    sf(doc, [248, 248, 255]);
    doc.roundedRect(margin + 10, y, 120, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    sc(doc, b.color); doc.text(b.label, margin + 15, y + 11);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    sc(doc, C.light); doc.text(b.sub, margin + 15 + doc.getTextWidth(b.label + ' '), y + 11);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7);
    sc(doc, C.coral); doc.text(b.desc, margin + 140, y + 11);
    sc(doc, C.text);
    drawLine(doc, margin + 15, y + 24, pw - margin, y + 24);
    drawLine(doc, margin + 15, y + 38, pw - margin, y + 38);
    y += blockH + 4;
}
y += 6;

// BRAIN DUMP
header(doc, 'BRAIN DUMP (your mental junk drawer)', margin, y, w, [245, 240, 250]);
y += 14;
doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
sc(doc, C.light); doc.text('Write anything. Grocery lists, existential thoughts, song lyrics stuck in your head...', margin + 6, y);
sc(doc, C.text); y += 10;
sd(doc, C.line); doc.setLineWidth(0.3);
doc.roundedRect(margin, y, w, ph - margin - y - 40, 6, 6);
// Dot grid
doc.setFillColor(210, 210, 228);
for (let dy = y + 12; dy < ph - margin - 48; dy += 14) {
    for (let dx = margin + 10; dx < pw - margin - 5; dx += 14) {
        doc.circle(dx, dy, 0.6, 'F');
    }
}
pageN(doc, 2);
funnyQuote(doc, ph - 32, 1);


// ═══════════════════════════════════════
// PAGE 5: BRAIN DUMP FULL (with fun background)
// ═══════════════════════════════════════
doc.addPage();
bgStars(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Brain Dump', margin, y);
doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
sc(doc, C.coral); doc.text('"Ctrl+Alt+Delete for your brain"', pw - margin, y, { align: 'right' });
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 14;
doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
sc(doc, C.light);
doc.text('Dump EVERYTHING here. Random thoughts, ideas, worries, that thing you', margin, y); y += 13;
doc.text('forgot 3 times, the name of that song... ALL OF IT. No rules. No lines. Freedom.', margin, y);
sc(doc, C.text); y += 20;

// Decorated dump area
sd(doc, C.purple); doc.setLineWidth(0.8);
doc.roundedRect(margin, y, w, ph - margin - y - 55, 8, 8);
// Inner border
sd(doc, [230, 225, 245]); doc.setLineWidth(0.3);
doc.roundedRect(margin + 4, y + 4, w - 8, ph - margin - y - 63, 6, 6);
// Dot grid
doc.setFillColor(205, 205, 225);
for (let dy = y + 16; dy < ph - margin - 62; dy += 16) {
    for (let dx = margin + 16; dx < pw - margin - 10; dx += 16) {
        doc.circle(dx, dy, 0.7, 'F');
    }
}
// Decorative corner stars
doc.setFontSize(18); doc.setTextColor(230, 225, 245); doc.setFont('helvetica', 'bold');
doc.text('*', margin + 10, y + 18);
doc.text('*', pw - margin - 14, y + 18);
doc.text('*', margin + 10, ph - margin - 62);
doc.text('*', pw - margin - 14, ph - margin - 62);

pageN(doc, 3);
funnyQuote(doc, ph - 32, 2);

// ═══════════════════════════════════════
// PAGE 6: MOOD & ENERGY (colorful version)
// ═══════════════════════════════════════
doc.addPage();
bgDots(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Mood & Energy Check-in', margin, y);
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 12;
doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
sc(doc, C.coral);
doc.text('"Am I tired or is it just Tuesday?" — Track it and find out.', margin, y);
sc(doc, C.text); y += 18;

const daysM = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const moodLabels = ['Amazing', 'Good', 'Meh', 'Low', 'SOS'];
const moodColors = [C.green, C.teal, C.amber, C.coral, C.pink];
const rowH = 78;

for (let d = 0; d < daysM.length; d++) {
    if (y + rowH > ph - margin - 50) break;
    // Row background alternating
    if (d % 2 === 0) { sf(doc, [250, 250, 255]); doc.roundedRect(margin, y, w, rowH, 3, 3, 'F'); }
    // Color bar
    sf(doc, dayColors[d]); doc.roundedRect(margin, y, 5, rowH, 2, 2, 'F');
    // Day label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    sc(doc, dayColors[d]); doc.text(daysM[d], margin + 12, y + 14);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    sc(doc, C.light); doc.text('Date: ___ / ___', margin + 55, y + 14);
    // Mood circles with colors
    sc(doc, C.text); doc.setFontSize(8);
    doc.text('Mood:', margin + 12, y + 34);
    for (let m = 0; m < moodLabels.length; m++) {
        const mx = margin + 55 + m * 58;
        sd(doc, moodColors[m]); doc.setLineWidth(1);
        doc.circle(mx, y + 32, 5);
        doc.setFontSize(6.5); sc(doc, moodColors[m]);
        doc.text(moodLabels[m], mx + 8, y + 34);
    }
    // Energy bar
    sc(doc, C.text); doc.setFontSize(8);
    doc.text('Energy:', margin + 12, y + 52);
    for (let e = 0; e < 5; e++) {
        const ex = margin + 60 + e * 22;
        sf(doc, [240, 240, 250]); doc.roundedRect(ex, y + 44, 18, 12, 3, 3, 'F');
        sd(doc, C.line); doc.setLineWidth(0.3); doc.roundedRect(ex, y + 44, 18, 12, 3, 3);
        doc.setFontSize(7); sc(doc, C.text);
        doc.text(String(e + 1), ex + 9, y + 53, { align: 'center' });
    }
    doc.setFontSize(6); sc(doc, C.light);
    doc.text('(1=dead  5=superhero)', margin + 175, y + 53);
    // Notes
    sc(doc, C.text); doc.setFontSize(7.5);
    doc.text('What happened:', margin + 12, y + 70);
    drawLine(doc, margin + 80, y + 70, pw - margin - 8, y + 70);
    y += rowH + 3;
}

y += 6;
header(doc, 'PATTERNS I NOTICE (my brain\'s cheat codes)', margin, y, w, [255, 245, 240]);
y += 16;
drawLine(doc, margin + 4, y, pw - margin, y); y += 16;
drawLine(doc, margin + 4, y, pw - margin, y);
pageN(doc, 4);
funnyQuote(doc, ph - 32, 3);


// ═══════════════════════════════════════
// PAGE 7: HABIT TRACKER (fun version)
// ═══════════════════════════════════════
doc.addPage();
bgGeometric(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Habit Tracker', margin, y);
doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
sc(doc, C.coral); doc.text('"Building habits, one forgotten day at a time"', pw - margin, y, { align: 'right' });
doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
sc(doc, C.light); doc.text('Month: ___________', pw - margin, y + 16, { align: 'right' });
sc(doc, C.text);
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 20;

doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
sc(doc, C.text);
doc.text('Choose 5-7 tiny habits. Fill the circle when done. Missed a day? Cool, try again tomorrow.', margin, y);
y += 20;

// Day numbers header
const habitLabelW = 105;
const daysCount = 31;
const dayW = (w - habitLabelW) / daysCount;
const circR = Math.min(dayW * 0.35, 4.5);
doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5);
sc(doc, C.purple);
for (let d = 1; d <= daysCount; d++) {
    doc.text(String(d), margin + habitLabelW + (d - 0.5) * dayW, y, { align: 'center' });
}
sc(doc, C.text); y += 10;

// Habit rows with fun defaults
const habitDefaults = [
    'Drink water',
    'Take meds',
    '5 min walk',
    'Eat actual food',
    'Brain dump',
    'No phone 15min',
    'Celebrate a win',
];
const habitRowH = 38;
for (let h = 0; h < 7; h++) {
    if (h % 2 === 0) { sf(doc, [250, 248, 255]); doc.rect(margin, y, w, habitRowH, 'F'); }
    // Color indicator
    sf(doc, dayColors[h]); doc.roundedRect(margin, y, 4, habitRowH, 1, 1, 'F');
    // Pre-filled habit name (light, as suggestion)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    sc(doc, [200, 200, 215]);
    doc.text(habitDefaults[h], margin + 8, y + habitRowH / 2 - 2);
    // Write-over line
    drawLine(doc, margin + 8, y + habitRowH / 2 + 6, margin + habitLabelW - 8, y + habitRowH / 2 + 6);
    // Day circles
    sd(doc, C.line); doc.setLineWidth(0.3);
    for (let d = 0; d < daysCount; d++) {
        doc.circle(margin + habitLabelW + (d + 0.5) * dayW, y + habitRowH / 2 + 2, circR);
    }
    y += habitRowH;
}

// Fun ideas section
y += 16;
header(doc, 'MORE HABIT IDEAS (pick what doesn\'t make you cringe)', margin, y, w, [255, 250, 240]);
y += 18;
doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
sc(doc, C.text);
const ideas = [
    'Stretch for 2 min  |  Write 1 gratitude  |  Make the bed  |  Go outside 5 min',
    'Read 1 page  |  Text someone nice  |  No social media before 9am  |  Deep breaths x3',
    'Tidy one thing  |  Prep tomorrow\'s clothes  |  Journal 3 sentences  |  Dance to 1 song',
];
for (const idea of ideas) { doc.text(idea, pw / 2, y, { align: 'center' }); y += 14; }
pageN(doc, 5);
funnyQuote(doc, ph - 32, 4);

// ═══════════════════════════════════════
// PAGE 8: WEEKLY REFLECTION (heartfelt + funny)
// ═══════════════════════════════════════
doc.addPage();
bgWaves(doc);
y = margin + 10;
doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
sc(doc, C.blue); doc.text('Weekly Reflection', margin, y);
doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
sc(doc, C.coral); doc.text('"Therapy lite, but on paper"', pw - margin, y, { align: 'right' });
y += 6; drawLine(doc, margin, y, pw - margin, y); y += 14;
doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
sc(doc, C.light);
doc.text('No judgment zone. Just vibes and self-awareness. Be honest with yourself.', margin, y);
sc(doc, C.text); y += 22;

const sections = [
    { title: 'WHAT WENT WELL?', hint: 'Even tiny wins count. Did you remember to eat? That\'s a W.', lines: 4, color: C.green },
    { title: 'WHAT WAS HARD?', hint: 'Not to roast yourself. To understand and adjust. Be kind.', lines: 3, color: C.coral },
    { title: 'WHAT DRAINED MY ENERGY?', hint: 'People? Tasks? That one meeting? Name it.', lines: 3, color: C.purple },
    { title: 'WHAT GAVE ME ENERGY?', hint: 'Do more of this. Seriously. Write it down. Remember it.', lines: 3, color: C.amber },
    { title: 'ONE THING TO TRY NEXT WEEK', hint: 'Just ONE. Keep it tiny and doable. You\'re not training for the Olympics.', lines: 2, color: C.teal },
];

for (const s of sections) {
    if (y + s.lines * 18 + 40 > ph - margin - 30) break;
    // Colored section header
    sf(doc, s.color);
    doc.roundedRect(margin, y - 12, 5, 18, 2, 2, 'F');
    sf(doc, C.bg);
    doc.roundedRect(margin + 8, y - 12, w - 8, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    sc(doc, s.color); doc.text(s.title, margin + 14, y);
    sc(doc, C.text);
    y += 14;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7);
    sc(doc, C.light); doc.text(s.hint, margin + 14, y);
    sc(doc, C.text); y += 12;
    for (let i = 0; i < s.lines; i++) { drawLine(doc, margin + 8, y, pw - margin, y); y += 18; }
    y += 10;
}

// Bottom motivational
doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
sc(doc, C.amber);
doc.text('You survived another week. That\'s not nothing.', pw / 2, y + 8, { align: 'center' });
pageN(doc, 6);
funnyQuote(doc, ph - 32, 5);

// ═══════════ SAVE ═══════════
const fs = await import('fs');
const buffer = doc.output('arraybuffer');
fs.writeFileSync('/home/user/kdp-book-factory/ADHD_Planner_Sample.pdf', Buffer.from(buffer));
console.log('PDF v2 generated: 8 pages with humor + backgrounds');
