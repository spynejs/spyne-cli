// add-channel.js

import fs from 'fs';
import path from 'path';
import recast from 'recast';

const { builders: b } = recast.types;

// Export the function so it can be imported elsewhere
export const addChannelToIndexJS = (channelClassName, channelFileName, indexJSPath="./src/index.js") => {
  try {
    // Read the index.js file content
    const code = fs.readFileSync(indexJSPath, 'utf8');

    // Parse the code into an AST
    const ast = recast.parse(code);

    // 1. Add the import statement
    const importDeclaration = b.importDeclaration(
        [b.importSpecifier(b.identifier(channelClassName))],
        b.literal(`channels/${channelFileName}`)
    );

    // Insert the import declaration after the last import statement
    const body = ast.program.body;
    let lastImportIndex = -1;
    body.forEach((node, index) => {
      if (node.type === 'ImportDeclaration') {
        lastImportIndex = index;
      }
    });
    if (lastImportIndex >= 0) {
      body.splice(lastImportIndex + 1, 0, importDeclaration);
    } else {
      // No import declarations found, add at the top
      body.unshift(importDeclaration);
    }

    // 2. Add the SpyneApp.registerChannel() call
    const registerCall = b.expressionStatement(
        b.callExpression(
            b.memberExpression(b.identifier('SpyneApp'), b.identifier('registerChannel')),
            [b.newExpression(b.identifier(channelClassName), [])]
        )
    );

    // Find the correct place to insert the register call
    // After the last existing SpyneApp.registerChannel() call
    let lastRegisterIndex = -1;
    body.forEach((node, index) => {
      if (
          node.type === 'ExpressionStatement' &&
          node.expression.type === 'CallExpression' &&
          node.expression.callee.type === 'MemberExpression' &&
          node.expression.callee.object.name === 'SpyneApp' &&
          node.expression.callee.property.name === 'registerChannel'
      ) {
        lastRegisterIndex = index;
      }
    });

    if (lastRegisterIndex >= 0) {
      body.splice(lastRegisterIndex + 1, 0, registerCall);
    } else {
      // If no existing register calls, insert after SpyneApp.init(config);
      let initIndex = -1;
      body.forEach((node, index) => {
        if (
            node.type === 'ExpressionStatement' &&
            node.expression.type === 'CallExpression' &&
            node.expression.callee.type === 'MemberExpression' &&
            node.expression.callee.object.name === 'SpyneApp' &&
            node.expression.callee.property.name === 'init'
        ) {
          initIndex = index;
        }
      });
      if (initIndex >= 0) {
        body.splice(initIndex + 1, 0, registerCall);
      } else {
        // Else, add at the end
        body.push(registerCall);
      }
    }

    // Generate the modified code
    const output = recast.print(ast).code;

    // Write back to index.js
    fs.writeFileSync(indexJSPath, output, 'utf8');

    // Return success result
    return {
      fileHasSaved: true,
      errorType: null
    };
  } catch (error) {
    // Determine error type
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

    // Fail silently and return error information
    return {
      fileHasSaved: false,
      errorType
    };
  }
};
