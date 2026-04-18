// Extra Puzzles Module: Crosswords, Mazes, Number Search, Cryptograms, Dot-to-Dot

// ============ NUMBER SEARCH ============
const NUMBER_SEARCH_THEMES = {
    'random': () => String(Math.floor(Math.random() * 9000) + 1000),
    'dates': () => {
        const m = String(Math.floor(Math.random()*12)+1).padStart(2,'0');
        const d = String(Math.floor(Math.random()*28)+1).padStart(2,'0');
        return m + d;
    },
    'math': () => {
        const a = Math.floor(Math.random()*50)+10;
        const b = Math.floor(Math.random()*50)+10;
        return String(a * b);
    },
};

function createNumberSearchGrid(size, numberCount) {
    const grid = Array.from({length: size}, () => Array(size).fill(''));
    const solution = Array.from({length: size}, () => Array(size).fill(false));
    const numbers = [];

    for (let n = 0; n < numberCount; n++) {
        const num = String(Math.floor(Math.random() * 9000) + 1000);
        const dirs = shuffleArray([...DIRECTIONS]);
        let placed = false;
        for (let attempt = 0; attempt < 80 && !placed; attempt++) {
            const dir = dirs[attempt % dirs.length];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            if (canPlaceStr(grid, num, row, col, dir, size)) {
                placeStr(grid, solution, num, row, col, dir);
                numbers.push(num);
                placed = true;
            }
        }
    }

    // Fill empty with random digits
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (!grid[r][c]) grid[r][c] = String(Math.floor(Math.random() * 10));

    return { grid, numbers, solution };
}

function canPlaceStr(grid, str, row, col, dir, size) {
    for (let i = 0; i < str.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (grid[r][c] && grid[r][c] !== str[i]) return false;
    }
    return true;
}

function placeStr(grid, solution, str, row, col, dir) {
    for (let i = 0; i < str.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        grid[r][c] = str[i];
        solution[r][c] = true;
    }
}

// ============ MAZE GENERATOR (Recursive Backtracker) ============
function generateMaze(rows, cols) {
    const maze = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => ({top: true, right: true, bottom: true, left: true, visited: false}))
    );
    const stack = [];
    let current = {r: 0, c: 0};
    maze[0][0].visited = true;
    stack.push(current);

    while (stack.length > 0) {
        const neighbors = [];
        const {r, c} = current;
        if (r > 0 && !maze[r-1][c].visited) neighbors.push({r: r-1, c, wall: 'top'});
        if (r < rows-1 && !maze[r+1][c].visited) neighbors.push({r: r+1, c, wall: 'bottom'});
        if (c > 0 && !maze[r][c-1].visited) neighbors.push({r, c: c-1, wall: 'left'});
        if (c < cols-1 && !maze[r][c+1].visited) neighbors.push({r, c: c+1, wall: 'right'});

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Remove walls between current and next
            if (next.wall === 'top') { maze[r][c].top = false; maze[next.r][next.c].bottom = false; }
            if (next.wall === 'bottom') { maze[r][c].bottom = false; maze[next.r][next.c].top = false; }
            if (next.wall === 'left') { maze[r][c].left = false; maze[next.r][next.c].right = false; }
            if (next.wall === 'right') { maze[r][c].right = false; maze[next.r][next.c].left = false; }
            maze[next.r][next.c].visited = true;
            stack.push(current);
            current = next;
        } else {
            current = stack.pop();
        }
    }
    return maze;
}

function drawMazeOnPage(doc, maze, x, y, totalW, totalH) {
    const rows = maze.length;
    const cols = maze[0].length;
    const cellW = totalW / cols;
    const cellH = totalH / rows;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cx = x + c * cellW;
            const cy = y + r * cellH;
            if (maze[r][c].top) doc.line(cx, cy, cx + cellW, cy);
            if (maze[r][c].left) doc.line(cx, cy, cx, cy + cellH);
            if (maze[r][c].bottom) doc.line(cx, cy + cellH, cx + cellW, cy + cellH);
            if (maze[r][c].right) doc.line(cx + cellW, cy, cx + cellW, cy + cellH);
        }
    }

    // Start & End markers
    doc.setFillColor(100, 126, 234);
    doc.circle(x + cellW/2, y + cellH/2, 3, 'F');
    doc.setFillColor(234, 100, 100);
    doc.circle(x + (cols-0.5)*cellW, y + (rows-0.5)*cellH, 3, 'F');
}

