# SimplePDFviewer

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/Version-rolling-blue.svg)
![Browser Support](https://img.shields.io/badge/Browser-Modern%20+%20Mobile-brightgreen.svg)

A lightweight, standalone JavaScript PDF viewer library that wraps Mozilla's pdf.js with a modular course/chapter interface and responsive UI. Perfect for viewing educational materials, documentation, and multi-chapter documents.

## Features

- **Modular Interface** - Organize PDFs into courses, modules, and chapters.
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile.
- **Lightweight** - Only ~15KB minified (plus ~300KB pdf.js).
- **Customizable** - Full CSS styling and theme support.
- **Accessible** - ARIA labels, keyboard navigation, semantic HTML.
- **Performance Optimized** - Debounced rendering, high-DPI support, efficient memory management.
- **Auto-Scaling** - PDFs automatically fit container width.
- **Zoom Controls** - Built-in zoom in/out buttons and manual zoom input (100-200%).
- **Smart Navigation** - Automatic zoom and scroll reset when navigating between pages and chapters.
- **Keyboard Navigation** - Arrow keys to navigate pages.
- **Well-Documented** - Comprehensive guides and examples.

## Quick Start

### 1. Add to Your HTML

```html
<div id="viewer" style="height: 100vh; width: 100%;"></div>

<script src="https://cdn.jsdelivr.net/gh/BrunoRNS/SimplePDFviewer@latest/min/core.min.js"></script>
<script type="text/javascript">
  const course = {
    title: "My Course",
    modules: [{
      title: "Module 1",
      chapters: [{
        title: "Chapter 1",
        pdf: "https://example.com/chapter1.pdf"
      }]
    }]
  };

  PDFViewer.init(document.getElementById('viewer'), course);
</script>
```

> **Important**: The library exports as `PDFViewer`, **not** `SimplePDFviewer`. Use `PDFViewer.init()` to initialize the viewer.

### 2. That's It

You now have a fully functional PDF viewer with:

- Chapter navigation sidebar.
- Previous/Next page buttons.
- Zoom in/out controls with manual zoom input.
- Keyboard controls (arrow keys).
- Automatic zoom and scroll reset on navigation.
- Responsive mobile design.
- Error handling.

## Documentation

### For Users

**[USAGE.md](./docs/USAGE.md)**: Complete API reference, customization, examples.
**[FAQ.md](./docs/FAQ.md)**: Common questions and answers.
**[THIRD_PARTY_NOTICES.md](./docs/THIRD_PARTY_NOTICES.md)**: License information for third-party libraries.

### For Developers

**[CONTRIBUTING.md](./docs/CONTRIBUTING.md)**: How to contribute, code guidelines, pull request process.
**[BUILD.md](./docs/BUILD.md)**: Build system, Makefile, Docker setup.

## Installation Options

### Option 1: CDN (Fastest)

```html
<script src="https://cdn.jsdelivr.net/gh/BrunoRNS/SimplePDFviewer@latest/min/core.min.js"></script>
```

### Option 2: Local File

Download `core.min.js` and host it:

```html
<script src="./core.min.js"></script>
```

### Option 3: Development Version

Use unminified source for debugging:

```html
<script src="./src/SimplePDFviewer.js"></script>
```

## Core Concepts

SimplePDFviewer organizes PDFs hierarchically:

```javascript
{
  title: "Course Title",
  modules: [{
    title: "Module 1",
    chapters: [{
      title: "Chapter 1",
      pdf: "url/to/pdf.pdf"
    }, {
      title: "Chapter 2",
      pdf: "url/to/pdf2.pdf"
    }]
  }, {
    title: "Module 2",
    chapters: [/* ... */]
  }]
}
```

This structure makes it easy to organize related PDFs and navigate between them.

## Basic Usage

```javascript
// Initialize viewer
const viewer = PDFViewer.init(container, course, {
  onError: (error) => console.error('PDF Error:', error)
});

// Navigate pages
viewer.nextPage();
viewer.prevPage();

// Zoom control
viewer.setZoom(150); // Set to 150%
console.log(viewer.zoom); // Current zoom level

// Load specific chapter
viewer.loadChapter(0, 1); // Module 0, Chapter 1

// Access current state
console.log(viewer.currentPage);     // 1
console.log(viewer.currentModule);   // 0
console.log(viewer.currentChapter);  // 0

// Note: Zoom and scroll automatically reset to 100% and top-left (0,0)
// when navigating between pages or chapters

// Clean up when done
viewer.destroy();
```

## Customization

### Custom Colors

```css
.pdf-viewer-sidebar {
  background: #1a1a1a;
}

.pdf-viewer-btn {
  background: #0066cc;
}

.pdf-viewer-btn:hover {
  background: #0052a3;
}
```

### Theme Customization

```javascript
// Dynamic theme switching with automatic color generation
const viewer = PDFViewer.init(container, course, {
  colorTheme: '#FF5722'  // Material Design Deep Orange
});

// Change theme later
viewer.setTheme('#E91E63');   // Pink
viewer.setTheme('#4CAF50');   // Green
viewer.setTheme('#2196F3');   // Blue
```

### Zoom Control

```javascript
// Set zoom level (100-200%)
viewer.setZoom(150);

// Zoom resets automatically when navigating pages
viewer.nextPage(); // zoom resets to 100%
```

### Error Handling

```javascript
const viewer = PDFViewer.init(container, course, {
  onError: (error) => {
    if (error.type === 'load') {
      alert('Failed to load PDF');
    }
  }
});
```

See [USAGE.md - Customization](./docs/USAGE.md#customization) for more options.

## Build & Development

### Prerequisites

- Node.js with npm/yarn
- Terser (JavaScript minifier)
- Docker (optional, for testing with containers)

### Build Minified Version

```bash
# Install terser globally
npm install -g terser

# Build
make all

# Output: min/core.min.js
```

### Test Locally with Docker

```bash
docker-compose up
# CDN: http://localhost:8081/core.min.js
# App: http://localhost:8080
```

See [BUILD.md](./docs/BUILD.md) for complete build instructions and Docker setup.

## Browser Support

| Browser | Version | Status     |
|---------|---------|------------|
| Chrome  | 45+     | Full       |
| Firefox | 40+     | Full       |
| Safari  | 10+     | Full       |
| Edge    | 12+     | Full       |
| IE      | 11      | Limited    |
| Mobile  | Latest  | Full       |

## Performance

- **File Size**: ~15KB minified (gzips to ~4KB)
- **Rendering**: Optimized with debouncing and high-DPI support
- **Memory**: Efficient canvas usage with proper cleanup
- **Load Time**: Lazy loads pdf.js only when needed
- **Requires at least 750Kb/s of download speed**: If you're having performance issues, check your connection speed.

## Security

- SimplePDFviewer is a pure frontend library
- Relies on Mozilla's well-maintained pdf.js
- No data collection or external communications
- Safe to use with untrusted PDFs (pdf.js is Mozilla-vetted)

## Contributing

We welcome contributions! Before getting started:

1. Read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines
2. Check [existing issues](https://github.com/BrunoRNS/SimplePDFviewer/issues)
3. Follow our [Code of Conduct](./docs/CONTRIBUTING.md#code-of-conduct)

### Quick Contribution Checklist

- Fork the repository
- Create a feature branch
- Make focused changes
- Test thoroughly
- Submit a pull request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed instructions.

## License

**SimplePDFviewer** is licensed under the **MIT License**. See [LICENSE.txt](./LICENSE.txt) for details.

**Third-party licenses:**

- **pdf.js**: Apache 2.0 (Mozilla)
- See [THIRD_PARTY_NOTICES.md](./docs/THIRD_PARTY_NOTICES.md) for complete attribution

## Acknowledgments

- [Mozilla pdf.js](https://mozilla.github.io/pdf.js/) - The excellent PDF rendering engine
- [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) - For responsive sizing
- All contributors and the open-source community

**SimplePDFviewer is not affiliated with or endorsed by Mozilla.**

## Learn More

- **Getting Started**: [USAGE.md](./docs/USAGE.md)
- **Common Questions**: [FAQ.md](./docs/FAQ.md)
- **Want to Contribute?**: [CONTRIBUTING.md](./docs/CONTRIBUTING.md)
- **Building from Source**: [BUILD.md](./docs/BUILD.md)
- **Licenses**: [THIRD_PARTY_NOTICES.md](./docs/THIRD_PARTY_NOTICES.md)

## Issues & Support

- **Bug Reports**: [Open an issue](https://github.com/BrunoRNS/SimplePDFviewer/issues)
- **Feature Requests**: Use GitHub Issues with `[feature request]` label
- **Usage Questions**: Check [FAQ.md](./docs/FAQ.md) or [USAGE.md](./docs/USAGE.md)
- **Contributing**: See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Project Status

- **Status**: Active development
- **Latest Version**: Rolling release
- **Last Updated**: February 2026
- **Maintenance**: Community maintained

## Example Use Cases

### Educational Platforms

```javascript
const course = {
  title: "JavaScript 101",
  modules: [{
    title: "Fundamentals",
    chapters: [
      { title: "Variables", pdf: "/pdfs/variables.pdf" },
      { title: "Functions", pdf: "/pdfs/functions.pdf" }
    ]
  }]
};
```

### Documentation Sites

```javascript
const course = {
  title: "API Documentation",
  modules: [{
    title: "Getting Started",
    chapters: [
      { title: "Installation", pdf: "/docs/install.pdf" },
      { title: "Quick Start", pdf: "/docs/quickstart.pdf" }
    ]
  }]
};
```

### Training Materials

```javascript
const course = {
  title: "Employee Training",
  modules: [{
    title: "Week 1",
    chapters: [
      { title: "Monday", pdf: "/training/monday.pdf" },
      { title: "Wednesday", pdf: "/training/wednesday.pdf" },
      { title: "Friday", pdf: "/training/friday.pdf" }
    ]
  }]
};
```

## Show Your Support

If SimplePDFviewer is helpful, please:

- Star this repository
- Report bugs or suggest features
- Contribute code or documentation
- Spread the word!

> **Made with love by the SimplePDFviewer community**
