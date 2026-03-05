// Metadata Generator Module (SEO templates - no AI needed)

const META_TEMPLATES = {
    wordsearch: {
        titles: [
            '{Theme} Word Search Puzzle Book for {Audience}',
            'Ultimate {Theme} Word Search: {Count}+ Puzzles for {Audience}',
            '{Theme} Word Search Book - Large Print Edition for {Audience}',
            'Fun {Theme} Word Search Puzzles: Hours of Entertainment for {Audience}',
            'Big Book of {Theme} Word Search Puzzles for {Audience}',
        ],
        descriptions: [
            'Dive into hours of fun with this {theme} word search puzzle book! Featuring {count}+ carefully crafted puzzles perfect for {audience}. Each puzzle contains hidden words related to {theme}, with full solutions included at the back. Great for improving vocabulary, concentration, and having fun!\n\nFeatures:\n- {count}+ unique puzzles\n- Full solutions included\n- Large print, easy to read\n- Perfect for {audience}\n- Great gift idea',
            'Looking for the perfect {theme} puzzle book? This collection of {count}+ word search puzzles is designed specifically for {audience}. Challenge yourself with themed puzzles that will keep you entertained for hours. Complete solutions are provided at the back of the book.\n\nWhat\'s inside:\n- {count}+ themed word searches\n- Answer key included\n- Clear, large-print grids\n- Ideal for {audience}',
        ],
        keywords: [
            'word search puzzle book {theme}',
            '{theme} word search for {audience}',
            'word search puzzles large print',
            'word find puzzle book {theme}',
            '{theme} activity book {audience}',
            'word search book for {audience}',
            '{theme} puzzles entertainment',
        ],
    },
    sudoku: {
        titles: [
            'Sudoku Puzzle Book for {Audience}: {Difficulty} Level',
            '{Difficulty} Sudoku: {Count}+ Puzzles for {Audience}',
            'Big Sudoku Book - {Difficulty} Edition: {Count}+ Puzzles',
            'Sudoku Challenge: {Difficulty} Puzzles for {Audience}',
            'Classic Sudoku {Difficulty}: Large Print for {Audience}',
        ],
        descriptions: [
            'Challenge your brain with {count}+ {difficulty} sudoku puzzles! This book is perfect for {audience} who enjoy logical thinking and number puzzles. Each puzzle is carefully generated to ensure a unique solution. Complete solutions are included at the back.\n\nFeatures:\n- {count}+ {difficulty} puzzles\n- One puzzle per page for comfortable solving\n- Large print format\n- Full solutions included\n- Perfect for {audience}',
        ],
        keywords: [
            'sudoku puzzle book {difficulty}',
            'sudoku for {audience}',
            'sudoku large print',
            'number puzzles book',
            'brain games {audience}',
            'sudoku {difficulty} level',
            'logic puzzles book',
        ],
    },
    coloring: {
        titles: [
            '{Theme} Coloring Book for {Audience}',
            'Beautiful {Theme} Coloring Pages for {Audience}',
            '{Theme} Coloring Book: Relaxing Designs for {Audience}',
            'Creative {Theme} Coloring Book for {Audience}',
            '{Theme} Art: A Coloring Book for {Audience}',
        ],
        descriptions: [
            'Unleash your creativity with this beautiful {theme} coloring book! Featuring stunning illustrations perfect for {audience}. Each page is printed single-sided to prevent bleed-through. Relax, unwind, and enjoy hours of coloring fun.\n\nFeatures:\n- Beautiful {theme} illustrations\n- Single-sided pages\n- Suitable for {audience}\n- Great for relaxation and stress relief\n- Makes a wonderful gift',
        ],
        keywords: [
            '{theme} coloring book',
            'coloring book for {audience}',
            '{theme} coloring pages',
            'adult coloring book {theme}',
            'relaxing coloring book',
            '{theme} art therapy',
            'creative coloring {audience}',
        ],
    },
    journal: {
        titles: [
            '{Theme} Journal for {Audience}',
            'Daily Planner & {Theme} Journal for {Audience}',
            '{Theme} Notebook: A Guided Journal for {Audience}',
            'My {Theme} Journal: Daily Reflections for {Audience}',
            '{Theme} Planner & Tracker for {Audience}',
        ],
        descriptions: [
            'Stay organized and inspired with this {theme} journal designed for {audience}. Featuring thoughtfully designed pages for daily planning, goal tracking, and personal reflection. The perfect companion for your daily routine.\n\nFeatures:\n- Beautifully designed pages\n- Daily/weekly planning sections\n- Goal tracking pages\n- Reflection prompts\n- Perfect size for everyday carry',
        ],
        keywords: [
            '{theme} journal',
            'planner for {audience}',
            'daily journal notebook',
            '{theme} planner',
            'guided journal {audience}',
            'notebook for {audience}',
            'daily planner organizer',
        ],
    },
    math: {
        titles: [
            'Math Puzzles for {Audience}: {Difficulty} Practice',
            '{Difficulty} Math Workbook for {Audience}',
            'Math Practice Book: {Count}+ Problems for {Audience}',
            '{Theme} Math Puzzles: {Difficulty} Level for {Audience}',
            'Fun Math Exercises for {Audience}',
        ],
        descriptions: [
            'Build strong math skills with {count}+ practice problems! This workbook is designed for {audience} and features {difficulty} level problems covering addition, subtraction, multiplication, and division. Answer key included at the back.\n\nFeatures:\n- {count}+ math problems\n- {difficulty} difficulty level\n- Complete answer key\n- Clear, easy-to-read format\n- Perfect for {audience}',
        ],
        keywords: [
            'math workbook {audience}',
            'math practice book',
            '{difficulty} math problems',
            'math puzzles for {audience}',
            'arithmetic practice book',
            'math exercises {audience}',
            'number practice workbook',
        ],
    },
};

function capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

function generateMetadata() {
    const type = document.getElementById('mt-type').value;
    const theme = document.getElementById('mt-theme').value.trim() || 'general';
    const audience = document.getElementById('mt-audience').value.trim() || 'adults';

    const templates = META_TEMPLATES[type];
    if (!templates) return;

    const replacements = {
        '{theme}': theme.toLowerCase(),
        '{Theme}': capitalize(theme),
        '{audience}': audience.toLowerCase(),
        '{Audience}': capitalize(audience),
        '{count}': '50',
        '{Count}': '50',
        '{difficulty}': 'medium',
        '{Difficulty}': 'Medium',
    };

    function applyReplacements(text) {
        let result = text;
        for (const [key, val] of Object.entries(replacements)) {
            result = result.split(key).join(val);
        }
        return result;
    }

    const output = document.getElementById('mt-output');
    output.style.display = 'block';

    let html = '<p class="copy-hint">Haz clic en cualquier item para copiarlo al portapapeles</p>';

    // Titles
    html += '<h3>Opciones de Titulo (elige uno)</h3>';
    for (const t of templates.titles) {
        html += `<div class="meta-item">${applyReplacements(t)}</div>`;
    }

    // Descriptions
    html += '<h3>Descripcion (elige una)</h3>';
    for (const d of templates.descriptions) {
        html += `<div class="meta-item">${applyReplacements(d)}</div>`;
    }

    // Backend keywords
    html += '<h3>7 Backend Keywords para KDP</h3>';
    const keywords = templates.keywords.map(k => applyReplacements(k));
    for (const k of keywords) {
        html += `<div class="meta-item">${k}</div>`;
    }

    output.innerHTML = html;
}
