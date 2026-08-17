// Single source of truth for every spyne-cli command.
//
// Three consumers read this registry: the interactive picker, the argv parser,
// and (in a later release) the SpyneJS MCP server. Adding a command here makes
// it available to all three — no other file needs to change.

import {createApp, DEFAULT_TEMPLATE, TEMPLATES} from './core/create-app.js';
import {generateModule} from './core/generate-module.js';

const templateValues = Object.keys(TEMPLATES);

const moduleArgs = (extra = {}) => ({
  fileName: {
    type: 'string',
    positional: 0,
    required: true,
    description: 'File name for the generated module (.js is appended if omitted).',
  },
  className: {
    type: 'string',
    description: 'Class name. Defaults to the PascalCase form of the file name.',
  },
  fileDirectory: {
    type: 'string',
    alias: 'd',
    description: 'Directory to write into. Defaults to the conventional path for this type.',
  },
  ...extra,
});

/**
 * A generation target: interactive via the picker, deterministic via flags,
 * enumerable programmatically.
 *
 * @typedef {Object} Command
 * @property {string} name            command name as typed
 * @property {string} summary         one line, shown in help and the picker
 * @property {'app'|'module'} kind    app creates a directory; module writes into a project
 * @property {Object} args            arg name -> schema
 * @property {Function} handler       async (args) => structured result
 */
export const commands = [
  {
    name: 'create-app',
    summary: 'Create a new SpyneJS application',
    pickerLabel: 'App',
    kind: 'app',
    args: {
      appName: {
        type: 'string',
        positional: 0,
        required: true,
        description: 'Directory name for the new application.',
      },
      template: {
        type: 'string',
        alias: 't',
        enum: templateValues,
        default: DEFAULT_TEMPLATE,
        description: 'Template to scaffold from.',
      },
      prompt: {
        type: 'string',
        alias: 'p',
        description: 'Site description — AI generates pages, routes, content, ' +
            'and images (shell template only).',
      },
      install: {
        type: 'boolean',
        default: true,
        negatable: true,
        description: 'Install dependencies after scaffolding.',
        negatedDescription: 'Skip dependency installation.',
      },
      git: {
        type: 'boolean',
        default: true,
        negatable: true,
        description: 'Initialise a fresh git repository.',
        negatedDescription: 'Skip git initialisation.',
      },
    },
    handler: createApp,
  },
  {
    name: 'create-viewstream',
    summary: 'Generate a ViewStream class',
    pickerLabel: 'ViewStream',
    kind: 'module',
    fileType: 'ViewStream',
    args: moduleArgs(),
    handler: (args) => generateModule({...args, fileType: 'ViewStream'}),
  },
  {
    name: 'create-domelement',
    summary: 'Generate a DomElement class',
    pickerLabel: 'DomElement',
    kind: 'module',
    fileType: 'DomElement',
    args: moduleArgs(),
    handler: (args) => generateModule({...args, fileType: 'DomElement'}),
  },
  {
    name: 'create-channel',
    summary: 'Generate a Channel class and register it',
    pickerLabel: 'Channel',
    kind: 'module',
    fileType: 'Channel',
    args: moduleArgs({
      channelName: {
        type: 'string',
        description: 'Channel name. Defaults to the CONSTANT_CASE form of the class name.',
      },
      replayLastPayload: {
        type: 'boolean',
        default: false,
        description: 'Send the cached payload to new subscribers.',
      },
    }),
    handler: (args) => generateModule({...args, fileType: 'Channel'}),
  },
  {
    name: 'create-trait',
    summary: 'Generate a SpyneTrait class',
    pickerLabel: 'SpyneTrait',
    kind: 'module',
    fileType: 'SpyneTrait',
    args: moduleArgs({
      methodPrefix: {
        type: 'string',
        description: 'String prepended to all trait methods. Derived from the class name by default.',
      },
    }),
    handler: (args) => generateModule({...args, fileType: 'SpyneTrait'}),
  },
];

// `new` shipped in 0.6.x and stays working; create-app is canonical.
export const aliases = {
  new: {command: 'create-app', deprecated: true, since: '0.7.0'},
};

/**
 * Flags that existed in 0.6.x and no longer do. Declared rather than deleted so
 * the CLI can say what happened instead of reporting an unknown option.
 */
export const removedFlags = {
  spa: {
    removedIn: '0.7.0',
    message: '"--spa" has been removed. Pick a template with --template starter|shell.',
  },
};

export const commandNames = commands.map((c) => c.name);

export const getCommand = (name) => {
  if (!name) return undefined;
  const alias = aliases[name];
  const target = alias ? alias.command : name;
  return commands.find((c) => c.name === target);
};

export const getAlias = (name) => aliases[name];

export const moduleCommands = commands.filter((c) => c.kind === 'module');

export const appCommands = commands.filter((c) => c.kind === 'app');

/**
 * Registry as plain data — no handlers, no functions. This is the shape the
 * MCP server will enumerate to expose each generation target as a capability.
 */
export const describeCommands = () => commands.map(
    ({name, summary, kind, args}) => ({
      name,
      summary,
      kind,
      args: Object.fromEntries(
          Object.entries(args).map(([argName, schema]) => [argName, {...schema}])),
    }));
