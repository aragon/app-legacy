/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('@aragon/ods/tailwind.config'),
  ],
  content: [
    './src/**/*.{tsx,html}',
    './node_modules/@aragon/ods/**/*.js',
  ],
  /*
  theme: {
    lineHeight: {
      3: '24px',
      3.75: '30px',
      4.75: '38px',
      7.5: '60px',
    },
    fontSize: {
      xs: ['0.64rem', 1.5],
      sm: ['0.8rem', 1.5],
      base: ['1rem', 1.5],
      lg: ['1.25rem', 1.5],
      xl: ['1.563rem', 1.2],
      '2xl': ['1.953rem', 1.2],
      '3xl': ['2.441rem', 1.2],
      '4xl': ['3.052rem', 1.2],
      '5xl': ['3.185rem', 1.2],
    },
  },
  */
  plugins: [
    require('tailwindcss-fluid-type')({
      settings: {
        fontSizeMin: 0.875, // 14px
        fontSizeMax: 1, // 16px
        ratioMin: 1.2, // Min multiplicator: Minor Third
        ratioMax: 1.25, // Max multiplicator: Major Third
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
