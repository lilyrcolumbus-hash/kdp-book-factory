// Math Puzzles Generator Module

function generateMathProblem(type, difficulty) {
    const ranges = {
        easy: { max: 20, divMax: 10 },
        medium: { max: 100, divMax: 20 },
        hard: { max: 1000, divMax: 50 },
    };
    const r = ranges[difficulty] || ranges.medium;

    const ops = type === 'mixed'
        ? ['addition', 'subtraction', 'multiplication', 'division']
        : [type];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a, b, symbol, answer;
    switch (op) {
        case 'addition':
            a = Math.floor(Math.random() * r.max) + 1;
            b = Math.floor(Math.random() * r.max) + 1;
            symbol = '+';
            answer = a + b;
            break;
        case 'subtraction':
            a = Math.floor(Math.random() * r.max) + 1;
            b = Math.floor(Math.random() * a) + 1;
            symbol = '-';
            answer = a - b;
            break;
        case 'multiplication':
            a = Math.floor(Math.random() * Math.min(r.max, 30)) + 1;
            b = Math.floor(Math.random() * Math.min(r.max, 20)) + 1;
            symbol = 'x';
            answer = a * b;
            break;
        case 'division':
            b = Math.floor(Math.random() * r.divMax) + 1;
            answer = Math.floor(Math.random() * r.divMax) + 1;
            a = b * answer;
            symbol = '/';
            break;
    }
    return { text: `${a} ${symbol} ${b} = `, answer };
}

async function generateMathPuzzles() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('mp-title').value;
    const type = document.getElementById('mp-type').value;
    const difficulty = document.getElementById('mp-difficulty').value;
    const perPage = parseInt(document.getElementById('mp-perpg').value);
    const pages = parseInt(document.getElementById('mp-pages').value);
    const pageSize = document.getElementById('mp-pagesize').value;

    const bgStyle = document.getElementById('mp-bgstyle').value;
    const bgTheme = document.getElementById('mp-bgtheme').value;

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;
    const allProblems = [];

    // Title page
    drawTitlePageBackground(doc, bgTheme, bgStyle, pw, ph);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw/2, ph/2 - 40, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const typeLabels = {addition:'Addition', subtraction:'Subtraction', multiplication:'Multiplication', division:'Division', mixed:'Mixed Operations'};
    const diffLabels = {easy:'Easy (1-20)', medium:'Medium (1-100)', hard:'Hard (1-1000)'};
    doc.text(`${typeLabels[type]} - ${diffLabels[difficulty]}`, pw/2, ph/2 + 10, { align: 'center' });
    doc.text(`${pages * perPage} Problems`, pw/2, ph/2 + 35, { align: 'center' });

    for (let p = 0; p < pages; p++) {
        showProgress('mp-progress', ((p+1)/pages) * 70, `Pagina ${p+1} de ${pages}...`);
        await tick();

        doc.addPage();
        drawPageBackground(doc, bgTheme, bgStyle, pw, ph, p + 1, pages);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Page ${p + 1}`, pw/2, margin - 5, { align: 'center' });

        const pageProblems = [];
        const cols = perPage <= 15 ? 2 : (perPage <= 20 ? 2 : 3);
        const rows = Math.ceil(perPage / cols);
        const colW = (pw - margin * 2) / cols;
        const rowH = (ph - margin * 2 - 20) / rows;

        doc.setFont('courier', 'normal');
        doc.setFontSize(perPage <= 15 ? 14 : (perPage <= 20 ? 12 : 10));

        let num = p * perPage;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (pageProblems.length >= perPage) break;
                num++;
                const problem = generateMathProblem(type, difficulty);
                pageProblems.push(problem);
                const x = margin + c * colW;
                const y = margin + 15 + r * rowH + rowH / 2;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(perPage <= 15 ? 13 : (perPage <= 20 ? 11 : 9));
                doc.text(`${num}.  ${problem.text}_____`, x + 10, y);
            }
        }
        allProblems.push(pageProblems);
    }

    // Answer key
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ANSWER KEY', pw/2, ph/2, { align: 'center' });

    let ansNum = 0;
    const ansPerPage = 40;
    const ansTotalPages = Math.ceil(pages * perPage / ansPerPage);
    for (let ap = 0; ap < ansTotalPages; ap++) {
        showProgress('mp-progress', 70 + ((ap+1)/ansTotalPages) * 25, `Respuestas ${ap+1}...`);
        await tick();
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Answers - Page ${ap + 1}`, pw/2, margin - 5, { align: 'center' });

        const cols = 4;
        const colW = (pw - margin * 2) / cols;
        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        let row = 0;
        let col = 0;
        const flat = allProblems.flat();
        for (let i = ap * ansPerPage; i < Math.min((ap+1) * ansPerPage, flat.length); i++) {
            const x = margin + col * colW;
            const y = margin + 15 + row * 16;
            doc.text(`${i+1}. ${flat[i].answer}`, x, y);
            col++;
            if (col >= cols) { col = 0; row++; }
        }
    }

    showProgress('mp-progress', 100, 'Descargando PDF...');
    const date = new Date().toISOString().slice(0,10);
    doc.save(`MathPuzzles_${type}_${difficulty}_${date}.pdf`);
    hideProgress('mp-progress');
}
