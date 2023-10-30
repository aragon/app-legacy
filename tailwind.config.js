/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('@aragon/ods/tailwind.config'),
  ],
  content: [
    './src/**/*.{tsx,html}',
    './node_modules/@aragon/ods/**/*.js',
  ],
  plugins: [
    require('tailwindcss-fluid-type')({
      settings: {
        ratioMin: 1.2, // Min multiplicator: Minor Third
        ratioMax: 1.25, // Max multiplicator: Major Third
        fontSizeMin: 0.875, // 14px
        fontSizeMax: 1, // 16px
        screenMin: 20, // 320px
        screenMax: 96, // 1536px
        unit: 'rem',
        prefix: 'ft-',
      },
      values: {
        xs: [-2, 1.5],
        sm: [-1, 1.5],
        base: [0, 1.5],
        lg: [1, 1.5],
        xl: [2, 1.2],
        '2xl': [3, 1.2],
        '3xl': [4, 1.2],
        '4xl': [5, 1.2],
        '5xl': [6, 1.2],
      },
    }),
  ],
};
