import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: '#071426',
        navy: '#102B46',
        electric: '#287BFF',
        'cyan-glow': '#56D9F5',
        'cold-gray': '#F2F5F8',
        'slate-gray': '#64748B',
        delivered: '#16A673',
        'border-dark': 'rgba(255, 255, 255, 0.08)',
        'surface-dark': 'rgba(16, 43, 70, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [forms, containerQueries],
};
