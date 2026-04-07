// ADHD Planner Generator Module
// Based on research: simple, clean, undated, with instructions on every page type

// ── Color palette for ADHD-friendly accents (soft, not overwhelming) ──
const ADHD_COLORS = {
    primary:    [102, 126, 234],  // calm blue
    secondary:  [118, 75, 162],   // soft purple
    accent:     [76, 175, 80],    // gentle green
    warmAccent: [255, 183, 77],   // warm amber
    text:       [50, 50, 60],     // dark gray (not pure black — easier on eyes)
    lightText:  [130, 130, 150],  // muted gray
    line:       [210, 210, 225],  // soft line color
    bgSection:  [245, 245, 252],  // very light section bg
};

function adhdSetColor(doc, colorArr) {
    doc.setTextColor(colorArr[0], colorArr[1], colorArr[2]);
}

function adhdSetFill(doc, colorArr) {
    doc.setFillColor(colorArr[0], colorArr[1], colorArr[2]);
}

function adhdSetDraw(doc, colorArr) {
    doc.setDrawColor(colorArr[0], colorArr[1], colorArr[2]);
}

// ── Reusable micro-components ──

function adhdDrawCheckbox(doc, x, y, size) {
    doc.setLineWidth(0.5);
    adhdSetDraw(doc, ADHD_COLORS.line);
    doc.roundedRect(x, y, size, size, 2, 2);
}

function adhdDrawLine(doc, x1, y1, x2, y2) {
    doc.setLineWidth(0.3);
    adhdSetDraw(doc, ADHD_COLORS.line);
    doc.line(x1, y1, x2, y2);
}

function adhdDrawSectionHeader(doc, text, x, y, w) {
    adhdSetFill(doc, ADHD_COLORS.bgSection);
    doc.roundedRect(x, y - 12, w, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text(text, x + 6, y);
    adhdSetColor(doc, ADHD_COLORS.text);
}

function adhdPageNumber(doc, pw, ph, num) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text(String(num), pw / 2, ph - 20, { align: 'center' });
    adhdSetColor(doc, ADHD_COLORS.text);
}

// ── PAGE: Welcome / How to Use (addresses #1 complaint: no instructions) ──

function drawADHDWelcome(doc, pw, ph, margin) {
    const w = pw - margin * 2;
    let y = margin + 20;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Welcome to Your ADHD Planner', pw / 2, y, { align: 'center' });
    y += 30;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    adhdSetColor(doc, ADHD_COLORS.text);
    const intro = [
        'This planner was designed specifically for how your brain works.',
        'No guilt. No pressure. Just gentle structure when you need it.',
        '',
        'There are no dates — start anytime, skip days freely, and come back.',
        'Each page type has a short guide so you always know what to do.',
    ];
    for (const line of intro) {
        doc.text(line, pw / 2, y, { align: 'center' });
        y += 16;
    }
    y += 10;

    // Section: Page Types explained
    adhdDrawSectionHeader(doc, 'YOUR PAGE TYPES', margin, y, w);
    y += 16;

    const pages = [
        ['Daily Focus', 'Your simplified daily page. Pick only 3 priorities, block your time visually, and brain dump anything swirling in your head.'],
        ['Weekly Overview', 'A bird\'s-eye view of your week. No hourly detail — just key tasks and a quick energy check.'],
        ['Brain Dump', 'Unload every thought. No categories, no rules. Just get it out of your head and onto paper.'],
        ['Mood & Energy', 'Track how you feel and your energy level. Over time, you\'ll spot patterns that help you plan better.'],
        ['Habit Tracker', 'A simple visual tracker for just 5-7 habits. Small circles — fill them in. That\'s it.'],
        ['Weekly Reflection', 'A gentle weekly review. What worked? What didn\'t? No judgment — just awareness.'],
    ];

    doc.setFontSize(9);
    for (const [title, desc] of pages) {
        if (y + 35 > ph - margin) break;
        doc.setFont('helvetica', 'bold');
        adhdSetColor(doc, ADHD_COLORS.secondary);
        doc.text(title, margin + 8, y);
        doc.setFont('helvetica', 'normal');
        adhdSetColor(doc, ADHD_COLORS.text);
        const lines = doc.splitTextToSize(desc, w - 16);
        doc.text(lines, margin + 8, y + 13);
        y += 13 + lines.length * 12 + 8;
    }

    y += 10;
    if (y + 30 < ph - margin) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        adhdSetColor(doc, ADHD_COLORS.warmAccent);
        doc.text('Tip: You don\'t have to use every page. Use what helps. Skip what doesn\'t.', pw / 2, y, { align: 'center' });
        adhdSetColor(doc, ADHD_COLORS.text);
    }
}

