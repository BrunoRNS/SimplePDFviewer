# SimplePDFviewer Usage Guide

A lightweight, standalone JavaScript PDF viewer library that wraps Mozilla's pdf.js library with a modular course/chapter interface and responsive UI, making it easy to integrate into your web applications.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [Basic Usage](#basic-usage)
5. [API Reference](#api-reference)
6. [Course Data Format](#course-data-format)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)
9. [Examples](#examples)
10. [Browser Support](#browser-support)
11. [Performance Tips](#performance-tips)
12. [Limitations & Known Issues](#limitations--known-issues)

## Quick Start

**Get running in 5 minutes:**

> **Important**: The library exports as `PDFViewer`, **not** `SimplePDFviewer`. Always use `PDFViewer.init()` to initialize the viewer.

1. Add the script to your HTML:

    ```html
    <div id="viewer" style="height: 100vh;"></div>

    <script src="https://cdn.jsdelivr.net/gh/BrunoRNS/SimplePDFviewer@latest/min/core.min.js"></script>
    <script>
        const course = {
            title: "My Course",
            modules: [{
                title: "Module 1",
                chapters: [{
                    title: "Chapter 1",
                    pdf: "path/to/pdf.pdf"
                }]
            }]
        };

        PDFViewer.init(document.getElementById('viewer'), course);
    </script>
    ```

2. Style the container (set height and width):

    ```html
    <style>
        #viewer { height: 100vh; width: 100%; }
    </style>
    ```

That's it! You now have a fully functional PDF viewer with navigation and chapter sidebar.

## Installation

### Option 1: CDN (Recommended for most use cases)

```html
<script src="https://cdn.jsdelivr.net/gh/BrunoRNS/SimplePDFviewer@latest/min/core.min.js"></script>
```

### Option 2: Local File

Download `min/core.min.js` from the repository and include it:

```html
<script src="./core.min.js"></script>
```

### Option 3: Development Version

For development, use the unminified version from `src/`:

```html
<script src="./src/SimplePDFviewer.js"></script>
```

## Core Concepts

SimplePDFviewer organizes PDFs into a hierarchical structure:

- **Course**: The root container with a title and modules
- **Module**: A collection of chapters (e.g., "Chapter 1", "Chapter 2")
- **Chapter**: Individual PDF documents with titles and URLs

This structure allows you to organize related PDFs and navigate between them seamlessly.

### Navigation Features

- **Sidebar**: Lists all chapters for quick access
- **Previous/Next buttons**: Navigate pages within a PDF or jump to the next/previous chapter
- **Keyboard navigation**: Use arrow keys (←/→) to navigate
- **Responsive design**: Sidebar collapses on mobile, toggleable with menu button
- **Auto-scaling**: PDF pages automatically scale to fit the container

## Basic Usage

### 1. Create Course Data

```javascript
const course = {
  title: "Introduction to JavaScript",
  modules: [
    {
      title: "Fundamentals",
      chapters: [
        {
          title: "Variables & Types",
          pdf: "https://example.com/variables.pdf"
        },
        {
          title: "Functions",
          pdf: "https://example.com/functions.pdf"
        }
      ]
    },
    {
      title: "Advanced Topics",
      chapters: [
        {
          title: "Closures",
          pdf: "https://example.com/closures.pdf"
        }
      ]
    }
  ]
};
```

### 2. Initialize the Viewer

```javascript
const viewer = PDFViewer.init(
  document.getElementById('viewer'),
  course,
  {
    onError: (error) => {
      console.error('PDF Error:', error);
    }
  }
);
```

### 3. Use Viewer Methods

```javascript
// Navigate to next page
viewer.nextPage();

// Navigate to previous page
viewer.prevPage();

// Load a specific chapter
viewer.loadChapter(0, 1); // Module 0, Chapter 1

// Access current state
console.log(viewer.currentModule);    // 0
console.log(viewer.currentChapter);   // 0
console.log(viewer.currentPage);      // 1
console.log(viewer.pdfDoc);           // pdf.js document object

// Clean up when done
viewer.destroy();
```

## API Reference

### PDFViewer.init(container, course, options)

Initializes a PDF viewer instance.

**Parameters:**

- `container` (HTMLElement, required): The DOM element where the viewer will be rendered
- `course` (Object, required): Course data object with structure detailed in [Course Data Format](#course-data-format)
- `options` (Object, optional): Configuration options
  - `onError` (Function): Callback function for error handling. Called with error object: `{ type, message, error }`

**Returns:**

Instance object or `null` if initialization fails.

**Example:**

```javascript
const viewer = PDFViewer.init(
  document.getElementById('viewer'),
  courseData,
  {
    onError: (err) => {
      console.error(`${err.type} error: ${err.message}`);
    }
  }
);

if (!viewer) {
  console.error('Failed to initialize viewer');
}
```

### Instance Methods

#### nextPage()

Navigate to the next page. If at the end of a chapter, loads the next chapter.

```javascript
viewer.nextPage();
```

#### prevPage()

Navigate to the previous page. If at the beginning of a chapter, loads the previous chapter.

```javascript
viewer.prevPage();
```

#### loadChapter(moduleIndex, chapterIndex)

Load a specific chapter by module and chapter indices.

```javascript
viewer.loadChapter(0, 2); // Load Chapter 2 from Module 0

if (viewer.pdfDoc) {
  console.log(`Loaded ${viewer.pdfDoc.numPages} pages`);
}
```

#### destroy()

Clean up the viewer instance. Removes event listeners and cancels rendering tasks.

```javascript
viewer.destroy();
```

### Instance Properties

- `currentModule` (number): Index of current module (0-based)
- `currentChapter` (number): Index of current chapter (0-based)
- `currentPage` (number): Current page number (1-based)
- `pdfDoc` (pdfjsLib.PDFDocument): The pdf.js document object (null before loading)
- `renderTask` (pdfjsLib.RenderTask): Current render task (null if not rendering)
- `onError` (Function): Error callback function

## Course Data Format

The course object must follow this structure:

```javascript
{
  title: "string",           // Required: Course title
  modules: [                 // Required: Array of modules
    {
      title: "string",       // Required: Module title
      chapters: [            // Required: Array of chapters
        {
          title: "string",   // Required: Chapter title
          pdf: "string"      // Required: PDF URL (must be accessible/CORS-enabled)
        },
        // ... more chapters
      ]
    },
    // ... more modules
  ]
}
```

### Validation Rules

- `title`: Must be a non-empty string
- `modules`: Must be a non-empty array
- Each module must have a `title` and `chapters` array
- Each chapter must have a `title` and `pdf` URL
- All required fields are validated at initialization

### Example with IDs (Optional)

You can add extra properties for your own tracking:

```javascript
const course = {
  id: "course-001",
  title: "Advanced JavaScript",
  modules: [
    {
      id: "mod-101",
      title: "Core Concepts",
      chapters: [
        {
          id: "ch-1001",
          title: "Chapter 1",
          pdf: "https://example.com/ch1.pdf"
        }
      ]
    }
  ]
};
```

## Customization

### 1. Styling with CSS

SimplePDFviewer injects default CSS classes. Override them with your own styles:

```html
<style>
  /* Container and layout */
  .pdf-viewer-container { /* Main container */ }
  .pdf-viewer-main { /* Main content area */ }
  .pdf-viewer-sidebar { /* Left sidebar */ }
  .pdf-viewer-controls { /* Top control bar */ }
  .pdf-viewer-canvas-container { /* Canvas wrapper */ }

  /* Canvas and loading */
  .pdf-viewer-canvas { /* PDF canvas */ }
  .pdf-viewer-loading-overlay { /* Loading indicator */ }

  /* Chapters list */
  .pdf-viewer-chapter-item { /* Chapter in sidebar */ }
  .pdf-viewer-chapter-item:hover { /* Chapter hover state */ }
  .pdf-viewer-chapter-item.active { /* Active chapter */ }

  /* Buttons */
  .pdf-viewer-btn { /* All buttons */ }
  .pdf-viewer-btn:hover { /* Button hover */ }
  .pdf-viewer-btn:disabled { /* Disabled button */ }
  .pdf-viewer-toggle-btn { /* Menu toggle button */ }
</style>
```

### 2. Custom Colors

```css
.pdf-viewer-sidebar {
  background: #1a1a1a;  /* Dark sidebar */
  color: #ffffff;
}

.pdf-viewer-btn {
  background: #0066cc;  /* Custom blue */
}

.pdf-viewer-btn:hover {
  background: #0052a3;
}

.pdf-viewer-chapter-item.active {
  background: #0066cc;
}
```

### 3. Custom Container Size

```html
<style>
  #viewer {
    height: 800px;
    width: 100%;
    border: 2px solid #ccc;
  }
</style>
```

### 4. Error Handling

```javascript
const viewer = PDFViewer.init(container, course, {
  onError: (error) => {
    const { type, message, error: err } = error;

    switch(type) {
      case 'load':
        console.error('Failed to load PDF:', message);
        break;
      case 'render':
        console.error('Failed to render page:', message);
        break;
      default:
        console.error('Error:', message);
    }

    // You could show a user-friendly message
    if (type === 'load') {
      showNotification('Failed to load PDF. Please try again.');
    }
  }
});
```

## Troubleshooting

### 1. PDF Fails to Load

**Symptoms:** Error alert after clicking a chapter, "Error loading PDF" message

**Solutions:**

- **Check CORS**: The PDF URL must be CORS-enabled. If hosting on a different domain, configure your server:

  ```sh
  Access-Control-Allow-Origin: *
  ```

- **Verify URL**: Ensure the PDF URL is correct and accessible:

  ```javascript
  // Test in browser console
  fetch('your-pdf-url').then(r => console.log(r.status))
  ```

- **Browser Console**: Check browser console for detailed error messages (F12 → Console tab)

### 2. Sidebar Not Showing on Mobile

**Symptoms:** Chapters sidebar is hidden on mobile devices

**Expected behavior:** The sidebar is hidden by default on mobile (<768px width) and can be toggled with the menu button (☰).

**Solution:** Use the hamburger menu button to toggle the sidebar, or increase your browser window width.

### 3. PDF.js Worker Not Loading

**Symptoms:** Console error about "pdf.worker.min.js"

**Possible causes:**

- CDN is blocked or inaccessible
- Script is hosted offline without CORS configuration

**Solution:**

- Check internet connection
- Check browser console for network errors
- For offline use, download both `pdf.min.js` and `pdf.worker.min.js` and update URLs

### 4. Canvas Rendering Issues

**Symptoms:** Blank canvas, blurry text, or rendering errors

**Solutions:**

- **Verify PDF validity**: The PDF might be corrupted. Test with a known-good PDF
- **Check container size**: Ensure the container has dimensions (height/width)
- **Clear browser cache**: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)

### 5. High CPU Usage

**Symptoms:** Browser feels slow, high CPU usage in Task Manager

**Possible causes:**

- Rapidly resizing window
- Large PDF with many pages

**Solutions:**

- Debouncing is built in, but rendering triggers on resize. This is expected behavior for dynamic sizing.
- Use smaller PDFs or convert large PDFs to multiple chapters

## Examples

### Example 1: Basic Local PDFs

Load PDFs from your local server:

```javascript
const course = {
  title: "Training Materials",
  modules: [
    {
      title: "Week 1",
      chapters: [
        { title: "Monday", pdf: "/pdfs/monday.pdf" },
        { title: "Tuesday", pdf: "/pdfs/tuesday.pdf" },
        { title: "Wednesday", pdf: "/pdfs/wednesday.pdf" }
      ]
    },
    {
      title: "Week 2",
      chapters: [
        { title: "Thursday", pdf: "/pdfs/thursday.pdf" },
        { title: "Friday", pdf: "/pdfs/friday.pdf" }
      ]
    }
  ]
};

PDFViewer.init(document.getElementById('viewer'), course);
```

### Example 2: Error Handling with User Feedback

```javascript
const viewer = PDFViewer.init(container, course, {
  onError: (error) => {
    const message = error.type === 'load'
      ? 'Unable to load PDF. Check your internet connection.'
      : 'Failed to display PDF. Please try with another browser.';

    document.getElementById('error-message').textContent = message;
  }
});
```

### Example 3: Remote PDFs with Dynamic Loading

```javascript
// Load course data from API
fetch('/api/course')
  .then(res => res.json())
  .then(course => {
    const viewer = PDFViewer.init(
      document.getElementById('viewer'),
      course
    );
  });
```

### Example 4: Multiple Viewers on Same Page

```javascript
const course1 = { /* ... */ };
const course2 = { /* ... */ };

const viewer1 = PDFViewer.init(
  document.getElementById('viewer1'),
  course1
);

const viewer2 = PDFViewer.init(
  document.getElementById('viewer2'),
  course2
);

// Navigate both independently
viewer1.nextPage();
viewer2.loadChapter(0, 1);
```

### Example 5: Manual Navigation Control

```javascript
const viewer = PDFViewer.init(container, course);

// Custom button controls
document.getElementById('jump-to-chapter-2').onclick = () => {
  viewer.loadChapter(0, 2);
};

// Display current progress
document.getElementById('progress').textContent =
  `Module ${viewer.currentModule + 1}, ` +
  `Chapter ${viewer.currentChapter + 1}, ` +
  `Page ${viewer.currentPage} of ${viewer.pdfDoc?.numPages || '?'}`;
```

## Browser Support

| Browser       | Version  | Status                    |
|---------------|----------|---------------------------|
| Chrome        | 45+      | Full support              |
| Firefox       | 40+      | Full support              |
| Safari        | 10+      | Full support              |
| Edge          | 12+      | Full support              |
| IE            | 11       | Limited (no canvas HiDPI) |
| Mobile Chrome | Latest 2 | Full support              |
| Mobile Safari | Latest 2 | Full support              |

**Note:** Uses ResizeObserver and other modern APIs. For older browsers, consider using polyfills.

## Performance Tips

### 1. Optimize PDF Files

- **Compress PDFs**: Use tools like ImageMagick or GhostScript to reduce file size
- **Remove unnecessary content**: Delete unused fonts, images, and annotations
- **Split large documents**: Break very large PDFs into multiple chapters

### 2. Caching

Print-to-PDF usually compresses well. For web-native PDFs, ensure your server sends proper cache headers:

```sh
Cache-Control: public, max-age=31536000
```

### 3. Content Delivery

- Use a CDN to serve PDFs from servers closest to users
- Compress responses with gzip

### 4. Initial Load

- Don't preload all PDFs, load on-demand
- Consider showing a preview or loading spinner

### 5. Memory Management

- Call `viewer.destroy()` when done with a viewer instance
- Close unused viewer instances
- For multiple viewers, limit active instances

## Limitations & Known Issues

### Limitations

1. **No text selection** in PDFs (by design for simplicity)
2. **No search functionality** (use pdf.js directly if needed)
3. **No zoom controls** (use CSS transforms for workaround)
4. **No annotations** (view-only)
5. **Performance degrades** with very large PDFs (500+ pages per chapter)

### Known Issues

1. **CORS requirement**: PDFs must be from CORS-enabled servers
2. **Worker requirement**: pdf.js worker must be accessible
3. **Mobile sidebar**: Sidebar auto-closes after chapter selection for UX
4. **High-DPI rendering**: Slightly higher memory usage on Retina/4K displays

### Workarounds

**For zoom:**

```css
.pdf-viewer-canvas-container {
  transform: scale(1.2);
  transform-origin: top center;
}
```

**For search:**
Consider using the full pdf.js library or adding a search layer over the viewer.

---

## Need Help?

- **GitHub Issues**: [Issues](https://github.com/BrunoRNS/SimplePDFviewer/issues)
- **Documentation**: [SimplePDFviewer Home Page](https://github.com/BrunoRNS/SimplePDFviewer)
- **pdf.js Docs**: [PDF.js Home Page](https://mozilla.github.io/pdf.js/)

## License

MIT License - See LICENSE.txt for details

## Credits

- [pdf.js](https://mozilla.github.io/pdf.js/)
- [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

---

> This project, SimplePDFviewer, is not affiliated with Mozilla, the developers of the pdf.js library that it uses. While the project is open-source and free to use, it is not officially endorsed or supported by Mozilla. If you have any issues or need help with the viewer, please refer to the GitHub issues page or the documentation provided in the repository.
