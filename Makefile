SRC_DIR = src
MIN_DIR = min
SRC_FILE = $(SRC_DIR)/SimplePDFviewer.js
MIN_FILE = $(MIN_DIR)/core.min.js

MINIFIER = terser

COMPOSER = podman-compose

all: build

build: $(SRC_FILE) | $(MIN_DIR)
	$(MINIFIER) $(SRC_FILE) -o $(MIN_FILE) --compress --mangle
	@echo "Minified: $(MIN_FILE)"

$(MIN_DIR):
	mkdir -p $(MIN_DIR)

clean:
	rm -rf $(MIN_DIR)/*

test: test-clean
	$(COMPOSER) up --build

test-clean:
	$(COMPOSER) down -v

.PHONY: all clean test test-clean build
