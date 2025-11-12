const c = require('./src/styles/colors.js');
module.exports = {
  content: ['./App.{js,ts,tsx}', './app/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: c.primary,
        'primary-soft': c.primarySoft,
        bg: c.bg,
        surface: c.surface,
        content: c.content,
        muted: c.muted,
        border: c.border,
        'accent-1': c.accent1,
        'accent-2': c.accent2,
        danger: c.danger,
      },
      boxShadow: { glow: '0 0 10px 0 rgba(255,214,0,0.5)' },
    },
  },
};
