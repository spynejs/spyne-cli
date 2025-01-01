#!/usr/bin/env node

import { SpyneCliUI } from './src/ui.js';
import clear from 'clear';
import { createNewApp } from './src/spyne-starter-app-create.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';

const command = process.argv[2];
const appName = process.argv[3];

const startPromptFn = async () => {
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
};

if (command === 'new' && appName) {
  // We can use an immediately-invoked async function
  // OR top-level await if your Node version supports it.
  (async () => {
    try {
      await createNewApp(appName);
    } catch (err) {
      console.error('Failed to create new application:', err.message);
      process.exit(1);
    }
  })();
} else {
  startPromptFn();
}
