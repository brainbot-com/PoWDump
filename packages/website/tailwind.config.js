module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'white': '#FAFAFA',
        'gray': '#bbbabe',
        'gray-500': '#454041',
        'orange': '#ef5a0f',
        'yellow': '#f4c500',
        'pink': '#f99585',
        'green': '#19dd55',
        'brown-orange': '#773116',
        'rich-black': {
          lightest: "#454041",
          lighter: "#201010",
          DEFAULT: "#150201",
        }
      },
      borderRadius: {
        lg: "30px",
        md: "20px",
        sm: "10px",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
