// Batch Generation Module - Generate 5 books at once

async function batchGenerate(type) {
    const statusEl = document.getElementById('batch-status');
    statusEl.style.display = 'block';
    statusEl.textContent = 'Generando 5 libros...';

    const { jsPDF } = window.jspdf;
    const date = new Date().toISOString().slice(0, 10);
    const pdfs = [];

    for (let i = 0; i < 5; i++) {
        statusEl.textContent = `Generando libro ${i + 1} de 5...`;
        await tick();

        let doc, filename;

        if (type === 'wordsearch') {
            const title = document.getElementById('ws-title').value;
            const theme = document.getElementById('ws-theme').value;
            const gridSize = parseInt(document.getElementById('ws-gridsize').value);
            const puzzleCount = parseInt(document.getElementById('ws-count').value);
            const pageSize = document.getElementById('ws-pagesize').value;
            const [pw, ph] = getPageDimensions(pageSize);
            doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
            filename = `WordSearch_${theme}_${date}_${String(i+1).padStart(3,'0')}.pdf`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(28);
            doc.text(title, pw/2, ph/2 - 40, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`${puzzleCount} Puzzles - ${theme} - Vol.${i+1}`, pw/2, ph/2 + 10, { align: 'center' });

            for (let p = 0; p < puzzleCount; p++) {
                const words = getWordsForTheme(theme, Math.floor(gridSize * 0.8));
                const puzzle = createWordSearchGrid(gridSize, words);
                doc.addPage();
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text(`Puzzle ${p + 1}`, pw/2, 40, { align: 'center' });
                const gridArea = Math.min(pw - 80, ph - 160);
                const cellSize = gridArea / gridSize;
                const startX = (pw - gridArea) / 2;
                const startY = 65;
                doc.setFont('courier', 'normal');
                doc.setFontSize(Math.min(cellSize * 0.65, 14));
                for (let r = 0; r < gridSize; r++)
                    for (let c = 0; c < gridSize; c++)
                        doc.text(puzzle.grid[r][c], startX + c*cellSize + cellSize/2, startY + r*cellSize + cellSize/2 + 3, { align: 'center' });
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                for (let r = 0; r <= gridSize; r++) doc.line(startX, startY + r*cellSize, startX + gridArea, startY + r*cellSize);
                for (let c = 0; c <= gridSize; c++) doc.line(startX + c*cellSize, startY, startX + c*cellSize, startY + gridArea);
                const wordListY = startY + gridArea + 20;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const wpr = Math.floor((pw - 80) / 90);
                puzzle.placed.forEach((word, idx) => {
                    doc.text(word, 40 + (idx%wpr)*90, wordListY + Math.floor(idx/wpr)*14);
                });
                await tick();
            }

        } else if (type === 'sudoku') {
            const title = document.getElementById('su-title').value;
            const difficulty = document.getElementById('su-difficulty').value;
            const count = parseInt(document.getElementById('su-count').value);
            const pageSize = document.getElementById('su-pagesize').value;
            const [pw, ph] = getPageDimensions(pageSize);
            doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
            filename = `Sudoku_${difficulty}_${date}_${String(i+1).padStart(3,'0')}.pdf`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(28);
            doc.text(`${title} - Vol.${i+1}`, pw/2, ph/2, { align: 'center' });

            for (let p = 0; p < Math.min(count, 20); p++) {
                doc.addPage();
                const s = createSudokuPuzzle(difficulty);
                const size = Math.min(pw - 80, ph - 120);
                drawSudokuOnPage(doc, s.puzzle, (pw-size)/2, 60, size, 14);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text(`Puzzle ${p+1}`, pw/2, 40, { align: 'center' });
                await tick();
            }

        } else if (type === 'mathpuzzle') {
            const title = document.getElementById('mp-title').value;
            const opType = document.getElementById('mp-type').value;
            const difficulty = document.getElementById('mp-difficulty').value;
            const perPage = parseInt(document.getElementById('mp-perpg').value);
            const pages = Math.min(parseInt(document.getElementById('mp-pages').value), 20);
            const pageSize = document.getElementById('mp-pagesize').value;
            const [pw, ph] = getPageDimensions(pageSize);
            doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
            filename = `MathPuzzles_${opType}_${date}_${String(i+1).padStart(3,'0')}.pdf`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(28);
            doc.text(`${title} - Vol.${i+1}`, pw/2, ph/2, { align: 'center' });

            for (let p = 0; p < pages; p++) {
                doc.addPage();
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text(`Page ${p+1}`, pw/2, 35, { align: 'center' });
                const cols = perPage <= 20 ? 2 : 3;
                const rows = Math.ceil(perPage / cols);
                const colW = (pw - 80) / cols;
                const rowH = (ph - 100) / rows;
                let num = p * perPage;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(perPage <= 20 ? 11 : 9);
                for (let r = 0; r < rows; r++)
                    for (let c = 0; c < cols; c++) {
                        num++;
                        if (num > (p+1)*perPage) break;
                        const prob = generateMathProblem(opType, difficulty);
                        doc.text(`${num}. ${prob.text}_____`, 50 + c*colW, 55 + r*rowH);
                    }
                await tick();
            }

        } else {
            statusEl.textContent = 'Tipo no soportado para batch.';
            return;
        }

        doc.save(filename);
        pdfs.push(filename);
    }

    statusEl.textContent = `5 libros generados y descargados.`;
    setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
}
