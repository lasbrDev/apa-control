import TailwindAnimate from 'tailwindcss-animate'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Open Sans', 'Montserrat', 'Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        brand: 'hsl(var(--brand))',
        primary: 'hsl(var(--primary))',
        dark: 'hsl(var(--dark))',
        light: 'hsl(var(--light))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
      },
      transitionDuration: { 400: '400ms', 800: '800ms' },
      transitionTimingFunction: {
        'steps-12': 'steps(12, end)',
      },
    },
  },
  plugins: [TailwindAnimate],
}
