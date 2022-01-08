import chai from 'chai';
const {expect, assert} = chai;

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



});