import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wordCounter: resolve(__dirname, 'word-counter/index.html'),
        caseConverter: resolve(__dirname, 'case-converter/index.html'),
        codeCaseConverter: resolve(__dirname, 'code-case-converter/index.html'),
        textCleaner: resolve(__dirname, 'text-cleaner/index.html'),
        duplicateRemover: resolve(__dirname, 'duplicate-line-remover/index.html'),
        textCompare: resolve(__dirname, 'text-compare/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogTitleCase: resolve(__dirname, 'blog/how-to-convert-text-to-title-case/index.html'),
      },
    },
  },
});
