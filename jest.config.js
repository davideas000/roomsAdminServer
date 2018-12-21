module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  clearMocks: true,
  coverageDirectory: "coverage",

  globals: {
    "ts-jest": {
      "tsConfigFile": "tsconfig.json"
    }
  },

  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],

  testEnvironment: "node",
  
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },

  testMatch: [
    // "**/__tests__/*.+(ts|tsx|js)"
    "**/src/**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "src/extra-tests/email-uniquiness.spec.ts",
    "src/admin.app.spec.ts"
  ]
};
