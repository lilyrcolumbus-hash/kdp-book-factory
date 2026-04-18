// Journal / Planner Generator Module

function drawLinedPage(doc, pw, ph, margin, lineSpacing) {
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    const startY = margin + 30;
    for (let y = startY; y < ph - margin; y += lineSpacing) {
        doc.line(margin, y, pw - margin, y);
    }
}

function drawDotGrid(doc, pw, ph, margin, spacing) {
    doc.setFillColor(180, 180, 200);
    const startY = margin + 10;
    for (let y = startY; y < ph - margin; y += spacing) {
        for (let x = margin; x < pw - margin; x += spacing) {
            doc.circle(x, y, 0.8, 'F');
        }
    }
}

function drawDailyPlanner(doc, pw, ph, margin, pageNum) {
    const w = pw - margin * 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Daily Planner', pw / 2, margin + 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date: _______________', margin, margin + 40);

    // Schedule section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Schedule', margin, margin + 65);
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    const hours = ['6:00','7:00','8:00','9:00','10:00','11:00','12:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00'];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let y = margin + 80;
    for (const h of hours) {
        doc.text(h, margin, y + 3);
        doc.line(margin + 40, y, pw - margin, y);
        y += 18;
    }

    // To-Do section
    const todoY = y + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('To-Do List', margin, todoY);
    doc.setFont('helvetica', 'normal');
    y = todoY + 15;
    for (let i = 0; i < 8; i++) {
        doc.rect(margin, y - 7, 8, 8);
        doc.line(margin + 14, y + 1, pw - margin, y + 1);
        y += 18;
    }

    // Notes section
    const notesY = y + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    if (notesY + 60 < ph - margin) {
        doc.text('Notes', margin, notesY);
        doc.setDrawColor(180, 180, 200);
        doc.rect(margin, notesY + 8, w, ph - margin - notesY - 12);
    }
}

function drawWeeklyPlanner(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Weekly Planner', pw / 2, margin + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Week of: _______________', margin, margin + 38);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const w = pw - margin * 2;
    const dayH = (ph - margin * 2 - 60) / 7;
    let y = margin + 52;
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);

    for (const day of days) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setFillColor(240, 240, 248);
        doc.rect(margin, y, w, 14, 'F');
        doc.text(day, margin + 5, y + 10);
        doc.rect(margin, y, w, dayH);
        // Lines inside
        doc.setFont('helvetica', 'normal');
        for (let ly = y + 26; ly < y + dayH - 2; ly += 14) {
            doc.line(margin + 5, ly, pw - margin - 5, ly);
        }
        y += dayH;
    }
}

function drawMonthlyPlanner(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Monthly Planner', pw / 2, margin + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Month: _______________  Year: _______', margin, margin + 38);

    const w = pw - margin * 2;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cellW = w / 7;
    const cellH = (ph - margin * 2 - 80) / 6;
    const startY = margin + 55;

    // Header
    doc.setFillColor(100, 126, 234);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    for (let i = 0; i < 7; i++) {
        doc.rect(margin + i * cellW, startY, cellW, 18, 'F');
        doc.text(days[i], margin + i * cellW + cellW/2, startY + 12, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    // Grid
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            doc.rect(margin + c * cellW, startY + 18 + r * cellH, cellW, cellH);
        }
    }

    // Goals section at bottom
    const goalsY = startY + 18 + 6 * cellH + 15;
    if (goalsY + 40 < ph - margin) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Monthly Goals:', margin, goalsY);
        for (let i = 0; i < 3; i++) {
            doc.rect(margin, goalsY + 8 + i * 16, 8, 8);
            doc.line(margin + 14, goalsY + 16 + i * 16, pw - margin, goalsY + 16 + i * 16);
        }
    }
}

function drawGratitudeJournal(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Gratitude Journal', pw / 2, margin + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date: _______________', margin, margin + 40);

    const sections = [
        { title: 'Today I am grateful for...', lines: 5 },
        { title: 'What made today special?', lines: 4 },
        { title: 'Positive affirmation:', lines: 3 },
        { title: 'One thing I learned today:', lines: 3 },
        { title: 'How I will make tomorrow great:', lines: 3 },
    ];

    let y = margin + 60;
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    for (const s of sections) {
        if (y + s.lines * 20 + 25 > ph - margin) break;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(s.title, margin, y);
        y += 18;
        doc.setFont('helvetica', 'normal');
        for (let i = 0; i < s.lines; i++) {
            doc.line(margin, y, pw - margin, y);
            y += 20;
        }
        y += 12;
    }
}

function drawHabitTracker(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Habit Tracker', pw / 2, margin + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Month: _______________', margin, margin + 38);

    const w = pw - margin * 2;
    const habitCol = 100;
    const dayW = (w - habitCol) / 31;
    const rowH = 18;
    const startY = margin + 55;
    const habits = 15;

    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    doc.setFontSize(7);

    // Header row with day numbers
    doc.setFont('helvetica', 'bold');
    for (let d = 1; d <= 31; d++) {
        doc.text(String(d), margin + habitCol + (d-1) * dayW + dayW/2, startY - 3, { align: 'center' });
    }

    // Habit rows
    doc.setFont('helvetica', 'normal');
    for (let h = 0; h < habits; h++) {
        const y = startY + h * rowH;
        doc.rect(margin, y, habitCol, rowH);
        for (let d = 0; d < 31; d++) {
            doc.rect(margin + habitCol + d * dayW, y, dayW, rowH);
        }
    }
}

