// mocha.conf.js

module.exports = {
  // Look for test files in the `tests` folder
  spec: 'tests/**/*.test.js',

  // Creates the ./src/app fixture tree the generator writes into.
  require: ['./tests/root-hooks.js'],

  // You can also specify mocha options here
  extension: ['js'],       // The file extensions Mocha should look for
  ui: 'bdd',               // BDD-style (describe/it)
  timeout: 5000,           // Test timeout in milliseconds
  reporter: 'spec',        // The built-in "spec" reporter
};
