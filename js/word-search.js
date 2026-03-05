// Word lists by theme
const WORD_LISTS = {
    'animals': ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'TIGER', 'EAGLE', 'WHALE', 'BEAR', 'LION', 'WOLF', 'ZEBRA', 'MONKEY', 'SNAKE', 'SHARK', 'HORSE', 'RABBIT', 'TURTLE', 'PARROT', 'FALCON', 'PANDA', 'KOALA', 'OTTER', 'JAGUAR', 'BISON', 'MOOSE', 'CRANE', 'RAVEN', 'SALMON', 'LIZARD', 'CAMEL', 'GOAT', 'DEER', 'DUCK', 'FROG', 'HAWK', 'SEAL', 'CRAB', 'CROW', 'DOVE', 'MOTH', 'MULE', 'NEWT', 'WASP', 'WREN', 'LYNX', 'IBIS', 'KIWI', 'PUMA', 'VIPER', 'HYENA'],
    'food': ['PIZZA', 'BURGER', 'PASTA', 'SALAD', 'SUSHI', 'TACOS', 'BREAD', 'CHEESE', 'BUTTER', 'CREAM', 'STEAK', 'BACON', 'MANGO', 'APPLE', 'GRAPE', 'LEMON', 'PEACH', 'MELON', 'BERRY', 'ONION', 'GARLIC', 'PEPPER', 'TOMATO', 'POTATO', 'CARROT', 'CELERY', 'RICE', 'CORN', 'BEANS', 'SOUP', 'CAKE', 'CANDY', 'DONUT', 'FUDGE', 'HONEY', 'SYRUP', 'OLIVE', 'BASIL', 'THYME', 'CLOVE', 'CURRY', 'GINGER', 'WAFFLE', 'COOKIE', 'NOODLE', 'SALMON', 'SHRIMP', 'YOGURT', 'PRETZEL', 'BROWNIE'],
    'nature': ['MOUNTAIN', 'RIVER', 'OCEAN', 'FOREST', 'DESERT', 'VALLEY', 'ISLAND', 'CANYON', 'GLACIER', 'MEADOW', 'JUNGLE', 'LAGOON', 'VOLCANO', 'TUNDRA', 'PRAIRIE', 'STREAM', 'CREEK', 'CLIFF', 'BEACH', 'CORAL', 'MARSH', 'SWAMP', 'GROVE', 'RIDGE', 'STONE', 'CLOUD', 'STORM', 'RAIN', 'SNOW', 'WIND', 'THUNDER', 'FLOWER', 'PETAL', 'LEAF', 'TRUNK', 'BRANCH', 'ROOTS', 'MOSS', 'FERN', 'VINE', 'BLOOM', 'SEED', 'PINE', 'BIRCH', 'MAPLE', 'WILLOW', 'BAMBOO', 'CACTUS', 'SUNSET', 'AURORA'],
    'sports': ['SOCCER', 'TENNIS', 'HOCKEY', 'BOXING', 'KARATE', 'RUGBY', 'GOLF', 'SWIM', 'TRACK', 'ARCHER', 'FENCING', 'ROWING', 'CYCLING', 'DIVING', 'SKIING', 'SURF', 'SPRINT', 'RELAY', 'VAULT', 'HURDLE', 'DISCUS', 'HAMMER', 'JAVELIN', 'POLE', 'SQUASH', 'PADDLE', 'SCORE', 'MATCH', 'MEDAL', 'TROPHY', 'COACH', 'TEAM', 'FIELD', 'COURT', 'ARENA', 'LEAGUE', 'PITCH', 'GOAL', 'BASKET', 'RACKET', 'HELMET', 'GLOVE', 'SHIN', 'DRIBBLE', 'TACKLE', 'BLOCK', 'SERVE', 'VOLLEY', 'STRIKE', 'CATCH'],
    'travel': ['AIRPORT', 'HOTEL', 'BEACH', 'MUSEUM', 'TEMPLE', 'CASTLE', 'BRIDGE', 'TOWER', 'MARKET', 'HARBOR', 'SUBWAY', 'TRAIN', 'CRUISE', 'FLIGHT', 'TICKET', 'VISA', 'BORDER', 'CUSTOM', 'GUIDE', 'HOSTEL', 'RESORT', 'SAFARI', 'VOYAGE', 'TRIP', 'HIKE', 'CAMP', 'TRAIL', 'ROUTE', 'COMPASS', 'LUGGAGE', 'SUITCASE', 'PASSPORT', 'CAMERA', 'SOUVENIR', 'TOURIST', 'CULTURE', 'CUISINE', 'MONUMENT', 'RUINS', 'PALACE', 'GARDEN', 'FOUNTAIN', 'PLAZA', 'BAZAAR', 'GONDOLA', 'FERRY', 'TREK', 'EXPLORE', 'WANDER', 'JOURNEY'],
    'science': ['ATOM', 'MOLECULE', 'CELL', 'GENE', 'ORBIT', 'PROTON', 'NEUTRON', 'ELECTRON', 'PHOTON', 'QUARK', 'PLASMA', 'FUSION', 'GRAVITY', 'FORCE', 'ENERGY', 'MASS', 'LIGHT', 'WAVE', 'SOUND', 'HEAT', 'MAGNET', 'CRYSTAL', 'ENZYME', 'PROTEIN', 'NEURON', 'SYNAPSE', 'TISSUE', 'ORGAN', 'SPECIES', 'FOSSIL', 'COMET', 'NEBULA', 'GALAXY', 'QUASAR', 'PULSAR', 'PRISM', 'LENS', 'LASER', 'RADAR', 'SONAR', 'VOLT', 'WATT', 'HERTZ', 'TESLA', 'KELVIN', 'NEWTON', 'JOULE', 'PASCAL', 'GENOME', 'ISOTOPE'],
    'music': ['GUITAR', 'PIANO', 'DRUMS', 'VIOLIN', 'FLUTE', 'TRUMPET', 'BASS', 'CELLO', 'HARP', 'OBOE', 'CHOIR', 'OPERA', 'JAZZ', 'BLUES', 'ROCK', 'FOLK', 'SOUL', 'FUNK', 'METAL', 'TEMPO', 'RHYTHM', 'MELODY', 'CHORD', 'SCALE', 'PITCH', 'TONE', 'BEAT', 'NOTE', 'REST', 'SHARP', 'FLAT', 'TREBLE', 'CLEF', 'STAFF', 'BRIDGE', 'VERSE', 'CHORUS', 'REFRAIN', 'LYRIC', 'TUNE', 'SONG', 'ALBUM', 'TRACK', 'DUET', 'SOLO', 'TRIO', 'BAND', 'ORGAN', 'BANJO', 'SITAR'],
    'space': ['PLANET', 'STAR', 'MOON', 'SUN', 'COMET', 'METEOR', 'NEBULA', 'GALAXY', 'COSMOS', 'ORBIT', 'ROCKET', 'SHUTTLE', 'PROBE', 'ROVER', 'LUNAR', 'SOLAR', 'MARS', 'VENUS', 'SATURN', 'JUPITER', 'MERCURY', 'URANUS', 'NEPTUNE', 'PLUTO', 'EARTH', 'CRATER', 'RINGS', 'NOVA', 'PULSAR', 'QUASAR', 'VOID', 'WARP', 'LIGHT', 'GRAVITY', 'THRUST', 'LAUNCH', 'MISSION', 'STATION', 'CAPSULE', 'MODULE', 'DEBRIS', 'ANTENNA', 'SIGNAL', 'RADAR', 'COSMIC', 'STELLAR', 'ECLIPSE', 'AURORA', 'ZENITH', 'APOGEE'],
    'christmas': ['SANTA', 'REINDEER', 'SLEIGH', 'SNOW', 'TREE', 'GIFT', 'STAR', 'BELL', 'CANDY', 'WREATH', 'STOCKING', 'CHIMNEY', 'CAROL', 'ANGEL', 'TINSEL', 'HOLLY', 'RIBBON', 'CANDLE', 'LIGHTS', 'COOKIE', 'GINGER', 'EGGNOG', 'FROST', 'WINTER', 'JINGLE', 'MERRY', 'JOLLY', 'SPIRIT', 'WONDER', 'PEACE', 'FAMILY', 'FEAST', 'TURKEY', 'NORTH', 'POLE', 'RUDOLPH', 'NUTCRACKER', 'ORNAMENT', 'GARLAND', 'MISTLETOE', 'SNOWMAN', 'SLED', 'SCARF', 'MITTEN', 'COCOA', 'CIDER', 'NOEL', 'CHEER', 'COZY', 'BLISS'],
    'halloween': ['GHOST', 'WITCH', 'VAMPIRE', 'ZOMBIE', 'SKELETON', 'PUMPKIN', 'SPIDER', 'CANDY', 'COSTUME', 'MASK', 'HAUNTED', 'SPOOKY', 'CREEPY', 'SCARY', 'NIGHT', 'MOON', 'BLACK', 'ORANGE', 'TRICK', 'TREAT', 'LANTERN', 'COBWEB', 'CAULDRON', 'BROOM', 'POTION', 'SPELL', 'CURSE', 'TOMB', 'COFFIN', 'MUMMY', 'WEREWOLF', 'GOBLIN', 'DEMON', 'SKULL', 'BONE', 'FRIGHT', 'SCREAM', 'HOWL', 'CRYPT', 'SHADOW', 'RAVEN', 'OWL', 'TOAD', 'WAND', 'CLOAK', 'FANGS', 'GRAVE', 'EERIE', 'SINISTER', 'DARK'],
    'ocean': ['WHALE', 'SHARK', 'DOLPHIN', 'OCTOPUS', 'SEAHORSE', 'JELLYFISH', 'CORAL', 'REEF', 'TIDE', 'WAVE', 'CURRENT', 'SHELL', 'PEARL', 'SAND', 'ANCHOR', 'SHIP', 'BOAT', 'SAIL', 'HARBOR', 'LIGHTHOUSE', 'SEAGULL', 'PELICAN', 'CRAB', 'LOBSTER', 'SHRIMP', 'CLAM', 'OYSTER', 'STARFISH', 'URCHIN', 'KELP', 'PLANKTON', 'ABYSS', 'TRENCH', 'SUBMARINE', 'DIVER', 'SNORKEL', 'SURFBOARD', 'KAYAK', 'CANOE', 'ISLAND', 'LAGOON', 'COAST', 'CLIFF', 'BEACH', 'SHORE', 'MARINA', 'PIER', 'DOCK', 'BUOY', 'MAST'],
};

