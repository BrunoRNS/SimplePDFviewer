# Build Guide

This guide explains how to build SimplePDFviewer locally and deploy it using the included Makefile and Docker setup.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Build System](#build-system)
3. [Using Make](#using-make)
4. [Using Docker Compose](#using-docker-compose)
5. [Using Podman Compose](#using-podman-compose-alternative-to-docker)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Minimum Build (Development)

```bash
cd SimplePDFviewer
make all
```

This creates `min/core.min.js` - the minified library ready for production use.

### Full Testing Setup (With Docker)

```bash
docker-compose up --build
```

Or with Podman:

```bash
podman-compose up --build
```

This starts:

- **CDN Server** on `http://localhost:8081/core.min.js`
- **Test App** on `http://localhost:8080`

Visit `http://localhost:8080` in your browser to see the demo.

## Build System

SimplePDFviewer uses GNU Make as its build system. The Makefile handles minification of the JavaScript source code.

### Why Minify?

Minification:

- **Reduces file size** by 60-70% (from ~50KB to ~15KB)
- **Improves load time** - smaller files download faster
- **Production ready** - minified code is obfuscated and compressed
- **Same functionality** - minification doesn't change behavior

### Build Files

| File                     | Purpose             | When Created     |
|--------------------------|---------------------|------------------|
| `src/SimplePDFviewer.js` | Development source  | Pre-existing     |
| `min/core.min.js`        | Production minified | After `make all` |

## Using Make

### Prerequisites

Install the Terser minifier:

```bash
# Using npm
npm install -g terser

# Using apt (Debian/Ubuntu)
sudo apt-get install node-terser

# Using brew (macOS)
brew install terser

# Using pacman (Arch)
sudo pacman -S terser
```

Verify installation:

```bash
terser --version
```

### Available Commands

#### `make all`

Build and minify the library.

```bash
make all
```

**Output:**

```txt
Minified: min/core.min.js
```

**Creates:**

- `min/` directory (if it doesn't exist)
- `min/core.min.js` minified library file

**When to use:** Development and before deployment

#### `make clean`

Remove minified files and build artifacts.

```bash
make clean
```

**Removes:**

- `min/` directory
- All minified files

**When to use:** Clean rebuild, CI/CD workflows, before committing

#### Building Fresh

To do a complete rebuild:

```bash
make clean
make all
```

### Understanding the Makefile

Here's what's in the Makefile:

```makefile
SRC_DIR = src
MIN_DIR = min
SRC_FILE = $(SRC_DIR)/SimplePDFviewer.js
MIN_FILE = $(MIN_DIR)/core.min.js

MINIFIER = terser

all: $(MIN_FILE)

$(MIN_FILE): $(SRC_FILE) | $(MIN_DIR)
   $(MINIFIER) $(SRC_FILE) -o $(MIN_FILE) --compress --mangle
   @echo "Minified: $(MIN_FILE)"

$(MIN_DIR):
   mkdir -p $(MIN_DIR)

clean:
   rm -rf $(MIN_DIR)

.PHONY: all clean
```

**Key parts:**

- **SRC_FILE**: Points to the development source
- **MIN_FILE**: Output path for minified code
- **MINIFIER**: Uses `terser` for minification
- **--compress**: Removes dead code and optimizes
- **--mangle**: Shortens variable names (safe for global API)
- **.PHONY**: Tells Make these aren't real files

## Using Docker Compose

Docker provides containerized environments for testing without installing dependencies locally.

### Pre-requisites

Install Docker and Docker Compose:

- **Docker**: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- **Docker Compose**: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

> You can also use Podman (a Docker alternative) and Podman Compose instead of Docker/Docker Compose.

Verify installation:

```bash
docker --version
docker-compose --version
```

### Services

The `compose.yml` file defines two services:

#### CDN Service (Port 8081)

- **Purpose**: Simulates a CDN serving the minified library
- **URL**: `http://localhost:8081/core.min.js`
- **Files served**: Contents of `min/` directory
- **Use case**: Testing CDN loading in the test app

#### APP Service (Port 8080)

- **Purpose**: Serves the test application
- **URL**: `http://localhost:8080`
- **Files served**: Contents of `test-example/` directory
- **Dependencies**: Requires CDN service to be running

### Common Docker Commands

#### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images then start
docker-compose up --build
```

#### Stop Services

```bash
# Stop running services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

#### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs (like tail -f)
docker-compose logs -f

# View specific service logs
docker-compose logs app
docker-compose logs cdn
```

#### Rebuild After Changes

```bash
# Rebuild the minified library first
make all

# Then rebuild Docker images
docker-compose up --build
```

## Using Podman Compose (Alternative to Docker)

**Podman** is a daemonless container engine that's compatible with Docker. **Podman Compose** is a tool to run multiple containers just like Docker Compose, but without needing the Docker daemon.

### Why Use Podman?

- **Daemonless**: No background service required
- **Rootless**: Run containers without root privileges
- **Drop-in replacement**: Works with existing Docker Compose files
- **Lightweight**: Lower resource usage than Docker
- **Open-source**: No licensing concerns

### Prerequisites for Podman

Install Podman and Podman Compose:

**Linux (Debian/Ubuntu):**

```bash
sudo apt-get install podman podman-compose
```

**Linux (Fedora/RHEL):**

```bash
sudo dnf install podman podman-compose
```

**macOS:**

```bash
brew install podman podman-compose
```

**Windows:**

Download from [https://podman.io/docs/installation](https://podman.io/docs/installation) or use Windows Subsystem for Linux (WSL).

Verify installation:

```bash
podman --version
podman-compose --version
```

### Podman Compose vs Docker Compose

The usage is nearly identical! Simply replace `docker-compose` with `podman-compose`:

| Task           | Docker Compose              | Podman Compose              |
|----------------|-----------------------------|-----------------------------|
| Start services | `docker-compose up`         | `podman-compose up`         |
| Stop services  | `docker-compose down`       | `podman-compose down`       |
| View logs      | `docker-compose logs`       | `podman-compose logs`       |
| Rebuild        | `docker-compose up --build` | `podman-compose up --build` |

### Common Podman Compose Commands

#### Start Services (Podman)

```bash
# Start in foreground (see logs)
podman-compose up

# Start in background
podman-compose up -d

# Rebuild images then start
podman-compose up --build
```

#### Stop Services (Podman)

```bash
# Stop running services
podman-compose down

# Stop and remove volumes
podman-compose down -v
```

#### View Logs (Podman)

```bash
# View all logs
podman-compose logs

# Follow logs (like tail -f)
podman-compose logs -f

# View specific service logs
podman-compose logs app
podman-compose logs cdn
```

#### Rebuild After Changes (Podman)

```bash
# Rebuild the minified library first
make all

# Then rebuild Podman images
podman-compose up --build
```

#### Check Running Containers

```bash
# List all containers
podman ps

# Should show app and cdn services running
```

#### Clean Up Old Containers (Recommended)

When restarting, you may see a "container already in use" error from previous runs:

```bash
# Remove old containers and volumes
podman-compose down -v

# Then start fresh
podman-compose up --build
```

Or use the `--replace` flag to automatically replace old containers:

```bash
podman-compose up --build --replace
```

### Workflow with Podman Compose

The workflow is identical to Docker, just use `podman-compose` instead:

1. **Development**

   ```bash
   # Edit src/SimplePDFviewer.js
   # Test changes locally or in test-example/index.html
   ```

2. **Build**

   ```bash
   make all
   ```

3. **Local Testing with Podman**

   ```bash
   podman-compose up --build
   # Visit http://localhost:8080
   # Test in CDN mode (loads from http://localhost:8081)
   ```

4. **Deployment**

   ```bash
   # Push min/core.min.js to your CDN or server
   # Build production Podman images if needed
   ```

### Troubleshooting Podman Compose

#### Issue: `podman-compose: command not found`

**Solution:** Install podman-compose:

```bash
# Using package manager
sudo apt-get install podman-compose  # Debian/Ubuntu
sudo dnf install podman-compose      # Fedora/RHEL
brew install podman-compose          # macOS

# Or using pip
pip3 install podman-compose
```

#### Issue: Permission denied / rootless mode

**Solution:** Podman runs rootless by default. If you get permission errors:

```bash
# Enable user namespace (Linux)
sudo sysctl user.max_user_namespaces=15000

# Or use sudo with podman-compose
sudo podman-compose up --build
```

#### Issue: Port already in use

**Problem:** Ports 8080 or 8081 are already in use

**Solution:** Use different ports:

```bash
# Map to different ports
podman-compose -p "8090:80" up
```

Or edit `compose.yml` to use different ports.

#### Issue: Containers won't start

**Solution:** Check pod status and logs:

```bash
# Check container status
podman ps -a

# View error logs
podman-compose logs

# Rebuild from scratch
podman-compose down -v
podman-compose up --build
```

### Podman vs Docker: Which Should I Use?

| Aspect         | Docker                           | Podman                    |
|----------------|----------------------------------|---------------------------|
| Setup          | Requires daemon service          | Daemonless, simpler       |
| Permissions    | Often needs sudo or docker group | Rootless by default       |
| Resources      | Higher CPU/memory footprint      | Lower resource usage      |
| Compatibility  | Industry standard                | Docker Compose compatible |
| Security       | Single daemon manages all        | User-namespace isolation  |
| Learning curve | Very documented                  | Similar to Docker         |

**Recommendation:** Use Podman if you want a lighter-weight alternative or prefer rootless containers. Use Docker if you prefer the industry standard or need maximum compatibility.

### Quick Comparison Cheat Sheet

```bash
# Both work the same way:
docker-compose up --build       # Docker
podman-compose up --build       # Podman

# Both log the same way:
docker-compose logs -f app      # Docker
podman-compose logs -f app      # Podman

# Both stop the same way:
docker-compose down -v          # Docker
podman-compose down -v          # Podman
```

### Workflow: Development → Testing → Deployment

1. **Development**

   ```bash
   # Edit src/SimplePDFviewer.js
   # Test changes locally or in test-example/index.html
   ```

2. **Build**

   ```bash
   make all
   ```

3. **Local Testing**

   ```bash
   docker-compose up --build
   # Visit http://localhost:8080
   # Test in CDN mode (loads from http://localhost:8081)
   ```

4. **Deployment**

   ```bash
   # Push min/core.min.js to your CDN or server
   # Build production Docker images if needed
   ```

## Troubleshooting

### Issue: `terser: command not found`

**Solution:** Install terser globally:

```bash
npm install -g terser
# Or use your system package manager
```

Verify:

```bash
terser --version
```

### Issue: `make: *** [Makefile] Error 1`

**Solution:** Check if minifier is installed and working:

```bash
which terser  # Should show the path to terser
terser --version  # Should show version info
```

If terser isn't available:

```bash
npm install -g terser
```

### Issue: Docker containers won't start

**Problem:** `docker: command not found`

**Solution:** Install Docker:

- **Linux**: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
- **macOS**: [https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/)

**Problem:** Permission denied

**Solution:** Add your user to docker group (Linux):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: Port already in use or `listen tcp 127.0.0.1:8080: bind: address already in use`

**Problem:** `listen tcp 127.0.0.1:8080: bind: address already in use`

**Solution:** Use different ports:

```bash
docker-compose up -p "8090:80"
# Or stop the service using the port:
sudo lsof -i :8080  # Find what's using port 8080
```

### Issue: Changes not reflected

**Problem:** Rebuilt file but Docker still serves old version

**Solution:**

```bash
# Rebuild everything
make clean
make all

# Restart Docker with rebuild
docker-compose down
docker-compose up --build
```

### Issue: Can't access [http://localhost:8080](http://localhost:8080)

**Problem:** Docker is running but page won't load

**Solution:** Check if containers are running:

```bash
docker-compose ps

# Should show:
# NAME      STATUS      PORTS
# app       Up 2 mins   0.0.0.0:8080->80/tcp
# cdn       Up 2 mins   0.0.0.0:8081->80/tcp
```

If containers aren't running:

```bash
docker-compose up  # This will show error messages
```

### Issue: `min/core.min.js` is empty

**Problem:** Minification created an empty file

**Solution:** Check for errors:

```bash
make clean
make all  # Look for error messages

# Test terser directly:
terser src/SimplePDFviewer.js -o /tmp/test.js
```

## Performance Optimization

### Minimize Build Time

```bash
# Skip rebuilding if source hasn't changed
make all  # Only rebuilds if src/SimplePDFviewer.js changed
```

### Reduce Minified Size

The minified file is already optimized. To check size:

```bash
ls -lh min/core.min.js

# Check compression ratio:
du -sh src/SimplePDFviewer.js
du -sh min/core.min.js
```

### Gzip Compression

For web serving, enable gzip compression:

```nginx
# In nginx config:
gzip on;
gzip_types application/javascript;
```

The minified library compresses very well (typically 70-80% reduction).

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g terser
      - run: make all
      - run: docker-compose build  # Check Docker builds work
```

## Deployment

### For CDN/Web Server

1. Build locally: `make all`
2. Upload `min/core.min.js` to your CDN/server
3. Users load from your CDN or jsdelivr

### For Docker

1. Build: `make all`
2. Build images: `docker-compose build`
3. Push images to registry:

   ```bash
   docker tag app:latest yourregistry/app:latest
   docker push yourregistry/app:latest
   ```

4. Deploy to your server using Docker

## Next Steps

- **Learn more about Make**: [https://www.gnu.org/software/make/manual/](https://www.gnu.org/software/make/manual/)
- **Learn more about Docker**: [https://docs.docker.com/](https://docs.docker.com/)
- **Terser documentation**: [https://github.com/terser/terser](https://github.com/terser/terser)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

**Need help?** Check [FAQ.md](./FAQ.md) or open an issue on [GitHub](https://github.com/BrunoRNS/SimplePDFviewer/issues).
