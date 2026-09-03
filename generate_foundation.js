const fs = require('fs');
const path = require('path');

const root = __dirname;

const files = {
  'package.json': `{
  "name": "civicconnect",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.3",
    "vite": "^5.3.5"
  }
}`,
  'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'tailwind.config.ts': `import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette - Deep Navy / Trust hierarchy
        primary: '#002045',
        'on-primary': '#ffffff',
        'primary-container': '#1a365d',
        'on-primary-container': '#86a0cd',
        'primary-fixed': '#d6e3ff',
        'primary-fixed-dim': '#adc7f7',
        'on-primary-fixed': '#001b3c',
        'on-primary-fixed-variant': '#2d476f',
        'inverse-primary': '#adc7f7',
        // Secondary palette - Royal Blue
        secondary: '#1960a3',
        'on-secondary': '#ffffff',
        'secondary-container': '#7db6ff',
        'on-secondary-container': '#00477f',
        'secondary-fixed': '#d3e4ff',
        'secondary-fixed-dim': '#a2c9ff',
        'on-secondary-fixed': '#001c38',
        'on-secondary-fixed-variant': '#004881',
        // Tertiary palette - Amber/Warning
        tertiary: '#321b00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#4f2e00',
        'on-tertiary-container': '#c6955e',
        'tertiary-fixed': '#ffddba',
        'tertiary-fixed-dim': '#f2bc82',
        'on-tertiary-fixed': '#2b1700',
        'on-tertiary-fixed-variant': '#633f0f',
        // Error palette - Crimson
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        // Surface stack
        surface: '#faf9fd',
        'surface-dim': '#dad9dd',
        'surface-bright': '#faf9fd',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f3f7',
        'surface-container': '#efedf1',
        'surface-container-high': '#e9e7eb',
        'surface-container-highest': '#e3e2e6',
        'on-surface': '#1a1c1e',
        'on-surface-variant': '#43474e',
        'surface-variant': '#e3e2e6',
        'surface-tint': '#455f88',
        'inverse-surface': '#2f3033',
        'inverse-on-surface': '#f1f0f4',
        // Outline
        outline: '#74777f',
        'outline-variant': '#c4c6cf',
        // Background
        background: '#faf9fd',
        'on-background': '#1a1c1e',
        // Semantic status colors (used in complaints/badges)
        'status-pending': '#74777f',
        'status-pending-bg': '#f4f3f7',
        'status-assigned': '#1960a3',
        'status-assigned-bg': '#d3e4ff',
        'status-in-progress': '#b45309',
        'status-in-progress-bg': '#ffddba',
        'status-resolved': '#137333',
        'status-resolved-bg': '#E6F4EA',
        'status-escalated': '#ba1a1a',
        'status-escalated-bg': '#ffdad6',
        'status-closed': '#43474e',
        'status-closed-bg': '#e3e2e6',
        'status-rejected': '#ba1a1a',
        'status-rejected-bg': '#ffdad6',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        unit: '8px',
        gutter: '24px',
        'margin-mobile': '16px',
        'container-max': '1280px',
        'touch-target-min': '44px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        'body-md': ['Inter'],
        'body-lg': ['Inter'],
        'label-md': ['Inter'],
        caption: ['Inter'],
        'headline-md': ['Inter'],
        'headline-lg': ['Inter'],
        'headline-lg-mobile': ['Inter'],
        'headline-xl': ['Inter'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      boxShadow: {
        header: '0 1px 8px rgba(0,0,0,0.04)',
        card: '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        sidebar: '4px 0 24px rgba(0,0,0,0.04)',
        overlay: '0 8px 32px rgba(0,32,69,0.10)',
      },
      backdropBlur: {
        header: '20px',
      },
    },
  },
  plugins: [],
} satisfies Config`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>CivicConnect</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  '.eslintrc.cjs': `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}`,
  '.gitignore': `node_modules
dist
.env
.env.local
.env.*.local`,
  'src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    overflow-x: hidden;
  }
  body {
    overscroll-behavior: none;
    font-family: 'Inter', ui-sans-serif, system-ui;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
  .pt-safe { padding-top: env(safe-area-inset-top, 0px); }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .icon-filled { font-variation-settings: 'FILL' 1; }
}`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(root, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});
console.log('Foundation files generated.');