const DIRECTIONS = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
];

function getWordsForTheme(theme, count) {
    const key = theme.toLowerCase().trim();
    // Check direct match
    if (WORD_LISTS[key]) {
        return shuffleArray([...WORD_LISTS[key]]).slice(0, count);
    }
    // Check partial match
    for (const k of Object.keys(WORD_LISTS)) {
        if (k.includes(key) || key.includes(k)) {
            return shuffleArray([...WORD_LISTS[k]]).slice(0, count);
        }
    }
    // Default: mix from all
    const all = Object.values(WORD_LISTS).flat();
    return shuffleArray([...new Set(all)]).slice(0, count);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createWordSearchGrid(size, words) {
    const grid = Array.from({length: size}, () => Array(size).fill(''));
    const placed = [];
    const solution = Array.from({length: size}, () => Array(size).fill(false));

    // Sort words longest first for better placement
    const sorted = [...words].sort((a, b) => b.length - a.length);

    for (const word of sorted) {
        if (word.length > size) continue;
        let success = false;
        const dirs = shuffleArray([...DIRECTIONS]);

        for (let attempt = 0; attempt < 100 && !success; attempt++) {
            const dir = dirs[attempt % dirs.length];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            if (canPlace(grid, word, row, col, dir, size)) {
                placeWord(grid, solution, word, row, col, dir);
                placed.push(word);
                success = true;
            }
        }
    }

    // Fill empty cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) {
                grid[r][c] = letters[Math.floor(Math.random() * 26)];
            }
        }
    }

    return { grid, placed, solution };
}

