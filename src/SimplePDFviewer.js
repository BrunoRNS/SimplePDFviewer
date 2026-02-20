/**
 * Simple JavaScript PDF Viewer
 * 
 * @version rolling-release
 * @license MIT
 * @author BrunoRNS
 * @see https://github.com/BrunoRNS/SimplePDFviewer
 * @see https://github.com/mozilla/pdf.js
 * @see https://www.jsdelivr.com/?docs=gh
 */

/**
 * Global namespace for SimplePDFviewer.
 */
(function (global) {
    'use strict';

    const PDFJS_VERSION = '3.11.174';
    const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    const WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

    let isLibLoading = false;
    const initQueue = [];

    // Session-only storage for anonymous/private browsing mode
    const memoryStorage = {};

    /**
     * Check if localStorage is available (not in private/anonymous mode)
     * @returns {boolean} - true if localStorage is available
     */
    function isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Unified storage interface that falls back to memory storage if localStorage unavailable
     */
    const Storage = {
        available: isLocalStorageAvailable(),
        setItem: function (key, value) {
            if (this.available) {
                localStorage.setItem(key, value);
            } else {
                memoryStorage[key] = value;
            }
        },
        getItem: function (key) {
            if (this.available) {
                return localStorage.getItem(key);
            } else {
                return memoryStorage[key] || null;
            }
        },
        removeItem: function (key) {
            if (this.available) {
                localStorage.removeItem(key);
            } else {
                delete memoryStorage[key];
            }
        }
    };

    /**
     * Creates SVG icon with text fallback
     * @param {string} type - Icon type: 'zoom-in', 'zoom-out', 'fullscreen', 'hamburger'
     * @returns {string} - HTML string with SVG and fallback
     */
    function createIcon(type) {
        const icons = {
            'zoom-in': {
                svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
                fallback: '+'
            },
            'zoom-out': {
                svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
                fallback: '−'
            },
            'fullscreen': {
                svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>',
                fallback: '⛶'
            },
            'hamburger': {
                svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
                fallback: '☰'
            }
        };

        const icon = icons[type] || icons['hamburger'];
        return `<span class="icon-svg">${icon.svg}</span><span class="icon-fallback" role="img">${icon.fallback}</span>`;
    }

    // Configuration constants
    const MIN_TOUCH_TARGET_SIZE = 44; // px for accessibility
    const RENDER_DEBOUNCE_DELAY = 150; // ms

    // Default theme colors
    const DEFAULT_THEME = {
        primary: '#3498db',
        primaryHover: '#2980b9',
        primaryActive: '#1f618d',
        sidebarPrimary: '#2c3e50',
        sidebarHover: '#3d566e',
        sidebarBorder: '#34495e',
        containerBg: '#f0f2f5',
        disabled: '#bdc3c7',
        lightBorder: '#ddd'
    };

    // Proportional relationships (calculated from default colors)
    const COLOR_RATIOS = {
        primaryToHover: -18, // Lightness change percentage
        primaryToActive: -36,
        sidebarToHover: 8,
        sidebarToBorder: -8
    };

    /**
     * Converts hex color to RGB array.
     * @param {string} hex - Hex color (e.g., "#3498db" or "#3ad")
     * @returns {Array} - [r, g, b] values (0-255)
     */
    function hexToRgb(hex) {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(x => x + x).join('');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return [r, g, b];
    }

    /**
     * Converts RGB to hex color.
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} - Hex color (e.g., "#3498db")
     */
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Converts hex to HSL.
     * @param {string} hex - Hex color (e.g., "#3498db")
     * @returns {Object} - {h: 0-360, s: 0-100, l: 0-100}
     */
    function hexToHsl(hex) {
        const [r, g, b] = hexToRgb(hex);
        const rn = r / 255;
        const gn = g / 255;
        const bn = b / 255;

        const max = Math.max(rn, gn, bn);
        const min = Math.min(rn, gn, bn);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
                case gn: h = ((bn - rn) / d + 2) / 6; break;
                case bn: h = ((rn - gn) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Converts HSL to hex.
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} - Hex color
     */
    function hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        );
    }

    /**
     * Validates and adjusts hex color for edge cases.
     * @param {string} hex - Hex color to validate
     * @returns {Object} - {valid: boolean, color: string (adjusted), original: string}
     */
    function validateAndAdjustColor(hex) {

        if (!/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex)) {
            return { valid: false, error: 'Invalid hex format. Use #RRGGBB or #RGB' };
        }

        const hsl = hexToHsl(hex);
        const lightness = hsl.l;

        // Auto-adjust if too dark or too bright
        let adjustedL = lightness;
        if (lightness < 15) {
            adjustedL = 25; // Minimum usable lightness
        } else if (lightness > 85) {
            adjustedL = 75; // Maximum usable lightness
        }

        const adjustedHex = hslToHex(hsl.h, hsl.s, adjustedL);
        return {
            valid: true,
            color: adjustedHex,
            original: hex,
            wasAdjusted: adjustedL !== lightness
        };
    }

    /**
     * Injects CSS styles for the PDF viewer into the document head.
     * If the 'pdf-viewer-styles' element already exists, this function does nothing.
     * @param {Object} colors - Optional colors object to override defaults
     * @returns {void}
    */
    const injectStyles = (colors = null) => {
        const styleElement = document.getElementById('pdf-viewer-styles');
        const theme = colors || DEFAULT_THEME;

        const style = styleElement || document.createElement('style');
        style.id = 'pdf-viewer-styles';
        style.textContent = `
            .pdf-viewer-container { display: flex; height: 100%; width: 100%; font-family: system-ui, -apple-system, sans-serif; background: ${theme.containerBg}; overflow: hidden; position: relative; }
            .pdf-viewer-sidebar { position: absolute; top: 0; left: -100%; width: 280px; height: 100%; background: ${theme.sidebarPrimary}; color: #fff; transition: all 0.3s ease; z-index: 1001; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.2); }
            .pdf-viewer-sidebar.open { left: 0; }
            .pdf-viewer-sidebar.collapsed { width: 60px; padding: 0; }
            .pdf-viewer-sidebar.collapsed > div { display: none; }
            .pdf-viewer-sidebar.collapsed .pdf-viewer-chapter-item { padding: 8px 0; text-align: center; }
            .pdf-viewer-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
            .pdf-viewer-controls { display: flex; align-items: center; justify-content: center; gap: 15px; padding: 10px; background: #fff; border-bottom: 1px solid ${theme.lightBorder}; z-index: 10; }
            .pdf-viewer-canvas-container { position: relative; flex: 1; overflow: auto; padding: 5px; background: #525659; scroll-behavior: smooth; width: 100%; display: block; box-sizing: border-box; }
            .pdf-viewer-canvas { width: 100%; height: auto; box-shadow: 0 0 15px rgba(0,0,0,0.3); background: #fff; }
            .pdf-viewer-text-layer { position: absolute; top: 0; left: 0; right: 0; z-index: 1; user-select: text; }
            .pdf-viewer-text-layer > span { position: absolute; white-space: pre; cursor: text; color: transparent; -moz-user-select: text; -webkit-user-select: text; user-select: text; }
            .pdf-viewer-text-layer .highlight { background: rgba(255, 255, 0, 0.3); }
            .pdf-viewer-text-layer.disabled { pointer-events: none; user-select: none; }
            .pdf-viewer-loading-overlay { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 20; }
            .pdf-viewer-footer { padding: 10px; background: #f0f0f0; border-top: 1px solid ${theme.lightBorder}; text-align: center; font-size: 12px; color: #666; }
            .pdf-viewer-chapter-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid ${theme.sidebarBorder}; transition: background 0.2s; }
            .pdf-viewer-chapter-item:hover { background: ${theme.sidebarHover}; }
            .pdf-viewer-chapter-item.active { background: ${theme.primary}; border-left: 4px solid #fff; }
            .pdf-viewer-btn { padding: 10px 16px; min-height: ${MIN_TOUCH_TARGET_SIZE}px; min-width: ${MIN_TOUCH_TARGET_SIZE}px; border: none; border-radius: 4px; cursor: pointer; background: ${theme.primary}; color: white; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
            .pdf-viewer-btn:hover { background: ${theme.primaryHover}; }
            .pdf-viewer-btn:active { background: ${theme.primaryActive}; }
            .pdf-viewer-btn:disabled { background: ${theme.disabled}; cursor: not-allowed; }
            .zoom-controls { display: flex; gap: 5px; align-items: center; }
            .zoom-controls .zoom-input { padding: 8px 12px; width: 60px; border: 1px solid ${theme.lightBorder}; border-radius: 4px; font-size: 14px; text-align: center; font-weight: 500; }
            .zoom-controls .zoom-input:focus { outline: none; border-color: ${theme.primary}; box-shadow: 0 0 3px ${theme.primary}; }
            .icon-svg { display: inline-flex; width: 20px; height: 20px; color: inherit; align-items: center; justify-content: center; }
            .icon-svg svg { width: 100%; height: 100%; }
            .icon-fallback { display: none; font-size: 16px; line-height: 1; font-weight: bold; }
            .pdf-viewer-main.fullscreen { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; flex-direction: column; background: ${theme.sidebarPrimary}; }
            .pdf-viewer-main.fullscreen .pdf-viewer-canvas-container { background: ${theme.sidebarPrimary}; padding: 3px; box-sizing: border-box; }
            .pdf-viewer-main.fullscreen .pdf-viewer-controls { position: relative; background: ${theme.sidebarPrimary}; border-bottom: 3px solid ${theme.primary}; }
            .pdf-viewer-main.fullscreen .pdf-viewer-footer { position: relative; background: ${theme.sidebarPrimary}; border-top: 3px solid ${theme.primary}; color: #ccc; }
            .pdf-viewer-main.fullscreen .pdf-viewer-toggle-btn { display: none; }
            @media (min-width: 768px) {
                .pdf-viewer-sidebar { position: relative; left: 0; }
                .pdf-viewer-toggle-btn { display: none; }
            }
        `;

        if (!styleElement) {
            document.head.appendChild(style);
        }
    };

    /**
     * Calculates all theme colors based on a primary color.
     * @param {string} baseColorHex - Base hex color (e.g., "#FF5722")
     * @returns {Object|null} - Theme colors object or null if invalid
     */
    function calculateThemeColors(baseColorHex) {
        const validation = validateAndAdjustColor(baseColorHex);
        if (!validation.valid) {
            return null;
        }

        const primaryColor = validation.color;
        const primaryHsl = hexToHsl(primaryColor);

        // Calculate primary color variants using proportional changes
        const primaryHoverL = Math.max(0, Math.min(100, primaryHsl.l + COLOR_RATIOS.primaryToHover));
        const primaryActiveL = Math.max(0, Math.min(100, primaryHsl.l + COLOR_RATIOS.primaryToActive));

        // For sidebar, create a darker/muted variant
        const sidebarHsl = { ...primaryHsl };
        sidebarHsl.s = Math.max(0, sidebarHsl.s - 30); // Reduce saturation
        sidebarHsl.l = Math.max(0, Math.min(100, sidebarHsl.l - 25)); // Darken

        const sidebarHoverL = Math.max(0, Math.min(100, sidebarHsl.l + COLOR_RATIOS.sidebarToHover));
        const sidebarBorderL = Math.max(0, Math.min(100, sidebarHsl.l + COLOR_RATIOS.sidebarToBorder));

        return {
            primary: primaryColor,
            primaryHover: hslToHex(primaryHsl.h, primaryHsl.s, primaryHoverL),
            primaryActive: hslToHex(primaryHsl.h, primaryHsl.s, primaryActiveL),
            sidebarPrimary: hslToHex(sidebarHsl.h, sidebarHsl.s, sidebarHsl.l),
            sidebarHover: hslToHex(sidebarHsl.h, sidebarHsl.s, sidebarHoverL),
            sidebarBorder: hslToHex(sidebarHsl.h, sidebarHsl.s, sidebarBorderL),
            containerBg: '#f0f2f5', // Keep consistent
            disabled: '#bdc3c7', // Keep consistent
            lightBorder: '#ddd' // Keep consistent
        };
    }

    /**
     * Validates course data structure.
     * @param {Object} course - The course object to validate.
     * @returns {Object} - Validation result with {valid: boolean, error: string|null}
     */
    const validateCourse = (course) => {
        if (!course) return {
            valid: false, error: 'Course object is required.'
        };
        if (typeof course.title !== 'string') return {
            valid: false, error: 'Course must have a title (string).'
        };
        if (!Array.isArray(course.modules)) return {
            valid: false, error: 'Course must have modules array.'
        };
        if (course.modules.length === 0) return {
            valid: false, error: 'Course must have at least one module.'
        };

        for (let m = 0; m < course.modules.length; m++) {
            const mod = course.modules[m];
            if (typeof mod.title !== 'string') return {
                valid: false, error: `Module ${m} must have a title.`
            };
            if (!Array.isArray(mod.chapters)) return {
                valid: false, error: `Module ${m} must have chapters array.`
            };
            if (mod.chapters.length === 0) return {
                valid: false, error: `Module ${m} must have at least one chapter.`
            };

            for (let c = 0; c < mod.chapters.length; c++) {
                const ch = mod.chapters[c];
                if (typeof ch.title !== 'string') return {
                    valid: false, error: `Module ${m}, Chapter ${c} must have a title.`
                };
                if (typeof ch.pdf !== 'string') return {
                    valid: false, error: `Module ${m}, Chapter ${c} must have a pdf URL.`
                };
            }
        }
        return { valid: true, error: null };
    };

    /**
     * Validates container element.
     * @param {HTMLElement} container - The container element.
     * @returns {Object} - Validation result with {valid: boolean, error: string|null}
     */
    const validateContainer = (container) => {
        if (!container) return {
            valid: false, error: 'Container element is required.'
        };
        if (!(container instanceof HTMLElement)) return {
            valid: false, error: 'Container must be an HTML element.'
        };
        return { valid: true, error: null };
    };

    /**
     * Loads the PDF.js library and sets it up.
     * If the library is already loaded, it calls the callback immediately.
     * If the library is not loaded, it adds the callback to the initialization queue.
     * When the library is finished loading, it marks the library as ready and processes the 
     * initialization queue by calling all the functions in it.
     * @param {Function} callback - The function to call when the PDF.js library is ready.
     */
    function loadDependencies(callback) {
        if (typeof global.pdfjsLib !== 'undefined') {
            return callback();
        }
        initQueue.push(callback);
        if (isLibLoading) return;

        isLibLoading = true;
        const script = document.createElement('script');
        script.src = PDFJS_URL;

        /**
         * Called when the PDF.js library is loaded.
         * Sets the worker URL and processes the initialization queue.
         */
        script.onload = () => {
            global.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
            while (initQueue.length > 0) initQueue.shift()();
        };

        document.head.appendChild(script);
    }

    /**
     * Initializes a PDF viewer instance.
     *
     * @param {HTMLElement} container - The container element for the PDF viewer.
     * @param {Object} course - The course object with the following structure:
     * {
     *     title: string,
     *     modules: [
     *         {
     *             title: string,
     *             chapters: [
     *                 {
     *                     title: string,
     *                     pdf: string
     *                 }
     *             ]
     *         }
     *     ]
     * }
     * @param {Object} options - Optional configuration object
     * @param {Function} options.onError - Error callback function(error)
     * @param {string} options.colorTheme - Optional hex color for custom theme
     *
     * @returns {Object|null} - An instance object with the following methods and properties:
     * {
     *     currentModule: number,
     *     currentChapter: number,
     *     currentPage: number,
     *     pdfDoc: pdfjsLib.PDFDocument,
     *     renderTask: pdfjsLib.PDFPageRenderTask,
     *     nextPage: () => void,
     *     prevPage: () => void,
     *     loadChapter: (m, c) => void,
     *     setTheme: (hex) => void,
     *     destroy: () => void,
     *     onError: Function
     * } or null if initialization failed
     */
    function init(container, course, options = {}) {

        const containerValidation = validateContainer(container);

        if (!containerValidation.valid) {
            console.error(`PDFViewer: ${containerValidation.error}`);
            return null;
        }

        const courseValidation = validateCourse(course);
        if (!courseValidation.valid) {
            console.error(`PDFViewer: ${courseValidation.error}`);
            return null;
        }

        let themeColors = DEFAULT_THEME;
        if (options.colorTheme) {
            const calculatedColors = calculateThemeColors(options.colorTheme);

            if (calculatedColors) {
                themeColors = calculatedColors;

            } else {
                console.warn(`
                PDFViewer: Invalid colorTheme '${options.colorTheme}', using default theme
                `);
            }
        }

        injectStyles(themeColors);

        const instance = {
            currentModule: 0,
            currentChapter: 0,
            currentPage: 1,
            pdfDoc: null,
            renderTask: null,
            onError: options.onError || (() => { }),
            listeners: {},
            themeColors: themeColors,
            zoom: 100,
            viewportX: 0,
            viewportY: 0,
            enableTextSelection: options.enableTextSelection !== false,
            currentTextLayer: null,

            nextPage: () => goToNext(),
            prevPage: () => goToPrev(),
            loadChapter: (m, c) => loadChapter(m, c),
            setTheme: (hex) => setTheme(hex),
            setZoom: (value) => applyZoom(value),
            setTextSelectionEnabled: (enabled) => setTextSelectionEnabled(enabled),
            destroy: () => cleanup()
        };

        container.innerHTML = `
        <div class="pdf-viewer-container">
            <aside class="pdf-viewer-sidebar" role="navigation" aria-label="PDF chapters">
            </aside>
            <main class="pdf-viewer-main">
                <div class="pdf-viewer-controls" role="toolbar" aria-label="PDF viewer controls">
                    <button class="pdf-viewer-btn pdf-viewer-toggle-btn" aria-label="Toggle sidebar" aria-expanded="false">
                        ${createIcon('hamburger')}
                    </button>

                    <button class="pdf-viewer-btn prev-btn" aria-label="Previous page">
                        Previous
                    </button>

                    <button class="pdf-viewer-btn next-btn" aria-label="Next page">
                        Next
                    </button>

                    <div class="zoom-controls">
                        <button class="pdf-viewer-btn zoom-out-btn" aria-label="Zoom out" title="Zoom out">
                            ${createIcon('zoom-out')}
                        </button>

                        <input type="text" class="zoom-input" aria-label="Zoom level" placeholder="100%" value="100%">

                        <button class="pdf-viewer-btn zoom-in-btn" aria-label="Zoom in" title="Zoom in">
                            ${createIcon('zoom-in')}
                        </button>
                    </div>

                    <button class="pdf-viewer-btn fullscreen-btn" aria-label="Toggle fullscreen" title="Fullscreen (ESC to exit)">
                        ${createIcon('fullscreen')}
                    </button>
                </div>

                <div class="pdf-viewer-canvas-container" tabindex="0">
                    <canvas class="pdf-viewer-canvas" role="img" aria-label="PDF page content"></canvas>
                    <div class="pdf-viewer-text-layer"></div>
                </div>

                <div class="pdf-viewer-footer" role="status" aria-live="polite" aria-atomic="true">
                    <span class="pagination-info">
                        Page <span class="page">1</span>/<span class="pages">-</span> |
                        Chapter <span class="chapter">1</span>/<span class="chapters">-</span> |
                        Module <span class="module">1</span>/<span class="modules">-</span>
                    </span>
                </div>
            </main>

            <div class="pdf-viewer-loading-overlay" style="display:none;" aria-live="polite">
                Loading...
            </div>
        </div>
        `;
        const sidebar = container.querySelector('.pdf-viewer-sidebar');
        const canvas = container.querySelector('.pdf-viewer-canvas');
        const loading = container.querySelector('.pdf-viewer-loading-overlay');
        const ctx = canvas.getContext('2d');

        /**
         * Updates the UI with the current page number and the total number of pages in the PDF 
         * document.
         */
        const updateUI = () => {
            updateButtonStates();
            updatePaginationInfo();
        };

        /**
         * Updates the disabled state of Previous/Next buttons based on current position.
         * Disables Previous if at first page of first chapter.
         * Disables Next if at last page of last chapter.
         */
        const updateButtonStates = () => {
            const prevBtn = container.querySelector('.prev-btn');
            const nextBtn = container.querySelector('.next-btn');

            if (!prevBtn || !nextBtn || !instance.pdfDoc) return;

            // Check if at beginning (first page of first chapter)
            const isAtBeginning = instance.currentPage === 1 &&
                instance.currentChapter === 0 &&
                instance.currentModule === 0;

            // Check if at end (last page of last chapter)
            const isLastChapterOfModule = instance.currentModule === course.modules.length - 1 &&
                instance.currentChapter === course.modules[instance.currentModule].chapters.length - 1;
            const isAtEnd = instance.currentPage === instance.pdfDoc.numPages && isLastChapterOfModule;

            prevBtn.disabled = isAtBeginning;
            nextBtn.disabled = isAtEnd;
        };

        /**
         * Updates the pagination footer with current page, chapter, and module information.
         */
        const updatePaginationInfo = () => {
            if (!instance.pdfDoc) return;

            const curModule = instance.currentModule + 1;
            const totModules = course.modules.length;
            const curChapter = instance.currentChapter + 1;
            const totChapters = course.modules[instance.currentModule].chapters.length;

            const pageEl = container.querySelector('.pagination-info .page');
            const pagesEl = container.querySelector('.pagination-info .pages');
            const chapterEl = container.querySelector('.pagination-info .chapter');
            const chaptersEl = container.querySelector('.pagination-info .chapters');
            const moduleEl = container.querySelector('.pagination-info .module');
            const modulesEl = container.querySelector('.pagination-info .modules');

            if (pageEl) pageEl.textContent = instance.currentPage;
            if (pagesEl) pagesEl.textContent = instance.pdfDoc ? instance.pdfDoc.numPages : '-';
            if (chapterEl) chapterEl.textContent = curChapter;
            if (chaptersEl) chaptersEl.textContent = totChapters;
            if (moduleEl) moduleEl.textContent = curModule;
            if (modulesEl) modulesEl.textContent = totModules;
        };

        /**
         * Updates zoom UI state (input + buttons)
         */
        function updateZoomUI() {
            const zoomInput = container.querySelector('.zoom-input');
            const zoomOutBtn = container.querySelector('.zoom-out-btn');
            const zoomInBtn = container.querySelector('.zoom-in-btn');

            if (zoomInput) zoomInput.value = instance.zoom + '%';
            if (zoomOutBtn) zoomOutBtn.disabled = instance.zoom <= 100;
            if (zoomInBtn) zoomInBtn.disabled = instance.zoom >= 200;
        }


        const toggleLoading = (show) => loading.style.display = show ? 'flex' : 'none';

        // Scroll lock to prevent automatic scroll restoration during navigation
        let isNavigating = false;

        /**
         * Ensures scroll position is reset and stays at top-left (0,0)
         * Forces scroll to 0 using multiple aggressive methods
         */
        const resetScroll = () => {
            // Step 1: Disable scroll-behavior to prevent smooth scroll interference
            const originalScrollBehavior = canvasContainer.style.scrollBehavior;
            canvasContainer.style.scrollBehavior = 'auto';

            // Step 2: Multiple simultaneous scroll reset methods
            canvasContainer.scrollTop = 0;
            canvasContainer.scrollLeft = 0;
            canvasContainer.scroll(0, 0);
            canvasContainer.scrollTo(0, 0);

            // Step 3: Aggressive continuous locking during rendering
            let lockCount = 0;
            const maxLocks = 15;

            const forceLock = () => {
                if (lockCount < maxLocks & isNavigating) {
                    // Read current position
                    const currentTop = canvasContainer.scrollTop;
                    const currentLeft = canvasContainer.scrollLeft;

                    // If not at 0, force it back
                    if (currentTop !== 0 || currentLeft !== 0) {
                        canvasContainer.scrollTop = 0;
                        canvasContainer.scrollLeft = 0;
                        canvasContainer.scroll(0, 0);
                        canvasContainer.scrollTo(0, 0);
                    }

                    lockCount++;
                    requestAnimationFrame(forceLock);
                }
            };

            requestAnimationFrame(forceLock);

            // Step 4: Final cleanup and release after 600ms
            setTimeout(() => {
                isNavigating = false;
                // Restore original scroll-behavior
                canvasContainer.style.scrollBehavior = originalScrollBehavior;
            }, 600);
        };

        /**
         * Scroll event listener to prevent scroll restoration during navigation
         */
        const scrollLockHandler = (e) => {
            if (isNavigating && (canvasContainer.scrollTop !== 0 || canvasContainer.scrollLeft !== 0)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                canvasContainer.scrollTop = 0;
                canvasContainer.scrollLeft = 0;
            }
        };

        /**
         * Simple debounce utility to prevent rapid consecutive calls.
         * @param {Function} func - The function to debounce.
         * @param {number} wait - Wait time in milliseconds.
         * @returns {Function} - Debounced function.
         */
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        /**
         * Applies zoom level to the PDF (100-200%)
         * @param {number} newZoom - Zoom level (100-200)
         */
        function applyZoom(newZoom) {
            // Validate zoom (100-200, integer only)
            newZoom = Math.max(100, Math.min(200, Math.floor(newZoom)));

            if (newZoom === instance.zoom) return;

            // Save current scroll position relative to content
            const scrollContainer = canvasContainer;
            const scrollRatio = {
                x: scrollContainer.scrollWidth > 0 ? scrollContainer.scrollLeft / scrollContainer.scrollWidth : 0,
                y: scrollContainer.scrollHeight > 0 ? scrollContainer.scrollTop / scrollContainer.scrollHeight : 0
            };

            instance.zoom = newZoom;

            // Update UI
            const zoomInput = container.querySelector('.zoom-input');
            if (zoomInput) zoomInput.value = newZoom + '%';

            const zoomOutBtn = container.querySelector('.zoom-out-btn');
            const zoomInBtn = container.querySelector('.zoom-in-btn');
            if (zoomOutBtn) zoomOutBtn.disabled = newZoom <= 100;
            if (zoomInBtn) zoomInBtn.disabled = newZoom >= 200;

            updateZoomUI();

            // Re-render page with new zoom
            renderPage(instance.currentPage).then(() => {
                // Restore scroll position proportionally
                setTimeout(() => {
                    if (scrollContainer.scrollWidth > 0) {
                        scrollContainer.scrollLeft = scrollRatio.x * scrollContainer.scrollWidth;
                    }
                    if (scrollContainer.scrollHeight > 0) {
                        scrollContainer.scrollTop = scrollRatio.y * scrollContainer.scrollHeight;
                    }
                }, 0);
            });
        }

        /**
         * Zoom in by 10%
         */
        function zoomIn() {
            applyZoom(instance.zoom + 10);
        }

        /**
         * Zoom out by 10%
         */
        function zoomOut() {
            applyZoom(instance.zoom - 10);
        }

        /**
         * Renders a PDF page with the given number.
         * If the PDF document is not loaded, returns immediately.
         * If the current render task is not finished, cancels it and starts a new render task.
         * Renders at device pixel ratio for sharp display on high-DPI screens.
         * @param {Number} num - The number of the page to render.
         * @returns {Promise} - A promise that resolves when the page is rendered.
         */
        function renderPage(num) {
            if (!instance.pdfDoc || num < 1 || num > instance.pdfDoc.numPages) return;

            if (instance.renderTask) instance.renderTask.cancel();

            return instance.pdfDoc.getPage(num).then(page => {
                try {
                    // Get available width from parent container
                    const container = canvas.parentElement;
                    let availableWidth = container.clientWidth;

                    // Remove padding from available width for calculation
                    const styles = window.getComputedStyle(container);
                    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
                    const paddingRight = parseFloat(styles.paddingRight) || 0;
                    availableWidth -= (paddingLeft + paddingRight);

                    const dpr = window.devicePixelRatio || 1;
                    const viewport = page.getViewport({ scale: 1.0 });

                    // Calculate scale to fit available width with zoom applied
                    let scale = (availableWidth / viewport.width) * (instance.zoom / 100);

                    // Ensure scale is at least 1.0 to avoid unnecessary horizontal scroll at 100% zoom
                    if (instance.zoom <= 100) {
                        scale = Math.max(1.0, scale);
                    }

                    const scaledViewport = page.getViewport({ scale: scale * dpr });

                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;
                    canvas.style.width = (scaledViewport.width / dpr) + 'px';
                    canvas.style.height = (scaledViewport.height / dpr) + 'px';

                    instance.renderTask = page.render({
                        canvasContext: ctx,
                        viewport: scaledViewport
                    });

                    return instance.renderTask.promise.then(() => {
                        return renderTextLayer(page, scaledViewport);
                    });
                } catch (err) {
                    console.error('Error rendering page:', err);
                    instance.onError(
                        { type: 'render', message: 'Failed to render page', error: err }
                    );
                }
            }).catch(err => {
                if (err.name === 'RenderingCancelledException') return;
                console.error("Error rendering page:", err);
                instance.onError(
                    { type: 'render', message: 'Failed to render page', error: err }
                );
            });
        }

        /**
         * Renders a transparent text layer for text selection.
         * Leverages pdf.js TextLayerBuilder to create selectable text.
         * @param {PDFPage} page - The PDF page object
         * @param {Viewport} scaledViewport - The scaled viewport for positioning
         * @returns {Promise} - Resolves when text layer is rendered
         */
        async function renderTextLayer(page, scaledViewport) {
            if (!instance.enableTextSelection) return;

            try {
                // Get the text layer container
                const textLayerDiv = container.querySelector('.pdf-viewer-text-layer');
                if (!textLayerDiv) return;

                // Clear previous text layer
                textLayerDiv.innerHTML = '';

                // Get text content from the page
                const textContent = await page.getTextContent();

                // Create TextLayerBuilder instance
                const textLayerBuilder = new pdfjsLib.TextLayerBuilder({
                    textLayerDiv: textLayerDiv,
                    pageIndex: page.pageIndex,
                    viewport: scaledViewport,
                    textContent: textContent,
                    enhanceTextSelection: true
                });

                // Render the text layer
                textLayerBuilder.render();

                // Store reference for cleanup
                instance.currentTextLayer = textLayerBuilder;
            } catch (err) {
                console.warn('Failed to render text layer:', err);
                // Continue gracefully - text layer is optional
            }
        }

        /**
         * Enable or disable text selection at runtime.
         * @param {boolean} enabled - Whether to enable text selection
         */
        function setTextSelectionEnabled(enabled) {
            instance.enableTextSelection = enabled;
            const textLayer = container.querySelector('.pdf-viewer-text-layer');
            if (textLayer) {
                if (enabled) {
                    textLayer.style.pointerEvents = 'auto';
                    textLayer.classList.remove('disabled');
                } else {
                    textLayer.style.pointerEvents = 'none';
                    textLayer.classList.add('disabled');
                }
            }
        }

        /**
         * Loads a chapter from the course.
         * @param {number} mIndex The index of the module to load.
         * @param {number} cIndex The index of the chapter to load.
         */
        function loadChapter(mIndex, cIndex) {
            const chapter = course.modules[mIndex]?.chapters[cIndex];
            if (!chapter) {
                const err = `
                    Invalid module or chapter index: module=${mIndex}, chapter=${cIndex}
                `;
                console.error(err);
                instance.onError({ type: 'load', message: err });
                return;
            }

            isNavigating = true;

            toggleLoading(true);
            instance.currentModule = mIndex;
            instance.currentChapter = cIndex;
            instance.zoom = 100;

            loadDependencies(() => {
                try {
                    pdfjsLib.getDocument(chapter.pdf).promise.then(doc => {
                        instance.pdfDoc = doc;
                        instance.currentPage = 1;
                        renderPage(1).then(() => {
                            resetScroll();
                            updateZoomUI();
                        });
                        updateUI();
                        renderSidebar();
                    }).catch(err => {
                        console.error("Error loading PDF:", err);
                        instance.onError(
                            {
                                type: 'load',
                                message: `Failed to load PDF from ${chapter.pdf}`,
                                error: err
                            }
                        );
                        const modTitle = course.modules[mIndex].title;
                        alert(`Error loading PDF: ${modTitle} > ${chapter.title}`);
                    })
                        .finally(() => toggleLoading(false));
                } catch (err) {
                    console.error("Error setting up PDF loading:", err);
                    instance.onError(
                        {
                            type: 'load',
                            message: 'Failed to set up PDF loading',
                            error: err
                        }
                    );
                    toggleLoading(false);
                }
            });
        }

        /**
         * Renders the sidebar with the course modules and chapters.
         * The active chapter is highlighted.
         */
        function renderSidebar() {
            sidebar.innerHTML = `<div style="padding:20px; font-weight:bold; border-bottom:1px solid #444;">${course.title}</div>`;
            course.modules.forEach((mod, mIdx) => {
                mod.chapters.forEach((chap, cIdx) => {
                    const item = document.createElement('div');
                    item.className = `
                        pdf-viewer-chapter-item ${mIdx === instance.currentModule && cIdx === instance.currentChapter ? 'active' : ''}`;
                    item.innerHTML = `
                        <small style="display:block; opacity:0.7">${mod.title}</small> ${chap.title}`;
                    item.onclick = () => {
                        loadChapter(mIdx, cIdx);
                        if (window.innerWidth < 768) sidebar.classList.remove('open');
                    };
                    sidebar.appendChild(item);
                });
            });
        }

        /**
         * Goes to the next page.
         * If the current page is the last page of the current chapter,
         * it will load the next chapter if available.
         * If the current chapter is the last chapter of the course,
         * it will do nothing.
         */
        function goToNext() {
            if (instance.currentPage < instance.pdfDoc.numPages) {
                isNavigating = true;
                instance.currentPage++;
                instance.zoom = 100;
                renderPage(instance.currentPage).then(() => {
                    resetScroll();
                    updateZoomUI();
                });
                updateUI();
            } else {
                if (course.modules[instance.currentModule].chapters[instance.currentChapter + 1]) {
                    loadChapter(instance.currentModule, instance.currentChapter + 1);
                } else if (course.modules[instance.currentModule + 1]) {
                    loadChapter(instance.currentModule + 1, 0);
                }
            }
        }


        /**
         * Goes to the previous page.
         * If currently at the first page of the PDF, goes to the previous chapter if available.
         */
        function goToPrev() {
            if (instance.currentPage > 1) {
                isNavigating = true;
                instance.currentPage--;
                instance.zoom = 100;
                renderPage(instance.currentPage).then(() => {
                    resetScroll();
                    updateZoomUI();
                });
                updateUI();
            } else {
                if (instance.currentChapter > 0) {
                    loadChapter(instance.currentModule, instance.currentChapter - 1);
                }
            }
        }


        // Debounced resize render to prevent excessive rendering
        const debouncedRender = debounce(() => {
            if (instance.pdfDoc) renderPage(instance.currentPage);
        }, RENDER_DEBOUNCE_DELAY);

        const nextBtn = container.querySelector('.next-btn');
        const prevBtn = container.querySelector('.prev-btn');
        const toggleBtn = container.querySelector('.pdf-viewer-toggle-btn');
        const fullscreenBtn = container.querySelector('.fullscreen-btn');
        const canvasContainer = container.querySelector('.pdf-viewer-canvas-container');

        // Focus listener - clicking PDF area gives it focus for scroll control
        canvasContainer.addEventListener('click', () => canvasContainer.focus());

        // Scroll lock listener - prevents scroll restoration during navigation
        canvasContainer.addEventListener('scroll', scrollLockHandler, true);

        // Fullscreen state management
        instance.isFullscreen = false;

        // Sidebar collapse state management
        const SIDEBAR_STORAGE_KEY = 'pdfViewer_sidebarCollapsed';
        instance.sidebarCollapsed = Storage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
        if (instance.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }

        function toggleFullscreen() {
            instance.isFullscreen = !instance.isFullscreen;
            const pdfContainer = container.querySelector('.pdf-viewer-main');

            if (instance.isFullscreen) {
                pdfContainer.classList.add('fullscreen');
                fullscreenBtn.setAttribute('aria-pressed', 'true');
            } else {
                pdfContainer.classList.remove('fullscreen');
                fullscreenBtn.setAttribute('aria-pressed', 'false');
            }
        }

        nextBtn.onclick = goToNext;
        prevBtn.onclick = goToPrev;
        fullscreenBtn.onclick = toggleFullscreen;
        toggleBtn.onclick = () => {
            // On mobile: toggle sidebar visibility (open/close)
            // On desktop: toggle sidebar collapse state
            if (window.innerWidth < 768) {
                const isOpen = sidebar.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', isOpen);
            } else {
                // Desktop: toggle collapse state
                instance.sidebarCollapsed = !instance.sidebarCollapsed;
                sidebar.classList.toggle('collapsed');
                Storage.setItem(SIDEBAR_STORAGE_KEY, instance.sidebarCollapsed);
                toggleBtn.setAttribute('aria-pressed', instance.sidebarCollapsed);
            }
        };

        // Zoom controls
        const zoomOutBtn = container.querySelector('.zoom-out-btn');
        const zoomInBtn = container.querySelector('.zoom-in-btn');
        const zoomInput = container.querySelector('.zoom-input');

        if (zoomOutBtn) zoomOutBtn.onclick = zoomOut;
        if (zoomInBtn) zoomInBtn.onclick = zoomIn;

        if (zoomInput) {
            zoomInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    let value = parseInt(zoomInput.value);
                    if (!isNaN(value)) {
                        applyZoom(value);
                    } else {
                        zoomInput.value = instance.zoom + '%';
                    }
                }
            });
            zoomInput.addEventListener('blur', () => {
                if (!/^\d{3}%?$/.test(zoomInput.value.trim())) {
                    zoomInput.value = instance.zoom + '%';
                }
            });
        }

        /**
         * Keydown event handler for navigating PDF pages with arrow keys and fullscreen toggle.
         * @param {KeyboardEvent} e - The event object.
         * @returns {void}
         */
        const keyHandler = (e) => {
            if (!container.contains(document.activeElement)) return;
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
            if (e.key === "Escape" && instance.isFullscreen) {
                toggleFullscreen();
            }
        };

        // Store event listener for cleanup
        instance.listeners.keyHandler = keyHandler;

        document.addEventListener('keydown', keyHandler);

        // Focus-based scroll handler to prevent overflow scrolling
        const wheelHandler = (e) => {
            // Only handle scroll when PDF container has focus
            if (canvasContainer === document.activeElement || canvasContainer.contains(e.target)) {
                // PDF container has focus
                const container = canvasContainer;
                const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
                const isAtTop = container.scrollTop === 0;
                const scrollingDown = e.deltaY > 0;
                const scrollingUp = e.deltaY < 0;

                // Prevent default if we're at the boundaries and trying to scroll outward
                if ((isAtBottom && scrollingDown) || (isAtTop && scrollingUp)) {
                    e.preventDefault();
                }
                return;
            }
            // Outside PDF focus - allow page scroll normally
        };

        instance.listeners.wheelHandler = wheelHandler;
        // Use non-passive listener to allow preventDefault
        canvasContainer.addEventListener('wheel', wheelHandler, { passive: false });

        const ro = new ResizeObserver(debouncedRender);
        ro.observe(canvas.parentElement);

        // Store ResizeObserver for cleanup
        instance.resizeObserver = ro;

        /**
         * Sets a new color theme for the viewer.
         * @param {string} hex - Hex color for the new theme
         */
        function setTheme(hex) {
            const newColors = calculateThemeColors(hex);
            if (!newColors) {
                console.warn(`PDFViewer: Invalid color theme '${hex}', theme not changed`);
                return false;
            }
            instance.themeColors = newColors;
            injectStyles(newColors);
            return true;
        }

        /**
         * Cleanup function to remove all event listeners and observers.
         * Call this before destroying the viewer instance.
         */
        function cleanup() {
            document.removeEventListener('keydown', keyHandler);
            const canvasContainer = container.querySelector('.pdf-viewer-canvas-container');
            if (canvasContainer && instance.listeners.wheelHandler) {
                canvasContainer.removeEventListener('wheel', instance.listeners.wheelHandler);
            }
            if (canvasContainer) {
                canvasContainer.removeEventListener('scroll', scrollLockHandler, true);
            }
            if (instance.resizeObserver) instance.resizeObserver.disconnect();
            if (instance.renderTask) instance.renderTask.cancel();
            if (instance.currentTextLayer) {
                instance.currentTextLayer.cancel();
                instance.currentTextLayer = null;
            }
        }

        updateZoomUI();
        loadChapter(0, 0);

        return instance;
    }

    global.PDFViewer = { init };
})(window);
