import { jsPDF } from 'jspdf';

const ADHD_COLORS = {
    primary:    [102, 126, 234],
    secondary:  [118, 75, 162],
    accent:     [76, 175, 80],
    warmAccent: [255, 183, 77],
    text:       [50, 50, 60],
    lightText:  [130, 130, 150],
    line:       [210, 210, 225],
    bgSection:  [245, 245, 252],
};

function setColor(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }
function setFill(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }

function drawLine(doc, x1, y1, x2, y2) {
    doc.setLineWidth(0.3);
    setDraw(doc, ADHD_COLORS.line);
    doc.line(x1, y1, x2, y2);
}

function drawCheckbox(doc, x, y, size) {
    doc.setLineWidth(0.5);
    setDraw(doc, ADHD_COLORS.line);
    doc.roundedRect(x, y, size, size, 2, 2);
}

function sectionHeader(doc, text, x, y, w) {
    setFill(doc, ADHD_COLORS.bgSection);
    doc.roundedRect(x, y - 12, w, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(doc, ADHD_COLORS.primary);
    doc.text(text, x + 6, y);
    setColor(doc, ADHD_COLORS.text);
}

function pageNum(doc, pw, ph, n) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text(String(n), pw / 2, ph - 20, { align: 'center' });
    setColor(doc, ADHD_COLORS.text);
}

// Page dimensions: 8.5 x 11 = letter
const pw = 612, ph = 792, margin = 40;
const w = pw - margin * 2;

const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });

// ── PAGE 1: TITLE ──
doc.setFont('helvetica', 'bold');
doc.setFontSize(32);
setColor(doc, ADHD_COLORS.primary);
doc.text('ADHD Planner', pw / 2, ph / 2 - 40, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.secondary);
doc.text('Focus, Plan & Thrive', pw / 2, ph / 2, { align: 'center' });
doc.setFontSize(12);
setColor(doc, ADHD_COLORS.lightText);
doc.text('A Gentle Undated Planner for Your Brilliant Brain', pw / 2, ph / 2 + 30, { align: 'center' });
doc.setFont('helvetica', 'italic');
doc.setFontSize(10);
setColor(doc, ADHD_COLORS.warmAccent);
doc.text('Designed for your brilliant, beautiful brain.', pw / 2, ph - 80, { align: 'center' });

// ── PAGE 2: WELCOME ──
doc.addPage();
let y = margin + 20;
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
setColor(doc, ADHD_COLORS.primary);
doc.text('Welcome to Your ADHD Planner', pw / 2, y, { align: 'center' });
y += 30;
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
setColor(doc, ADHD_COLORS.text);
const intro = [
    'This planner was designed specifically for how your brain works.',
    'No guilt. No pressure. Just gentle structure when you need it.',
    '',
    'There are no dates — start anytime, skip days freely, and come back.',
    'Each page type has a short guide so you always know what to do.',
];
for (const line of intro) { doc.text(line, pw / 2, y, { align: 'center' }); y += 16; }
y += 10;
sectionHeader(doc, 'YOUR PAGE TYPES', margin, y, w);
y += 16;
const pages = [
    ['Daily Focus', 'Your simplified daily page. Pick only 3 priorities, block your time visually, and brain dump anything swirling in your head.'],
    ['Weekly Overview', "A bird's-eye view of your week. No hourly detail — just key tasks and a quick energy check."],
    ['Brain Dump', 'Unload every thought. No categories, no rules. Just get it out of your head and onto paper.'],
    ['Mood & Energy', "Track how you feel and your energy level. Over time, you'll spot patterns that help you plan better."],
    ['Habit Tracker', 'A simple visual tracker for just 5-7 habits. Small circles — fill them in. That is it.'],
    ['Weekly Reflection', "A gentle weekly review. What worked? What didn't? No judgment — just awareness."],
];
doc.setFontSize(9);
for (const [title, desc] of pages) {
    if (y + 35 > ph - margin) break;
    doc.setFont('helvetica', 'bold');
    setColor(doc, ADHD_COLORS.secondary);
    doc.text(title, margin + 8, y);
    doc.setFont('helvetica', 'normal');
    setColor(doc, ADHD_COLORS.text);
    const lines = doc.splitTextToSize(desc, w - 16);
    doc.text(lines, margin + 8, y + 13);
    y += 13 + lines.length * 12 + 8;
}
y += 10;
doc.setFont('helvetica', 'italic');
doc.setFontSize(10);
setColor(doc, ADHD_COLORS.warmAccent);
doc.text("Tip: You don't have to use every page. Use what helps. Skip what doesn't.", pw / 2, y, { align: 'center' });

