import {Data} from '../spyne-template-prompts.js';
import ErrorLogger  from '../utils/error-logger.js';

const {
  appPath,
  promptInputHash,
  inputTypesArr,
  fileTypesArr,
  fieldTypesArr,
} = Data;

import enquirer from 'enquirer';
const {prompt, Select} = enquirer;

import c from 'ansi-colors';
import R  from 'ramda';
import {getLocalFileDirectory, validateFileDirectory} from '../utils/file-utils.js';
import changeCase from 'change-case';

const {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} = changeCase;

const validateFieldFn = R.curry((arr, type, value) => {
  const isValid = arr.indexOf(value) >= 0;
  if (isValid) {
    return value;
  } else if (_inputType !== 'selectFileType') {
    ErrorLogger.log(`value, ${value}, for ${type} is not valid`,
        'validateProps');
  }

});

const isInitSelect = () => _inputType === 'selectFileType';

const validateInputType = validateFieldFn(inputTypesArr, 'inputType');
const validateFileType = validateFieldFn(fileTypesArr, 'fileType') ||
    isInitSelect();
const validateFieldType = validateFieldFn(fieldTypesArr, 'fieldType');
const messageColor = c.blueBright;
const answerColor = c.greenBright;

const messageMapColor = (m) => c.blueBright(m);
const choicesMapColor = (choice) => {
  return c.greenBright(choice)
};


const choicesResultParseFileName = (choice) => {
  const fileNameIsValid = validteJsSuffix(choice);
  choice = fileNameIsValid === true ? choice : choice+".js";
  return c.unstyle(c.greenBright(choice))
};

const choicesResultParse = (choice, args) => {
  return c.unstyle(c.greenBright(choice))
};
const validatorLength = value => String(value).length > 3;

let _inputType;
let _fileType;
let _fieldType;
let _type = 'input';
let _name;
let _message;
let _format;
let _result;
let _initial;
let _hint;
let _validateMethod;
let _options;

let _field;

const generateName = () => {
  return 'thename';
};

const pathProp = (arr) => R.path(arr);

const dataProp = (prop) => pathProp(['enquirer', 'answers', prop]);

const toPascalCase = (str) => {
  const fileNoSuffix = String(str).replace(/^(.*)(.js)$/, '$1');
  return pascalCase(fileNoSuffix);
};

const toConstantCase = (data) => {
  let classNameStr = dataProp('className')(data);
  if (String(classNameStr).toLowerCase().indexOf('channel') !== 0) {
    classNameStr = 'Channel' + classNameStr;
  }
  return constantCase(classNameStr);
};

const generateMethodPrefix = (data) => {
  let classNameAnswer = dataProp('className')(data);
  const classNameSentence = sentenceCase(classNameAnswer);
  const classNameArr = String(classNameSentence).split(' ');
  const len = classNameArr.length >= 2 ? 2 : 1;
  const splitArr = R.slice(0, len, classNameArr);
  return `${camelCase(splitArr.join('-'))}$`;
};

const generateInitialFileName = () => {
  const initialFileNameHash = {
    ViewStream: 'my-ui-el-view.js',
    DomElement: 'my-dom-element.js',
    Channel: 'channel-custom.js',
    SpyneTrait: 'my-custom-trait.js',
  };

  return initialFileNameHash[_fileType];

};

const validteJsSuffix = (value) => {
  const isValid = /(.*)(.js)/.test(value);
  return isValid || 'file needs to end in .js';
};

const generateValidatorFn = () => {
  const inputTypeHash = {
    fileName: validteJsSuffix,
    fileDirectory: validateFileDirectory,

  };
  const fn = inputTypeHash[_inputType];
  return fn;
};

const generateInitial = () => {
  const inputTypeHash = {

    fileName: generateInitialFileName(),
    className: R.compose(toPascalCase, dataProp('fileName')),
    fileDirectory: getLocalFileDirectory(_fileType),
    methodPrefix: generateMethodPrefix,
    channelName: toConstantCase,

  };

  const fn = inputTypeHash[_inputType];

  return fn;

};

const generateChoices = () => {
  const inputTypeHash = {
    selectFileType: fileTypesArr.map(choicesMapColor),

  };

  const fn = inputTypeHash[_inputType];
  return fn;

};

const generateMesage = () => {

  const defaultMsgFn = messageColor(`Enter the ${_fileType} file name`);

  const inputTypeHash = {
    selectFileType: messageColor(`Select file type`),
    fileName: defaultMsgFn,
    className: messageColor(`Enter the ${_fileType} class name`),
    fileDirectory: messageColor(`Enter where you would like to save the ${_fileType} file`),
    methodPrefix: messageColor(`Enter the string to be prepended to all trait methods`),
    channelName: (d) => messageColor(R.compose(R.concat('Enter the channel name for '), R.path(['answers', 'className']))(d)),
    replayLastPayload: messageColor(`This property determines if new subscribers receive the previous payload`),
  };

  const fn = inputTypeHash[_inputType];
  return fn;
};

const getType = () => 'input';
const getName = () => _inputType;
const getFormatFn = () => choicesMapColor;
const getResultFn =       () =>   choicesResultParse;
const getResultFileNameFn = () => choicesResultParseFileName;
const getInitial = () => 'initial options';
const getHint = () => 'custom hint';
const getMessage = () => generateMesage();
const getValidattionFn = () => generateValidatorFn();



export default class PromptInputField {

  constructor(inputType, fileType, fieldType, options = {}) {
    _inputType = validateInputType(inputType);
    _fileType = validateFileType(fileType);
    _fieldType = validateFieldType(fieldType);
    _options = options;
    //console.log('intput type is ', {_inputType, _fileType, _fieldType, inputTypesArr})
    this.generateField();
  }



  generateField() {

    const checkForCustomFileNameResult = ()=>{
      const isFileNameInput =    _inputType === 'fileName';
      const isResultMethodType = _fieldType === 'result';
      const isCustomFileNameResult = isFileNameInput && isResultMethodType;
      _fieldType = isCustomFileNameResult ? "resultFileName" : _fieldType;
    }



    const fieldMethodHash = {
      type: getType,
      name: getName,
      format: getFormatFn,
      result: getResultFn,
      resultFileName: getResultFileNameFn,
      message: getMessage,
      initial: generateInitial,
      hint: getHint,
      choices: generateChoices,
      validate: getValidattionFn,
    };

    //checkForCustomFileNameResult();

    const fieldMethod = fieldMethodHash[_fieldType];
    _field = fieldMethod();

  }

  get field() {
    return _field;
  }

};







