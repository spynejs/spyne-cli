import fs from 'fs';
import path from 'path';
import c from 'ansi-colors';
import {checkIfFolderExists, copyDirSync} from './utils/file-utils.js';

let _createAppBool = false;
let _folderName;
let _folderPath = path.resolve();
let _appDirectory;
let _errorMsg;


const _spyneAppSrcPath =  path.resolve('/usr/local/lib/node_modules/spynecli', 'src/hello-world-app-source');


import {packageDirectory} from 'pkg-dir';



const fn = async()=> {
  const loc = await pkgUp();
  const loc2 = await packageDirectory();

  console.log('XXXXXX up ',{loc, loc2});
}

fn();

export default class SpyneAppCreator {

  constructor(args=[]) {

    let {createAppBool, folderName} = SpyneAppCreator.checkArgs(args);

    _createAppBool = createAppBool;
    _folderName = folderName;

    console.log('craete app bool ',path.resolve('./'), {_folderPath, _spyneAppSrcPath});

    this.checkForErrors =   SpyneAppCreator.checkForErrors.bind(this);
    this.generateResponse = SpyneAppCreator.generateResponse.bind(this);
    this.copyDirAndReturnResponse = SpyneAppCreator.copyDirAndReturnResponse.bind(this);


  }


  static generateResponse(){
    _errorMsg = this.checkForErrors();
    return _errorMsg ? console.log(_errorMsg) : this.copyDirAndReturnResponse();
  }



  static copyDirAndReturnResponse(appDir=_appDirectory){
   // copyDirSync(_spyneAppSrcPath, appDir);
    console.log(SpyneAppCreator.successColors(`spyne at created at ${appDir}`));
  }


  static successColors(successStr="XXXX"){
    return c.blueBright(successStr);
  }

  static errorColors(errorStr="XXXX"){
    return c.greenBright(errorStr);
  }

  static checkForErrors(folderPath=_folderPath, folderName=_folderName){

    let folderNameIsMissing = folderName === undefined;

    if (folderNameIsMissing){
      return SpyneAppCreator.errorColors("Please add a folder name!");
    }

    _appDirectory =  `${folderPath}/${folderName}`;

    let pathAlreadyExistsBool = SpyneAppCreator.checkIfDirectoryExists(_appDirectory);

    if (pathAlreadyExistsBool){
      return SpyneAppCreator.errorColors('App folder already exists!');
    }

    //console.log('app directory is ',{_appDirectory, pathAlreadyExistsBool})


    return undefined;

  }

  static checkIfDirectoryExists(appDir=""){
    return checkIfFolderExists(appDir);;
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