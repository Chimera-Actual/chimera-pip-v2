import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui') || id.includes('@dnd-kit')) {
              return 'vendor-ui';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            if (id.includes('recharts') || id.includes('react-markdown')) {
              return 'vendor-charts';
            }
            return 'vendor-misc';
          }
          // Split widget components
          if (id.includes('src/components/widgets')) {
            return 'widgets';
          }
          // Split UI components
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
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
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  worker: {
    format: 'es',
  },
}));
