export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--clr-primary)',
        'primary-light': 'var(--clr-primary-light)',
        'primary-dark': 'var(--clr-primary-dark)',
        secondary: 'var(--clr-secondary)',
        'secondary-light': 'var(--clr-secondary-light)',
        'secondary-dark': 'var(--clr-secondary-dark)',
        accent: 'var(--clr-accent)',
        success: 'var(--clr-success)',
        warning: 'var(--clr-warning)',
        error: 'var(--clr-error)',
        info: 'var(--clr-info)',
      },
    },
  },
  plugins: [],
}
