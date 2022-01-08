#!/usr/bin/env node
import  {SpyneCliUI} from './src/ui.js';
import clear from 'clear';
import SpyneAppCreator from './src/spyne-app-creator.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';
const args = process.argv;
import path from 'path';

console.log("ARGS ",{args}, path.resolve('./'))

const methodStr =  args.length>=3 ? args[2] : 'empty';
const folderName = args.length>=4 ? args[3] : undefined;

const createAppPrompt = methodStr === "create-app";
new SpyneAppCreator(args);

console.log('method string is ',{createAppPrompt,methodStr})


const startPromptFn = async()=>{
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
}

//startPromptFn();

