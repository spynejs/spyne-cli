import chai from 'chai';
const {expect, assert} = chai;
import GenerateFileString from '../src/templates/generate-file-string.js';

describe('should test file string generator', () => {

  it('file string generator should exist', () => {

    expect(GenerateFileString).to.exist;

  });

  it('should generate string for ViewStream file', ()=>{
    const props = {
      fileName: 'my-viewstream-file.js',
      className: 'MyViewstreamClass'
    }
    const fileStrGen = new GenerateFileString('ViewStream', props);
    const fileString = fileStrGen.fileString;
    const classNameAdded = fileString.indexOf('class MyViewstreamClass ') >= 0;
   // console.log('view stream file str is ',{classNameAdded}, fileString)
    expect(classNameAdded).to.be.true;
  });

  it('should generate string for DomElement file', ()=>{
    const props = {
      fileName: 'my-dom-element-file.js',
      className: 'MyDomElementClass'
    }
    const fileStrGen = new GenerateFileString('DomElement', props);
    const fileString = fileStrGen.fileString;
    const classNameAdded = fileString.indexOf('class MyDomElementClass ') >= 0;
    //console.log('DomElement file str is ',{classNameAdded}, fileString)
    expect(classNameAdded).to.be.true;
  });


  it('should generate string for Channel file', ()=>{
    const props = {
      fileName: 'my-channel-file.js',
      className: 'MyChannelClass',
      channelName: 'MY_CUSTOM_CHANNEL',
      replayLastPayload: true
    }
    const fileStrGen = new GenerateFileString('Channel', props);
    const fileString = fileStrGen.fileString;
    const classNameAdded = fileString.indexOf('class MyChannelClass ') >= 0;
     //console.log('channel file str is ',{classNameAdded}, fileString)
    expect(classNameAdded).to.be.true;
  });


  it('should generate string for SpyneTrait file', ()=>{
    const props = {
      fileName: 'my-spynetrait-file.js',
      className: 'MySpyneTrait',
      methodPrefix: 'myTrait$'
    }
    const fileStrGen = new GenerateFileString('SpyneTrait', props);
    const fileString = fileStrGen.fileString;
    const classNameAdded = fileString.indexOf('class MySpyneTrait ') >= 0;
    //console.log('channel file str is ',{classNameAdded}, fileString)
    expect(classNameAdded).to.be.true;

  });


});
