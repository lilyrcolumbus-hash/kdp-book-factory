// Storage Module - Save/restore form configurations to localStorage

const STORAGE_KEY = 'kdp-book-factory-config';

function saveAllConfigs() {
    const config = {};
    const inputs = document.querySelectorAll('input[id], select[id], textarea[id]');
    inputs.forEach(el => {
        if (el.type === 'file') return;
        config[el.id] = el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadAllConfigs() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const config = JSON.parse(saved);
        for (const [id, value] of Object.entries(config)) {
            const el = document.getElementById(id);
            if (el && el.type !== 'file') {
                el.value = value;
            }
        }
    } catch (e) {
        console.warn('Error loading saved config:', e);
    }
}

function resetAllConfigs() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}

// Auto-save on any input change (debounced)
let saveTimeout = null;
document.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveAllConfigs, 1000);
});
document.addEventListener('change', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveAllConfigs, 500);
});

// Load saved configs on page load
document.addEventListener('DOMContentLoaded', loadAllConfigs);
