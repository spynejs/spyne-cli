import fs from 'fs';
import path from 'path';
import c from 'ansi-colors';
//import {Data} from '../spyne-template-prompts.js';
//const {appPath} = Data;

export function insertChannelStrings(channelClassName, channelFileName, indexJsPath="./src/index.js" ) {
  //console.log("INFO IS ",{appPath, channelClassName, channelFileName, indexJsPath})
  try {
    if (!fs.existsSync(indexJsPath)) {
      console.log(c.red(`Error: ./src/index.js not found at ${indexJsPath}`));
      return;
    }

    let fileContent = fs.readFileSync(indexJsPath, 'utf-8');
    let lines = fileContent.split('\n');

    // 1) Find the last import line
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      // A naive check: line starts with "import "
      // or you can also check .match(/^import\s+/)
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    // 2) Find the line with SpyneApp.init(...) or spyneApp.init(...)
    //    We'll store the first occurrence
    let initIndex = -1;
    const initRegex = /(SpyneApp\.init\s*\()|(spyneApp\.init\s*\()/;
    for (let i = 0; i < lines.length; i++) {
      if (initRegex.test(lines[i])) {
        initIndex = i;
        break;
      }
    }

    // 3) Build the import snippet
    //    e.g. "import {ChannelTest_1} from 'channels/channel-test-1.js';"
    const importSnippet = `import { ${channelClassName} } from 'channels/${channelFileName}';`;

    // 4) Decide where to insert the import line
    //    - Must be AFTER the last import
    //    - Must be BEFORE the init line (if init line is after the last import)
    // If init line doesn't exist or it's above the last import, we'll just place after last import.
    let importInsertionIndex = lastImportIndex + 1;
    if (initIndex !== -1 && initIndex > lastImportIndex) {
      // If there's space to place it exactly before the init line
      // we'll insert at the init line index. That effectively
      // pushes the init line down by 1 line.
      importInsertionIndex = Math.min(initIndex, lastImportIndex + 1);
    }

    // Insert the import line
    lines.splice(importInsertionIndex, 0, importSnippet);

    // 5) Build the registerChannel snippet
    //    e.g. "SpyneApp.registerChannel(new ChannelTest_1());"
    const registerSnippet = `SpyneApp.registerChannel(new ${channelClassName}());`;

    // 6) Insert the register snippet right AFTER the init line, if found
    if (initIndex !== -1) {
      // Because we inserted one line before the init,
      // the init line is now at initIndex+1, so the place to insert
      // is initIndex+2. But let's re-scan for the init line to be safe,
      // or simply adjust.
      let updatedInitIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (initRegex.test(lines[i])) {
          updatedInitIndex = i;
          break;
        }
      }

      if (updatedInitIndex !== -1) {
        lines.splice(updatedInitIndex + 1, 0, registerSnippet);
      } else {
        // If we somehow lost the init line, fallback to end
        lines.push(registerSnippet);
      }
    } else {
      // No init line found, let's just push it at the end or skip
      console.log(c.yellow('Warning: SpyneApp.init(...) not found. Skipping registerChannel insertion.'));
    }

    // 7) Write the updated content back
    fs.writeFileSync(indexJsPath, lines.join('\n'), 'utf-8');
    //console.log(c.green(`✔ Successfully updated ./src/index.js to import and register "${channelClassName}".`));

    return {
      fileHasSaved: true,
      errorType: null
    };


  } catch (error) {
    let errorType = 'UnknownError';
    if (error.code === 'ENOENT') {
      errorType = 'FileNotFound';
    } else if (error.name === 'SyntaxError') {
      errorType = 'SyntaxError';
    } else if (error.name === 'TypeError') {
      errorType = 'TypeError';
    } else if (error.name === 'PermissionError') {
      errorType = 'PermissionError';
    }
    //console.warn(`spyne-cli register channel, ${errorType} incomplete `,error)

    // Fail silently and return error information
    return {
      fileHasSaved: false,
      errorType
    };


    //console.error(c.red(`Error updating index.js: ${err.message}`));
  }
}
