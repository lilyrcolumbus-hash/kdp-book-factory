// ADHD Planner Workflow System
// Step-by-step guided mode with image prompts and Canva instructions

const ADHD_WORKFLOW = {
    // ── Complete page blueprint for 12-week planner ──
    pages: [
        // ═══════════════════════════════════════
        // SECTION 1: FRONT MATTER (pages 1-3)
        // ═══════════════════════════════════════
        {
            id: 'cover',
            name: 'Front Cover',
            section: 'Front Matter',
            canvaSize: '8.5 x 11 in',
            bgPrompt: 'Soft watercolor background, lavender and light blue gradient, subtle brain neural network pattern, calming, minimalist, high resolution, no text',
            bgStyle: 'Full page background image',
            textOverlay: {
                title: 'ADHD Planner: Focus, Plan & Thrive',
                subtitle: 'A Gentle Undated Planner for Your Brilliant Brain',
                author: '[Your Name]',
                tagline: 'NO DATES. NO GUILT. NO BORING PAGES.',
            },
            canvaInstructions: [
                '1. Canva > Create Design > Custom 8.5 x 11 in',
                '2. Search backgrounds: "watercolor purple blue gradient"',
                '3. Add title text: font Playfair Display Bold, size 48, color #667EEA',
                '4. Add subtitle: font Lato Light, size 18, color #764BA2',
                '5. Add tagline at bottom: font Lato Bold, size 12, color #FFB74D',
                '6. Add author name: font Lato, size 14, color #828296',
            ],
            fonts: { title: 'Playfair Display Bold 48pt', subtitle: 'Lato Light 18pt' },
            colors: { title: '#667EEA', subtitle: '#764BA2', tagline: '#FFB74D', author: '#828296' },
        },
        {
            id: 'title-page',
            name: 'Title Page (Interior)',
            section: 'Front Matter',
            bgPrompt: 'Minimal abstract watercolor splash, very soft lavender and white, large empty center area for text, elegant, clean',
            bgStyle: 'Subtle background, mostly white with soft color accents',
            textOverlay: {
                title: 'ADHD Planner',
                subtitle: 'Focus, Plan & Thrive',
                copyright: '© 2026 [Your Name]. All rights reserved.',
            },
            canvaInstructions: [
                '1. Duplicate cover design, simplify it',
                '2. Remove heavy background, keep very subtle watercolor touches',
                '3. Center title text, make it elegant and simple',
                '4. Add copyright at bottom in small font (Lato 8pt, gray)',
            ],
        },
        {
            id: 'welcome',
            name: 'Welcome Page — "Hey, You Made It!"',
            section: 'Front Matter',
            bgPrompt: 'Soft dotted pattern background, pastel colors, very subtle, paper texture, calming, minimal',
            bgStyle: 'Light textured background',
            textOverlay: {
                title: 'Hey, You Made It!',
                subtitle: '(That\'s already an achievement. Seriously.)',
                body: [
                    'This planner was designed for brains like yours — the kind that can hyperfocus on Wikipedia for 4 hours but forget to eat lunch.',
                    '',
                    'Here\'s the deal:',
                    '• There are NO dates. Skip a day? A week? Zero guilt.',
                    '• Each page tells you exactly what to do.',
                    '• You only need to pick 3 things per day. THREE.',
                    '• If you finish all 3, you\'re basically a superhero.',
                ],
                pageTypes: [
                    'Daily Focus — Only 3 tasks. Because 47 was never realistic.',
                    'Time Blocks — Morning / Afternoon / Evening. No micromanagement.',
                    'Brain Dump — Your mental junk drawer. No judgment.',
                    'Weekly Overview — Pretend you have your week together.',
                    'Mood & Energy — Discover you\'re a zombie on Tuesdays.',
                    'Habit Tracker — Just 7 habits. Momentum, not anxiety.',
                    'Weekly Reflection — What worked? What snacks helped?',
                ],
                tip: 'Pro tip: Use what helps. Ignore what doesn\'t. Eat snacks.',
            },
            canvaInstructions: [
                '1. Background: subtle dot pattern or soft paper texture',
                '2. Title: Playfair Display Bold 28pt, color #667EEA',
                '3. Subtitle in italic coral (#FF6F61)',
                '4. Body text: Lato Regular 11pt, color #32323C',
                '5. Page types list: bold title + regular description',
                '6. Tip at bottom: Lato Bold 11pt, color #FFB74D',
                '7. Optional: small brain/lightbulb icon next to title',
            ],
        },

        // ═══════════════════════════════════════
        // SECTION 2: WEEKLY CYCLE (repeat x12)
        // ═══════════════════════════════════════
        {
            id: 'weekly-overview',
            name: 'Weekly Overview',
            section: 'Weekly Cycle (repeat 12x)',
            repeatNote: 'Create 1 template, duplicate 12 times in Canva',
            bgPrompt: 'Subtle geometric pattern background, very light pastel, triangles and circles, barely visible, clean modern design',
            bgStyle: 'Very subtle geometric pattern',
            layout: {
                description: '7 day rows with color sidebar + checkboxes + energy tracker',
                days: [
                    { name: 'Monday', color: '#667EEA', emoji: '(fresh start!)' },
                    { name: 'Tuesday', color: '#009688', emoji: '(you got this)' },
                    { name: 'Wednesday', color: '#4CAF50', emoji: '(halfway hero)' },
                    { name: 'Thursday', color: '#764BA2', emoji: '(almost there)' },
                    { name: 'Friday', color: '#FF6F61', emoji: '(TGIF energy)' },
                    { name: 'Saturday', color: '#FFB74D', emoji: '(rest or chaos?)' },
                    { name: 'Sunday', color: '#EC64AA', emoji: '(recharge day)' },
                ],
            },
            textOverlay: {
                title: 'Weekly Overview',
                funny: '"Pretending I have my life together since page 3"',
                footer: '"My brain has too many tabs open." — Every ADHD human ever',
                winsSection: 'WEEKLY WINS (even getting out of bed counts)',
            },
            canvaInstructions: [
                '1. Title: Playfair Display Bold 18pt, #667EEA, top left',
                '2. Funny quote: Lato Italic 8pt, #FF6F61, top right',
                '3. Create 7 rows, each with:',
                '   - 5px color bar on left (color per day)',
                '   - Day name in bold + funny subtitle in italic gray',
                '   - 2-3 checkbox lines for tasks',
                '   - 5 empty circles on right for energy rating',
                '4. "Weekly Wins" section at bottom with 3 bullet lines',
                '5. Footer quote: Lato Italic 8pt, #FF6F61, centered bottom',
                '6. Optional: subtle geometric background',
            ],
        },
        {
            id: 'daily-focus',
            name: 'Daily Focus',
            section: 'Weekly Cycle (repeat 12x)',
            repeatNote: 'Create 1 template, duplicate 84 times (7 days x 12 weeks)',
            bgPrompt: 'Very subtle wave pattern, soft blue and lavender, watercolor texture, barely visible, calm and focusing, paper texture',
            bgStyle: 'Subtle wave/flow pattern',
            layout: {
                sections: [
                    {
                        name: 'TOP 3 PRIORITIES',
                        subtitle: '(yes, only 3. breathe.)',
                        description: '3 numbered circles (1,2,3) with lines. Numbers filled blue.',
                    },
                    {
                        name: 'TIME BLOCKS',
                        subtitle: '(when are you human vs. zombie?)',
                        blocks: [
                            { name: 'Morning', time: '6-12h', quote: '"Brain is warming up..."', color: '#FFB74D' },
                            { name: 'Afternoon', time: '12-5pm', quote: '"Peak chaos or peak focus?"', color: '#667EEA' },
                            { name: 'Evening', time: '5-9pm', quote: '"Wind down mode activated"', color: '#764BA2' },
                        ],
                    },
                    {
                        name: 'BRAIN DUMP',
                        subtitle: '(your mental junk drawer)',
                        description: 'Rounded rectangle with dot grid inside. Instruction: "Write anything. Grocery lists, existential thoughts, song lyrics..."',
                    },
                ],
            },
            textOverlay: {
                title: 'Daily Focus',
                instruction: 'Pick only 3 things. THREE. Not 47. If you finish all 3, do a victory dance.',
                footer: '"I\'m not disorganized. I have a creative filing system." — You, probably',
            },
            canvaInstructions: [
                '1. Title: Playfair Display Bold 18pt, #667EEA',
                '2. Date field top right: "Date: ___ / ___ / ______"',
                '3. Instruction in coral italic below title',
                '4. TOP 3 section:',
                '   - 3 filled circles (#667EEA) with white numbers 1, 2, 3',
                '   - Long line after each for writing',
                '5. TIME BLOCKS section:',
                '   - 3 rows with color bar (amber/blue/purple)',
                '   - Block name + time + funny quote in italic',
                '   - 2-3 lines per block for writing',
                '6. BRAIN DUMP section:',
                '   - Rounded rectangle taking remaining space',
                '   - Dot grid pattern inside (Canva: search "dot grid")',
                '7. Footer quote centered at bottom',
            ],
        },
        {
            id: 'brain-dump',
            name: 'Brain Dump (Full Page)',
            section: 'Weekly Cycle (repeat 12x)',
            repeatNote: 'Create 1 template, duplicate 12 times',
            bgPrompt: 'Ethereal starfield pattern, very soft pastel purple and blue dots scattered like stars, dreamy, minimal, paper texture background',
            bgStyle: 'Subtle starfield/scattered dots',
            textOverlay: {
                title: 'Brain Dump',
                funny: '"Ctrl+Alt+Delete for your brain"',
                instruction: 'Dump EVERYTHING here. Random thoughts, ideas, worries, that thing you forgot 3 times. ALL OF IT. No rules. Freedom.',
                footer: '"Today\'s goal: be slightly less chaotic than yesterday."',
            },
            canvaInstructions: [
                '1. Title: Playfair Display Bold 18pt, #667EEA',
                '2. Funny quote: italic, #FF6F61, top right',
                '3. Instruction text in gray italic',
                '4. Large rounded rectangle border (soft purple #764BA2)',
                '5. Fill with dot grid pattern',
                '6. Small star decorations in corners',
                '7. Starfield background barely visible',
            ],
        },
        {
            id: 'mood-energy',
            name: 'Mood & Energy Check-in',
            section: 'Weekly Cycle (repeat 12x)',
            repeatNote: 'Create 1 template, duplicate 12 times',
            bgPrompt: 'Soft polka dot pattern, pastel rainbow colors, very subtle, white background, cheerful but calm',
            bgStyle: 'Subtle colorful dots pattern',
            layout: {
                days: 7,
                moodOptions: [
                    { label: 'Amazing', color: '#4CAF50' },
                    { label: 'Good', color: '#009688' },
                    { label: 'Meh', color: '#FFB74D' },
                    { label: 'Low', color: '#FF6F61' },
                    { label: 'SOS', color: '#EC64AA' },
                ],
                energyScale: '1 (dead) to 5 (superhero)',
            },
            textOverlay: {
                title: 'Mood & Energy Check-in',
                funny: '"Am I tired or is it just Tuesday?"',
                patternSection: 'PATTERNS I NOTICE (my brain\'s cheat codes)',
                footer: '"Remember: done is better than perfect. Also, snacks help."',
            },
            canvaInstructions: [
                '1. Title + funny quote',
                '2. 7 rows (Day 1-7), alternating subtle bg:',
                '   - Color bar on left (rainbow cycle)',
                '   - Day label + date field',
                '   - Mood: 5 colored circles with labels',
                '   - Energy: 5 rounded boxes numbered 1-5',
                '   - "What happened:" line',
                '3. "Patterns I Notice" section with 2 lines',
                '4. Footer quote',
            ],
        },
        {
            id: 'habit-tracker',
            name: 'Habit Tracker (Monthly)',
            section: 'Monthly Insert (repeat 3x for 12 weeks)',
            repeatNote: 'Create 1 template, duplicate 3 times',
            bgPrompt: 'Minimal geometric shapes background, soft pastel, circles triangles squares scattered, very subtle, modern clean design',
            bgStyle: 'Subtle geometric shapes',
            layout: {
                habits: 7,
                days: 31,
                prefilledHabits: [
                    'Drink water', 'Take meds', '5 min walk', 'Eat actual food',
                    'Brain dump', 'No phone 15min', 'Celebrate a win',
                ],
            },
            textOverlay: {
                title: 'Habit Tracker',
                funny: '"Building habits, one forgotten day at a time"',
                instruction: 'Choose 5-7 tiny habits. Fill the circle when done. Missed a day? Cool, try again tomorrow.',
                ideas: [
                    'Stretch 2 min | Write 1 gratitude | Make the bed | Go outside 5 min',
                    'Read 1 page | Text someone nice | No social media before 9am | Deep breaths x3',
                ],
                footer: '"If plan A didn\'t work, the alphabet has 25 more letters."',
            },
            canvaInstructions: [
                '1. Title + funny quote + month field',
                '2. Grid: 7 rows x 31 columns',
                '   - Left column: habit name (pre-filled in light gray as suggestion)',
                '   - Color bar on left per row (rainbow)',
                '   - Small circles for each day',
                '   - Day numbers on top (1-31)',
                '3. "Habit Ideas" section at bottom',
                '4. Alternating row backgrounds for readability',
            ],
        },
        {
            id: 'weekly-reflection',
            name: 'Weekly Reflection',
            section: 'Weekly Cycle (repeat 12x)',
            repeatNote: 'Create 1 template, duplicate 12 times',
            bgPrompt: 'Soft flowing wave lines, very subtle, lavender and mint, calming zen pattern, minimal, high resolution paper texture',
            bgStyle: 'Subtle flowing waves',
            layout: {
                sections: [
                    { title: 'WHAT WENT WELL?', hint: 'Even tiny wins count. Did you remember to eat? That\'s a W.', color: '#4CAF50', lines: 4 },
                    { title: 'WHAT WAS HARD?', hint: 'Not to roast yourself. To understand and adjust. Be kind.', color: '#FF6F61', lines: 3 },
                    { title: 'WHAT DRAINED MY ENERGY?', hint: 'People? Tasks? That one meeting? Name it.', color: '#764BA2', lines: 3 },
                    { title: 'WHAT GAVE ME ENERGY?', hint: 'Do more of this. Seriously.', color: '#FFB74D', lines: 3 },
                    { title: 'ONE THING TO TRY NEXT WEEK', hint: 'Just ONE. You\'re not training for the Olympics.', color: '#009688', lines: 2 },
                ],
            },
            textOverlay: {
                title: 'Weekly Reflection',
                funny: '"Therapy lite, but on paper"',
                motivation: 'You survived another week. That\'s not nothing.',
                footer: '"Your brain isn\'t broken. It\'s just running a different operating system."',
            },
            canvaInstructions: [
                '1. Title + funny quote',
                '2. 5 sections, each with:',
                '   - 5px color bar on left (unique color per section)',
                '   - Section title in bold (same color as bar)',
                '   - Hint text in italic gray below title',
                '   - Writing lines',
                '3. Motivational text in amber bold before footer',
                '4. Footer quote',
            ],
        },
    ],

    // ── Canva workflow summary ──
    totalPages: {
        'cover': 1,
        'title-page': 1,
        'welcome': 1,
        'weekly-overview': 12,
        'daily-focus': 84,
        'brain-dump': 12,
        'mood-energy': 12,
        'habit-tracker': 3,
        'weekly-reflection': 12,
    },

    // ── Color palette for Canva ──
    colorPalette: {
        'Calm Blue': '#667EEA',
        'Soft Purple': '#764BA2',
        'Gentle Green': '#4CAF50',
        'Warm Amber': '#FFB74D',
        'Coral': '#FF6F61',
        'Pink': '#EC64AA',
        'Teal': '#009688',
        'Dark Text': '#32323C',
        'Light Text': '#828296',
        'Line Gray': '#D2D2E1',
        'Section BG': '#F5F5FC',
    },

    // ── Font system ──
    fonts: {
        title: 'Playfair Display — Bold — used for page titles',
        body: 'Lato — Regular — used for body text and instructions',
        accent: 'Lato — Italic — used for funny quotes and hints',
        numbers: 'Montserrat — Bold — used for day numbers and priorities',
    },

    // ── All image prompts (for Midjourney/DALL-E) ──
    getAllImagePrompts: function() {
        return this.pages.map(p => ({
            page: p.name,
            prompt: p.bgPrompt,
            style: p.bgStyle,
        }));
    },
};