function drawFitnessLog(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Fitness Log', pw / 2, margin + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date: _______________', margin, margin + 40);

    const sections = [
        { title: 'Workout Type:', lines: 1 },
        { title: 'Warm-up:', lines: 2 },
    ];

    let y = margin + 60;
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);

    for (const s of sections) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(s.title, margin, y);
        y += 14;
        for (let i = 0; i < s.lines; i++) {
            doc.line(margin, y, pw - margin, y);
            y += 18;
        }
        y += 5;
    }

    // Exercise table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Exercises', margin, y);
    y += 12;
    const cols = ['Exercise', 'Sets', 'Reps', 'Weight', 'Notes'];
    const colW = [(pw - margin*2) * 0.3, 50, 50, 60, (pw - margin*2) * 0.3 - 60];
    let cx = margin;
    doc.setFontSize(8);
    doc.setFillColor(240, 240, 248);
    doc.rect(margin, y - 8, pw - margin*2, 14, 'F');
    for (let i = 0; i < cols.length; i++) {
        doc.text(cols[i], cx + 3, y + 2);
        cx += colW[i];
    }
    y += 10;
    doc.setFont('helvetica', 'normal');
    for (let r = 0; r < 12; r++) {
        cx = margin;
        for (let i = 0; i < cols.length; i++) {
            doc.rect(cx, y, colW[i], 22);
            cx += colW[i];
        }
        y += 22;
    }

    // Notes
    if (y + 50 < ph - margin) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Notes:', margin, y);
        doc.rect(margin, y + 5, pw - margin*2, ph - margin - y - 10);
    }
}

function drawReadingLog(doc, pw, ph, margin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Reading Log', pw / 2, margin + 15, { align: 'center' });

    let y = margin + 40;
    const fields = [
        'Title: _______________________________________________',
        'Author: _____________________________________________',
        'Date Started: ____________  Date Finished: ____________',
        'Pages: _______  Rating: ___ / 5',
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const f of fields) {
        doc.text(f, margin, y);
        y += 22;
    }

    y += 5;
    const sections = [
        { title: 'Summary:', lines: 5 },
        { title: 'Favorite Quotes:', lines: 4 },
        { title: 'Key Takeaways:', lines: 4 },
        { title: 'Personal Reflections:', lines: 4 },
    ];
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    for (const s of sections) {
        if (y + s.lines * 18 + 20 > ph - margin) break;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(s.title, margin, y);
        y += 14;
        for (let i = 0; i < s.lines; i++) {
            doc.line(margin, y, pw - margin, y);
            y += 18;
        }
        y += 8;
    }
}

function drawCornellNotes(doc, pw, ph, margin) {
    const w = pw - margin * 2;
    const h = ph - margin * 2;
    const cueW = w * 0.3;
    const noteW = w * 0.7;
    const summaryH = 80;
    const headerH = 35;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Cornell Notes', margin, margin + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Date: ________  Topic: ________________________________', margin, margin + 28);

    doc.setDrawColor(100, 126, 234);
    doc.setLineWidth(0.8);
    // Main box
    doc.rect(margin, margin + headerH, w, h - headerH);
    // Vertical divider
    doc.line(margin + cueW, margin + headerH, margin + cueW, margin + h - summaryH);
    // Horizontal divider (summary)
    doc.line(margin, margin + h - summaryH, margin + w, margin + h - summaryH);

    // Labels
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 126, 234);
    doc.text('CUES / QUESTIONS', margin + 5, margin + headerH + 12);
    doc.text('NOTES', margin + cueW + 5, margin + headerH + 12);
    doc.text('SUMMARY', margin + 5, margin + h - summaryH + 12);
    doc.setTextColor(0, 0, 0);

    // Lines in notes area
    doc.setDrawColor(220, 220, 235);
    doc.setLineWidth(0.2);
    for (let y = margin + headerH + 24; y < margin + h - summaryH - 5; y += 18) {
        doc.line(margin + cueW + 5, y, margin + w - 5, y);
    }
    // Lines in summary area
    for (let y = margin + h - summaryH + 24; y < margin + h - 5; y += 18) {
        doc.line(margin + 5, y, margin + w - 5, y);
    }
}

async function generateJournal() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('jr-title').value;
    const type = document.getElementById('jr-type').value;
    const pages = parseInt(document.getElementById('jr-pages').value);
    const pageSize = document.getElementById('jr-pagesize').value;

    const bgStyle = document.getElementById('jr-bgstyle').value;
    const bgTheme = document.getElementById('jr-bgtheme').value;

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;

    // Title page
    drawTitlePageBackground(doc, bgTheme, bgStyle, pw, ph);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw/2, ph/2 - 20, { align: 'center' });

    const drawFn = {
        daily: drawDailyPlanner,
        weekly: drawWeeklyPlanner,
        monthly: drawMonthlyPlanner,
        gratitude: drawGratitudeJournal,
        habit: drawHabitTracker,
        fitness: drawFitnessLog,
        reading: drawReadingLog,
        dotgrid: (d, w, h, m) => drawDotGrid(d, w, h, m, 15),
        lined: (d, w, h, m) => drawLinedPage(d, w, h, m, 22),
        cornell: drawCornellNotes,
    };

    for (let i = 0; i < pages; i++) {
        showProgress('jr-progress', ((i+1)/pages) * 95, `Pagina ${i+1} de ${pages}...`);
        await tick();
        doc.addPage();
        drawPageBackground(doc, bgTheme, bgStyle, pw, ph, i + 1, pages);
        drawFn[type](doc, pw, ph, margin, i + 1);
    }

    showProgress('jr-progress', 100, 'Descargando PDF...');
    const date = new Date().toISOString().slice(0,10);
    doc.save(`Journal_${type}_${date}.pdf`);
    hideProgress('jr-progress');
}
