#!/usr/bin/env node
import  {SpyneCliUI} from './src/ui.js';
import clear from 'clear';
import SpyneAppCreator from './src/spyne-app-creator.js';
import SpyneAppCreate from './src/spyne-app-create.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';
const args = process.argv;


//let spyneAppCreator = new SpyneAppCreator(args);
//const {createAppBool} = spyneAppCreator;


let spyneAppCreator = new SpyneAppCreate(process.argv.slice(2));
const {createAppBool} = spyneAppCreator;

const startPromptFn = async()=>{
  clear();
  SpyneCliUI.title();
  const spyneFilePrompt = new SpyneFilePrompt();
  await spyneFilePrompt.startPrompt();
}

if (createAppBool){
  //spyneAppCreator.generateResponse();
  spyneAppCreator.createApp();
} else {
  startPromptFn();
}

