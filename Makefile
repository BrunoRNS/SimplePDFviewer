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
