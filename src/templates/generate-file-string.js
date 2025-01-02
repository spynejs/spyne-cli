const _viewStreamTemplate = (props)=> {
 return `import { ViewStream } from 'spyne';

export class ${props.className} extends ViewStream {
  constructor(props = {}) {
    super(props);
  }

  addActionListeners() {
    return [];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
`
}

const _domElementTemplate = (props) => {
  return `import { DomElement } from 'spyne';

export class ${props.className} extends DomElement {
  constructor(props = {}) {
    super(props);
  }
}
`
}


const _channelTemplate = (props)=> {
  return `import { Channel } from 'spyne';

export class ${props.className} extends Channel {
  constructor(name, props = {}) {
    name = '${props.channelName}';
    props.sendCachedPayload = ${props.replayLastPayload};
    super(name, props);
  }

  onRegistered() {}

  addRegisteredActions() {
    return [];
  }

  onViewStreamInfo() {}
}
`
}

const _spyneTraitTemplate = (props)=>{
  return `import { SpyneTrait } from 'spyne';

export class ${props.className} extends SpyneTrait {
  constructor(context) {
    let traitPrefix = '${props.methodPrefix}';
    super(context, traitPrefix);
  }

  static ${props.methodPrefix}HelloWorld() {
    return 'Hello World';
  }
}
`
}




export default class GenerateFileString {

  constructor(fileTypeName, fileProps) {
    this._fileTypeName = fileTypeName;
    this._fileProps = fileProps;
  }

  get fileString(){

    const methodFn = GenerateFileString.getFileTemplate(this._fileTypeName)
     this._fileStr = methodFn(this._fileProps);
    return this._fileStr;
  }


  static getFileTemplate(str){

    const fileTypeHashObj = {
      ViewStream: _viewStreamTemplate,
      DomElement: _domElementTemplate,
      Channel: _channelTemplate,
      SpyneTrait: _spyneTraitTemplate
    }

    return fileTypeHashObj[str];

  }




}
