# Third-Party Notices

SimplePDFviewer relies on third-party software and libraries. This document outlines the licenses and attributions for these dependencies.

## pdf.js

**Description:** A JavaScript implementation of the Portable Document Format (PDF) specification.

**Author/Organization:** Mozilla

**Repository:** [https://github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)

**License:** Apache License 2.0

**License Text:**

```txt
Copyright 2011 Mozilla Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

**Usage in SimplePDFviewer:**

pdf.js is the core engine behind SimplePDFviewer. It handles:

- PDF file parsing and interpretation
- Page rendering to canvas
- Document structure analysis

SimplePDFviewer wraps pdf.js functionality to provide a simpler, more focused API for basic PDF viewing.

**Additional Information:**

- pdf.js is actively maintained by Mozilla
- It's used by Firefox's built-in PDF viewer
- It's the de facto standard for JavaScript PDF rendering
- For more information, visit: [https://mozilla.github.io/pdf.js/](https://mozilla.github.io/pdf.js/)

---

## SimplePDFviewer License

**License:** MIT License

**License Text:**

```txt
MIT License

Copyright 2026 BrunoRNS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Nginx

**Description:** Web server and reverse proxy used in Docker containers.

**Author/Organization:** Nginx, Inc.

**Repository:** [https://github.com/nginx/nginx](https://github.com/nginx/nginx)

**License:** 2-clause BSD License

**License Text:**

```txt
Copyright (C) 2011-2023 Nginx, Inc.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

**Usage in SimplePDFviewer:**

Nginx is used in Docker containers to serve:

- The test application (test-example/)
- The minified library (CDN simulation)

## Terser

**Description:** JavaScript minifier used to optimize the library for production.

**Author/Organization:** Terser Contributors

**Repository:** [https://github.com/terser/terser](https://github.com/terser/terser)

**License:** 2-clause BSD License

**License Text:**

```txt
Copyright 2012-2023 Terser Contributors

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

**Usage in SimplePDFviewer:**

Terser is a build-time dependency used to minify `SimplePDFviewer.js` into `core.min.js`. It's not included in the runtime library.

## CDN Sources

SimplePDFviewer uses cdn.jsdelivr.net and cdnjs.cloudflare.com to serve pdf.js files.

**CDN Providers:**

- **jsDelivr**: [https://www.jsdelivr.com](https://www.jsdelivr.com) (For SimplePDFviewer project files)
- **Cloudflare**: [https://cdnjs.cloudflare.com](https://cdnjs.cloudflare.com) (For pdf.js library)

These CDN providers are independent services and have their own terms of service.

---

## License Summary

| Component       | License      | Conditions                                           |
|-----------------|--------------|------------------------------------------------------|
| SimplePDFviewer | MIT          | Use, modify, distribute freely - include license     |
| pdf.js          | Apache 2.0   | Use, modify, distribute - include license and notice |
| Nginx           | BSD 2-Clause | Use, modify, distribute - include license            |
| Terser          | BSD 2-Clause | Use, modify, distribute - include license            |

---

## Compliance Notes

### Using SimplePDFviewer in Your Project

If you use SimplePDFviewer in your project:

1. **MIT License**: SimplePDFviewer itself is MIT licensed. No attribution required, but appreciated.

2. **pdf.js Attribution**: Because SimplePDFviewer bundles pdf.js functionality, you should acknowledge pdf.js. Include this notice:

   ```md
   This product includes software developed by Mozilla,
   specifically the pdf.js library (https://mozilla.github.io/pdf.js/).
   pdf.js is licensed under the Apache License 2.0.
   ```

3. **Optional Attribution**: If desired, attribute SimplePDFviewer:

   ```md
   Powered by SimplePDFviewer
   https://github.com/BrunoRNS/SimplePDFviewer
   ```

---

## Important Disclaimer

**SimplePDFviewer is NOT affiliated with, endorsed by, or officially supported by Mozilla.** While SimplePDFviewer uses pdf.js (an excellent Mozilla project), SimplePDFviewer is an independent community project.

### What This Means

**You can:**

- Use SimplePDFviewer freely in commercial and personal projects
- Modify SimplePDFviewer under MIT license terms
- Contribute improvements and bug fixes
- Create derivative works

**You cannot:**

- Claim SimplePDFviewer is made or supported by Mozilla
- Claim SimplePDFviewer is the official Mozilla PDF viewer
- Use Mozilla branding with SimplePDFviewer

### Support

- **SimplePDFviewer issues?** → [GitHub Issues](https://github.com/BrunoRNS/SimplePDFviewer/issues)
- **pdf.js issues?** → [pdf.js GitHub](https://github.com/mozilla/pdf.js/issues)
- **Mozilla products?** → [Mozilla Support](https://support.mozilla.org)

## Changes to Third-Party Software

SimplePDFviewer does not modify pdf.js source code. It includes unmodified builds from the official pdf.js releases.

If you believe there's a licensing issue or this document is incomplete or inaccurate, please:

1. Open an issue on the [GitHub Issues](https://github.com/BrunoRNS/SimplePDFviewer/issues) page
2. Include specific details about the concern
3. We'll address it promptly

## Version Information

This document was last updated: **February 2026**

For the most current information about third-party licenses, please check:

- pdf.js License: [https://github.com/mozilla/pdf.js/blob/master/LICENSE](https://github.com/mozilla/pdf.js/blob/master/LICENSE)
- Nginx License: [http://nginx.org/LICENSE](http://nginx.org/LICENSE)
- Terser License: [https://github.com/terser/terser/blob/master/LICENSE](https://github.com/terser/terser/blob/master/LICENSE)

---

**Thank you** to all the open-source projects that make SimplePDFviewer possible!
