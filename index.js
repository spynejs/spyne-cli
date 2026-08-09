#!/usr/bin/env node

import {readFileSync} from 'fs';
import clear from 'clear';
import c from 'ansi-colors';
import enquirer from 'enquirer';

import {SpyneCliUI} from './src/ui.js';
import SpyneFilePrompt from './src/spyne-file-prompt.js';
import {parseArgs, validateArgs} from './src/cli/args.js';
import {
  appNamePrompt,
  createProgressReporter,
  renderAppResult,
  renderCommandHelp,
  renderError,
  renderHelp,
  renderModuleResult,
  templatePrompt,
} from './src/cli/render.js';

const {prompt} = enquirer;
const {version} = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const EXIT = {ok: 0, usage: 2, failed: 1};

const parsed = parseArgs(process.argv.slice(2));
const {command, commandName, alias, args, provided, globals, errors} = parsed;

// --json implies machine consumption; a non-TTY stdin means nothing can answer
// a prompt. Either way we must never block.
const isInteractive = !globals.json && process.stdin.isTTY === true;

const emitJson = (payload, exitCode) => {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(exitCode);
};

const fail = (error, exitCode = EXIT.failed) => {
  if (globals.json) emitJson({ok: false, error}, exitCode);
  console.error(renderError(error));
  process.exit(exitCode);
};

const succeed = (result, render) => {
  if (globals.json) emitJson({ok: true, ...result}, EXIT.ok);
  console.log(render(result));
  process.exit(EXIT.ok);
};

if (globals.version) {
  if (globals.json) emitJson({ok: true, version}, EXIT.ok);
  console.log(version);
  process.exit(EXIT.ok);
}

if (globals.help || (commandName && !command)) {
  const unknown = commandName && !command;
  if (unknown && globals.json) {
    emitJson({
      ok: false,
      error: {code: 'UNKNOWN_COMMAND', message: `Unknown command "${commandName}".`},
    }, EXIT.usage);
  }
  if (unknown) console.error(renderError({message: `Unknown command "${commandName}".`}));
  console.log(command ? renderCommandHelp(command) : renderHelp(version));
  process.exit(unknown ? EXIT.usage : EXIT.ok);
}

// Bare invocation keeps the 0.6.8 front door: banner, then the picker.
if (!commandName) {
  clear();
  SpyneCliUI.title();
  new SpyneFilePrompt().startPrompt().catch((err) => {
    console.error(renderError({message: err.message}));
    process.exit(EXIT.failed);
  });
} else {
  run().catch((err) => fail({code: 'UNEXPECTED', message: err.message}));
}

async function run() {
  if (errors.length) fail(errors[0], EXIT.usage);

  if (alias && alias.deprecated) {
    console.error(c.yellow(
        `"${commandName}" is deprecated and will be removed in a future release. Use "${alias.command}" instead.`));
  }

  // Fill required args interactively; in non-interactive mode a missing
  // required arg is a usage error rather than a hang.
  if (command.kind === 'app') await resolveAppArgs();

  const missing = validateArgs(command, args);
  if (missing.length) fail(missing[0], EXIT.usage);

  const handlerArgs = command.kind === 'app'
      ? {...args, onProgress: globals.json ? () => {} : createProgressReporter()}
      : args;

  const result = await command.handler(handlerArgs);

  if (!result.ok) {
    // Module write failures still print the generated source for copy-paste.
    if (command.kind === 'module' && result.fileString && !globals.json) {
      console.log(renderModuleResult(result));
      process.exit(EXIT.failed);
    }
    fail(result.error);
  }

  succeed(result,
      command.kind === 'app' ? renderAppResult : renderModuleResult);
}

async function resolveAppArgs() {
  if (!isInteractive) {
    // Never prompt in CI. Announce the default rather than failing, but only
    // once the invocation is otherwise viable.
    if (args.appName && !provided.has('template')) {
      console.error(c.dim(`Using template: ${args.template}`));
    }
    return;
  }

  // Template first: the general choice before the specific one.
  if (!provided.has('template')) {
    ({template: args.template} = await prompt(templatePrompt()));
  }

  if (!args.appName) {
    ({appName: args.appName} = await prompt(appNamePrompt()));
  }
}