function canPlace(grid, word, row, col, dir, size) {
    for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (grid[r][c] && grid[r][c] !== word[i]) return false;
    }
    return true;
}

function placeWord(grid, solution, word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        grid[r][c] = word[i];
        solution[r][c] = true;
    }
}

async function generateWordSearch() {
    const { jsPDF } = window.jspdf;

    const title = document.getElementById('ws-title').value;
    const theme = document.getElementById('ws-theme').value;
    const gridSize = parseInt(document.getElementById('ws-gridsize').value);
    const puzzleCount = parseInt(document.getElementById('ws-count').value);
    const pageSize = document.getElementById('ws-pagesize').value;
    const includeSolutions = document.getElementById('ws-solutions').value === 'yes';
    const wordsInput = document.getElementById('ws-words').value.trim();

    const [pw, ph] = getPageDimensions(pageSize);
    const doc = new jsPDF({
        unit: 'pt',
        format: [pw, ph],
    });

    const margin = 40;
    const puzzles = [];

    // Title page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(title, pw / 2, ph / 2 - 40, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${puzzleCount} Puzzles - ${theme}`, pw / 2, ph / 2 + 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Find the words hidden in the grid!', pw / 2, ph / 2 + 40, { align: 'center' });

    for (let i = 0; i < puzzleCount; i++) {
        showProgress('ws-progress', ((i + 1) / puzzleCount) * (includeSolutions ? 70 : 95),
            `Generando puzzle ${i + 1} de ${puzzleCount}...`);
        await tick();

        let words;
        if (wordsInput) {
            const allWords = wordsInput.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            words = shuffleArray([...allWords]).slice(0, Math.min(allWords.length, Math.floor(gridSize * 0.8)));
        } else {
            words = getWordsForTheme(theme, Math.floor(gridSize * 0.8));
        }

        const puzzle = createWordSearchGrid(gridSize, words);
        puzzles.push(puzzle);

        doc.addPage();

        // Puzzle number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Puzzle ${i + 1}`, pw / 2, margin, { align: 'center' });

        // Draw grid
        const gridArea = Math.min(pw - margin * 2, ph - margin * 2 - 80);
        const cellSize = gridArea / gridSize;
        const startX = (pw - gridArea) / 2;
        const startY = margin + 25;

        doc.setFont('courier', 'normal');
        doc.setFontSize(Math.min(cellSize * 0.65, 14));

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const x = startX + c * cellSize + cellSize / 2;
                const y = startY + r * cellSize + cellSize / 2 + 3;
                doc.text(puzzle.grid[r][c], x, y, { align: 'center' });
            }
        }

        // Draw grid lines (light)
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        for (let r = 0; r <= gridSize; r++) {
            doc.line(startX, startY + r * cellSize, startX + gridArea, startY + r * cellSize);
        }
        for (let c = 0; c <= gridSize; c++) {
            doc.line(startX + c * cellSize, startY, startX + c * cellSize, startY + gridArea);
        }

        // Word list below grid
        const wordListY = startY + gridArea + 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const wordsPerRow = Math.floor((pw - margin * 2) / 90);
        puzzle.placed.forEach((word, idx) => {
            const col = idx % wordsPerRow;
            const row = Math.floor(idx / wordsPerRow);
            doc.text(word, margin + col * 90, wordListY + row * 14);
        });
    }

    // Solutions section
    if (includeSolutions) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('SOLUTIONS', pw / 2, ph / 2, { align: 'center' });

        for (let i = 0; i < puzzles.length; i++) {
            showProgress('ws-progress', 70 + ((i + 1) / puzzles.length) * 28,
                `Generando solucion ${i + 1} de ${puzzles.length}...`);
            await tick();

            doc.addPage();
            const puzzle = puzzles[i];

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Solution - Puzzle ${i + 1}`, pw / 2, margin, { align: 'center' });

            const gridArea = Math.min(pw - margin * 2, ph - margin * 2 - 60);
            const cellSize = gridArea / gridSize;
            const startX = (pw - gridArea) / 2;
            const startY = margin + 20;

            doc.setFont('courier', 'normal');
            doc.setFontSize(Math.min(cellSize * 0.65, 14));

            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    const x = startX + c * cellSize + cellSize / 2;
                    const y = startY + r * cellSize + cellSize / 2 + 3;
                    if (puzzle.solution[r][c]) {
                        doc.setTextColor(0, 0, 0);
                        doc.setFont('courier', 'bold');
                    } else {
                        doc.setTextColor(200, 200, 200);
                        doc.setFont('courier', 'normal');
                    }
                    doc.text(puzzle.grid[r][c], x, y, { align: 'center' });
                }
            }
            doc.setTextColor(0, 0, 0);
        }
    }

    showProgress('ws-progress', 100, 'Descargando PDF...');
    const filename = title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    doc.save(filename);
    hideProgress('ws-progress');
}
