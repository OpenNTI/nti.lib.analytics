.PHONY: clean check test

REPORTS = reports
LIB = lib

all: node_modules lib

node_modules: package.json
	@rm -rf node_modules
	@npm install

check:
	@eslint --ext .js,.jsx ./src

test: node_modules clean check
	@jest

clean:
	@rm -rf $(LIB)
	@rm -rf $(REPORTS)

lib: clean
	@rollup -c
	@rollup -c -f cjs -o lib/cjs-index.js
