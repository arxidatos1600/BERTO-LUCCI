import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The preview/dev server may be spawned with a different working directory than
// this project root, which breaks Tailwind's automatic config discovery. Resolve
// the config by absolute path (relative to this file) so it's found regardless.
const here = dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    tailwindcss: { config: join(here, "tailwind.config.ts") },
    autoprefixer: {},
  },
};

export default config;
