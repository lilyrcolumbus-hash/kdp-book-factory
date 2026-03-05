// Sudoku Generator Module

function generateSudokuBoard() {
    const board = Array.from({length: 9}, () => Array(9).fill(0));
    fillBoard(board);
    return board;
}

function fillBoard(board) {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;
    const nums = shuffleArray([1,2,3,4,5,6,7,8,9]);
    for (const num of nums) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function findEmpty(board) {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] === 0) return [r, c];
    return null;
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++)
            if (board[r][c] === num) return false;
    return true;
}

function createSudokuPuzzle(difficulty) {
    const solution = generateSudokuBoard();
    const puzzle = solution.map(r => [...r]);
    const clues = {easy: 33, medium: 28, hard: 24, expert: 19};
    const target = clues[difficulty] || 28;
    let filled = 81;
    const cells = shuffleArray(
        Array.from({length: 81}, (_, i) => [Math.floor(i/9), i%9])
    );
    for (const [r, c] of cells) {
        if (filled <= target) break;
        puzzle[r][c] = 0;
        filled--;
    }
    return { puzzle, solution };
}

function drawSudokuOnPage(doc, puzzle, x, y, size, fontSize) {
    const cellSize = size / 9;
    // Draw cells
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] !== 0) {
                doc.text(
                    String(puzzle[r][c]),
                    x + c * cellSize + cellSize / 2,
                    y + r * cellSize + cellSize / 2 + fontSize * 0.3,
                    { align: 'center' }
                );
            }
        }
    }
    // Thin lines
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    for (let i = 0; i <= 9; i++) {
        doc.line(x, y + i * cellSize, x + size, y + i * cellSize);
        doc.line(x + i * cellSize, y, x + i * cellSize, y + size);
    }
    // Thick lines for 3x3 boxes
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    for (let i = 0; i <= 3; i++) {
        doc.line(x, y + i * 3 * cellSize, x + size, y + i * 3 * cellSize);
        doc.line(x + i * 3 * cellSize, y, x + i * 3 * cellSize, y + size);
    }
}

async function generateSudoku() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('su-title').value;
    const difficulty = document.getElementById('su-difficulty').value;
    const perPage = parseInt(document.getElementById('su-perpg').value);
    const count = parseInt(document.getElementById('su-count').value);
    const pageSize = document.getElementById('su-pagesize').value;
    const includeSolutions = document.getElementById('su-solutions').value === 'yes';

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;
    const puzzles = [];

    // Title page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw/2, ph/2 - 40, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const diffLabel = {easy:'Easy', medium:'Medium', hard:'Hard', expert:'Expert'};
    doc.text(`${count} Puzzles - ${diffLabel[difficulty]}`, pw/2, ph/2 + 10, { align: 'center' });

    const totalPages = Math.ceil(count / perPage);
    let puzzleIdx = 0;

    for (let p = 0; p < totalPages; p++) {
        showProgress('su-progress', ((p+1)/totalPages) * (includeSolutions ? 65 : 95),
            `Generando pagina ${p+1} de ${totalPages}...`);
        await tick();

        doc.addPage();
        const puzzlesThisPage = Math.min(perPage, count - puzzleIdx);

        if (perPage === 1) {
            const s = createSudokuPuzzle(difficulty);
            puzzles.push(s);
            const size = Math.min(pw - margin*2, ph - margin*2 - 60);
            const sx = (pw - size) / 2;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Puzzle ${puzzleIdx + 1}`, pw/2, margin, { align: 'center' });
            drawSudokuOnPage(doc, s.puzzle, sx, margin + 20, size, 16);
            puzzleIdx++;
        } else if (perPage === 2) {
            for (let i = 0; i < puzzlesThisPage; i++) {
                const s = createSudokuPuzzle(difficulty);
                puzzles.push(s);
                const size = Math.min(pw - margin*2, (ph - margin*2 - 80) / 2 - 20);
                const sx = (pw - size) / 2;
                const sy = margin + 20 + i * (size + 40);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text(`Puzzle ${puzzleIdx + 1}`, pw/2, sy - 8, { align: 'center' });
                drawSudokuOnPage(doc, s.puzzle, sx, sy, size, 12);
                puzzleIdx++;
            }
        } else { // 4 per page
            for (let i = 0; i < puzzlesThisPage; i++) {
                const s = createSudokuPuzzle(difficulty);
                puzzles.push(s);
                const size = Math.min((pw - margin*3) / 2, (ph - margin*2 - 80) / 2 - 20);
                const col = i % 2;
                const row = Math.floor(i / 2);
                const sx = margin + col * (size + margin);
                const sy = margin + 20 + row * (size + 40);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text(`#${puzzleIdx + 1}`, sx + size/2, sy - 5, { align: 'center' });
                drawSudokuOnPage(doc, s.puzzle, sx, sy, size, 10);
                puzzleIdx++;
            }
        }
    }

    // Solutions
    if (includeSolutions) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('SOLUTIONS', pw/2, ph/2, { align: 'center' });

        // 4 solutions per page always (smaller)
        const solPages = Math.ceil(puzzles.length / 4);
        for (let p = 0; p < solPages; p++) {
            showProgress('su-progress', 65 + ((p+1)/solPages) * 30,
                `Soluciones ${p+1} de ${solPages}...`);
            await tick();
            doc.addPage();
            for (let i = 0; i < 4; i++) {
                const idx = p * 4 + i;
                if (idx >= puzzles.length) break;
                const size = Math.min((pw - margin*3) / 2, (ph - margin*2 - 60) / 2 - 20);
                const col = i % 2;
                const row = Math.floor(i / 2);
                const sx = margin + col * (size + margin);
                const sy = margin + 15 + row * (size + 35);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(`Sol. #${idx + 1}`, sx + size/2, sy - 4, { align: 'center' });
                drawSudokuOnPage(doc, puzzles[idx].solution, sx, sy, size, 8);
            }
        }
    }

    showProgress('su-progress', 100, 'Descargando PDF...');
    const date = new Date().toISOString().slice(0,10);
    doc.save(`Sudoku_${difficulty}_${date}.pdf`);
    hideProgress('su-progress');
}