// ============ CRYPTOGRAM ============
const CRYPTOGRAM_QUOTES = [
    'THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO',
    'IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY',
    'BELIEVE YOU CAN AND YOU ARE HALFWAY THERE',
    'THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THEIR DREAMS',
    'LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS',
    'IT DOES NOT MATTER HOW SLOWLY YOU GO AS LONG AS YOU DO NOT STOP',
    'SUCCESS IS NOT FINAL FAILURE IS NOT FATAL IT IS THE COURAGE TO CONTINUE',
    'THE BEST TIME TO PLANT A TREE WAS TWENTY YEARS AGO THE SECOND BEST TIME IS NOW',
    'HAPPINESS IS NOT SOMETHING READY MADE IT COMES FROM YOUR OWN ACTIONS',
    'YOU MISS ONE HUNDRED PERCENT OF THE SHOTS YOU DO NOT TAKE',
    'BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD',
    'EDUCATION IS THE MOST POWERFUL WEAPON YOU CAN USE TO CHANGE THE WORLD',
    'THE JOURNEY OF A THOUSAND MILES BEGINS WITH A SINGLE STEP',
    'STAY HUNGRY STAY FOOLISH',
    'IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE',
    'STRIVE NOT TO BE A SUCCESS BUT RATHER TO BE OF VALUE',
    'THE MIND IS EVERYTHING WHAT YOU THINK YOU BECOME',
    'AN UNEXAMINED LIFE IS NOT WORTH LIVING',
    'DO WHAT YOU CAN WITH WHAT YOU HAVE WHERE YOU ARE',
    'TURN YOUR WOUNDS INTO WISDOM',
    'THE ONLY IMPOSSIBLE JOURNEY IS THE ONE YOU NEVER BEGIN',
    'EVERYTHING YOU CAN IMAGINE IS REAL',
    'WHAT WE THINK WE BECOME',
    'DO OR DO NOT THERE IS NO TRY',
    'KEEP YOUR FACE ALWAYS TOWARD THE SUNSHINE AND SHADOWS WILL FALL BEHIND YOU',
    'QUALITY IS NOT AN ACT IT IS A HABIT',
    'THE PURPOSE OF OUR LIVES IS TO BE HAPPY',
    'LIFE IS REALLY SIMPLE BUT WE INSIST ON MAKING IT COMPLICATED',
    'IF YOU WANT TO LIFT YOURSELF UP LIFT UP SOMEONE ELSE',
    'SPREAD LOVE EVERYWHERE YOU GO LET NO ONE EVER COME TO YOU WITHOUT LEAVING HAPPIER',
];

function createCryptogram(text) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffled = shuffleArray([...letters]);
    const map = {};
    for (let i = 0; i < 26; i++) {
        map[letters[i]] = shuffled[i];
        // Ensure no letter maps to itself
        if (letters[i] === shuffled[i]) {
            const swap = (i + 1) % 26;
            [shuffled[i], shuffled[swap]] = [shuffled[swap], shuffled[i]];
            map[letters[i]] = shuffled[i];
            map[letters[swap]] = shuffled[swap];
        }
    }
    const encoded = text.split('').map(c => map[c] || c).join('');
    return { original: text, encoded, key: map };
}

// ============ SIMPLE CROSSWORD ============
function createSimpleCrossword(words) {
    const size = 15;
    const grid = Array.from({length: size}, () => Array(size).fill(null));
    const placed = [];
    const sorted = [...words].sort((a, b) => b.length - a.length);

    // Place first word horizontally in the middle
    if (sorted.length > 0) {
        const w = sorted[0];
        const startCol = Math.floor((size - w.length) / 2);
        const row = Math.floor(size / 2);
        if (w.length <= size) {
            for (let i = 0; i < w.length; i++) grid[row][startCol + i] = w[i];
            placed.push({word: w, row, col: startCol, dir: 'across'});
        }
    }

    // Try to place remaining words
    for (let wi = 1; wi < sorted.length; wi++) {
        const word = sorted[wi];
        let bestPlacement = null;

        for (const p of placed) {
            for (let pi = 0; pi < p.word.length; pi++) {
                for (let wi2 = 0; wi2 < word.length; wi2++) {
                    if (p.word[pi] !== word[wi2]) continue;
                    let row, col, dir;
                    if (p.dir === 'across') {
                        dir = 'down';
                        col = p.col + pi;
                        row = p.row - wi2;
                    } else {
                        dir = 'across';
                        row = p.row + pi;
                        col = p.col - wi2;
                    }
                    if (canPlaceCrossword(grid, word, row, col, dir, size)) {
                        bestPlacement = {word, row, col, dir};
                        break;
                    }
                }
                if (bestPlacement) break;
            }
            if (bestPlacement) break;
        }

        if (bestPlacement) {
            const {word: w, row, col, dir} = bestPlacement;
            for (let i = 0; i < w.length; i++) {
                if (dir === 'across') grid[row][col + i] = w[i];
                else grid[row + i][col] = w[i];
            }
            placed.push(bestPlacement);
        }
    }

    return {grid, placed, size};
}

