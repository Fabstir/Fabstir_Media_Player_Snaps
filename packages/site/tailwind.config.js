/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#181a1b',
        white: '#f8f8f8',
        'light-gray': '#d0d3cd',
        gray: '#aaaaaa',
        'dark-gray': '#252627',
        'medium-dark-gray': '#4a4b4c',
        'light-pink': '#f78fa7',
        primary: {
          DEFAULT: 'var(--primary-color)',
          content: 'var(--primary-content-color)',
          dark: 'var(--primary-dark-color)',
          light: 'var(--primary-light-color)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          content: 'var(--secondary-content-color)',
          dark: 'var(--secondary-dark-color)',
          light: 'var(--secondary-light-color)',
        },
        success: {
          DEFAULT: 'var(--success-color)',
          content: 'var(--success-content-color)',
        },
        warning: {
          DEFAULT: 'var(--warning-color)',
          content: 'var(--warning-content-color)',
        },
        error: {
          DEFAULT: 'var(--error-color)',
          content: 'var(--error-content-color)',
        },
        copy: {
          DEFAULT: 'var(--light-copy)',
          light: 'var(--light-copy-light)',
          lighter: 'var(--light-copy-lighter)',
        },
        foreground: 'var(--light-foreground)',
        background: 'var(--light-background)',
        border: 'var(--light-border)',

        // button: {
        //   background: 'var(--light-button-color)',
        //   text: 'var(--light-button-text-color)',
        // },
        // buttonShadow: 'var(--light-button-shadow)',
        // background: 'var(--light-background-color)',
        // text: 'var(--light-text-color)',
        // foreground: '#fbfbfb',
        // border: '#e0dde2',
        // hover: {
        //   background: 'var(--light-button-hover-color)',
        //   text: 'var(--light-button-hover-text-color)',
        // },
        dark: {
          primary: {
            DEFAULT: 'var(--primary-color)',
            content: 'var(--primary-content-color)',
            dark: 'var(--primary-dark-color)',
            light: 'var(--primary-light-color)',
          },
          secondary: {
            DEFAULT: 'var(--secondary-color)',
            content: 'var(--secondary-content-color)',
            dark: 'var(--secondary-dark-color)',
            light: 'var(--secondary-light-color)',
          },
          success: {
            DEFAULT: 'var(--success-color)',
            content: 'var(--success-content-color)',
          },
          warning: {
            DEFAULT: 'var(--warning-color)',
            content: 'var(--warning-content-color)',
          },
          error: {
            DEFAULT: 'var(--error-color)',
            content: 'var(--error-content-color)',
          },
          copy: {
            DEFAULT: 'var(--dark-copy)',
            light: 'var(--dark-copy-light)',
            lighter: 'var(--dark-copy-lighter)',
          },
          foreground: 'var(--dark-foreground)',
          background: 'var(--dark-background)',
          border: 'var(--dark-border)',
         
          // button: {
          //   background: 'var(--dark-button-color)',
          //   text: 'var(--dark-button-text-color)',
          // },
          // buttonShadow: 'var(--dark-button-shadow)',
          // background: 'var(--dark-background-color)',
          // text: 'var(--dark-text-color)',
          // foreground: '#2c292d',
          // border: '#3f3b42',
          // hover: {
          //   background: 'var(--dark-button-hover-color)',
          //   text: 'var(--dark-button-hover-text-color)',
          // },
        },
      },
    },
  },
  plugins: [],
};
