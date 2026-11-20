import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  outDir: '../dist',
  site: process.env.PUBLIC_SITE_URL || undefined,
  integrations: [react()],
  devToolbar: {enabled: false},
  vite: {plugins: [tailwindcss(),{
    name: 'kanishka-legacy-addresses',
    configureServer(server) {
      // Read the original URL before prerendered Astro routes remove search parameters.
      server.middlewares.use((request,response,next)=>{
        const url=new URL(request.url||'/', 'http://localhost');
        const target={'/index.html':'/','/catalog.html':'/catalog/'}[url.pathname];
        if(!target)return next();
        response.writeHead(301,{Location:target+url.search});response.end();
      });
    },
  }]},
});
