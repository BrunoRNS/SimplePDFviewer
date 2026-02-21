SRC_DIR := src
MIN_DIR := min
MINIFIER := terser

ifeq ($(OS),Windows_NT)
    FIX_PATH = $(subst /,\,$1)
    SRC_FILE := $(call FIX_PATH,$(SRC_DIR)/SimplePDFviewer.js)
    MIN_FILE := $(call FIX_PATH,$(MIN_DIR)/core.min.js)
    NULL := NUL
    CHECK_CMD := where
    RM := rmdir /s /q
    MKDIR_P := mkdir
    EXIT_NULL := 2>NUL || (exit 0)
else
    FIX_PATH = $1
    SRC_FILE := $(SRC_DIR)/SimplePDFviewer.js
    MIN_FILE := $(MIN_DIR)/core.min.js
    NULL := /dev/null
    CHECK_CMD := which
    RM := rm -rf
    MKDIR_P := mkdir -p
    EXIT_NULL := 
endif

COMPOSER := $(shell $(CHECK_CMD) podman-compose >$(NULL) 2>&1 && echo podman-compose || ($(CHECK_CMD) docker-compose >$(NULL) 2>&1 && echo docker-compose) || echo Error)

ifeq ($(COMPOSER),Error)
    $(error Neither podman-compose nor docker-compose is installed. Please install one of them to run tests.)
endif

all: build

build: $(SRC_FILE) | $(MIN_DIR)
	$(MINIFIER) $(SRC_FILE) -o $(MIN_FILE) --compress --mangle
	@echo "Minified: $(MIN_FILE)"

$(MIN_DIR):
	@$(MKDIR_P) $(call FIX_PATH,$(MIN_DIR)) $(EXIT_NULL)

clean: test-clean
	@$(RM) $(call FIX_PATH,$(MIN_DIR)) $(EXIT_NULL)
	@echo "Cleaned $(MIN_DIR) successfully."

test:
	$(COMPOSER) up --build

test-clean:
	$(COMPOSER) down -v

.PHONY: all clean test test-clean build
