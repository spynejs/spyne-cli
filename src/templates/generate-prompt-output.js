import R from 'ramda';
import boxen from 'boxen';
import colors from 'ansi-colors';
colors.alias('comment', colors.white);
colors.alias('snippet', colors.yellow);
colors.alias('code', colors.yellow);
colors.alias('files', colors.green);

let _answers;
let _savedProps;
let _fileStr;


const createChannelRegisterSnippet = () => {
  const {fileName, className, fileDirectory, channelName} = _answers;

  const filePath = fileDirectory+fileName;
  const importStr = colors.snippet(`import {${className}} from '${filePath}';`);

  const registerStr = colors.snippet(`SpyneApp.registerChannel(new ${className}());`)

  const padding = "       ";
  const instx = colors.comment(`\n${padding}//ADD THE FOLLOWING SNIPPET TO YOUR SRC index.js FILE`)

  const registerComment = colors.comment('//REGISTER CHANNEL AFTER SPYNE APP HAS BEEN INITIALIZED')


  const commentLine = colors.comment("/*_______________________________________________________________________________*/\n\n");
  const finalStr = `\n${commentLine}${padding}${importStr}\n\n${padding}${registerComment}\n${padding}${registerStr}\n\n${commentLine}`;

  //return instx+boxen(finalStr, {padding: 1});
  return instx+finalStr;

}

const outputFailedMessage = (e)=>{
  const {fileType} = _answers;
  const {fileDirPath, errorType} = _savedProps;
  const fileDirPathFormatted = colors.files(`"${fileDirPath}"`)

 // console.log('error is ',{e})
 const defaultFailedInsertHash = {
    "fileAlreadyExists" : ` already exists, and  `

  }

  let defaultFailedInsert = defaultFailedInsertHash[errorType] || "";


  let defaultFailedText = `\n\nFile, ${fileDirPathFormatted},${defaultFailedInsert}is unable to be saved. `

  let defaultFailedCopyInfo = `\n\nCopy and paste below:\n/*============ begin copy and paste ================*/\n\n${colors.code(_fileStr)}\n/*============ end copy and paste ================*/`


  let defaultFailedOutput = defaultFailedText+defaultFailedCopyInfo;

  if (fileType === "Channel"){
    const channelSnippet = createChannelRegisterSnippet();
    defaultFailedOutput = `${channelSnippet}\n${defaultFailedOutput}`;
  }
  return defaultFailedOutput;

}


const outputMessage = ()=>{
  const {fileType} = _answers;
  const {fileHasSaved, errorType} = _savedProps;

  //console.log('error type is ',{errorType, fileHasSaved})

  let messageOutput = '';

  const defaultStr = colors.bgBlue(colors.black("File saved successfully."));
  const messageHash = {

    "ViewStream" : defaultStr,
    "DomElement" : defaultStr,
    "SpyneTrait" : defaultStr,
    "Channel"    : `${defaultStr}\n${createChannelRegisterSnippet()}`
  }

  if (fileHasSaved){
    messageOutput = messageHash[fileType];
  } else {

    messageOutput = outputFailedMessage();

  }


  return messageOutput;
}



const generatePromptOutput = (answers={}, savedProps={}, fileStr='')=>{

  _answers = answers;
  _savedProps = savedProps;
  _fileStr = fileStr;


  return outputMessage();

}


export {generatePromptOutput}
