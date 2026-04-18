// Kakuro Generator Module

// Generate a kakuro puzzle grid
// Strategy: create a pattern, fill with valid numbers, extract clues
function generateKakuroGrid(size, density) {
    // density: 'easy' = more white cells, 'hard' = fewer
    const fillRatio = density === 'easy' ? 0.55 : density === 'hard' ? 0.40 : 0.48;
    let best = null;

    for (let attempt = 0; attempt < 20; attempt++) {
        const result = tryGenerateKakuro(size, fillRatio);
        if (result && result.runs.length >= size * 2) {
            best = result;
            break;
        }
        if (result && (!best || result.runs.length > best.runs.length)) {
            best = result;
        }
    }
    return best;
}

function tryGenerateKakuro(size, fillRatio) {
    // 0 = black/clue cell, 1 = white/fill cell
    const pattern = Array.from({length: size}, () => Array(size).fill(0));

    // Top row and left column are always black (clue cells)
    // Fill interior with white cells based on density
    for (let r = 1; r < size; r++) {
        for (let c = 1; c < size; c++) {
            if (Math.random() < fillRatio) {
                pattern[r][c] = 1;
            }
        }
    }

    // Clean up: remove isolated white cells (need at least 2 in a row/col run)
    let changed = true;
    while (changed) {
        changed = false;
        for (let r = 1; r < size; r++) {
            for (let c = 1; c < size; c++) {
                if (pattern[r][c] === 1) {
                    const hLen = getRunLength(pattern, r, c, 0, 1, size) + getRunLength(pattern, r, c, 0, -1, size) - 1;
                    const vLen = getRunLength(pattern, r, c, 1, 0, size) + getRunLength(pattern, r, c, -1, 0, size) - 1;
                    if (hLen < 2 && vLen < 2) {
                        pattern[r][c] = 0;
                        changed = true;
                    }
                }
            }
        }
    }

    // Find all runs (horizontal and vertical sequences of white cells)
    const runs = [];

    // Horizontal runs
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (pattern[r][c] === 0 && c + 1 < size && pattern[r][c + 1] === 1) {
                const cells = [];
                let cc = c + 1;
                while (cc < size && pattern[r][cc] === 1) {
                    cells.push([r, cc]);
                    cc++;
                }
                if (cells.length >= 2 && cells.length <= 9) {
                    runs.push({ clueR: r, clueC: c, cells, dir: 'across' });
                }
            }
        }
    }

    // Vertical runs
    for (let c = 0; c < size; c++) {
        for (let r = 0; r < size; r++) {
            if (pattern[r][c] === 0 && r + 1 < size && pattern[r + 1][c] === 1) {
                const cells = [];
                let rr = r + 1;
                while (rr < size && pattern[rr][c] === 1) {
                    cells.push([rr, c]);
                    rr++;
                }
                if (cells.length >= 2 && cells.length <= 9) {
                    runs.push({ clueR: r, clueC: c, cells, dir: 'down' });
                }
            }
        }
    }

    if (runs.length < 4) return null;

    // Fill the grid with valid numbers using backtracking
    const solution = Array.from({length: size}, () => Array(size).fill(0));

    // Build cell-to-runs mapping
    const cellRuns = {};
    for (const run of runs) {
        for (const [r, c] of run.cells) {
            const key = `${r},${c}`;
            if (!cellRuns[key]) cellRuns[key] = [];
            cellRuns[key].push(run);
        }
    }

    // Get all white cells
    const whiteCells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (pattern[r][c] === 1 && cellRuns[`${r},${c}`]) {
                whiteCells.push([r, c]);
            }
        }
    }

    // Backtracking solver to fill grid
    if (!fillKakuro(solution, whiteCells, 0, cellRuns, runs)) {
        return null;
    }

    // Calculate clues (sums)
    for (const run of runs) {
        run.sum = 0;
        for (const [r, c] of run.cells) {
            run.sum += solution[r][c];
        }
    }

    return { pattern, solution, runs, size };
}

function fillKakuro(solution, cells, idx, cellRuns, runs) {
    if (idx >= cells.length) return true;

    const [r, c] = cells[idx];
    const key = `${r},${c}`;
    const myRuns = cellRuns[key] || [];
    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of nums) {
        if (isValidKakuroPlacement(solution, r, c, num, myRuns)) {
            solution[r][c] = num;
            if (fillKakuro(solution, cells, idx + 1, cellRuns, runs)) return true;
            solution[r][c] = 0;
        }
    }
    return false;
}

function isValidKakuroPlacement(solution, row, col, num, runs) {
    // Check that no other cell in the same run already has this number
    for (const run of runs) {
        for (const [r, c] of run.cells) {
            if (r === row && c === col) continue;
            if (solution[r][c] === num) return false;
        }
    }
    return true;
}

function getRunLength(pattern, r, c, dr, dc, size) {
    let len = 0;
    let rr = r, cc = c;
    while (rr >= 0 && rr < size && cc >= 0 && cc < size && pattern[rr][cc] === 1) {
        len++;
        rr += dr;
        cc += dc;
    }
    return len;
}

