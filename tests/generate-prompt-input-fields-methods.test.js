import {expect, assert} from 'chai';import PromptInputField from '../src/templates/generate-prompt-input-fields.js';
import * as changeCase from "change-case";

const {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} = changeCase;


import {MockData} from './mocks/enquirer-data.js';



describe('should create all necessary prompt input initial, hint and validate fields', () => {

  it('PromptInputField should exist', () => {
    expect(PromptInputField).to.exist;
  });


  describe('it should generate all initial values ',()=>{

    let inputType = "className";
    let fileType = "ViewStream";

    it('should generate initial file name values ',()=>{
      const fileNameInputType = "fileName"
      let fieldType = "initial";

      const viewStreamInitialValue = new PromptInputField(fileNameInputType, 'ViewStream', fieldType).field;
      const domElementInitialValue = new PromptInputField(fileNameInputType, 'DomElement', fieldType).field;
      const channelInitialValue    = new PromptInputField(fileNameInputType, 'Channel', fieldType).field;
      const spyneTraitInitialValue = new PromptInputField(fileNameInputType, 'SpyneTrait', fieldType).field;

      const isValidFileName = (str)=>/(.*)(.js)/.test(str)===true;

      /*console.log('view stream file name is ',{viewStreamInitialValue})
      console.log('dom element file name is ',{domElementInitialValue})
      console.log('channel file name is ',{channelInitialValue})
      console.log('spyne trait file name is ',{spyneTraitInitialValue})
*/


      expect(isValidFileName(viewStreamInitialValue)).to.be.true;
      expect(isValidFileName(domElementInitialValue)).to.be.true;
      expect(isValidFileName(channelInitialValue)).to.be.true;
      expect(isValidFileName(spyneTraitInitialValue)).to.be.true;

    })


    it('should generate initial value for className based on valid filename', ()=>{
        MockData.enquirer.answers.fileName = 'my-viewstream.js';

        const initialViewStreamClassNameFn = new PromptInputField(inputType, fileType, 'initial').field;
        const initialViewStreamClassName = initialViewStreamClassNameFn(MockData);

      MockData.enquirer.answers.fileName = 'my-dom-element.js';
      const initialDomElementClassNameFn = new PromptInputField(inputType, fileType, 'initial').field;
      const initialDomElementClassName = initialDomElementClassNameFn(MockData);

      MockData.enquirer.answers.fileName = 'channel-custom.js';
      const initialChannelClassNameFn = new PromptInputField(inputType, fileType, 'initial').field;
      const initialChannelClassName = initialDomElementClassNameFn(MockData);

      MockData.enquirer.answers.fileName = 'my-custom-trait.js';
      const initialTraitClassNameFn = new PromptInputField(inputType, fileType, 'initial').field;
      const initialTraitClassName = initialTraitClassNameFn(MockData);


/*      console.log('initial class name is ',{initialViewStreamClassName})
      console.log('initial dom element is ',{initialDomElementClassName})
      console.log('initial channel is ',{initialChannelClassName})
      console.log('initial trait is ',{initialTraitClassName})*/

      expect(initialViewStreamClassName).to.equal('MyViewstream')
      expect(initialDomElementClassName).to.equal('MyDomElement')
      expect(initialChannelClassName).to.equal('ChannelCustom')
      expect(initialTraitClassName).to.equal('MyCustomTrait')


    })


    it('it should generate initial value for directory based on app path', ()=>{
      let inputType = 'fileDirectory';
      const initialViewStreamFileDir = new PromptInputField(inputType,  fileType,      'initial').field;
      const initialDomElementFileDir = new PromptInputField(inputType, 'DomElement',  'initial').field;
      const initialChannelFileDir =    new PromptInputField(inputType, 'Channel',     'initial').field;
      const initialSpyneTraitFileDir = new PromptInputField(inputType, 'SpyneTrait',  'initial').field;
      //console.log('viewstream dir ',{initialViewStreamFileDir})
      //console.log('domelement dir ',{initialDomElementFileDir})
      //console.log('channel dir ',{initialChannelFileDir})
      //console.log('spynetrait dir ',{initialSpyneTraitFileDir})



      //console.log('process ',{initialFileDir})

      expect(initialViewStreamFileDir).to.equal('./src/app/components/')
      expect(initialDomElementFileDir).to.equal('./src/app/components/')
      expect(initialChannelFileDir).to.equal('./src/app/channels/')
      expect(initialSpyneTraitFileDir).to.equal('./src/app/traits/')

    })

    it('it should generate initial value for method prefix', ()=>{
      MockData.enquirer.answers.className = 'MyCustomTrait';
      fileType = "SpyneTrait";
      inputType = "methodPrefix";
      const initialMethodPrefixFn = new PromptInputField(inputType, fileType, 'initial').field;
      const initialMethodPrefix = initialMethodPrefixFn(MockData);
      expect(initialMethodPrefix).to.equal('myCustom$')


    })

    it('it should generate initial value for channel name', ()=>{
      MockData.enquirer.answers.className = 'ChannelCustom';
      fileType = "Channel";
      inputType = "channelName";
      const initialMethodPrefixFn = new PromptInputField(inputType, fileType, 'initial').field;
      const initialMethodPrefix = initialMethodPrefixFn(MockData);

      //console.log('channel name is ',initialMethodPrefix);
      expect(initialMethodPrefix).to.equal('CHANNEL_CUSTOM')

    })






  })


  describe('it should add proper validator for field',()=>{
    const fieldType = 'validate';

    it ('should generate validator for fileName ', ()=>{
      const fileNameValidatorFn = new PromptInputField("fileName", "ViewStream", fieldType).field;
      const fileNameValidator = fileNameValidatorFn('my-custom-viewstream.js');
      //console.log('file name validator is ',{fileNameValidator})
      expect(fileNameValidator).to.be.true;

    })

    it ('should generate validator for file directory', ()=>{
      const fileDirectoryValidatorFn = new PromptInputField("fileDirectory", "ViewStream", fieldType).field;
      const validPath = './src/app/components/'
      const inValidPath = './src/stuff'
      const isValidDir = fileDirectoryValidatorFn(validPath);
      const isInvalidDir = fileDirectoryValidatorFn(inValidPath);
      expect(isValidDir).to.be.true;
      expect(isInvalidDir).to.equal("File directory needs to exist.")

    })



  })





});
