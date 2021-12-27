
import {Data} from '../spyne-template-prompts.js';
const {appPath,promptInputHash} = Data;
import ErrorLogger  from '../utils/error-logger.js';
import stringify from 'json-stringify-safe';

import path from 'path';
import fs from 'fs';
import c from 'ansi-colors';
import R  from 'ramda';;


const checkIfFileExists = (fileLoc) => fs.existsSync(fileLoc)


const onSaveSpyneFileToDir =  (fileStr, fileName,  fileDirectory) =>{
  const fileDirPath = fileDirectory+fileName;
  const fileExists = checkIfFileExists(fileDirPath);
  let fileHasSaved = false;
  let errorType;

  if (fileExists){
   // console.warn('file already exists');
    const errObj = {fileDirPath}
    errorType = 'fileAlreadyExists';

    //ErrorLogger.log(JSON.stringify(errObj), errorType);

  } else {
    try {
      const data = fs.writeFileSync(fileDirPath, fileStr)
      //file written successfully
      fileHasSaved = true;

    } catch (err) {
      errorType='generic';

      ErrorLogger.log(err, 'onSaveSpyneFileToDir');
    }
  }

  return {fileExists, fileHasSaved,fileDirPath, errorType}

};



const getLocalFileDirectory = (_fileType)=>{
  let dirPath="";
  const fileTypePath = R.path([_fileType, 'path'])(promptInputHash)

  try{
    dirPath = fs.existsSync(appPath) ? appPath+fileTypePath : './';
  } catch(e){
    ErrorLogger.log(e, 'getFileDirectory')
  }

  return dirPath;

}


const validateFileDirectory = (value)=>{
  const isValid = fs.existsSync(value);
  return isValid || 'File directory needs to exist.';
}


export {getLocalFileDirectory, validateFileDirectory, onSaveSpyneFileToDir}
