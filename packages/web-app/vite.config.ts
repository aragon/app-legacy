import typescript from '@rollup/plugin-typescript';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, loadEnv} from 'vite';
import {resolve} from 'path';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, 'env');

  // Plugin so we can use default %env_variable%
  const htmlEnvPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, (_, p1) => {
          return env[p1];
        });
      },
    };
  };

  return {
    base: '',
    plugins: [
      htmlEnvPlugin(),
      reactRefresh(),
      tsconfigPaths(),
      typescript({tsconfig: './tsconfig.json'}),
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          nested: resolve(__dirname, 'ipfs-404.html'),
        },
      },
    },
  };
});