function canPlaceCrossword(grid, word, row, col, dir, size) {
    for (let i = 0; i < word.length; i++) {
        const r = dir === 'down' ? row + i : row;
        const c = dir === 'across' ? col + i : col;
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (grid[r][c] !== null && grid[r][c] !== word[i]) return false;
    }
    return true;
}

// ============ MAIN GENERATOR ============
async function generateExtraPuzzles() {
    const { jsPDF } = window.jspdf;
    const puzzleType = document.getElementById('ep-type').value;
    const title = document.getElementById('ep-title').value;
    const count = parseInt(document.getElementById('ep-count').value);
    const pageSize = document.getElementById('ep-pagesize').value;

    const bgStyle = document.getElementById('ep-bgstyle').value;
    const bgTheme = document.getElementById('ep-bgtheme').value;

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({ unit: 'pt', format: [pw, ph] });
    const margin = 40;

    // Title page
    drawTitlePageBackground(doc, bgTheme, bgStyle, pw, ph);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw/2, ph/2 - 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${count} Puzzles`, pw/2, ph/2 + 15, { align: 'center' });

    const solutions = [];

    for (let i = 0; i < count; i++) {
        showProgress('ep-progress', ((i+1)/count) * 85, `Puzzle ${i+1} de ${count}...`);
        await tick();
        doc.addPage();
        drawPageBackground(doc, bgTheme, bgStyle, pw, ph, i + 1, count);

        if (puzzleType === 'maze') {
            const rows = 20;
            const cols = 15;
            const maze = generateMaze(rows, cols);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Maze ${i+1}`, pw/2, margin, { align: 'center' });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Find your way from the blue dot to the red dot!', pw/2, margin + 14, { align: 'center' });
            const mazeW = pw - margin * 2;
            const mazeH = ph - margin * 2 - 30;
            drawMazeOnPage(doc, maze, margin, margin + 25, mazeW, mazeH);

        } else if (puzzleType === 'numbersearch') {
            const gridSize = 15;
            const ns = createNumberSearchGrid(gridSize, Math.floor(gridSize * 0.7));
            solutions.push({idx: i+1, numbers: ns.numbers, grid: ns.grid, solution: ns.solution});

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Number Search ${i+1}`, pw/2, margin, { align: 'center' });

            const gridArea = Math.min(pw - margin*2, ph - margin*2 - 80);
            const cellSize = gridArea / gridSize;
            const startX = (pw - gridArea) / 2;
            const startY = margin + 25;

            doc.setFont('courier', 'normal');
            doc.setFontSize(Math.min(cellSize * 0.65, 14));
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    doc.text(ns.grid[r][c], startX + c*cellSize + cellSize/2, startY + r*cellSize + cellSize/2 + 3, { align: 'center' });
                }
            }
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            for (let r = 0; r <= gridSize; r++) doc.line(startX, startY + r*cellSize, startX + gridArea, startY + r*cellSize);
            for (let c = 0; c <= gridSize; c++) doc.line(startX + c*cellSize, startY, startX + c*cellSize, startY + gridArea);

            // Number list
            const listY = startY + gridArea + 20;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const numsPerRow = Math.floor((pw - margin*2) / 60);
            ns.numbers.forEach((num, idx) => {
                const col = idx % numsPerRow;
                const row = Math.floor(idx / numsPerRow);
                doc.text(num, margin + col * 60, listY + row * 14);
            });

        } else if (puzzleType === 'cryptogram') {
            const quote = CRYPTOGRAM_QUOTES[i % CRYPTOGRAM_QUOTES.length];
            const crypto = createCryptogram(quote);
            solutions.push({idx: i+1, original: crypto.original, key: crypto.key});

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Cryptogram ${i+1}`, pw/2, margin, { align: 'center' });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Decode the message. Each letter represents another letter.', pw/2, margin + 14, { align: 'center' });

            // Show encoded text with blanks underneath
            const maxCharsPerLine = Math.floor((pw - margin*2) / 16);
            const words = crypto.encoded.split(' ');
            let line = '';
            let lineY = margin + 50;
            const lines = [];

            for (const word of words) {
                if ((line + ' ' + word).trim().length > maxCharsPerLine) {
                    lines.push(line.trim());
                    line = word;
                } else {
                    line = (line + ' ' + word).trim();
                }
            }
            if (line) lines.push(line.trim());

            doc.setFont('courier', 'bold');
            doc.setFontSize(14);
            for (const l of lines) {
                // Encoded letter on top
                let x = margin;
                for (const ch of l) {
                    doc.text(ch, x + 7, lineY, { align: 'center' });
                    if (ch !== ' ') {
                        doc.line(x, lineY + 5, x + 14, lineY + 5);
                    }
                    x += 16;
                }
                lineY += 35;
            }

            // Hint: show key for one letter
            const hintLetter = crypto.original.replace(/[^A-Z]/g, '')[0];
            const hintEncoded = crypto.key[hintLetter];
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Hint: ${hintEncoded} = ${hintLetter}`, margin, lineY + 20);

        } else if (puzzleType === 'crossword') {
            const allThemes = Object.values(WORD_LISTS);
            const themeWords = allThemes[i % allThemes.length];
            const selected = shuffleArray([...themeWords]).slice(0, 10).map(w => w.toUpperCase());
            const cross = createSimpleCrossword(selected);
            solutions.push({idx: i+1, words: cross.placed.map(p => p.word)});

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Crossword ${i+1}`, pw/2, margin, { align: 'center' });

            const gridArea = Math.min(pw - margin*2, (ph - margin*2 - 80) * 0.6);
            const cellSize = gridArea / cross.size;
            const startX = (pw - gridArea) / 2;
            const startY = margin + 25;

            // Draw crossword grid
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            let clueNum = 1;
            const clues = {across: [], down: []};
            for (const p of cross.placed) {
                p.clueNum = clueNum;
                clues[p.dir === 'across' ? 'across' : 'down'].push({num: clueNum, word: p.word});
                clueNum++;
            }

            for (let r = 0; r < cross.size; r++) {
                for (let c = 0; c < cross.size; c++) {
                    if (cross.grid[r][c] !== null) {
                        doc.rect(startX + c*cellSize, startY + r*cellSize, cellSize, cellSize);
                        // Check if this is start of a word
                        const wordStart = cross.placed.find(p => p.row === r && p.col === c);
                        if (wordStart) {
                            doc.setFontSize(6);
                            doc.setFont('helvetica', 'normal');
                            doc.text(String(wordStart.clueNum), startX + c*cellSize + 2, startY + r*cellSize + 7);
                        }
                    }
                }
            }

            // Clues
            let clueY = startY + gridArea + 20;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('ACROSS', margin, clueY);
            clueY += 14;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            for (const c of clues.across) {
                doc.text(`${c.num}. ${c.word.length} letters`, margin, clueY);
                clueY += 12;
            }
            clueY += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('DOWN', margin, clueY);
            clueY += 14;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            for (const c of clues.down) {
                doc.text(`${c.num}. ${c.word.length} letters`, margin, clueY);
                clueY += 12;
            }
        }
    }

    // Solutions
    if (solutions.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('SOLUTIONS', pw/2, ph/2, { align: 'center' });

        for (const sol of solutions) {
            showProgress('ep-progress', 85 + (sol.idx / solutions.length) * 12, `Solucion ${sol.idx}...`);
            await tick();
            doc.addPage();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);

            if (sol.original) {
                doc.text(`Cryptogram ${sol.idx} Solution:`, margin, margin + 20);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(sol.original, margin, margin + 40, { maxWidth: pw - margin*2 });
            } else if (sol.words) {
                doc.text(`Crossword ${sol.idx} Solution:`, margin, margin + 20);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                sol.words.forEach((w, idx) => {
                    doc.text(`${idx+1}. ${w}`, margin, margin + 40 + idx * 16);
                });
            } else if (sol.numbers) {
                doc.text(`Number Search ${sol.idx} Solution:`, margin, margin + 20);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text(`Numbers: ${sol.numbers.join(', ')}`, margin, margin + 40, { maxWidth: pw - margin*2 });
            }
        }
    }

    showProgress('ep-progress', 100, 'Descargando PDF...');
    const date = new Date().toISOString().slice(0,10);
    doc.save(`${puzzleType}_puzzles_${date}.pdf`);
    hideProgress('ep-progress');
}
