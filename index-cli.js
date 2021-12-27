#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import fsPromises from "fs/promises";
import R from 'ramda';


const args = process.argv;

const methodStr = args.length>=3 ? args[2] : 'empty';
const undefinedFn = async ()=>console.log('params are undefined.');


const deleteFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    //console.log('Successfully removed file!');
  } catch (err) {
    console.log(err);
  }
};

function getFiles(dir) {
  return fs.readdirSync(dir).flatMap((item) => {
    const path = `${dir}/${item}`;
    if (fs.statSync(path).isDirectory()) {
      return getFiles(path);
    }

    return path;
  });
}

const resetAppDir = ()=>{

  const appDir = path.resolve('./', 'src/app');
  const gitKeepRe = /(.*\/)(.gitkeep)/g;
  const readFilesArr = R.compose(R.reject(R.test(gitKeepRe)))(getFiles(appDir));
  readFilesArr.forEach(deleteFile);
  console.log('app dir is reset');

}



const methodHash = {
  resetAppDir
}


const methodFn = methodHash[methodStr] || undefinedFn;

methodFn();


