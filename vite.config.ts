import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { CSP_HEADER } from "./config/csp";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // Ensure dynamic imports resolve from root
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'csp-headers-dev-preview',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          // Apply ONLY to HTML navigations; harmless for assets.
          res.setHeader('Content-Security-Policy', CSP_HEADER);
          res.setHeader('X-Frame-Options', 'DENY'); // legacy clickjacking guard
          next();
        });
      },
      configurePreviewServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          res.setHeader('Content-Security-Policy', CSP_HEADER);
          res.setHeader('X-Frame-Options', 'DENY');
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React together with react-dom in a single chunk
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Use esbuild for minification (default)
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Generate source maps for production debugging
    sourcemap: mode === 'development',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    esbuildOptions: {
      // Ensure React is treated as external in development but bundled in production
      define: {
        global: 'globalThis',
      },
    },
  },
  worker: {
    format: 'es',
  },
}));