// ── PAGE: Daily Focus (simplified — only 3 priorities + time blocking + brain dump) ──

function drawADHDDaily(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Daily Focus', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Date: ___ / ___ / ______', pw - margin, y, { align: 'right' });
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 14;

    // Mini instruction
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Pick only 3 things. If you finish them, celebrate. Anything extra is a bonus.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 16;

    // TOP 3 PRIORITIES
    adhdDrawSectionHeader(doc, 'TOP 3 PRIORITIES', margin, y, w);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (let i = 0; i < 3; i++) {
        adhdDrawCheckbox(doc, margin + 4, y - 7, 10);
        adhdDrawLine(doc, margin + 20, y + 1, pw - margin, y + 1);
        y += 24;
    }
    y += 6;

    // TIME BLOCKS (visual, simple — morning/afternoon/evening)
    adhdDrawSectionHeader(doc, 'TIME BLOCKS', margin, y, w);
    y += 14;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('What will you focus on during each block? Keep it simple.', margin + 6, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 14;

    const blocks = [
        { label: 'Morning', icon: '06-12h', color: ADHD_COLORS.warmAccent },
        { label: 'Afternoon', icon: '12-17h', color: ADHD_COLORS.primary },
        { label: 'Evening', icon: '17-21h', color: ADHD_COLORS.secondary },
    ];

    const blockH = 48;
    for (const b of blocks) {
        adhdSetFill(doc, b.color);
        doc.roundedRect(margin, y, 6, blockH, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adhdSetColor(doc, ADHD_COLORS.text);
        doc.text(b.label, margin + 14, y + 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text(b.icon, margin + 14, y + 20);
        adhdSetColor(doc, ADHD_COLORS.text);
        // Lines for writing
        adhdDrawLine(doc, margin + 70, y + 14, pw - margin, y + 14);
        adhdDrawLine(doc, margin + 70, y + 30, pw - margin, y + 30);
        adhdDrawLine(doc, margin + 70, y + 44, pw - margin, y + 44);
        y += blockH + 8;
    }
    y += 4;

    // BRAIN DUMP
    if (y + 80 < ph - margin) {
        adhdDrawSectionHeader(doc, 'BRAIN DUMP', margin, y, w);
        y += 14;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text('Get it out of your head. No order needed.', margin + 6, y);
        adhdSetColor(doc, ADHD_COLORS.text);
        y += 12;
        adhdSetDraw(doc, ADHD_COLORS.line);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, w, ph - margin - y - 30, 4, 4);
        // Dot grid inside brain dump area
        doc.setFillColor(200, 200, 215);
        for (let dy = y + 14; dy < ph - margin - 35; dy += 14) {
            for (let dx = margin + 10; dx < pw - margin - 5; dx += 14) {
                doc.circle(dx, dy, 0.6, 'F');
            }
        }
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── PAGE: Weekly Overview ──

function drawADHDWeekly(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Weekly Overview', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Week of: _______________', pw - margin, y, { align: 'right' });
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 12;

    // Instruction
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Write 1-2 key tasks per day. If a day is blank, that\'s perfectly fine.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 16;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayH = Math.min(60, (ph - y - margin - 100) / 7);

    for (const day of days) {
        if (y + dayH > ph - margin - 80) break;
        // Day label bar
        adhdSetFill(doc, ADHD_COLORS.bgSection);
        doc.roundedRect(margin, y, w, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adhdSetColor(doc, ADHD_COLORS.secondary);
        doc.text(day, margin + 6, y + 10);
        adhdSetColor(doc, ADHD_COLORS.text);

        // Energy indicator on right
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text('Energy:', pw - margin - 80, y + 10);
        // 5 small circles for energy rating
        for (let e = 0; e < 5; e++) {
            doc.circle(pw - margin - 38 + e * 10, y + 7, 3.5);
        }
        adhdSetColor(doc, ADHD_COLORS.text);

        // Task lines
        const lineY = y + 26;
        adhdDrawCheckbox(doc, margin + 4, lineY - 7, 8);
        adhdDrawLine(doc, margin + 16, lineY + 1, pw / 2 - 5, lineY + 1);
        adhdDrawCheckbox(doc, pw / 2 + 4, lineY - 7, 8);
        adhdDrawLine(doc, pw / 2 + 16, lineY + 1, pw - margin, lineY + 1);

        if (dayH > 45) {
            const lineY2 = lineY + 18;
            adhdDrawCheckbox(doc, margin + 4, lineY2 - 7, 8);
            adhdDrawLine(doc, margin + 16, lineY2 + 1, pw / 2 - 5, lineY2 + 1);
        }

        y += dayH;
    }

    // Weekly wins section at bottom
    y += 8;
    if (y + 50 < ph - margin) {
        adhdDrawSectionHeader(doc, 'WEEKLY WINS (anything counts!)', margin, y, w);
        y += 16;
        for (let i = 0; i < 3; i++) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('*', margin + 6, y + 2);
            adhdDrawLine(doc, margin + 14, y + 2, pw - margin, y + 2);
            y += 16;
        }
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── PAGE: Brain Dump (full page, addresses need for thought capture) ──

function drawADHDBrainDump(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Brain Dump', margin, y);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 14;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Write, sketch, list — whatever your brain needs to release right now. No rules.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 18;

    // Large dot grid area for free-form capture
    adhdSetDraw(doc, ADHD_COLORS.line);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, w, ph - margin - y - 30, 6, 6);

    doc.setFillColor(195, 195, 215);
    const spacing = 14;
    for (let dy = y + spacing; dy < ph - margin - 35; dy += spacing) {
        for (let dx = margin + spacing; dx < pw - margin - 5; dx += spacing) {
            doc.circle(dx, dy, 0.7, 'F');
        }
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── PAGE: Mood & Energy Tracker ──

function drawADHDMoodEnergy(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Mood & Energy Check-in', margin, y);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 14;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Track daily for a week. Spotting patterns helps you plan around your energy, not against it.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 18;

    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const rowH = Math.min(72, (ph - y - margin - 50) / 7);

    for (const day of days) {
        if (y + rowH > ph - margin - 30) break;

        adhdSetFill(doc, ADHD_COLORS.bgSection);
        doc.roundedRect(margin, y, w, rowH, 3, 3, 'F');

        // Day label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adhdSetColor(doc, ADHD_COLORS.secondary);
        doc.text(day, margin + 6, y + 12);

        // Date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text('Date: ___ / ___', margin + 50, y + 12);

        // Mood row
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        adhdSetColor(doc, ADHD_COLORS.text);
        doc.text('Mood:', margin + 6, y + 28);
        const moods = ['Great', 'Good', 'Okay', 'Low', 'Hard'];
        for (let m = 0; m < moods.length; m++) {
            const mx = margin + 50 + m * 55;
            doc.circle(mx, y + 26, 4);
            doc.setFontSize(7);
            doc.text(moods[m], mx + 7, y + 28);
        }

        // Energy row
        doc.setFontSize(8);
        doc.text('Energy:', margin + 6, y + 44);
        for (let e = 0; e < 5; e++) {
            const ex = margin + 55 + e * 12;
            doc.circle(ex, y + 42, 4);
            doc.setFontSize(7);
            doc.text(String(e + 1), ex - 2, y + 44);
        }
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text('(1=empty  5=full)', margin + 125, y + 44);

        // Notes line
        adhdSetColor(doc, ADHD_COLORS.text);
        doc.setFontSize(8);
        doc.text('Note:', margin + 6, y + 60);
        adhdDrawLine(doc, margin + 38, y + 60, pw - margin - 6, y + 60);

        adhdSetColor(doc, ADHD_COLORS.text);
        y += rowH + 4;
    }

    // Pattern reflection
    y += 4;
    if (y + 40 < ph - margin) {
        adhdDrawSectionHeader(doc, 'PATTERNS I NOTICE', margin, y, w);
        y += 16;
        adhdDrawLine(doc, margin + 4, y, pw - margin, y);
        y += 16;
        adhdDrawLine(doc, margin + 4, y, pw - margin, y);
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── PAGE: Habit Tracker (simplified — max 7 habits, visual circles) ──

function drawADHDHabitTracker(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Habit Tracker', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Month: ___________', pw - margin, y, { align: 'right' });
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 14;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('Choose 5-7 small habits. Fill the circle when done. Don\'t aim for perfection — aim for awareness.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 20;

    // Header: day numbers
    const habitLabelW = 100;
    const daysCount = 31;
    const dayW = (w - habitLabelW) / daysCount;
    const circleR = Math.min(dayW * 0.35, 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    for (let d = 1; d <= daysCount; d++) {
        doc.text(String(d), margin + habitLabelW + (d - 0.5) * dayW, y, { align: 'center' });
    }
    adhdSetColor(doc, ADHD_COLORS.text);
    y += 10;

    // 7 habit rows
    const habitCount = 7;
    const rowH = Math.min(36, (ph - y - margin - 80) / habitCount);

    for (let h = 0; h < habitCount; h++) {
        // Alternating row bg
        if (h % 2 === 0) {
            adhdSetFill(doc, ADHD_COLORS.bgSection);
            doc.rect(margin, y, w, rowH, 'F');
        }

        // Habit label area
        adhdDrawLine(doc, margin + 4, y + rowH / 2 + 6, margin + habitLabelW - 6, y + rowH / 2 + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text('Habit ' + (h + 1) + ':', margin + 4, y + rowH / 2);
        adhdSetColor(doc, ADHD_COLORS.text);

        // Day circles
        adhdSetDraw(doc, ADHD_COLORS.line);
        doc.setLineWidth(0.3);
        for (let d = 0; d < daysCount; d++) {
            doc.circle(margin + habitLabelW + (d + 0.5) * dayW, y + rowH / 2 + 2, circleR);
        }

        y += rowH;
    }

    // Habit ideas
    y += 14;
    if (y + 60 < ph - margin) {
        adhdDrawSectionHeader(doc, 'HABIT IDEAS TO GET STARTED', margin, y, w);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        const ideas = [
            'Drink water when I wake up  |  Take my meds  |  5 min walk  |  Brain dump before bed',
            'No phone first 15 min  |  Eat breakfast  |  1 thing off my list  |  Gratitude thought',
        ];
        for (const idea of ideas) {
            doc.text(idea, pw / 2, y, { align: 'center' });
            y += 14;
        }
        adhdSetColor(doc, ADHD_COLORS.text);
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── PAGE: Weekly Reflection ──

function drawADHDReflection(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    let y = margin + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text('Weekly Reflection', margin, y);
    y += 8;
    adhdDrawLine(doc, margin, y, pw - margin, y);
    y += 14;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    adhdSetColor(doc, ADHD_COLORS.lightText);
    doc.text('No judgment here. Just noticing. Awareness is the first step to working WITH your brain.', margin, y);
    adhdSetColor(doc, ADHD_COLORS.text);
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

        adhdDrawSectionHeader(doc, s.title.toUpperCase(), margin, y, w);
        y += 14;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text(s.hint, margin + 6, y);
        adhdSetColor(doc, ADHD_COLORS.text);
        y += 12;

        for (let i = 0; i < s.lines; i++) {
            adhdDrawLine(doc, margin + 4, y, pw - margin, y);
            y += 18;
        }
        y += 8;
    }

    adhdPageNumber(doc, pw, ph, pageNum);
}

// ── Main generator function ──

async function generateADHDPlanner() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('adhd-title').value || 'ADHD Planner';
    const subtitle = document.getElementById('adhd-subtitle').value || '';
    const author = document.getElementById('adhd-author').value || '';
    const weeks = parseInt(document.getElementById('adhd-weeks').value) || 12;
    const pageSize = document.getElementById('adhd-pagesize').value;
    const includeWelcome = document.getElementById('adhd-welcome').value === 'yes';
    const includeMood = document.getElementById('adhd-mood').value === 'yes';
    const includeHabits = document.getElementById('adhd-habits').value === 'yes';

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;
    let pageNum = 0;
    let totalPages = weeks * 10 + 5; // rough estimate for progress

    // ── Title Page ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    adhdSetColor(doc, ADHD_COLORS.primary);
    doc.text(title, pw / 2, ph / 2 - 40, { align: 'center' });

    if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        adhdSetColor(doc, ADHD_COLORS.secondary);
        doc.text(subtitle, pw / 2, ph / 2, { align: 'center' });
    }

    if (author) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        adhdSetColor(doc, ADHD_COLORS.lightText);
        doc.text(author, pw / 2, ph / 2 + 30, { align: 'center' });
    }

    // Small motivational line
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    adhdSetColor(doc, ADHD_COLORS.warmAccent);
    doc.text('Designed for your brilliant, beautiful brain.', pw / 2, ph - 80, { align: 'center' });
    adhdSetColor(doc, ADHD_COLORS.text);

    // ── Welcome Page ──
    if (includeWelcome) {
        doc.addPage();
        drawADHDWelcome(doc, pw, ph, margin);
    }

    let progress = 0;

    // ── Weekly cycles ──
    for (let week = 0; week < weeks; week++) {
        // Weekly Overview
        doc.addPage();
        pageNum++;
        drawADHDWeekly(doc, pw, ph, margin, pageNum);
        progress++;
        showProgress('adhd-progress', (progress / totalPages) * 95, `Week ${week + 1} of ${weeks}...`);
        await tick();

        // 7 Daily Focus pages
        for (let day = 0; day < 7; day++) {
            doc.addPage();
            pageNum++;
            drawADHDDaily(doc, pw, ph, margin, pageNum);
            progress++;
        }
        await tick();

        // Brain Dump page
        doc.addPage();
        pageNum++;
        drawADHDBrainDump(doc, pw, ph, margin, pageNum);
        progress++;

        // Mood & Energy (if enabled)
        if (includeMood) {
            doc.addPage();
            pageNum++;
            drawADHDMoodEnergy(doc, pw, ph, margin, pageNum);
            progress++;
        }

        // Weekly Reflection
        doc.addPage();
        pageNum++;
        drawADHDReflection(doc, pw, ph, margin, pageNum);
        progress++;

        await tick();
    }

    // Habit Trackers (if enabled — 3 monthly trackers at the end)
    if (includeHabits) {
        const habitPages = Math.ceil(weeks / 4);
        for (let h = 0; h < habitPages; h++) {
            doc.addPage();
            pageNum++;
            drawADHDHabitTracker(doc, pw, ph, margin, pageNum);
        }
    }

    showProgress('adhd-progress', 100, 'Downloading PDF...');
    const date = new Date().toISOString().slice(0, 10);
    doc.save(`ADHD_Planner_${weeks}wk_${date}.pdf`);
    hideProgress('adhd-progress');
}
