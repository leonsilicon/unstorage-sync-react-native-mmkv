import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    dts: {
      tsgo: true,
    },
    exports: {
      customExports(exports) {
        exports["."] = {
          types: "./dist/index.d.mts",
          default: "./dist/index.mjs",
        };
        return exports;
      },
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
