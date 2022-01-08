import fs from 'fs';
import path from 'path';
import c from 'ansi-colors';
import {checkIfFileExists} from './utils/file-utils.js';

let _createAppBool = false;
let _folderName;
let _folderPath = path.resolve('./');
let _appDirectory;
let _errorMsg;
export default class SpyneAppCreator {

  constructor(args=[]) {

    let {createAppBool, folderName} = SpyneAppCreator.checkArgs(args);

    _createAppBool = createAppBool;
    _folderName = folderName;

    console.log('craete app bool ',_createAppBool);

    this.checkForErrors =   SpyneAppCreator.checkForErrors.bind(this);
    this.generateResponse = SpyneAppCreator.generateResponse.bind(this);

    _errorMsg = this.checkForErrors();

  }

  static errorColors(errorStr="XXXX"){
    return c.greenBright(errorStr);
  }

  static checkForErrors(folderName=_folderName, folderPath=_folderPath){

    let folderNameIsMissing = folderName === undefined;

    if (folderNameIsMissing){
      return SpyneAppCreator.errorColors("Please a folder name");
    }

    _appDirectory = folderPath+folderName;





    return undefined;

  }

  static checkIfDirectoryExists(appDir){
    return checkIfFileExists(_appDirectory);;
  }

  static generateResponse(){



  }







  static checkArgs(args){
    const methodStr =  args.length>=3 ? args[2] : false;
    const folderName = args.length>=4 ? args[3] : undefined;
    const createAppBool = methodStr === "create-app";

    return {folderName, createAppBool};

  }

  get createAppBool(){
    return _createAppBool;
  }

  get folderName(){
    return _folderName;
  }

  get folderPath(){
    return _folderPath;
  }


}