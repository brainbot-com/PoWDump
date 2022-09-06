module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'rich-black': '#150201',
        'white': '#FAFAFA',
        'gray': '#bbbabe',
        'gray-500': '#454041',
        'orange': '#ef5a0f',
        'yellow': '#f4c500',
        'pink': '#f99585',
        'green': '#19dd55',
        'brown-orange': '#773116',

      },
      borderRadius: {
        lg: "30px",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
