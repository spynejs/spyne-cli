import {Data} from '../spyne-template-prompts.js';
const {promptTypes} = Data;
import PromptInputField from './generate-prompt-input-fields.js';

import enquirer from 'enquirer';
const {prompt} = enquirer;
import * as R  from 'ramda';
import fs from 'fs';
import color from 'ansi-colors';

let _inputType;
let _fileType;
let _type = "input";
let _promptObjSettings;
let _promptObj;

export default class GeneratePromptInputObject{

  constructor(inputType, fileType, props={}) {
    _inputType = inputType;
    _fileType = fileType;
    _promptObjSettings = GeneratePromptInputObject.getPromptObjSettings();
    //console.log("PROMPT SETTINGS ",{_promptObjSettings,_inputType, promptTypes})
  }

  getPrompObject() {
    const {fields, type} = _promptObjSettings;

    const fieldsObj = {};
    fieldsObj['type'] = type || 'input';

    const reducer = (acc={}, key)=>{
      acc[key]=  new PromptInputField(_inputType, _fileType, key).field;
      return acc;
    }

    return _promptObjSettings.fields.reduce(reducer, fieldsObj);
  }

  static getPromptObjSettings(){
   return R.compose(R.head, R.filter(R.propEq('inputType', _inputType)))(promptTypes);
  }

}


