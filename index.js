#!/usr/bin/env node
import  {SpyneCliUI} from './src/ui.js';
import clear from 'clear';
import SpyneAppCreator from './src/spyne-app-creator.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';
const args = process.argv;
import path from 'path';


console.log("PATH START ",path.resolve('./'));

let spyneAppCreator = new SpyneAppCreator(args);
const {createAppBool} = spyneAppCreator;


console.log('method string is ',{createAppBool})

spyneAppCreator.generateResponse();

const startPromptFn = async()=>{
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
}

//startPromptFn();

