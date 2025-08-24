/**
 * Simple test runner to validate the test setup
 * This can be used to check if the tests are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Validating test setup...\n');

// Check if required files exist
const requiredFiles = [
  'game.js',
  'game.test.js',
  'test-setup.js',
  'package.json',
  'jest.config.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📋 Test setup validation complete!');
console.log('Run "npm install" followed by "npm test" to execute the tests.');
