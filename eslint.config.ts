import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // Esto hace la magia: activa el plugin de prettier y apaga las reglas conflictivas
  eslintPluginPrettierRecommended,
  {
    rules: {
      // Reglas de calidad puras de TS (tu formato lo maneja Prettier ahora)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      
      // Puedes sobrescribir reglas de Prettier aquí si lo necesitas
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  }
);