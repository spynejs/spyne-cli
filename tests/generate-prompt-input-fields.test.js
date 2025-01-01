import {expect, assert} from 'chai';import PromptInputField from '../src/templates/generate-prompt-input-fields.js';

import {MockData} from './mocks/enquirer-data.js';

const sani = (str)=>{
  const len = String(str).length;
  //String(str).replace(/^(\\.+\d{2}\w)(Enter.*name)(\\.*)$/, "$2")
  return String(str).substr(5, len-10);
}


describe('should create all necessary prompt input fields', () => {

  it('PromptInputField should exist', () => {
    expect(PromptInputField).to.exist;
  });



  describe('should generate basic input fields', ()=>{
      let inputType = "fileName";
      let fileType = "ViewStream";

      it('should generate type field', ()=>{
        const fieldType = 'type';
        const type = new PromptInputField(inputType, fileType, fieldType).field;
        //console.log('type is ',{type})
        expect(type).to.equal('input');
      })


      it('should generate name field', ()=>{
        const fieldType = "name";
        const name = new PromptInputField(inputType, fileType, fieldType).field;
       expect(name).to.equal(inputType);

      })

      it('should generate input format ',()=>{
        const fieldType = 'format';
        const format = new PromptInputField(inputType, fileType, fieldType).field;
        //console.log('format is ',{format}, format('colored output'))
        expect(format).to.be.an('function');
      })

      it('should parse input and remove color',()=>{
        const fieldType = 'result';
        const format = new PromptInputField(inputType, fileType, 'format').field;
        const result = new PromptInputField(inputType, fileType, fieldType).field;
        const formatStr = format('foo');
        const parsedFormatStr = result(formatStr);
        //console.log('field is ',{format,result, formatStr, parsedFormatStr})
        expect(parsedFormatStr).to.equal('foo');

      })

    it('should generate choices for selectFileType ',()=>{
      const fieldType = 'choices';
      const format = new PromptInputField('selectFileType', 'Channel', fieldType).field;
      const result = new PromptInputField(inputType, fileType, 'result').field;

      expect(result(format)).to.equal("ViewStream,DomElement,Channel,SpyneTrait");
    })

  })

  describe('it should generate input messages for each input and file types ',()=>{
    const fieldType = "message";


    it('should generate messages for filename ',()=>{
      const inputType = 'fileName';


      const expectedStr = (_fileType)=>`Enter the ${_fileType} file name`

      const viewsStreamMsg = new PromptInputField(inputType, 'ViewStream', fieldType).field;
      const domElementMsg =  new PromptInputField(inputType, 'DomElement', fieldType).field;
      const channelMsg =     new PromptInputField(inputType, 'Channel', fieldType).field;
      const spyneTraitMsg =  new PromptInputField(inputType, 'SpyneTrait', fieldType).field;


     /* console.log('view stream msg is ', sani(viewsStreamMsg))
      console.log('view stream msg is ',{domElementMsg})
      console.log('view stream msg is ',{channelMsg})
      console.log('view stream msg is ',{spyneTraitMsg})
*/
      expect(sani(viewsStreamMsg)).to.equal(expectedStr('ViewStream'))
      expect(sani(domElementMsg)).to.equal(expectedStr('DomElement'))
      expect(sani(channelMsg)).to.equal(expectedStr('Channel'))
      expect(sani(spyneTraitMsg)).to.equal(expectedStr('SpyneTrait'))
    })




    it('should generate messages for className', ()=>{
      const inputType = 'className';
      const expectedStr = (_fileType)=>`Enter the ${_fileType} class name`

      const viewsStreamMsg = new PromptInputField(inputType, 'ViewStream', fieldType).field;
      const domElementMsg =  new PromptInputField(inputType, 'DomElement', fieldType).field;
      const channelMsg =  new PromptInputField(inputType, 'Channel', fieldType).field;
      const spyneTraitMsg =  new PromptInputField(inputType, 'SpyneTrait', fieldType).field;

      /* console.log('view stream msg is ',sani(viewsStreamMsg))
       console.log('view stream msg is ',{domElementMsg})
       console.log('view stream msg is ',{channelMsg})
       console.log('view stream msg is ',{spyneTraitMsg})*/

      expect(sani(viewsStreamMsg)).to.equal(expectedStr('ViewStream'))
      expect(sani(domElementMsg)).to.equal(expectedStr('DomElement'))
      expect(sani(channelMsg)).to.equal(expectedStr('Channel'))
      expect(sani(spyneTraitMsg)).to.equal(expectedStr('SpyneTrait'))

      return true;

    })

    it('should generate messages for fileDirectory', ()=>{
      const inputType = 'fileDirectory';
      const expectedStr = (_fileType)=>`Enter where you would like to save the ${_fileType} file`

      const viewsStreamMsg = new PromptInputField(inputType, 'ViewStream', fieldType).field;
      const domElementMsg =  new PromptInputField(inputType, 'DomElement', fieldType).field;
      const channelMsg =  new PromptInputField(inputType, 'Channel', fieldType).field;
      const spyneTraitMsg =  new PromptInputField(inputType, 'SpyneTrait', fieldType).field;

      /* console.log('view stream msg is ',{viewsStreamMsg})
       console.log('view stream msg is ',{domElementMsg})
       console.log('view stream msg is ',{channelMsg})
       console.log('view stream msg is ',{spyneTraitMsg})*/

      expect(sani(viewsStreamMsg)).to.equal(expectedStr('ViewStream'))
      expect(sani(domElementMsg)).to.equal(expectedStr('DomElement'))
      expect(sani(channelMsg)).to.equal(expectedStr('Channel'))
      expect(sani(spyneTraitMsg)).to.equal(expectedStr('SpyneTrait'))

      return true;

    })

    it('should generate message for channelName', ()=>{
      MockData.enquirer.answers.className="MyChannel"
      const inputType = 'channelName';
      const expectedStr = `Enter the channel name for MyChannel`
      const channelNameMsgFn =  new PromptInputField(inputType, 'SpyneTrait', fieldType).field;
      const channelNameMsg = channelNameMsgFn(MockData.enquirer);
      //console.log('channelNameMsg stream msg is ',{channelNameMsg}, channelNameMsg(MockData))
      expect(sani(channelNameMsg)).to.equal(expectedStr)
      return true;

    })


    it('should generate message for methodPrefix$', ()=>{
      const inputType = 'methodPrefix';
      const expectedStr = `Enter the string to be prepended to all trait methods`
      const spyneTraitMethodPrefix =  new PromptInputField(inputType, 'SpyneTrait', fieldType).field;
      //console.log('view stream msg is ',{spyneTraitMethodPrefix})
      expect(sani(spyneTraitMethodPrefix)).to.equal(expectedStr)

    })

    it('should generate message for replayLastPayload', ()=>{
      const inputType = 'replayLastPayload';
      const expectedStr = `This property determines if new subscribers receive the previous payload`
      const replayLastPayloadMsg =  new PromptInputField(inputType, 'Channel', fieldType).field;
      //console.log('view stream msg is ',{replayLastPayloadMsg})
      expect(sani(replayLastPayloadMsg)).to.equal(expectedStr)
      //return true;
    })




  })

});