// ── UI: Render workflow dashboard ──

function renderADHDWorkflow() {
    const output = document.getElementById('adhd-workflow-output');
    if (!output) return;

    let html = '<div class="copy-hint">Click any text block to copy it to clipboard</div>';

    // Color palette
    html += '<h3>Color Palette (copy hex codes)</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
    for (const [name, hex] of Object.entries(ADHD_WORKFLOW.colorPalette)) {
        html += `<div class="meta-item" style="display:flex;align-items:center;gap:8px;padding:8px 12px">
            <div style="width:20px;height:20px;border-radius:50%;background:${hex}"></div>
            <span>${name}: ${hex}</span>
        </div>`;
    }
    html += '</div>';

    // Fonts
    html += '<h3>Font System</h3>';
    for (const [key, val] of Object.entries(ADHD_WORKFLOW.fonts)) {
        html += `<div class="meta-item">${key}: ${val}</div>`;
    }

    // Page count summary
    html += '<h3>Total Pages: 138</h3>';
    html += '<div style="margin-bottom:12px">';
    for (const [page, count] of Object.entries(ADHD_WORKFLOW.totalPages)) {
        html += `<div class="meta-item">${page}: ${count} pages</div>`;
    }
    html += '</div>';

    // Page blueprints
    html += '<h3>Page-by-Page Blueprint</h3>';
    let currentSection = '';
    for (const page of ADHD_WORKFLOW.pages) {
        if (page.section !== currentSection) {
            currentSection = page.section;
            html += `<h3 style="color:#764BA2;margin-top:20px">${currentSection}</h3>`;
        }

        html += `<div style="background:#151528;border:1px solid #2a2a4a;border-radius:10px;padding:16px;margin-bottom:12px">`;
        html += `<div style="font-size:1.1rem;font-weight:700;color:#667EEA;margin-bottom:8px">${page.name}</div>`;

        if (page.repeatNote) {
            html += `<div style="color:#FFB74D;font-size:0.8rem;margin-bottom:8px">${page.repeatNote}</div>`;
        }

        // Image prompt
        html += `<div style="margin-bottom:8px"><span style="color:#999;font-size:0.8rem">Image prompt (copy for Midjourney/DALL-E):</span></div>`;
        html += `<div class="prompt-item">${page.bgPrompt}</div>`;

        // Text content
        if (page.textOverlay) {
            html += `<div style="margin-top:8px"><span style="color:#999;font-size:0.8rem">Text content:</span></div>`;
            for (const [key, val] of Object.entries(page.textOverlay)) {
                if (Array.isArray(val)) {
                    html += `<div class="prompt-item">${key}:\n${val.join('\n')}</div>`;
                } else {
                    html += `<div class="prompt-item">${key}: ${val}</div>`;
                }
            }
        }

        // Canva instructions
        if (page.canvaInstructions) {
            html += `<div style="margin-top:8px"><span style="color:#999;font-size:0.8rem">Canva steps:</span></div>`;
            html += `<div class="prompt-item">${page.canvaInstructions.join('\n')}</div>`;
        }

        // Layout details
        if (page.layout) {
            html += `<div style="margin-top:8px"><span style="color:#999;font-size:0.8rem">Layout details:</span></div>`;
            html += `<div class="prompt-item">${JSON.stringify(page.layout, null, 2)}</div>`;
        }

        html += '</div>';
    }

    // All image prompts grouped
    html += '<h3>All Image Prompts (batch copy for AI art)</h3>';
    const allPrompts = ADHD_WORKFLOW.getAllImagePrompts();
    let promptBatch = allPrompts.map(p => `[${p.page}]\n${p.prompt}`).join('\n\n');
    html += `<div class="prompt-item">${promptBatch}</div>`;

    output.innerHTML = html;
    output.style.display = 'block';
}
