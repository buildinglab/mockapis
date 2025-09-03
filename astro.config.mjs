import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const output = process.env.ASTRO_OUTPUT || 'static';
const base = process.env.ASTRO_BASE || '/mockapis/';

export default defineConfig({
  output,
  base,
  server: { port: 4321 },
  integrations: [tailwind()]
});
