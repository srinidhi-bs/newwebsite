/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          background: '#FFFFFF',
          surface: '#F8F9FC',
          primary: '#6200EE',
          secondary: '#03DAC6',
          error: '#B00020',
          onBackground: '#1A1A1A',
          onSurface: '#1A1A1A',
          onPrimary: '#FFFFFF',
          onSecondary: '#000000',
          elevation: {
            1: '#FFFFFF',
            2: '#F5F5F5',
            3: '#F0F0F0',
            4: '#EBEBEB',
            6: '#E6E6E6',
            8: '#E1E1E1',
            12: '#DCDCDC',
            16: '#D7D7D7',
            24: '#D2D2D2'
          }
        },
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          error: '#CF6679',
          onBackground: '#FFFFFF',
          onSurface: '#FFFFFF',
          onPrimary: '#000000',
          onSecondary: '#000000',
          elevation: {
            1: '#1E1E1E',
            2: '#232323',
            3: '#252525',
            4: '#272727',
            6: '#2C2C2C',
            8: '#2E2E2E',
            12: '#333333',
            16: '#363636',
            24: '#383838'
          }
        }
      },
      backgroundColor: theme => ({
        ...theme('colors'),
      }),
      textColor: theme => ({
        ...theme('colors'),
      }),
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}