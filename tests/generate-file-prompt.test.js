import SpyneFilePrompt from '../src/spyne-file-prompt.js';
import {expect, assert} from 'chai';


describe('should test spyne file prompt', () => {

  const spyneFilePrompt = new SpyneFilePrompt();

  it('SpyneFilePrompt should exist', () => {
   expect(SpyneFilePrompt).to.exist;

  });


  it('should get the initial select prompt ',()=>{

    const selectPrompt = spyneFilePrompt.getSelectPromptObj();

    //console.log('spyne file prompt is ',{selectPrompt})

    expect(selectPrompt.type).to.equal('Select');
    expect(selectPrompt).to.be.an('object');

  })

  it('should get file type obj from json data',()=>{

    const fileType = 'ViewStream';
    const viewStreamObj = SpyneFilePrompt.getFilePromptPropertiesObj(fileType);
    expect(viewStreamObj.props).to.deep.equal([ 'fileName', 'className', 'fileDirectory' ])

  })

  it('should get prompt array from file type', ()=>{
    const fileType = 'Channel';
    const promptArr = SpyneFilePrompt.getFilePrompt(fileType);

    //console.log('prompt arr is ',{promptArr})

    return true;

  })


});
