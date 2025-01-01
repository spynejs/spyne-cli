// mocha.conf.js

module.exports = {
  // Look for test files in the `tests` folder
  spec: 'tests/**/*.test.js',

  exclude: [
      'tests/create-spyne-app-test.js'

  ],
  // You can also specify mocha options here
  extension: ['js'],       // The file extensions Mocha should look for
  ui: 'bdd',               // BDD-style (describe/it)
  timeout: 5000,           // Test timeout in milliseconds
  reporter: 'spec',        // The built-in "spec" reporter
};
