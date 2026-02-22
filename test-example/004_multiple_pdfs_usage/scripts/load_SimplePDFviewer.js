let viewer = null;
let currentCourseIndex = null;

const courseSelect = document.getElementById('courseSelect');
const loadBtn = document.getElementById('loadBtn');
const unloadBtn = document.getElementById('unloadBtn');
const collapseToggle = document.getElementById('collapseToggle');
const panelBody = document.getElementById('panelBody');
const statusEl = document.getElementById('statusMessage');

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
        viewer = PDFViewer.init(container, window.courses[courseIndex]);
        if (viewer) {
            currentCourseIndex = courseIndex;
            viewer.setTextSelectionEnabled(false);
            setStatus(`Loaded: ${window.courses[courseIndex].title || `Course ${courseIndex}`}`, 'success');
        } else {
            setStatus('Failed to initialize viewer.', 'error');
        }
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

function setStatus(message, type = 'info') {
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#166534' : '#475569';
    }
}

function togglePanel() {
    const isCollapsed = panelBody.classList.toggle('collapsed');
    collapseToggle.innerHTML = isCollapsed ? '+' : '-';
    collapseToggle.setAttribute('aria-label', isCollapsed ? 'Expand panel' : 'Collapse panel');
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

collapseToggle.addEventListener('click', togglePanel);

window.addEventListener('coursesLoaded', () => {
    populateCourseSelect();
    setStatus('Courses loaded. Select one and click Load.', 'info');
});

if (window.courses && Object.keys(window.courses).length > 0) {
    populateCourseSelect();
    setStatus('Courses loaded. Select one and click Load.', 'info');
}