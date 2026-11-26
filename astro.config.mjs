// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // The site does not use sessions; skip the KV namespace the adapter would provision.
  session: false,
  devToolbar: {
    enabled: false,
  },
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
});
