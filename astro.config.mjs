import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const output = process.env.ASTRO_OUTPUT || 'hybrid'; // use 'static' for GitHub Pages builds
const base = process.env.ASTRO_BASE || '/'; // set to '/<repo>/' on GitHub Pages

export default defineConfig({
  output,
  base,
  server: { port: 4321 },
  integrations: [tailwind()]
});
