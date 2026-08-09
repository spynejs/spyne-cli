import enquirer from 'enquirer';
const {prompt, Select} = enquirer;
import c from 'ansi-colors';

import {Data} from './spyne-template-prompts.js';
const {promptInputHash} = Data;
import GeneratePromptInputObject from './templates/generate-prompt-input-object.js';
import {appCommands, moduleCommands} from './registry.js';
import {generateModule} from './core/generate-module.js';
import {createApp, detectSpyneProject} from './core/create-app.js';
import {
  appNamePrompt,
  createProgressReporter,
  renderAppResult,
  renderError,
  renderModuleResult,
  selectSizing,
  templatePrompt,
} from './cli/render.js';

// Picker labels come from the registry, so command messaging has one home.
const APP_LABELS = new Set(appCommands.map((cmd) => cmd.pickerLabel));

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

  /**
   * The picker is a renderer over the registry: App first, then every module
   * command in registry order.
   */
  getSelectPromptObj() {
    const promptGen = new GeneratePromptInputObject('selectFileType');
    const promptObj = promptGen.getPrompObject();

    promptObj.choices = [
      ...appCommands.map((cmd) => ({
        name: cmd.pickerLabel,
        message: c.greenBright(cmd.pickerLabel),
        hint: c.dim(`— ${cmd.summary}`),
      })),
      ...moduleCommands.map((cmd) => c.greenBright(cmd.pickerLabel)),
    ];

    Object.assign(promptObj, selectSizing(promptObj.choices.length));

    return promptObj;
  }

  async saveFileAndSendOutput(answers) {
    const result = await generateModule(answers);

    if (!result.ok && result.error.code === 'NOT_IN_SPYNE_PROJECT') {
      console.log(renderError(result.error));
      process.exitCode = 1;
      return result;
    }

    console.log(renderModuleResult(result));
    if (!result.ok) process.exitCode = 1;
    return result;
  }

  async runAppPrompt() {
    const {isSpyneProject, root} = detectSpyneProject();

    if (isSpyneProject) {
      const {proceed} = await prompt({
        type: 'confirm',
        name: 'proceed',
        initial: false,
        message: c.yellow(
            `This creates a new app inside an existing SpyneJS project (${root}) — continue?`),
      });
      if (!proceed) return undefined;
    }

    // Template first: the general choice before the specific one.
    const answers = await prompt([templatePrompt(), appNamePrompt()]);

    const result = await createApp({
      ...answers,
      onProgress: createProgressReporter(),
    });

    console.log(result.ok
        ? renderAppResult(result)
        : renderError(result.error));

    if (!result.ok) process.exitCode = 1;
    return result;
  }

  async startPrompt() {
    const selectPrompt = new Select(this.getSelectPromptObj());
    const selection = await selectPrompt.run();

    if (APP_LABELS.has(selection)) {
      return this.runAppPrompt();
    }

    const filePromptArr = SpyneFilePrompt.getFilePrompt(selection);
    const filePrompt = await prompt(filePromptArr);
    return this.saveFileAndSendOutput(
        Object.assign({}, filePrompt, {fileType: selection}));
  }

};
