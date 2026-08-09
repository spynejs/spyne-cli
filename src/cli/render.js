// Thin presentation layer. Everything here is terminal chrome — no generation
// logic lives in this file, and nothing in src/core imports it.

import c from 'ansi-colors';
import ora from 'ora';
import {generatePromptOutput} from '../templates/generate-prompt-output.js';
import {commands} from '../registry.js';
import {TEMPLATES} from '../core/create-app.js';

/**
 * Rebuild the legacy shapes generatePromptOutput expects, so module output is
 * identical to 0.6.8 whether it came from the picker or from flags.
 */
export const renderModuleResult = (result) => {
  const answers = {
    fileType: result.fileType,
    fileName: result.fileName,
    className: result.className,
    fileDirectory: result.fileDirectory,
    channelName: result.channelName,
  };
  const savedProps = {
    fileExists: result.error?.code === 'FILE_ALREADY_EXISTS',
    fileHasSaved: result.ok === true,
    fileDirPath: result.filePath,
    errorType: result.errorType,
  };
  return generatePromptOutput(answers, savedProps, result.fileString,
      result.channelRegistered);
};

export const renderAppResult = (result) => {
  const lines = [
    '',
    c.greenBright('Success!'),
    `Created ${c.bold(result.appName)} at ${result.path}`,
    `Template: ${result.template}`,
    '',
    'Next steps:',
    ...result.nextSteps.map((step) => `  ${c.cyan(step)}`),
  ];
  return lines.join('\n');
};

export const renderError = (error) => `${c.red('Error:')} ${error.message}`;

/**
 * Enquirer clamps a select's visible rows with Math.min(limit, height), where
 * height comes from options.rows and falls back to process.stdout.rows. When
 * that reports 0 — short panes, some CI and multiplexer setups — height wins at
 * 0 and the list renders as "No matching choices". Passing rows explicitly is
 * the only way to raise the floor; a real terminal taller than the list keeps
 * its own value, so this only ever kicks in when the default would break.
 */
export const selectSizing = (choiceCount) => {
  const needed = choiceCount + 2;
  const limit = choiceCount;
  return {limit, rows: Math.max(process.stdout.rows || 0, needed)};
};

/**
 * Template choices for the enquirer select. `name` must be the template key,
 * not the label — it is what reaches createApp.
 */
export const templateChoices = () => Object.values(TEMPLATES).map((t) => ({
  name: t.value,
  message: c.greenBright(t.label),
  hint: c.dim(`— ${t.description}`),
}));

export const templatePrompt = () => {
  const choices = templateChoices();
  return {
    type: 'select',
    name: 'template',
    message: c.blueBright('Choose a template'),
    choices,
    ...selectSizing(choices.length),
  };
};

export const appNamePrompt = () => ({
  type: 'input',
  name: 'appName',
  message: c.blueBright('Enter the application name'),
  initial: 'my-spyne-app',
  validate: (value) => String(value).trim().length > 0 ||
      'An app name is required.',
});

export const createProgressReporter = () => {
  let spinner;
  return ({status, message}) => {
    if (status === 'start') {
      spinner = ora({text: message, spinner: 'dots'}).start();
      return;
    }
    if (!spinner) return;
    if (status === 'success') spinner.succeed(message);
    else if (status === 'fail') spinner.fail(message);
    else spinner.info(message);
    spinner = undefined;
  };
};

const isPositional = (def) => typeof def.positional === 'number';

const describeArg = (def) => {
  const parts = [def.description];
  if (def.enum) parts.push(`Values: ${def.enum.join(' | ')}.`);
  if (def.default !== undefined && def.type !== 'boolean') {
    parts.push(`Default: ${def.default}.`);
  }
  return parts.filter(Boolean).join(' ');
};

const formatOption = ([name, def]) => {
  // A boolean that defaults true is only actionable in its --no- form, so that
  // is what help shows. `description` stays true to the positive form for
  // programmatic consumers of the registry.
  const showNegated = def.type === 'boolean' && def.default === true;
  const flag = showNegated
      ? `--no-${name}`
      : (def.alias ? `-${def.alias}, --${name}` : `--${name}`);
  const description = showNegated
      ? (def.negatedDescription || `Skip: ${def.description}`)
      : describeArg(def);
  return `    ${flag.padEnd(20)} ${description}`;
};

const formatPositional = ([name, def]) =>
    `    ${`<${name}>`.padEnd(20)} ${describeArg(def)}`;

export const renderCommandHelp = (command) => {
  const entries = Object.entries(command.args);
  const positionals = entries.filter(([, def]) => isPositional(def));
  const options = entries.filter(([, def]) => !isPositional(def));
  const usage = [
    'spyne-cli',
    command.name,
    ...positionals.map(([name, def]) => def.required ? `<${name}>` : `[${name}]`),
    options.length ? '[options]' : '',
  ].filter(Boolean).join(' ');

  return [
    '',
    `  ${c.bold(command.name)} — ${command.summary}`,
    '',
    '  Usage:',
    `    ${usage}`,
    ...(positionals.length
        ? ['', '  Arguments:', ...positionals.map(formatPositional)]
        : []),
    ...(options.length ? ['', '  Options:', ...options.map(formatOption)] : []),
    '',
  ].join('\n');
};

export const renderHelp = (version) => {
  const templateList = Object.values(TEMPLATES).
      map((t) => `    ${t.value.padEnd(12)} ${t.description}`).
      join('\n');

  return [
    '',
    `  spyne-cli ${version}`,
    '',
    '  Usage:',
    '    spyne-cli                      interactive picker',
    '    spyne-cli <command> [options]',
    '',
    '  Commands:',
    ...commands.map((cmd) => `    ${cmd.name.padEnd(20)} ${cmd.summary}`),
    '',
    '  Templates (create-app):',
    templateList,
    '',
    '  Global options:',
    '    --json                 machine-readable output, human chrome suppressed',
    '    -h, --help             show help; pass a command name for its options',
    '    -v, --version          print version',
    '',
  ].join('\n');
};
