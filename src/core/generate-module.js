// Core module generation. No terminal output — returns structured results.
// The CLI layer is responsible for rendering these.

import path from 'path';
import GenerateFileString from '../templates/generate-file-string.js';
import {detectSpyneProject} from './create-app.js';
import {getLocalFileDirectory, onSaveSpyneFileToDir} from '../utils/file-utils.js';
import {insertChannelStrings} from '../utils/insert-channel-strings-to-index-file.js';
import {Data} from '../spyne-template-prompts.js';

const {fileTypesArr} = Data;

const toPascalCase = (str) => String(str).
    replace(/\.js$/, '').
    split(/[-_\s]+/).
    filter(Boolean).
    map((s) => s.charAt(0).toUpperCase() + s.slice(1)).
    join('');

const toConstantCase = (str) => {
  const name = String(str).toLowerCase().startsWith('channel')
      ? str
      : `Channel${str}`;
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').
      replace(/[-\s]+/g, '_').
      toUpperCase();
};

const toMethodPrefix = (className) => {
  const words = String(className).
      replace(/([a-z0-9])([A-Z])/g, '$1 $2').
      split(/[\s-_]+/).
      filter(Boolean).
      slice(0, 2);
  const joined = words.map(
      (w, i) => i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return `${joined}$`;
};

const withTrailingSlash = (dir) => dir.endsWith('/') ? dir : `${dir}/`;

/**
 * Fill in the same defaults the interactive prompts would have offered, so a
 * flags-only invocation produces identical output to the picker.
 */
export const resolveModuleArgs = (args = {}) => {
  const {fileType} = args;
  const fileName = String(args.fileName).endsWith('.js')
      ? args.fileName
      : `${args.fileName}.js`;
  const className = args.className || toPascalCase(fileName);
  const fileDirectory = withTrailingSlash(
      args.fileDirectory || getLocalFileDirectory(fileType));

  const resolved = {fileType, fileName, className, fileDirectory};

  if (fileType === 'Channel') {
    resolved.channelName = args.channelName || toConstantCase(className);
    resolved.replayLastPayload = args.replayLastPayload === true ||
        args.replayLastPayload === 'true';
  }

  if (fileType === 'SpyneTrait') {
    resolved.methodPrefix = args.methodPrefix || toMethodPrefix(className);
  }

  return resolved;
};

/**
 * Generate a single Spyne module file.
 *
 * @param {Object} args
 * @returns {Promise<Object>} structured result — never throws for expected
 *   failures (missing name, existing file); those surface on the result.
 */
export async function generateModule(args = {}) {
  if (!fileTypesArr.includes(args.fileType)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `Unknown file type "${args.fileType}". Expected one of: ${fileTypesArr.join(
            ', ')}.`,
      },
    };
  }

  if (!args.fileName) {
    return {
      ok: false,
      error: {code: 'MISSING_FILE_NAME', message: 'A file name is required.'},
    };
  }

  // Modules generate into an existing project; an app does not exist yet.
  if (args.requireProject !== false && !detectSpyneProject().isSpyneProject) {
    return {
      ok: false,
      error: {
        code: 'NOT_IN_SPYNE_PROJECT',
        message: 'Run this inside a SpyneJS project. To start a new one: spyne-cli create-app <app-name>',
      },
    };
  }

  const resolved = resolveModuleArgs(args);
  const {fileType, fileName, className, fileDirectory} = resolved;
  const {fileString} = new GenerateFileString(fileType, resolved);
  const saved = onSaveSpyneFileToDir(fileString, fileName, fileDirectory);

  // The CLI prints the generated source for copy-paste when a write fails, so
  // failure results carry the same payload a success would.
  if (!saved.fileHasSaved) {
    return {
      ok: false,
      error: {
        code: saved.fileExists ? 'FILE_ALREADY_EXISTS' : 'WRITE_FAILED',
        message: saved.fileExists
            ? `${saved.fileDirPath} already exists.`
            : `Could not write ${saved.fileDirPath}.`,
      },
      ...resolved,
      filePath: saved.fileDirPath,
      errorType: saved.errorType,
      channelRegistered: false,
      fileString,
    };
  }

  let channelRegistered = false;
  if (fileType === 'Channel') {
    channelRegistered = insertChannelStrings(className, fileName).fileHasSaved;
  }

  return {
    ok: true,
    ...resolved,
    filePath: saved.fileDirPath,
    relativePath: path.relative(process.cwd(), saved.fileDirPath),
    channelRegistered,
    fileString,
  };
}
