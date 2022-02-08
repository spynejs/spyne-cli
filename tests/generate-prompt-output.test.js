import chai from 'chai';
const {expect, assert} = chai;
import {MockData} from './mocks/enquirer-data.js';
import {AnswersData} from './mocks/answers.js';
const {answersArr} = AnswersData;
import {generatePromptOutput} from '../src/templates/generate-prompt-output.js';
import * as R  from 'ramda';

const getAnswersByFileType = (fileType) => R.compose(R.head, R.filter(R.propEq('fileType', fileType)))(answersArr)

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

    const fileHasSaved = false;
    const fileExists = false;
    const savedProps = {fileHasSaved, fileExists};

    const msgOutput = generatePromptOutput(answersObj, savedProps, defaultStr);

    expect(msgOutput).to.be.a('string');

  });

});
