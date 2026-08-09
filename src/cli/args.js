// Registry-driven argv parsing. The registry defines what a command accepts;
// this file only knows how to read argv against a schema.

import {getAlias, getCommand, removedFlags} from '../registry.js';

const removedFlagError = (name) => {
  const removed = removedFlags[name];
  return removed
      ? {code: 'REMOVED_FLAG', flag: name, message: removed.message}
      : undefined;
};

const GLOBAL_FLAGS = ['json', 'help', 'version'];

const findByAlias = (schema, alias) => Object.entries(schema).
    find(([, def]) => def.alias === alias);

const coerce = (def, raw) => {
  if (def.type === 'boolean') {
    if (raw === undefined) return true;
    return raw !== 'false' && raw !== '0';
  }
  if (def.type === 'number') {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  return raw;
};

/**
 * @param {string[]} argv typically process.argv.slice(2)
 */
export function parseArgs(argv = []) {
  const tokens = [...argv];
  const globals = {json: false, help: false, version: false};
  const errors = [];

  const commandName = tokens[0] && !tokens[0].startsWith('-')
      ? tokens.shift()
      : undefined;

  const command = getCommand(commandName);
  const alias = getAlias(commandName);
  const schema = command ? command.args : {};
  const args = {};
  const positionals = [];

  while (tokens.length) {
    const token = tokens.shift();

    if (token === '--') {
      positionals.push(...tokens);
      break;
    }

    if (token.startsWith('--')) {
      let [flag, inlineValue] = token.slice(2).split(/=(.*)/s);

      if (GLOBAL_FLAGS.includes(flag)) {
        globals[flag] = true;
        continue;
      }

      // --no-install style negation for negatable booleans
      if (flag.startsWith('no-')) {
        const positive = flag.slice(3);
        if (schema[positive] && schema[positive].type === 'boolean') {
          args[positive] = false;
          continue;
        }
      }

      const def = schema[flag];
      if (!def) {
        errors.push(removedFlagError(flag) || {
          code: 'UNKNOWN_FLAG',
          message: `Unknown option "--${flag}".`,
        });
        continue;
      }

      if (def.type === 'boolean' && inlineValue === undefined) {
        args[flag] = true;
        continue;
      }

      const value = inlineValue !== undefined
          ? inlineValue
          : (tokens[0] && !tokens[0].startsWith('-') ? tokens.shift() : undefined);

      if (value === undefined && def.type !== 'boolean') {
        errors.push({
          code: 'MISSING_VALUE',
          message: `Option "--${flag}" expects a value.`,
        });
        continue;
      }

      args[flag] = coerce(def, value);
      continue;
    }

    if (token.startsWith('-') && token.length > 1) {
      const short = token.slice(1);

      if (short === 'h') { globals.help = true; continue; }
      if (short === 'v') { globals.version = true; continue; }

      const entry = findByAlias(schema, short);
      if (!entry) {
        // 0.6.x accepted both -spa and --spa, so catch the short form too.
        errors.push(removedFlagError(short) ||
            {code: 'UNKNOWN_FLAG', message: `Unknown option "-${short}".`});
        continue;
      }

      const [flagName, def] = entry;
      if (def.type === 'boolean') {
        args[flagName] = true;
        continue;
      }

      const value = tokens[0] && !tokens[0].startsWith('-')
          ? tokens.shift()
          : undefined;
      if (value === undefined) {
        errors.push({
          code: 'MISSING_VALUE',
          message: `Option "-${short}" expects a value.`,
        });
        continue;
      }
      args[flagName] = coerce(def, value);
      continue;
    }

    positionals.push(token);
  }

  // Map remaining bare tokens onto positional slots.
  Object.entries(schema).
      filter(([, def]) => typeof def.positional === 'number').
      sort((a, b) => a[1].positional - b[1].positional).
      forEach(([name, def]) => {
        if (args[name] === undefined && positionals.length) {
          args[name] = coerce(def, positionals.shift());
        }
      });

  // Everything set so far came from argv; record it before defaults land, so
  // callers can tell "user chose starter" from "starter is the default".
  const provided = new Set(Object.keys(args));

  // Defaults last, so an explicit flag always wins.
  Object.entries(schema).forEach(([name, def]) => {
    if (args[name] === undefined && def.default !== undefined) {
      args[name] = def.default;
    }
  });

  return {
    commandName,
    command,
    alias,
    args,
    provided,
    globals,
    errors,
    extraPositionals: positionals,
  };
}

/**
 * Validate parsed args against the schema. Returns an array of errors so a
 * non-interactive caller can fail deterministically instead of prompting.
 */
export function validateArgs(command, args) {
  if (!command) return [];
  return Object.entries(command.args).flatMap(([name, def]) => {
    const value = args[name];
    if (def.required && (value === undefined || value === '')) {
      return [{
        code: 'MISSING_REQUIRED_ARG',
        arg: name,
        message: `"${name}" is required.`,
      }];
    }
    if (def.enum && value !== undefined && !def.enum.includes(value)) {
      return [{
        code: 'INVALID_ARG_VALUE',
        arg: name,
        message: `"${name}" must be one of: ${def.enum.join(', ')}.`,
      }];
    }
    return [];
  });
}
