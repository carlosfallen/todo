/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          light: {
            bg: '#F2F2F7',
            card: '#FFFFFF',
            border: '#E5E5EA',
            text: '#000000',
            secondary: '#8E8E93',
            accent: '#007AFF',
          },
          dark: {
            bg: '#000000',
            card: '#1C1C1E',
            elevated: '#2C2C2E',
            border: '#38383A',
            text: '#FFFFFF',
            secondary: '#8E8E93',
            accent: '#0A84FF',
          }
        },
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '20px',
        'ios-xl': '28px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      fontSize: {
        'ios-xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'ios-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'ios-base': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'ios-lg': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'ios-xl': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'ios-2xl': ['34px', { lineHeight: '41px', fontWeight: '700' }],
      },
      fontFamily: {
        'ios': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        'ios': '20px',
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'ios': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
