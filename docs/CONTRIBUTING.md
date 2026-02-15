# Contributing to SimplePDFviewer

First, thank you for considering contributing to SimplePDFviewer! This project thrives on community contributions. Whether you're fixing bugs, adding features, or improving documentation, we appreciate your effort.

## Code of Conduct

### Our Values

SimplePDFviewer is built on a foundation of respect and inclusivity. We expect all contributors to:

- **Be respectful** - Treat fellow contributors, maintainers, and users with courtesy and professionalism
- **Be constructive** - Provide thoughtful feedback and creative solutions
- **Be inclusive** - Welcome people of all backgrounds and skill levels
- **Be patient** - Help others learn and grow in the community

### Expected Behavior

- Use welcoming and inclusive language
- Be open to different perspectives and ideas
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Derogatory language or jokes
- Unwelcome sexual attention or advances
- Trolling, insulting comments, or derogatory remarks
- Publishing others' private information without consent
- Deliberate disruption of discussions or work

### Enforcement

Violations of the Code of Conduct will be addressed by the maintainers. Serious or repeated violations may result in removal from the project.

**Report violations** to the maintainers privately - do not call them out publicly.

## Before You Start

### Check Existing Issues

Before submitting an issue or pull request:

1. Search [existing issues](https://github.com/BrunoRNS/SimplePDFviewer/issues) to see if someone already reported the problem
2. Search closed issues - your concern may have been addressed
3. Check [pull requests](https://github.com/BrunoRNS/SimplePDFviewer/pulls) to see if someone is already working on it

If you find a related issue, comment and help with discussion rather than opening duplicates.

## Reporting Bugs

### Bug Report Template

Create an issue with the following information:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error '...'

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 10, macOS 14]
- SimplePDFviewer version: [e.g., latest from CDN]

**Screenshots or console errors**
If applicable, add browser console errors (F12 → Console tab).

**Additional context**
Any other relevant information.
```

### Bug Report Guidelines

- **Search first** - Make sure this bug hasn't been reported already
- **Be specific** - Vague reports make debugging difficult
- **Include reproducible steps** - We need to replicate the issue
- **Check console errors** - Browser console often has helpful error messages
- **Test with latest version** - Bug may already be fixed

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem. E.g., "I'm frustrated when..."

**Describe the solution**
Clear description of what you want to happen.

**Describe alternatives**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

### Feature Request Guidelines

- **Keep it focused** - One feature per issue
- **Explain the use case** - Why is this feature needed?
- **Consider scope** - SimplePDFviewer aims to be lightweight
- **Check if it fits the project** - Major architectural changes may not align with our vision

**Note:** Not all feature requests will be accepted. We prioritize simplicity and performance. Features that significantly increase complexity, bundle size, or introduce breaking changes may be declined.

## Development Setup

### Prerequisites

- Node.js (v14+)
- Git
- A code editor (VS Code, Sublime, etc.)
- Familiarity with JavaScript and basic web development

### Local Development

1. **Fork the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/SimplePDFviewer.git
   cd SimplePDFviewer
   ```

2. **Install dependencies**

   ```bash
   npm install -g terser  # Or use your system's package manager
   ```

3. **Build the project**

   ```bash
   make all
   ```

4. **Test locally**

   ```bash
   # Option 1: Use Docker
   docker-compose up
   # Open http://localhost:8080 in your browser

   # Option 2: Open test-example/index.html directly in browser
   ```

### Project Structure

```sh
SimplePDFviewer/
├── src/
│   └── SimplePDFviewer.js     # Main library (development)
├── min/
│   └── core.min.js            # Minified library (production)
├── test-example/
│   ├── index.html             # Test/demo page
│   └── course.json            # Sample data
├── docs/
│   ├── USAGE.md              # User guide
│   ├── FAQ.md                # Common questions
│   ├── CONTRIBUTING.md       # This file
│   └── THIRD_PARTY_NOTICES.md # Licenses
├── docker/
│   ├── Dockerfile.cdn        # CDN server
│   ├── Dockerfile.test       # Test app server
│   ├── nginx-cdn.conf        # CDN nginx config
│   └── nginx-test.conf       # Test app nginx config
├── Makefile                  # Build rules
├── compose.yml               # Docker Compose config
└── README.md                 # Project overview
```

## Code Guidelines

### Architectural Principles

SimplePDFviewer is designed with these principles in mind:

1. **Simplicity** - Keep the codebase minimal and focused
2. **Performance** - Prioritize speed and responsiveness
3. **Lightweight** - Avoid adding large dependencies
4. **Flexibility** - Allow user customization through CSS and options
5. **Standalone** - Works without external build tools or dependencies (except pdf.js)

### When Contributing Code

- **Don't change core architecture** - Before proposing architectural changes, discuss in an issue first
- **Don't add large dependencies** - Keep the library lightweight
- **Do improve existing code** - Bug fixes, optimizations, and refactoring are welcome
- **Do add JSDoc comments** - Document all functions for maintainability
- **Do follow the existing style** - Use consistent formatting and naming

### Code Style

- Use `const`/`let`, avoid `var`
- Use arrow functions where appropriate
- Keep functions focused and small
- Add comments for non-obvious logic
- Use meaningful variable names (`module` instead of `m`)

**Example:**

```javascript
/**
 * Validates course data structure.
 * @param {Object} course - The course object to validate.
 * @returns {Object} - Validation result with {valid: boolean, error: string|null}
 */
const validateCourse = (course) => {
  if (!course) return { valid: false, error: 'Course object is required.' };
  // ... validation logic
  return { valid: true, error: null };
};
```

### Testing Your Changes

1. **Test in browser** - Open test-example/index.html
2. **Test with example data** - Use test-example/course.json
3. **Test with your own PDFs** - Ensure it works with various PDF types
4. **Check console** - Verify no errors or warnings appear
5. **Test on mobile** - Use browser dev tools to simulate mobile devices

## Submitting Changes

### Git Workflow

1. **Create a branch** with a descriptive name:

   ```bash
   git checkout -b fix/sidebar-mobile-issue
   git checkout -b feat/add-page-jump-feature
   ```

2. **Make focused commits**:

   ```bash
   git commit -m "Fix: Improve touch target size on mobile buttons"
   ```

3. **Push to your fork**:

   ```bash
   git push origin fix/sidebar-mobile-issue
   ```

4. **Create a pull request** on GitHub

### Pull Request Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Performance improvement
- [ ] Code refactor

## Changes Made

- Specific change 1
- Specific change 2
- Specific change 3

## Testing

How was this tested? Include specific test cases.

## Screenshots (if applicable)

Before/after screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] All functions have JSDoc comments
- [ ] Tested in browser (desktop and mobile)
- [ ] No console errors or warnings
- [ ] Builds successfully with `make all`
- [ ] Updated USAGE.md if behavior changed
```

### PR Guidelines

- **Keep it focused** - One feature/fix per PR
- **Keep it small** - Large PRs are harder to review
- **Write clear description** - Explain what and why
- **Link related issues** - Use "Fixes #123" syntax
- **Include testing notes** - How to verify the changes work
- **Be patient** - Reviews take time

### Review Process

1. A maintainer will review your PR
2. Changes may be requested
3. Address feedback constructively
4. Be patient during review process
5. Once approved, your PR will be merged

**Note:** Not all PRs will be merged. We carefully consider:

- Alignment with project vision
- Code quality and style
- Performance impact
- Complexity vs. benefit
- Maintainability

Rejection isn't personal - we're protecting the project's simplicity.

## Documentation

### Updating docs/USAGE.md

If your change affects how users interact with SimplePDFviewer, update the USAGE guide:

- Add new sections if introducing major features
- Update existing sections with API changes
- Add examples for new capabilities
- Update the Table of Contents

### Updating docs/FAQ.md

If your changes introduce common questions:

- Add Q&A entries
- Link to relevant USAGE sections
- Keep answers concise and practical

### Updating Makefile or Docker

If you modify build scripts or Docker setup:

- Document changes in [BUILD.md](./BUILD.md)
- Test build process locally
- Verify Docker Compose works: `docker-compose up`

## Building and Testing

### Using Make

```bash
make all      # Build/minify
make clean    # Remove minified files
make help     # Show available commands
```

### Using Docker Compose

```bash
# Start services (CDN on 8081, app on 8080)
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build
```

## Commit Message Guidelines

Write clear, descriptive commit messages:

```markdown
type: description

