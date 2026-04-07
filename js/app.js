// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Coloring book image preview
document.getElementById('cb-images').addEventListener('change', function(e) {
    const preview = document.getElementById('cb-preview');
    preview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    });
});

// All KDP page dimensions in points (72 pt = 1 inch)
function getPageDimensions(size) {
    const dims = {
        '5x8':       [360, 576],
        '5.25x8':    [378, 576],
        '5.5x8.5':   [396, 612],
        '6x9':       [432, 648],
        '6.14x9.21': [442.08, 663.12],
        '6.69x9.61': [481.68, 691.92],
        '7x10':      [504, 720],
        '7.44x9.69': [535.68, 697.68],
        '7.5x9.25':  [540, 666],
        '8x10':      [576, 720],
        '8.25x6':    [594, 432],
        'letter':    [612, 792],       // 8.5 x 11
        '8.25x8.25': [594, 594],
        '8.5x8.5':   [612, 612],
        'square':    [612, 612],       // alias
    };
    return dims[size] || dims['letter'];
}

// Progress bar utilities
function showProgress(id, percent, text) {
    const bar = document.getElementById(id);
    bar.style.display = 'block';
    bar.querySelector('.progress-fill').style.width = percent + '%';
    bar.querySelector('.progress-text').textContent = text || `${Math.round(percent)}%`;
}

function hideProgress(id) {
    setTimeout(() => {
        document.getElementById(id).style.display = 'none';
    }, 1500);
}

// Async delay for UI updates
function tick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

// Copy to clipboard on click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('prompt-item') || e.target.classList.contains('meta-item')) {
        navigator.clipboard.writeText(e.target.textContent.trim());
        e.target.classList.add('copied');
        setTimeout(() => e.target.classList.remove('copied'), 1000);
    }
});

// Bilingual support
const UI_STRINGS = {
    es: {
        title: 'KDP Book Factory',
        subtitle: 'Genera libros listos para Amazon KDP en segundos',
        tabs: {
            wordsearch: 'Sopas de Letras',
            sudoku: 'Sudoku',
            journal: 'Journals',
            coloring: 'Colorear',
            mathpuzzle: 'Math',
            extrapuzzles: 'Mas Puzzles',
            adhdplanner: 'ADHD Planner',
            covers: 'Portadas',
            metadata: 'Metadatos',
            royalties: 'Royalties',
        },
    },
    en: {
        title: 'KDP Book Factory',
        subtitle: 'Generate Amazon KDP-ready books in seconds',
        tabs: {
            wordsearch: 'Word Search',
            sudoku: 'Sudoku',
            journal: 'Journals',
            coloring: 'Coloring',
            mathpuzzle: 'Math',
            extrapuzzles: 'More Puzzles',
            adhdplanner: 'ADHD Planner',
            covers: 'Covers',
            metadata: 'Metadata',
            royalties: 'Royalties',
        },
    },
};

function switchLanguage(lang) {
    const strings = UI_STRINGS[lang];
    if (!strings) return;
    document.querySelector('header h1').textContent = strings.title;
    document.querySelector('.subtitle').textContent = strings.subtitle;
    document.querySelectorAll('.tab').forEach(tab => {
        const key = tab.dataset.tab;
        if (strings.tabs[key]) tab.textContent = strings.tabs[key];
    });
}

// Spanish word lists for bilingual word search
const WORD_LISTS_ES = {
    'animales': ['ELEFANTE', 'JIRAFA', 'DELFIN', 'PINGUINO', 'TIGRE', 'AGUILA', 'BALLENA', 'OSO', 'LEON', 'LOBO', 'CEBRA', 'MONO', 'SERPIENTE', 'TIBURON', 'CABALLO', 'CONEJO', 'TORTUGA', 'LORO', 'HALCON', 'PANDA', 'KOALA', 'NUTRIA', 'JAGUAR', 'BISONTE', 'ALCE', 'GRULLA', 'CUERVO', 'SALMON', 'LAGARTO', 'CAMELLO', 'CABRA', 'CIERVO', 'PATO', 'RANA', 'FOCA', 'CANGREJO', 'PALOMA', 'AVISPA', 'LINCE', 'PUMA'],
    'comida': ['PIZZA', 'HAMBURGUESA', 'PASTA', 'ENSALADA', 'TACOS', 'PAN', 'QUESO', 'MANTEQUILLA', 'CREMA', 'BISTEC', 'MANGO', 'MANZANA', 'UVA', 'LIMON', 'DURAZNO', 'MELON', 'CEBOLLA', 'AJO', 'TOMATE', 'PAPA', 'ZANAHORIA', 'ARROZ', 'MAIZ', 'SOPA', 'PASTEL', 'DULCE', 'MIEL', 'ACEITE', 'GALLETA', 'FIDEO', 'CAMARONES', 'YOGUR'],
    'naturaleza': ['MONTANA', 'RIO', 'OCEANO', 'BOSQUE', 'DESIERTO', 'VALLE', 'ISLA', 'VOLCAN', 'PRADERA', 'ARROYO', 'PLAYA', 'CORAL', 'PANTANO', 'PIEDRA', 'NUBE', 'TORMENTA', 'LLUVIA', 'NIEVE', 'VIENTO', 'TRUENO', 'FLOR', 'HOJA', 'TRONCO', 'RAMA', 'RAIZ', 'MUSGO', 'HELECHO', 'PINO', 'SAUCE', 'CACTUS', 'AURORA', 'SEMILLA'],
    'deportes': ['FUTBOL', 'TENIS', 'NATACION', 'BOXEO', 'KARATE', 'GOLF', 'CICLISMO', 'ESQUI', 'SURF', 'CARRERA', 'SALTO', 'DISCO', 'JABALINA', 'EQUIPO', 'CAMPO', 'CANCHA', 'ARENA', 'LIGA', 'GOL', 'CASCO', 'GUANTE', 'RAQUETA', 'BALON', 'MEDALLA', 'TROFEO', 'ENTRENADOR'],
};
