# Frequently Asked Questions (FAQ)

## Installation & Setup

### Q: How do I install SimplePDFviewer?

**A:** Simply add a script tag to your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/BrunoRNS/SimplePDFviewer@latest/min/core.min.js"></script>
```

Or download `core.min.js` and host it locally. See the [Installation section](./USAGE.md#installation) in the USAGE guide for more options.

### Q: What are the system requirements?

**A:** SimplePDFviewer requires:

- A modern web browser (Chrome 45+, Firefox 40+, Safari 10+, Edge 12+)
- Internet connection (if using CDN-hosted PDFs)
- JavaScript enabled

For optimal experience on older browsers, consider adding polyfills for ResizeObserver and Promises.

### Q: Does SimplePDFviewer work in Node.js?

**A:** No, SimplePDFviewer is designed for the browser only. It uses browser APIs like DOM, Canvas, and ResizeObserver that don't exist in Node.js. For server-side PDF rendering, consider other solutions like pdf-lib or PDFKit.

## Usage & Features

### Q: Can I customize the appearance of the viewer?

**A:** Yes! SimplePDFviewer uses CSS classes that you can override. See [Customization section](./USAGE.md#customization) for detailed styling examples. You can change colors, fonts, sizes, and layout.

### Q: Does SimplePDFviewer support text selection in PDFs?

**A:** No, the viewer is designed for viewing only. Text is rendered as images on canvas. If you need full text selection, annotations, and advanced features, consider using pdf.js directly.

### Q: Can I add zoom controls to the viewer?

**A:** Yes! SimplePDFviewer now includes **built-in zoom controls** (100-200% zoom range) with:

- Zoom in/out buttons in the toolbar
- Manual zoom input field
- Automatic zoom reset to 100% when navigating pages

```javascript
// Control zoom programmatically
viewer.setZoom(150); // Set to 150%
console.log(viewer.zoom); // Current zoom: 150

