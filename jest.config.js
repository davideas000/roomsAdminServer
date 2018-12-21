module.exports = {
  roots: [
    "<rootDir>/lib"
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
    "**/lib/**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "lib/extra-tests/email-uniquiness.spec.ts",
    "lib/admin.app.spec.ts"
  ]
};
