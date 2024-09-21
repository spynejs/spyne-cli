import path from 'path';
import c from 'ansi-colors';
import {checkIfFolderExists, copyDirSync} from './utils/file-utils.js';

let _createAppBool = false;
let _folderName;
let _folderPath = path.resolve();
let _appDirectory;
let _errorMsg;




import {packageDirectory} from 'pkg-dir';
const globalPath = "/usr/local/lib/node_modules/spyne-cli"
const _spyneAppSrcRelPath = '/src/hello-world-app-source';
let _spyneAppSrcPath = path.resolve(globalPath, _spyneAppSrcRelPath);


const getSpyneSrcPath = async()=> {
  const localPath = await packageDirectory();
  const mainPath = localPath || globalPath;
  _spyneAppSrcPath = path.resolve(mainPath, 'src/hello-world-app-source');
}


export default class SpyneAppCreator {

  constructor(args=[]) {

    let {createAppBool, folderName} = SpyneAppCreator.checkArgs(args);

    _createAppBool = createAppBool;
    _folderName = folderName;


    this.checkForErrors =   SpyneAppCreator.checkForErrors.bind(this);
    this.generateResponse = SpyneAppCreator.generateResponse.bind(this);
    this.copyDirAndReturnResponse = SpyneAppCreator.copyDirAndReturnResponse.bind(this);


  }


  static async generateResponse(){
     try{
       await getSpyneSrcPath();
     } catch(e){
       console.log('getting src path err ',e);
     }
    _errorMsg = this.checkForErrors();
    return _errorMsg ? console.log(_errorMsg) : this.copyDirAndReturnResponse();
  }



  static copyDirAndReturnResponse(appDir=_appDirectory){
    copyDirSync(_spyneAppSrcPath, appDir);
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

    return undefined;

  }

  static checkIfDirectoryExists(appDir=""){
    return checkIfFolderExists(appDir);;
  }



  static checkArgs(args){
    const methodStr =  args.length>=3 ? args[2] : false;
    const folderName = args.length>=4 ? args[3] : undefined;
    const createAppBool =  ["create-app", "new", "create", "generate"].includes(methodStr);

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
