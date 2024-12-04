import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    runtime: {
      mode: 'local',
      type: 'pages',
      bindings: {
        // Add your environment variables here
        SUPABASE_URL: { type: 'plain_text' },
        SUPABASE_ANON_KEY: { type: 'plain_text' },
      },
    },
    routes: {
      strategy: 'include',
      patterns: ['/*'],
    },
  }),
  integrations: [tailwind()],
});