function drawKakuroOnPage(doc, kakuro, x, y, gridSize, showSolution) {
    const { pattern, solution, runs, size } = kakuro;
    const cellSize = gridSize / size;

    // Draw cells
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cx = x + c * cellSize;
            const cy = y + r * cellSize;

            if (pattern[r][c] === 0) {
                // Black cell
                doc.setFillColor(35, 35, 35);
                doc.rect(cx, cy, cellSize, cellSize, 'F');

                // Draw clues in this cell
                const acrossRun = runs.find(run => run.dir === 'across' && run.clueR === r && run.clueC === c);
                const downRun = runs.find(run => run.dir === 'down' && run.clueR === r && run.clueC === c);

                if (acrossRun || downRun) {
                    // Draw diagonal line
                    doc.setDrawColor(100, 100, 100);
                    doc.setLineWidth(0.5);
                    doc.line(cx, cy, cx + cellSize, cy + cellSize);

                    const clueFont = Math.max(7, Math.min(cellSize * 0.3, 11));
                    doc.setFontSize(clueFont);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 255, 255);

                    if (acrossRun) {
                        // Bottom-right area: across clue
                        doc.text(String(acrossRun.sum), cx + cellSize * 0.72, cy + cellSize * 0.85, { align: 'center' });
                    }
                    if (downRun) {
                        // Top-left area: down clue
                        doc.text(String(downRun.sum), cx + cellSize * 0.28, cy + cellSize * 0.42, { align: 'center' });
                    }
                }
            } else {
                // White cell
                doc.setFillColor(255, 255, 255);
                doc.rect(cx, cy, cellSize, cellSize, 'F');

                if (showSolution && solution[r][c] > 0) {
                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(Math.min(cellSize * 0.55, 14));
                    doc.text(
                        String(solution[r][c]),
                        cx + cellSize / 2,
                        cy + cellSize / 2 + cellSize * 0.15,
                        { align: 'center' }
                    );
                }
            }

            // Cell border
            doc.setDrawColor(80, 80, 80);
            doc.setLineWidth(0.5);
            doc.rect(cx, cy, cellSize, cellSize);
        }
    }

    // Outer border thicker
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.rect(x, y, gridSize, gridSize);

    // Reset text color
    doc.setTextColor(0, 0, 0);
}

async function generateKakuro() {
    const { jsPDF } = window.jspdf;
    const title = document.getElementById('kk-title').value;
    const difficulty = document.getElementById('kk-difficulty').value;
    const count = parseInt(document.getElementById('kk-count').value);
    const gridSizeOpt = document.getElementById('kk-gridsize').value;
    const pageSize = document.getElementById('kk-pagesize').value;
    const includeSolutions = document.getElementById('kk-solutions').value === 'yes';

    const gridDim = parseInt(gridSizeOpt);
    const bgStyle = document.getElementById('kk-bgstyle').value;
    const bgTheme = document.getElementById('kk-bgtheme').value;

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;
    const puzzles = [];

    // Title page
    drawTitlePageBackground(doc, bgTheme, bgStyle, pw, ph);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw / 2, ph / 2 - 40, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const diffLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    doc.text(`${count} Kakuro Puzzles - ${diffLabels[difficulty]}`, pw / 2, ph / 2 + 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Fill each white cell with digits 1-9.', pw / 2, ph / 2 + 35, { align: 'center' });
    doc.text('Numbers in each run must sum to the clue and cannot repeat.', pw / 2, ph / 2 + 50, { align: 'center' });

    for (let i = 0; i < count; i++) {
        showProgress('kk-progress', ((i + 1) / count) * (includeSolutions ? 70 : 95),
            `Generating puzzle ${i + 1} of ${count}...`);
        await tick();

        const kakuro = generateKakuroGrid(gridDim, difficulty);
        if (!kakuro) continue;
        puzzles.push(kakuro);

        doc.addPage();
        drawPageBackground(doc, bgTheme, bgStyle, pw, ph, i + 1, count);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Puzzle ${puzzles.length}`, pw / 2, margin, { align: 'center' });

        const availSize = Math.min(pw - margin * 2, ph - margin * 2 - 40);
        const startX = (pw - availSize) / 2;
        drawKakuroOnPage(doc, kakuro, startX, margin + 15, availSize, false);
    }

    // Solutions
    if (includeSolutions && puzzles.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0);
        doc.text('SOLUTIONS', pw / 2, ph / 2, { align: 'center' });

        // 2 solutions per page
        const solPages = Math.ceil(puzzles.length / 2);
        for (let p = 0; p < solPages; p++) {
            showProgress('kk-progress', 70 + ((p + 1) / solPages) * 25,
                `Solution page ${p + 1} of ${solPages}...`);
            await tick();
            doc.addPage();

            for (let i = 0; i < 2; i++) {
                const idx = p * 2 + i;
                if (idx >= puzzles.length) break;

                const solSize = Math.min((pw - margin * 3) / 2, (ph - margin * 2 - 40));
                const sx = i === 0 ? margin : pw / 2 + margin / 2;
                const sy = margin + 15;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text(`Solution ${idx + 1}`, sx + solSize / 2, sy - 5, { align: 'center' });
                drawKakuroOnPage(doc, puzzles[idx], sx, sy, solSize, true);
            }
        }
    }

    showProgress('kk-progress', 100, 'Downloading PDF...');
    const date = new Date().toISOString().slice(0, 10);
    doc.save(`Kakuro_${difficulty}_${count}_${date}.pdf`);
    hideProgress('kk-progress');
}