{optional body}

Example:
Fix: Improve error messages with specific module/chapter info
Performance: Reduce ResizeObserver render calls with debouncing
Feat: Add destroy() method for proper cleanup
Docs: Add browser support table to USAGE guide
```

Types:

- `fix:` - Bug fix
- `feat:` - New feature
- `perf:` - Performance improvement
- `docs:` - Documentation
- `refactor:` - Code reorganization (no functionality change)
- `style:` - Formatting (no code change)
- `test:` - Test-related changes

## Release Process

(For maintainers)

1. Update version if needed
2. Update USAGE.md and docs
3. Merge PR into main
4. Create GitHub Release with tag
5. Attach minified file to release

Contributors don't need to handle this.

## Getting Help

- **Usage questions** → [FAQ.md](./FAQ.md) or create an issue
- **Bug reports** → [GitHub Issues](https://github.com/BrunoRNS/SimplePDFviewer/issues)
- **Feature ideas** → GitHub Issues with `[feature request]` label
- **Development help** → Comment on relevant issues or PRs

## Recognition

Contributors are recognized:

- In release notes (for features/major fixes)
- In GitHub's contributor graph
- Our gratitude and respect!

---

**Thank you for contributing to SimplePDFviewer!**

Every bug report, feature suggestion, and code contribution makes this project better for everyone.