// ── PAGE 3: WEEKLY OVERVIEW ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Weekly Overview', margin, y);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Week of: _______________', pw - margin, y, { align: 'right' });
setColor(doc, ADHD_COLORS.text);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 12;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text("Write 1-2 key tasks per day. If a day is blank, that's perfectly fine.", margin, y);
setColor(doc, ADHD_COLORS.text);
y += 16;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayH = 70;
for (const day of days) {
    if (y + dayH > ph - margin - 80) break;
    setFill(doc, ADHD_COLORS.bgSection);
    doc.roundedRect(margin, y, w, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, ADHD_COLORS.secondary);
    doc.text(day, margin + 6, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text('Energy:', pw - margin - 80, y + 10);
    setDraw(doc, ADHD_COLORS.line);
    doc.setLineWidth(0.4);
    for (let e = 0; e < 5; e++) doc.circle(pw - margin - 38 + e * 10, y + 7, 3.5);
    setColor(doc, ADHD_COLORS.text);
    const lineY = y + 26;
    drawCheckbox(doc, margin + 4, lineY - 7, 8);
    drawLine(doc, margin + 16, lineY + 1, pw / 2 - 5, lineY + 1);
    drawCheckbox(doc, pw / 2 + 4, lineY - 7, 8);
    drawLine(doc, pw / 2 + 16, lineY + 1, pw - margin, lineY + 1);
    const lineY2 = lineY + 18;
    drawCheckbox(doc, margin + 4, lineY2 - 7, 8);
    drawLine(doc, margin + 16, lineY2 + 1, pw / 2 - 5, lineY2 + 1);
    y += dayH;
}
y += 8;
sectionHeader(doc, 'WEEKLY WINS (anything counts!)', margin, y, w);
y += 16;
for (let i = 0; i < 3; i++) { doc.text('*', margin + 6, y + 2); drawLine(doc, margin + 14, y + 2, pw - margin, y + 2); y += 16; }
pageNum(doc, pw, ph, 1);

// ── PAGE 4: DAILY FOCUS ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Daily Focus', margin, y);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Date: ___ / ___ / ______', pw - margin, y, { align: 'right' });
setColor(doc, ADHD_COLORS.text);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Pick only 3 things. If you finish them, celebrate. Anything extra is a bonus.', margin, y);
setColor(doc, ADHD_COLORS.text);
y += 16;

sectionHeader(doc, 'TOP 3 PRIORITIES', margin, y, w);
y += 14;
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
for (let i = 0; i < 3; i++) { drawCheckbox(doc, margin + 4, y - 7, 10); drawLine(doc, margin + 20, y + 1, pw - margin, y + 1); y += 24; }
y += 6;

sectionHeader(doc, 'TIME BLOCKS', margin, y, w);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('What will you focus on during each block? Keep it simple.', margin + 6, y);
setColor(doc, ADHD_COLORS.text);
y += 14;
const blocks = [
    { label: 'Morning', icon: '06-12h', color: ADHD_COLORS.warmAccent },
    { label: 'Afternoon', icon: '12-17h', color: ADHD_COLORS.primary },
    { label: 'Evening', icon: '17-21h', color: ADHD_COLORS.secondary },
];
const blockH = 48;
for (const b of blocks) {
    setFill(doc, b.color);
    doc.roundedRect(margin, y, 6, blockH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, ADHD_COLORS.text);
    doc.text(b.label, margin + 14, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text(b.icon, margin + 14, y + 20);
    setColor(doc, ADHD_COLORS.text);
    drawLine(doc, margin + 70, y + 14, pw - margin, y + 14);
    drawLine(doc, margin + 70, y + 30, pw - margin, y + 30);
    drawLine(doc, margin + 70, y + 44, pw - margin, y + 44);
    y += blockH + 8;
}
y += 4;

sectionHeader(doc, 'BRAIN DUMP', margin, y, w);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Get it out of your head. No order needed.', margin + 6, y);
setColor(doc, ADHD_COLORS.text);
y += 12;
setDraw(doc, ADHD_COLORS.line);
doc.setLineWidth(0.3);
doc.roundedRect(margin, y, w, ph - margin - y - 30, 4, 4);
doc.setFillColor(200, 200, 215);
for (let dy = y + 14; dy < ph - margin - 35; dy += 14) {
    for (let dx = margin + 10; dx < pw - margin - 5; dx += 14) {
        doc.circle(dx, dy, 0.6, 'F');
    }
}
pageNum(doc, pw, ph, 2);

// ── PAGE 5: BRAIN DUMP FULL ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Brain Dump', margin, y);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Write, sketch, list — whatever your brain needs to release right now. No rules.', margin, y);
setColor(doc, ADHD_COLORS.text);
y += 18;
setDraw(doc, ADHD_COLORS.line);
doc.setLineWidth(0.2);
doc.roundedRect(margin, y, w, ph - margin - y - 30, 6, 6);
doc.setFillColor(195, 195, 215);
for (let dy = y + 14; dy < ph - margin - 35; dy += 14) {
    for (let dx = margin + 14; dx < pw - margin - 5; dx += 14) {
        doc.circle(dx, dy, 0.7, 'F');
    }
}
pageNum(doc, pw, ph, 3);

// ── PAGE 6: MOOD & ENERGY ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Mood & Energy Check-in', margin, y);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Track daily for a week. Spotting patterns helps you plan around your energy, not against it.', margin, y);
setColor(doc, ADHD_COLORS.text);
y += 18;
const daysM = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const rowH = 80;
for (const day of daysM) {
    if (y + rowH > ph - margin - 50) break;
    setFill(doc, ADHD_COLORS.bgSection);
    doc.roundedRect(margin, y, w, rowH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, ADHD_COLORS.secondary);
    doc.text(day, margin + 6, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text('Date: ___ / ___', margin + 50, y + 12);
    setColor(doc, ADHD_COLORS.text);
    doc.setFontSize(8);
    doc.text('Mood:', margin + 6, y + 30);
    const moods = ['Great', 'Good', 'Okay', 'Low', 'Hard'];
    for (let m = 0; m < moods.length; m++) {
        const mx = margin + 50 + m * 55;
        setDraw(doc, ADHD_COLORS.line);
        doc.setLineWidth(0.4);
        doc.circle(mx, y + 28, 4);
        doc.setFontSize(7);
        doc.text(moods[m], mx + 7, y + 30);
    }
    doc.setFontSize(8);
    doc.text('Energy:', margin + 6, y + 48);
    for (let e = 0; e < 5; e++) {
        const ex = margin + 55 + e * 12;
        setDraw(doc, ADHD_COLORS.line);
        doc.setLineWidth(0.4);
        doc.circle(ex, y + 46, 4);
        doc.setFontSize(7);
        doc.text(String(e + 1), ex - 2, y + 48);
    }
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text('(1=empty  5=full)', margin + 125, y + 48);
    setColor(doc, ADHD_COLORS.text);
    doc.setFontSize(8);
    doc.text('Note:', margin + 6, y + 66);
    drawLine(doc, margin + 38, y + 66, pw - margin - 6, y + 66);
    y += rowH + 4;
}
pageNum(doc, pw, ph, 4);

// ── PAGE 7: HABIT TRACKER ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Habit Tracker', margin, y);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Month: ___________', pw - margin, y, { align: 'right' });
setColor(doc, ADHD_COLORS.text);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text("Choose 5-7 small habits. Fill the circle when done. Don't aim for perfection — aim for awareness.", margin, y);
setColor(doc, ADHD_COLORS.text);
y += 20;
const habitLabelW = 100;
const daysCount = 31;
const dayW = (w - habitLabelW) / daysCount;
const circleR = Math.min(dayW * 0.35, 4.5);
doc.setFont('helvetica', 'bold');
doc.setFontSize(6);
setColor(doc, ADHD_COLORS.lightText);
for (let d = 1; d <= daysCount; d++) {
    doc.text(String(d), margin + habitLabelW + (d - 0.5) * dayW, y, { align: 'center' });
}
setColor(doc, ADHD_COLORS.text);
y += 10;
const habitRowH = 36;
for (let h = 0; h < 7; h++) {
    if (h % 2 === 0) { setFill(doc, ADHD_COLORS.bgSection); doc.rect(margin, y, w, habitRowH, 'F'); }
    drawLine(doc, margin + 4, y + habitRowH / 2 + 6, margin + habitLabelW - 6, y + habitRowH / 2 + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text('Habit ' + (h + 1) + ':', margin + 4, y + habitRowH / 2);
    setColor(doc, ADHD_COLORS.text);
    setDraw(doc, ADHD_COLORS.line);
    doc.setLineWidth(0.3);
    for (let d = 0; d < daysCount; d++) {
        doc.circle(margin + habitLabelW + (d + 0.5) * dayW, y + habitRowH / 2 + 2, circleR);
    }
    y += habitRowH;
}
y += 14;
sectionHeader(doc, 'HABIT IDEAS TO GET STARTED', margin, y, w);
y += 16;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('Drink water when I wake up  |  Take my meds  |  5 min walk  |  Brain dump before bed', pw / 2, y, { align: 'center' });
y += 14;
doc.text('No phone first 15 min  |  Eat breakfast  |  1 thing off my list  |  Gratitude thought', pw / 2, y, { align: 'center' });
pageNum(doc, pw, ph, 5);

// ── PAGE 8: WEEKLY REFLECTION ──
doc.addPage();
y = margin + 10;
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
setColor(doc, ADHD_COLORS.primary);
doc.text('Weekly Reflection', margin, y);
y += 8;
drawLine(doc, margin, y, pw - margin, y);
y += 14;
doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
setColor(doc, ADHD_COLORS.lightText);
doc.text('No judgment here. Just noticing. Awareness is the first step to working WITH your brain.', margin, y);
setColor(doc, ADHD_COLORS.text);
y += 20;
const sections = [
    { title: 'What went well this week?', hint: 'Even tiny wins count. Celebrate them.', lines: 4 },
    { title: 'What was hard?', hint: 'Not to beat yourself up — to understand and adjust.', lines: 3 },
    { title: 'What drained my energy?', hint: 'People, tasks, situations — notice the patterns.', lines: 3 },
    { title: 'What gave me energy?', hint: 'Do more of this next week.', lines: 3 },
    { title: 'One thing I want to try next week:', hint: 'Just one. Keep it small and doable.', lines: 2 },
];
for (const s of sections) {
    if (y + s.lines * 18 + 35 > ph - margin) break;
    sectionHeader(doc, s.title.toUpperCase(), margin, y, w);
    y += 14;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    setColor(doc, ADHD_COLORS.lightText);
    doc.text(s.hint, margin + 6, y);
    setColor(doc, ADHD_COLORS.text);
    y += 12;
    for (let i = 0; i < s.lines; i++) { drawLine(doc, margin + 4, y, pw - margin, y); y += 18; }
    y += 8;
}
pageNum(doc, pw, ph, 6);

// Save
const fs = await import('fs');
const buffer = doc.output('arraybuffer');
fs.writeFileSync('/home/user/kdp-book-factory/ADHD_Planner_Sample.pdf', Buffer.from(buffer));
console.log('PDF generated: ADHD_Planner_Sample.pdf - 8 pages');
