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
    let libReady = false;
    const initQueue = [];

    // Configuration constants
    const DEBOUNCE_DELAY = 250; // ms
    const CONTAINER_PADDING = 40; // px
    const MIN_TOUCH_TARGET_SIZE = 44; // px for accessibility
    const RENDER_DEBOUNCE_DELAY = 150; // ms

    /**
     * Injects CSS styles for the PDF viewer into the document head.
     * If the 'pdf-viewer-styles' element already exists, this function does nothing.
     * @returns {void}
    */
    const injectStyles = () => {
        if (document.getElementById('pdf-viewer-styles')) return;
        const style = document.createElement('style');
        style.id = 'pdf-viewer-styles';
        style.textContent = `
            .pdf-viewer-container { display: flex; height: 100%; width: 100%; font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; overflow: hidden; position: relative; }
            .pdf-viewer-sidebar { position: absolute; top: 0; left: -100%; width: 280px; height: 100%; background: #2c3e50; color: #fff; transition: all 0.3s ease; z-index: 1001; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.2); }
            .pdf-viewer-sidebar.open { left: 0; }
            .pdf-viewer-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
            .pdf-viewer-controls { display: flex; align-items: center; justify-content: center; gap: 15px; padding: 10px; background: #fff; border-bottom: 1px solid #ddd; z-index: 10; }
            .pdf-viewer-canvas-container { flex: 1; overflow: auto; display: flex; justify-content: center; align-items: flex-start; padding: 20px; background: #525659; }
            .pdf-viewer-canvas { max-width: 100%; height: auto; box-shadow: 0 0 15px rgba(0,0,0,0.3); background: #fff; }
            .pdf-viewer-loading-overlay { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 20; }
            .pdf-viewer-chapter-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #34495e; transition: background 0.2s; }
            .pdf-viewer-chapter-item:hover { background: #3d566e; }
            .pdf-viewer-chapter-item.active { background: #3498db; border-left: 4px solid #fff; }
            .pdf-viewer-btn { padding: 10px 16px; min-height: 44px; min-width: 44px; border: none; border-radius: 4px; cursor: pointer; background: #3498db; color: white; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
            .pdf-viewer-btn:hover { background: #2980b9; }
            .pdf-viewer-btn:active { background: #1f618d; }
            .pdf-viewer-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
            @media (min-width: 768px) {
                .pdf-viewer-sidebar { position: relative; left: 0; }
                .pdf-viewer-toggle-btn { display: none; }
            }
        `;
        document.head.appendChild(style);
    };

    /**
     * Validates course data structure.
     * @param {Object} course - The course object to validate.
     * @returns {Object} - Validation result with {valid: boolean, error: string|null}
     */
    const validateCourse = (course) => {
        if (!course) return { valid: false, error: 'Course object is required.' };
        if (typeof course.title !== 'string') return { valid: false, error: 'Course must have a title (string).' };
        if (!Array.isArray(course.modules)) return { valid: false, error: 'Course must have modules array.' };
        if (course.modules.length === 0) return { valid: false, error: 'Course must have at least one module.' };

        for (let m = 0; m < course.modules.length; m++) {
            const mod = course.modules[m];
            if (typeof mod.title !== 'string') return { valid: false, error: `Module ${m} must have a title.` };
            if (!Array.isArray(mod.chapters)) return { valid: false, error: `Module ${m} must have chapters array.` };
            if (mod.chapters.length === 0) return { valid: false, error: `Module ${m} must have at least one chapter.` };

            for (let c = 0; c < mod.chapters.length; c++) {
                const ch = mod.chapters[c];
                if (typeof ch.title !== 'string') return { valid: false, error: `Module ${m}, Chapter ${c} must have a title.` };
                if (typeof ch.pdf !== 'string') return { valid: false, error: `Module ${m}, Chapter ${c} must have a pdf URL.` };
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
        if (!container) return { valid: false, error: 'Container element is required.' };
        if (!(container instanceof HTMLElement)) return { valid: false, error: 'Container must be an HTML element.' };
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
            libReady = true;
            return callback();
        }
        initQueue.push(callback);
        if (isLibLoading) return;

        isLibLoading = true;
        const script = document.createElement('script');
        script.src = PDFJS_URL;

        /**
         * Called when the PDF.js library is loaded.
         * Sets the worker URL and marks the library as ready.
         * Then, it processes the initialization queue by calling all the functions in it.
         */
        script.onload = () => {
            global.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
            libReady = true;
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

        injectStyles();

        const instance = {
            currentModule: 0,
            currentChapter: 0,
            currentPage: 1,
            pdfDoc: null,
            renderTask: null,
            onError: options.onError || (() => {}),
            listeners: {},

            nextPage: () => goToNext(),
            prevPage: () => goToPrev(),
            loadChapter: (m, c) => loadChapter(m, c),
            destroy: () => cleanup()
        };

        container.innerHTML = `
            <div class="pdf-viewer-container">
                <aside class="pdf-viewer-sidebar" role="navigation" aria-label="PDF chapters">
                </aside>
                <main class="pdf-viewer-main">
                    <div class="pdf-viewer-controls" role="toolbar" aria-label="PDF viewer controls">
                        <button class="pdf-viewer-btn pdf-viewer-toggle-btn" aria-label="Toggle sidebar" aria-expanded="false">&#9776;</button>
                        <button class="pdf-viewer-btn prev-btn" aria-label="Previous page">Previous</button>
                        <span class="page-info" aria-live="polite" aria-atomic="true">Page: <span class="cur">1</span> / <span class="tot">-</span></span>
                        <button class="pdf-viewer-btn next-btn" aria-label="Next page">Next</button>
                    </div>
                    <div class="pdf-viewer-canvas-container">
                        <canvas class="pdf-viewer-canvas" role="img" aria-label="PDF page content"></canvas>
                    </div>
                </main>
                <div class="pdf-viewer-loading-overlay" style="display:none;" aria-live="polite">Loading...</div>
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
            container.querySelector('.cur').textContent = instance.currentPage;
            container.querySelector('.tot').textContent = instance.pdfDoc ? instance.pdfDoc.numPages : '-';
        };

        const toggleLoading = (show) => loading.style.display = show ? 'flex' : 'none';

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
                    const containerWidth = canvas.parentElement.clientWidth - CONTAINER_PADDING;
                    const dpr = window.devicePixelRatio || 1;
                    const viewport = page.getViewport({ scale: 1.0 });
                    const scale = containerWidth / viewport.width;
                    const scaledViewport = page.getViewport({ scale: scale * dpr });

                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;
                    canvas.style.width = (scaledViewport.width / dpr) + 'px';
                    canvas.style.height = (scaledViewport.height / dpr) + 'px';

                    instance.renderTask = page.render({
                        canvasContext: ctx,
                        viewport: scaledViewport
                    });

                    return instance.renderTask.promise;
                } catch (err) {
                    console.error('Error rendering page:', err);
                    instance.onError({ type: 'render', message: 'Failed to render page', error: err });
                }
            }).catch(err => {
                if (err.name === 'RenderingCancelledException') return;
                console.error("Error rendering page:", err);
                instance.onError({ type: 'render', message: 'Failed to render page', error: err });
            });
        }

        /**
         * Loads a chapter from the course.
         * @param {number} mIndex The index of the module to load.
         * @param {number} cIndex The index of the chapter to load.
         */
        function loadChapter(mIndex, cIndex) {
            const chapter = course.modules[mIndex]?.chapters[cIndex];
            if (!chapter) {
                const err = `Invalid module or chapter index: module=${mIndex}, chapter=${cIndex}`;
                console.error(err);
                instance.onError({ type: 'load', message: err });
                return;
            }

            toggleLoading(true);
            instance.currentModule = mIndex;
            instance.currentChapter = cIndex;

            loadDependencies(() => {
                try {
                    pdfjsLib.getDocument(chapter.pdf).promise.then(doc => {
                        instance.pdfDoc = doc;
                        instance.currentPage = 1;
                        renderPage(1);
                        updateUI();
                        renderSidebar();
                    }).catch(err => {
                        console.error("Error loading PDF:", err);
                        instance.onError({ type: 'load', message: `Failed to load PDF from ${chapter.pdf}`, error: err });
                        const modTitle = course.modules[mIndex].title;
                        alert(`Error loading PDF: ${modTitle} > ${chapter.title}`);
                    })
                    .finally(() => toggleLoading(false));
                } catch (err) {
                    console.error("Error setting up PDF loading:", err);
                    instance.onError({ type: 'load', message: 'Failed to set up PDF loading', error: err });
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
                    item.className = `pdf-viewer-chapter-item ${mIdx === instance.currentModule && cIdx === instance.currentChapter ? 'active' : ''}`;
                    item.innerHTML = `<small style="display:block; opacity:0.7">${mod.title}</small> ${chap.title}`;
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
                instance.currentPage++;
                renderPage(instance.currentPage);
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
                instance.currentPage--;
                renderPage(instance.currentPage);
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

        nextBtn.onclick = goToNext;
        prevBtn.onclick = goToPrev;
        toggleBtn.onclick = () => {
            const isOpen = sidebar.classList.toggle('open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
        };

        /**
         * Keydown event handler for navigating PDF pages with arrow keys.
         * @param {KeyboardEvent} e - The event object.
         * @returns {void}
         */
        const keyHandler = (e) => {
            if (!container.contains(document.activeElement)) return;
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
        };

        // Store event listener for cleanup
        instance.listeners.keyHandler = keyHandler;

        document.addEventListener('keydown', keyHandler);

        const ro = new ResizeObserver(debouncedRender);
        ro.observe(canvas.parentElement);

        // Store ResizeObserver for cleanup
        instance.resizeObserver = ro;

        /**
         * Cleanup function to remove all event listeners and observers.
         * Call this before destroying the viewer instance.
         */
        function cleanup() {
            document.removeEventListener('keydown', keyHandler);
            if (instance.resizeObserver) instance.resizeObserver.disconnect();
            if (instance.renderTask) instance.renderTask.cancel();
        }

        loadChapter(0, 0);

        return instance;
    }

    global.PDFViewer = { init };
})(window);
