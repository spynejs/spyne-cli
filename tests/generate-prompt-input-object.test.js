import chai from 'chai';
const {expect, assert} = chai;
import GeneratePromptInputObject from '../src/templates/generate-prompt-input-object.js';
import {Data} from '../src/spyne-template-prompts.js';
import {MockData} from './mocks/enquirer-data.js';
const {promptTypes} = Data;

describe('should test prompt input object generator', () => {

  it('input prompt generator should exist', () => {
      expect(GeneratePromptInputObject).to.exist;

  });


  it('should get initial select file prompt object', ()=>{
    const inputType = 'selectFileType';
    const inputPrompt = new GeneratePromptInputObject(inputType);
    //console.log('input prompt is ',{inputPrompt}, inputPrompt.getPrompObject())
    const prompt = inputPrompt.getPrompObject();

    expect(prompt).to.be.an('object');


  })

  it('should generate ViewStream fileName input', ()=>{
    const inputType = 'fileName';
    const fileType = 'ViewStream';

    const inputPrompt = new GeneratePromptInputObject(inputType, fileType);


    //console.log('input prompt is ',inputPrompt.getPrompObject());

    return true;

  })


});
