import enquirer from 'enquirer';
const {prompt, Select} = enquirer;

import {Data} from './spyne-template-prompts.js';
const {promptInputHash} = Data;
import GeneratePromptInputObject from './templates/generate-prompt-input-object.js';
import GenerateFileString from './templates/generate-file-string.js';
import {onSaveSpyneFileToDir} from './utils/file-utils.js';
import {generatePromptOutput} from './templates/generate-prompt-output.js';

export default class SpyneFilePrompt {

  constructor(props) {

  }

  static getFilePromptPropertiesObj(fileType) {
    return promptInputHash[fileType];

  }

  static getFilePrompt(fileType) {
    const mapInputTypesToPrompObj = (inputType) => {
      return new GeneratePromptInputObject(inputType,
          fileType).getPrompObject();
    };

    const filePropsObj = SpyneFilePrompt.getFilePromptPropertiesObj(fileType);
    const {props} = filePropsObj;
    return props.map(mapInputTypesToPrompObj);
  }

  getSelectPromptObj() {
    const promptGen = new GeneratePromptInputObject('selectFileType');
    return promptGen.getPrompObject();

  }

  saveFileAndSendOutput(answers) {
    const {fileType, fileName, fileDirectory} = answers;
    const {fileString} = new GenerateFileString(fileType, answers);
    const savedProps = onSaveSpyneFileToDir(fileString, fileName, fileDirectory);
    const msgOutput = generatePromptOutput(answers, savedProps, fileString);
    console.log(msgOutput);
  }

  async startPrompt() {
    const selectPromptObj = this.getSelectPromptObj();
    //console.log('select prompt obj is ',selectPromptObj);
    const selectPrompt = new Select(selectPromptObj);
    const onSelectComplete = async (fileType) => {
      const filePromptArr = SpyneFilePrompt.getFilePrompt(fileType);
      //console.log("promp arr is ",filePromptArr);
      const filePrompt = await prompt(filePromptArr);
      const answersObj = Object.assign({}, filePrompt, {fileType});
      this.saveFileAndSendOutput(answersObj);
    };

    selectPrompt.run().then(onSelectComplete);

  }

};
