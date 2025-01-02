import enquirer from 'enquirer';
const {prompt, Select} = enquirer;

import {Data} from './spyne-template-prompts.js';
const {promptInputHash} = Data;
import GeneratePromptInputObject from './templates/generate-prompt-input-object.js';
import GenerateFileString from './templates/generate-file-string.js';
import {onSaveSpyneFileToDir} from './utils/file-utils.js';
import {generatePromptOutput} from './templates/generate-prompt-output.js';
import {addChannelToIndexJS} from './utils/add-channel-to-index-file.js';
import {insertChannelStrings} from './utils/insert-channel-strings-to-index-file.js';

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
    const {fileType, fileName, fileDirectory, className} = answers;
    const {fileString} = new GenerateFileString(fileType, answers);
    const savedProps = onSaveSpyneFileToDir(fileString, fileName, fileDirectory);

    // default is no channel to be registered, yet
    let channelHasRegistered = false;

    if (fileType === 'Channel'){
      //const savedChannelToIndexProps = addChannelToIndexJS(className, fileName);
      const savedChannelToIndexProps = insertChannelStrings(className, fileName);

      // check if channel has been registered
      channelHasRegistered = savedChannelToIndexProps.fileHasSaved;
    }

    const msgOutput = generatePromptOutput(answers, savedProps, fileString, channelHasRegistered);


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
