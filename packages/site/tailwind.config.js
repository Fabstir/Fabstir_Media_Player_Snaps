/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'fabstir-black': '#181a1b',
        'fabstir-white': '#f8f8f8',
        'fabstir-light-gray': '#d0d3cd',
        'fabstir-gray': '#aaaaaa',
        'fabstir-dark-gray': '#252627',
        'fabstir-medium-dark-gray': '#4a4b4c',
        'fabstir-light-pink': '#f78fa7',
        primary: {
          DEFAULT: '#540074',
          content: '#d974ff',
          dark: '#2f0041',
          light: '#7900a7',
        },
        secondary: {
          DEFAULT: '#74005a',
          content: '#ff74e0',
          dark: '#410032',
          light: '#a70082',
        },
        background: '#f0eff1',
        foreground: '#fbfbfb',
        border: '#e0dde2',
        copy: {
          DEFAULT: '#282329',
          light: '#695e6e',
          lighter: '#908495',
        },
        success: {
          DEFAULT: '#007400',
          content: '#74ff74',
        },
        warning: {
          DEFAULT: '#747400',
          content: '#ffff74',
        },
        error: {
          DEFAULT: '#740000',
          content: '#ff7474',
        },
        dark: {
          primary: {
            DEFAULT: '#7900a7',
            content: '#d974ff',
            dark: '#540074',
            light: '#9500cf',
          },
          secondary: {
            DEFAULT: '#a70082',
            content: '#ff74e0',
            dark: '#74005a',
            light: '#cf00a0',
          },
          background: '#1a181b',
          foreground: '#2c292d',
          border: '#3f3b42',
          copy: {
            DEFAULT: '#e0dde2',
            light: '#b3adb7',
            lighter: '#8c858f',
          },
          success: {
            DEFAULT: '#00a700',
            content: '#74ff74',
          },
          warning: {
            DEFAULT: '#a7a700',
            content: '#ffff74',
          },
          error: {
            DEFAULT: '#a70000',
            content: '#ff7474',
          },
        },
      },
    },
  },
  plugins: [],
};
