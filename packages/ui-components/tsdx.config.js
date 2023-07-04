const images = require('@rollup/plugin-image');
const postcss = require('rollup-plugin-postcss');
const {uglify} = require('rollup-plugin-uglify');

module.exports = {
  rollup(config) {
    config.plugins = [
      // postcss config
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),

      // plugin for bundling images
      images({include: ['**/*.png', '**/*.jpg', '**/*.svg']}),

      // uglify code
      uglify(),

      ...config.plugins,
    ];

    return config;
  },
};
