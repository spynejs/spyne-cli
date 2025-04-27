#!/usr/bin/env node

import { SpyneCliUI } from './src/ui.js';
import clear from 'clear';
import { createNewApp } from './src/spyne-starter-app-create.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';

const command = process.argv[2];
const appName = process.argv[3];

// Simple check if user included "-spa" or "--spa" anywhere in the process.argv
const isSPA = process.argv.includes('-spa') || process.argv.includes('--spa');

const startPromptFn = async () => {
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
};

if (command === 'new' && appName) {
  (async () => {
    try {
      // Pass the isSPA boolean to createNewApp
      await createNewApp(appName, isSPA);
    } catch (err) {
      console.error('Failed to create new application:', err.message);
      process.exit(1);
    }
  })();
} else {
  startPromptFn();
}
