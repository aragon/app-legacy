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
    extend: {
      spacing: {
        0.1: '1px',
        0.25: '2px',
        0.5: '4px',
        0.75: '6px',
        1: '8px',
        1.5: '12px',
        1.75: '14px',
        2: '16px',
        2.25: '18px',
        2.5: '20px',
        2.75: '22px',
        3: '24px',
        3.5: '28px',
        4: '32px',
        4.5: '36px',
      },
      borderRadius: {
        larger: '10px',
      },
      boxShadow: {
        100: '0px 4px 8px rgba(31, 41, 51, 0.04), 0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04)',
        200: '0px 10px 20px rgba(31, 41, 51, 0.04), 0px 2px 6px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04)',
        300: '0px 16px 24px rgba(31, 41, 51, 0.06), 0px 2px 6px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04)',
        400: '0px 24px 32px rgba(31, 41, 51, 0.04), 0px 16px 24px rgba(31, 41, 51, 0.04), 0px 4px 8px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04)',
      },
    },
    lineHeight: {
      3: '24px',
      3.75: '30px',
      4.75: '38px',
      7.5: '60px',
    },
    // overrides font sizes according to design system
    // These are to be used on components (labels, etc.).
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
        fontSizeMin: 0.875, // 0.875rem === 14px
        fontSizeMax: 1, // 1rem === 16px
        ratioMin: 1.2, // Multiplicator Min: Minor Third
        ratioMax: 1.25, // Multiplicator Max Major Third
        screenMin: 20, // 20rem === 320px
        screenMax: 96, // 96rem === 1536px
        unit: 'rem',
        prefix: 'ft-',
      },
      // Creates the ft-text-xx classes. These are to be used for inline text
      // and headings.
      // 'lineHeight' is unitless.
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
