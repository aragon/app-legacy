import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, loadEnv} from 'vite';
import {ViteDevServer} from 'vite';
import {visualizer} from 'rollup-plugin-visualizer';

const pluginWatchNodeModules = (modules: string[]) => {
  const pattern = `/node_modules\\/(?!${modules.join('|')}).*/`;

  return {
    name: 'watch-node-modules',
    configureServer: (server: ViteDevServer): void => {
      server.watcher.options = {
        ...server.watcher.options,
        ignored: [new RegExp(pattern), '**/.git/**'],
      };
    },
  };
};

// Plugin so we can use default %env_variable%
const htmlEnvPlugin = (mode: string) => {
  const env = loadEnv(mode, 'env');

  // Default deploy-version to npm package version when the environment variable
  // is not set (e.g. local build)
  env['VITE_REACT_APP_DEPLOY_VERSION'] ??= process.env.npm_package_version!;

  return {
    name: 'html-transform',
    transformIndexHtml: (html: string) =>
      html.replace(/%(.*?)%/g, (_, p1) => env[p1]),
  };
};

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const watchMode = process.env.WATCH === 'true';
  const analyze = process.env.ANALYZE === 'true';

  return {
    plugins: [
      htmlEnvPlugin(mode),
      react(),
      tsconfigPaths(),
      watchMode ? pluginWatchNodeModules(['@aragon/ods']) : undefined,
      analyze ? visualizer({open: true}) : undefined,
    ],

    optimizeDeps: {
      exclude: watchMode ? ['@aragon/ods'] : undefined,
      esbuildOptions: {
        target: 'es2020',
      },
    },

    resolve: {
      preserveSymlinks: !watchMode,
      alias: watchMode
        ? {'@aragon/ods': '@aragon/ods/dist/index.es'}
        : undefined,
    },

    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            'osx-ethers': ['@aragon/osx-ethers'],
            tiptap: [
              '@tiptap/extension-link',
              '@tiptap/extension-placeholder',
              '@tiptap/react',
              '@tiptap/starter-kit',
            ],
          },
        },
      },
    },
  };
});
