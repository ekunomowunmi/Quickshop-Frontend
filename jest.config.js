module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  transformIgnorePatterns: [
    // pnpm nests deps under node_modules/.pnpm/**/node_modules/<pkg>
    'node_modules/(?!.*(react-native|@react-native|expo(nent)?|expo-modules-core|@expo(nent)?/.*|@react-navigation/.*)/)',
  ],
  moduleNameMapper: {
    '^expo-modules-core/src/(.*)$': '<rootDir>/node_modules/expo-modules-core/src/$1',
  },
};

