#!/usr/bin/env node
import  {SpyneCliUI} from './src/ui.js';
import clear from 'clear';
import SpyneFilePrompt from './src/spyne-file-prompt.js';

const startPromptFn = async()=>{
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
}

startPromptFn();

