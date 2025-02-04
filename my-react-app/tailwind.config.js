// tailwind.config.js
export const content = [
  "./index.html", // Add this to ensure tailwind processes the HTML file
  "./src/**/*.{js,jsx,ts,tsx}" // Ensure all JavaScript/JSX files in the src folder are processed
];
export const theme = {
  extend: {
    animation: {
      'shimmer-text': 'shimmer-text 3s ease-in-out infinite',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      'pulse-slow': 'pulse 4s cubic-bezier(0, 0, 0.2, 1) infinite',
      'gradient': 'gradient 6s linear infinite',
      'gradient-x': 'gradient-x 15s ease infinite',
      'bounce-x': 'bounce-x 1s ease-in-out infinite',
      'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
      'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
      'flash-shimmer': 'flash-shimmer 2.5s linear infinite',
      'title-shine': 'title-shine 2s linear infinite',
      'rainbow-move': 'rainbow-move 3s linear infinite',
      'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      'shimmer': 'shimmer 2s linear infinite',
      'rainbow': 'rainbow 3s linear infinite',
      'pulse-glow': 'pulse-glow 2s infinite',
      'flash': 'flash 2.5s infinite',
    },
    keyframes: {
      shimmer: {
        '0%': { transform: 'translateX(-150%)' },
        '100%': { transform: 'translateX(150%)' }
      },
      rainbow: {
        '0%, 100%': {
          'background-size': '200% 200%',
          'background-position': 'left center'
        },
        '50%': {
          'background-size': '200% 200%',
          'background-position': 'right center'
        }
      },
      'pulse-glow': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.7 }
      },
      flash: {
        '0%': { transform: 'translateX(-100%)', opacity: 0 },
        '50%': { transform: 'translateX(0)', opacity: 0.8 },
        '100%': { transform: 'translateX(100%)', opacity: 0 }
      }
    },
      'flash-shimmer': {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '50%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(100%)', opacity: 0 },
        },
        'title-shine': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        'rainbow-move': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.8, filter: 'brightness(1)' },
          '50%': { opacity: 1, filter: 'brightness(1.2)' }
        },
      'shimmer-text': {
        '0%, 100%': {
          'background-size': '200% 200%',
          'background-position': 'left center'
        },
        '50%': {
          'background-size': '200% 200%',
          'background-position': 'right center'
        },
      },
      gradient: {
        '0%, 100%': {
          'background-position': '0% 50%',
        },
        '50%': {
          'background-position': '100% 50%',
        },
    },
    'gradient-x': {
      '0%, 100%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
    },
    'bounce-x': {
      '0%, 100%': { transform: 'translateX(0)' },
      '50%': { transform: 'translateX(0.25rem)' },
    },
    'pulse-subtle': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.8' },
    },
    'slide-in-left': {
      from: { transform: 'translateX(-100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    'slide-in-right': {
      from: { transform: 'translateX(100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
  },
};
export const plugins = [];
