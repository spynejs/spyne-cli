import {Data} from '../spyne-template-prompts.js';
const {debug} = Data;

export default class ErrorLogger {

    constructor() {

    }

    static log(msg, type='generic'){
      if (debug){
        console.log(`spyne-util warning: type:${type}, msg: ${msg}`);
      }
    }
}
