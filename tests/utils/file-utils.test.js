import {expect, assert} from 'chai';import {MockData} from '../mocks/enquirer-data.js';
import {AnswersData} from '../mocks/answers.js';
const {answersArr} = AnswersData;
import * as R  from 'ramda';
import fs from 'fs';
import path from 'path';



import {onSaveSpyneFileToDir, copyDirSync, removeDir} from '../../src/utils/file-utils.js';


const getAnswersByFileType = (fileType) => R.compose(R.head, R.filter(R.propEq(fileType, 'fileType')))(answersArr)

const defaultStr = `
import {Subject} from 'rxjs';
import {Channel, ChannelPayloadFilter} from 'spyne';


export class ChannelCustom extends Channel{

  constructor(name, props={}) {
    name="CHANNEL_CUSTOM";
    props.replayLastPayload = true;
    super(name, props);
    
  }

  onRegistered(){
    
  }

  addRegisteredActions() {
    return [];
  }

  onViewStreamInfo(obj) {
    let data = obj.props();
  }

 

}

`


describe('should test saving to file', () => {
  it('should save file', () => {
    const answersObj = getAnswersByFileType('Channel');
    const {fileName, fileDirectory} = answersObj;
    const content = 'Some content for tests/utils/file-utils-test -- should test saving to file'

    try {
      fs.writeFileSync(fileDirectory+fileName, content)
      //file written successfully
    } catch (err) {
      console.error(err)
    }

    const savedProps = onSaveSpyneFileToDir(defaultStr, fileName, fileDirectory);
    const {fileHasSaved, fileExists} = savedProps;

    expect(fileHasSaved).to.be.false;
    expect(fileExists).to.be.true;

  });

  it('should copy a folder recursively', ()=>{
    const appSrc = path.resolve('./src/templates');
    const appDest = path.resolve('./src/app/copy-target');

    if (fs.existsSync(appDest)) removeDir(appDest);
    const copiedFiles = copyDirSync(appSrc, appDest);

    expect(copiedFiles).to.be.true;
    expect(fs.existsSync(path.join(appDest, 'generate-file-string.js'))).to.be.true;

    removeDir(appDest);
  });


});
