import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        background: '#F7FBFF',
        foreground: '#0F172A',
        primary: '#0B6EFD',
        secondary: '#E6F0FF',
        card: '#FFFFFF',
        muted: '#EEF5FF',
        danger: '#E53935',
        warning: '#F59E0B',
        success: '#16A34A'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(14, 56, 112, 0.08)'
      },
      borderRadius: {
        xl2: '1rem'
      },
      keyframes: {
        floatIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        floatIn: 'floatIn 0.35s ease-out'
      }
    }
  },
  plugins: []
};

export default config;
