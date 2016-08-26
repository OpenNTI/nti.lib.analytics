.PHONY: clean check test

# SRC = $(shell find src -name '*.js')
# LIB = $(SRC:src/%.js=lib/%.js)
LIBDIR = lib

all: node_modules lib

node_modules: package.json
	@rm -rf node_modules
	@npm install
	@touch $@

check:
	@eslint --ext .js,.jsx ./src

test: node_modules check
	@karma start --single-run

clean:
	@rm -rf $(LIBDIR)

lib: clean
	@NODE_ENV=rollup rollup -c

# lib: $(LIB)
# lib/%.js: src/%.js
# 	@mkdir -p $(@D)
# 	babel $< -o $@
