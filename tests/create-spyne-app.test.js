import chai from 'chai';
const {expect, assert} = chai;
import path from 'path';

import SpyneAppCreator from '../src/spyne-app-creator.js';
//import PromptInputField from '../src/templates/generate-prompt-input-fields.js';

const appArgsFalseArr = [ '/usr/local/bin/node', '/usr/local/bin/spyne-cli', 'create-app'];
const appArgsTrueArr = [ '/usr/local/bin/node', '/usr/local/bin/spyne-cli', 'create-app', 'myapp'];


describe('should test app creation methods', () => {

  it('should run create app false', () => {
    let {createAppBool, folderName} = SpyneAppCreator.checkArgs(appArgsFalseArr);
    expect(createAppBool).to.be.true;
    expect(folderName).to.eq(undefined);
  });

  it('should run create app true', () => {
    let {createAppBool, folderName} = SpyneAppCreator.checkArgs(appArgsTrueArr);
    expect(createAppBool).to.be.true;
    expect(folderName).to.eq('myapp');
  });

  it('should return directory exists bool true', ()=>{
    let folderName = 'utils';
    let currentPath = path.resolve('./src');
    const appDir = `${currentPath}/${folderName}`;
    const dirAlreadyExistsBool = SpyneAppCreator.checkIfDirectoryExists(appDir);
    expect(dirAlreadyExistsBool).to.equal(true);
  })

  it('should return directory exists bool false', ()=>{
    let folderName = 'dir-does-not-exist';
    let currentPath = path.resolve('./src');
    const appDir = `${currentPath}/${folderName}`;

    const dirAlreadyExistsBool = SpyneAppCreator.checkIfDirectoryExists(appDir);

    expect(dirAlreadyExistsBool).to.equal(false);

  })

  it('should return folder name is undefined error', ()=>{
    const appPath = path.resolve('./src');
    const errorCheck = SpyneAppCreator.checkForErrors(appPath);
    const folderNameMissingErrCheck =  String(errorCheck).indexOf('Please add a folder name!')>=1;
    //console.log('has app exists ',{errorCheck, folderNameMissingErrCheck})
    expect(folderNameMissingErrCheck).to.be.true;
  })

  it('should return app folder already exists error', ()=>{

    const folder = 'h-world-new';

    const appPath = path.resolve('./src');
    const appSrc = `${appPath}/hello-world-app-source`
    const appDest = `${appPath}/${folder}`

    const errorCheck = SpyneAppCreator.checkForErrors(appPath, folder);

    const hasAppExistsErr =  String(errorCheck).indexOf("App folder already exists!")>=1;

    //console.log('has app exists ',{errorCheck, hasAppExistsErr})


    expect(hasAppExistsErr).to.be.true;

  })




});