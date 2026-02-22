let viewer = null;
let currentCourseIndex = null;

const courseSelect = document.getElementById('courseSelect');
const loadBtn = document.getElementById('loadBtn');
const unloadBtn = document.getElementById('unloadBtn');
const collapseToggle = document.getElementById('collapseToggle');
const panelBody = document.getElementById('panelBody');
const statusEl = document.getElementById('statusMessage');
const colorInput = document.getElementById('colorInput');
const applyThemeBtn = document.getElementById('applyThemeBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

const COLOR_STORAGE_KEY = 'pdfViewer_theme';
const DEFAULT_COLOR = '#3498DB';

let currentTheme = localStorage.getItem(COLOR_STORAGE_KEY) || DEFAULT_COLOR;
if (!/^#[0-9A-Fa-f]{6}$/.test(currentTheme)) currentTheme = DEFAULT_COLOR;
colorInput.value = currentTheme;

function populateCourseSelect() {
    if (!window.courses) return;
    courseSelect.innerHTML = '';
    for (let key in window.courses) {
        const course = window.courses[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = course.title || `Course ${key}`;
        courseSelect.appendChild(option);
    }
}

function setStatus(message, type = 'info') {
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#166534' : '#475569';
    }
}

function initializeViewer(courseIndex) {
    if (typeof PDFViewer === 'undefined') {
        setStatus('PDFViewer library not loaded.', 'error');
        return;
    }

    if (!window.courses || !window.courses[courseIndex]) {
        setStatus(`Course ${courseIndex} not found.`, 'error');
        return;
    }

    const container = document.getElementById('viewer');
    if (!container) {
        setStatus('Viewer container not found.', 'error');
        return;
    }

    clearViewer();

    try {
        viewer = PDFViewer.init(container, window.courses[courseIndex], {
            colorTheme: currentTheme,
            onError: (error) => {
                console.error('Viewer error:', error);
                setStatus(`Viewer error: ${error.message}`, 'error');
            }
        });
        if (viewer) {
            currentCourseIndex = courseIndex;
            setStatus(`Loaded: ${window.courses[courseIndex].title || `Course ${courseIndex}`} (theme: ${currentTheme})`, 'success');
        } else {
            setStatus('Failed to initialize viewer.', 'error');
        }
        // For better UX in this example, disable text selection
        viewer.setTextSelectionEnabled(false);
    } catch (err) {
        console.error('Error initializing viewer:', err);
        setStatus('Error initializing viewer.', 'error');
    }
}

function clearViewer() {
    if (viewer) {
        try {
            if (typeof viewer.cleanup === 'function') viewer.cleanup();
        } catch (err) {
            console.error('Error during viewer cleanup:', err);
        }
        try {
            if (typeof viewer.destroy === 'function') viewer.destroy();
        } catch (err) {
            console.error('Error during viewer destroy:', err);
        }
        viewer = null;
    }
    const container = document.getElementById('viewer');
    if (container) {
        container.innerHTML = '';
    }
    currentCourseIndex = null;
    setStatus('Viewer unloaded.', 'info');
}

function changeTheme(newColor) {
    if (!viewer) {
        setStatus('No viewer loaded. Load a course first.', 'error');
        return;
    }
    const success = viewer.setTheme(newColor);
    if (success) {
        currentTheme = newColor;
        localStorage.setItem(COLOR_STORAGE_KEY, newColor);
        colorInput.value = newColor;
        setStatus(`Theme changed to ${newColor}`, 'success');
    } else {
        setStatus(`Invalid color: ${newColor}`, 'error');
    }
}

loadBtn.addEventListener('click', () => {
    const selectedIndex = parseInt(courseSelect.value, 10);
    if (!isNaN(selectedIndex)) {
        initializeViewer(selectedIndex);
    } else {
        setStatus('Select a course.', 'error');
    }
});

unloadBtn.addEventListener('click', clearViewer);

collapseToggle.addEventListener('click', () => {
    const isCollapsed = panelBody.classList.toggle('collapsed');
    collapseToggle.textContent = isCollapsed ? '+' : '-';
    collapseToggle.setAttribute('aria-label', isCollapsed ? 'Expand panel' : 'Collapse panel');
});

applyThemeBtn.addEventListener('click', () => {
    const newColor = colorInput.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        changeTheme(newColor);
    } else {
        setStatus('Invalid hex color. Use #RRGGBB.', 'error');
    }
});

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        colorInput.value = color;
        changeTheme(color);
    });
});

window.addEventListener('coursesLoaded', () => {
    populateCourseSelect();
    setStatus('Courses loaded. Select one and click Load.', 'info');
});

if (window.courses && Object.keys(window.courses).length > 0) {
    populateCourseSelect();
    setStatus('Courses loaded. Select one and click Load.', 'info');
}
