const images = require('@rollup/plugin-image');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const {uglify} = require('rollup-plugin-uglify');

module.exports = {
  rollup(config, opts) {
    // suppress prevent assignment warning
    config.plugins = config.plugins.map(plugin =>
      plugin.name === 'replace'
        ? replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env),
            preventAssignment: true,
          })
        : plugin
    );

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