// Click Next/Previous - zoom automatically resets to 100%
viewer.nextPage(); // zoom = 100 after navigation
```

For CSS-based scaling (alternative), you can still use transforms:

```css
.pdf-viewer-canvas-container {
  transform: scale(1.2);
  transform-origin: top center;
}
```

See [Zoom Control](./USAGE.md#setzoomvalue) in the USAGE guide for details.

### Q: Does the viewer support search functionality?

**A:** No, SimplePDFviewer doesn't include built-in search. For text-searchable PDFs, you'd need to integrate the full pdf.js library or add a search layer with additional PDF.js capabilities.

### Q: How do I navigate to a specific page number?

**A:** While there's no built-in page jump feature, you can use the `loadChapter()` method and create custom controls:

```javascript
function jumpToChapter(moduleIndex, chapterIndex) {
  viewer.loadChapter(moduleIndex, chapterIndex);
}
```

For page numbers within a chapter, you'd need to extend the library with keyboard input or button controls.

### Q: Why does zoom reset to 100% when I navigate pages?

**A:** SimplePDFviewer automatically resets zoom to 100% and scroll position to the top-left (0,0) when you navigate between pages or chapters. This is by design for better UX - it ensures:

- You see the entire new page without unexpected zoom levels
- Navigation feels consistent and predictable
- You don't have to manually re-orient after switching pages

This happens automatically on:

- `nextPage()` / Previous page button clicks
- `loadChapter()` / sidebar chapter selection
- Arrow key navigation

The reset is transparent and cannot be disabled.

## Troubleshooting

### Q: My PDF won't load. What's wrong?

**A:** The most common issue is **CORS (Cross-Origin Resource Sharing)**. PDFs must be served from a CORS-enabled server. Check:

1. **Browser console** (F12 → Console) for error messages
2. **Network tab** (F12 → Network) to verify the PDF URL returns status 200
3. **Server headers** - ensure `Access-Control-Allow-Origin: *` is set

If hosting on a different domain, configure your server or use a CORS proxy.

### Q: The sidebar doesn't show on my phone. Is it broken?

**A:** No, that's by design! On mobile devices (<768px width), the sidebar is hidden to save space. Use the **hamburger menu** (☰) button at the top-left to toggle it. On desktop, the sidebar is always visible.

### Q: Why is the PDF blurry on my high-resolution display?

**A:** This shouldn't happen - SimplePDFviewer renders at `devicePixelRatio` for sharp text. If you see blurry rendering:

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Try a different PDF
3. Check browser console for errors
4. Test in incognito mode

### Q: The viewer is using too much CPU. Why?

**A:** Possible causes:

- **Rapidly resizing the browser** - This is expected, rendering updates dynamically
- **Very large PDFs** (500+ pages) - Split into multiple chapters
- **Low-end device** - Older devices struggle with canvas rendering

To optimize:

- Use smaller, optimized PDFs
- Avoid rapid window resizing
- Split large documents into chapters

### Q: How do I handle errors in the viewer?

**A:** Pass an `onError` callback to the init function:

```javascript
const viewer = PDFViewer.init(container, course, {
  onError: (error) => {
    console.error(`${error.type}: ${error.message}`);
    // Handle error appropriately
  }
});
```

Error types include `load` (PDF loading failed) and `render` (page rendering failed).

## Performance

### Q: How do I optimize PDF loading performance?

**A:** Follow these tips:

1. **Compress PDFs** - Use tools like GhostScript to reduce file size
2. **Use a CDN** - Serve PDFs from a content delivery network close to users
3. **Split large documents** - Break PDFs into multiple chapters
4. **Enable caching** - Set proper HTTP cache headers on your server
5. **Optimize images** - Remove unnecessary images or compress them

### Q: Will SimplePDFviewer work with very large PDFs?

**A:** PDFs with hundreds of pages can work, but performance degrades. The viewer renders the entire PDF in memory for page access. For very large documents:

- Split into multiple chapters (recommended)
- Use higher-end devices for viewing
- Optimize the PDF itself

## Security

### Q: Is SimplePDFviewer safe to use with untrusted PDFs?

**A:** SimplePDFviewer relies on pdf.js for PDF parsing. pdf.js is a well-maintained Mozilla project, but like any complex software, vulnerabilities could theoretically exist.

**Best practices:**

- Keep the library updated
- Only load PDFs from trusted sources
- Use CSP (Content Security Policy) headers
- Sanitize any user-provided content

For security-critical applications, audit the code and dependencies yourself.

### Q: Does SimplePDFviewer collect user data?

**A:** No, SimplePDFviewer is purely a frontend library. It doesn't collect, transmit, or store any user data. Your viewing history, PDFs, and interactions exist only in your browser memory.

## Development

### Q: How do I modify SimplePDFviewer?

**A:** See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on contributing. Generally:

1. Fork the repository
2. Create a feature branch
3. Make improvements (don't change core architecture)
4. Update tests if applicable
5. Submit a pull request with a clear description

### Q: Can I use SimplePDFviewer in a production application?

**A:** Yes! SimplePDFviewer is stable and used in production. However:

- Monitor for updates and security fixes
- Always test thoroughly with your PDFs
- Have fallbacks for older browsers
- Consider supporting users with JavaScript disabled

### Q: What's the browser compatibility?

**A:** See the [Browser Support table](./USAGE.md#browser-support) in the USAGE guide. In summary:

- Modern browsers (Chrome, Firefox, Safari, Edge) are fully supported
- Internet Explorer 11 has limited support (no high-DPI rendering)
- Mobile browsers (iOS Safari, Chrome Mobile) are fully supported

### Q: How do I report bugs?

**A:** Please submit an issue on [GitHub Issues](https://github.com/BrunoRNS/SimplePDFviewer/issues) with:

- Description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS information
- Console error messages (if any)

This helps the maintainers fix issues quickly.

## Licensing & Attribution

### Q: What license is SimplePDFviewer under?

**A:** SimplePDFviewer is licensed under the **MIT License**, which is permissive and open-source. You can use it freely in commercial and personal projects. See [LICENSE.txt](../LICENSE.txt).

### Q: What about pdf.js licensing?

**A:** pdf.js is developed by Mozilla and uses the **Apache-2.0 License**. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for complete details about third-party licenses.

### Q: Do I need to credit SimplePDFviewer?

**A:** Not required by the MIT License, but appreciated! If you use SimplePDFviewer in your project, a mention in your README or documentation is welcome.

## Miscellaneous

### Q: Can I use SimplePDFviewer for scientific/academic papers?

**A:** Absolutely! Many use SimplePDFviewer for viewing research papers, theses, and academic materials. It's perfect for that use case.

### Q: Can multiple PDF viewers exist on the same page?

**A:** Yes! You can initialize multiple viewers on different containers:

```javascript
const viewer1 = PDFViewer.init(container1, course1);
const viewer2 = PDFViewer.init(container2, course2);
```

Each viewer operates independently.

### Q: What's the file size of SimplePDFviewer?

**A:** The minified version (core.min.js) is approximately **10-15 KB** gzipped. Plus pdf.js adds ~300KB. This is already quite optimized for a PDF viewer.

### Q: How often is SimplePDFviewer updated?

**A:** Updates are released when bugs are fixed or features are added. Follow the [GitHub repository](https://github.com/BrunoRNS/SimplePDFviewer) for updates. All changes follow semantic versioning.

### Q: Is there a TypeScript version?

**A:** Not officially maintained, but SimplePDFviewer is simple enough to add type definitions. Consider contributing TypeScript definitions if you create them!

**Didn't find your answer?** [Open an issue on GitHub](https://github.com/BrunoRNS/SimplePDFviewer/issues) or check the full [USAGE guide](./USAGE.md).
