import {expect} from 'chai';

import {
  commandNames,
  commands,
  describeCommands,
  getAlias,
  getCommand,
  moduleCommands,
} from '../src/registry.js';
import {parseArgs, validateArgs} from '../src/cli/args.js';
import {
  DEFAULT_TEMPLATE,
  resolveTemplate,
  TEMPLATES,
} from '../src/core/create-app.js';

describe('command registry', () => {

  it('should expose all five generation targets', () => {
    expect(commandNames).to.have.members([
      'create-app',
      'create-viewstream',
      'create-domelement',
      'create-channel',
      'create-trait',
    ]);
  });

  it('should keep the four module flows in picker order', () => {
    expect(moduleCommands.map((c) => c.pickerLabel)).
        to.eql(['ViewStream', 'DomElement', 'Channel', 'SpyneTrait']);
  });

  it('should give every command a handler and an args schema', () => {
    commands.forEach((cmd) => {
      expect(cmd.handler, `${cmd.name} handler`).to.be.a('function');
      expect(cmd.args, `${cmd.name} args`).to.be.an('object');
      expect(cmd.summary, `${cmd.name} summary`).to.be.a('string');
    });
  });

  it('should resolve the deprecated new alias to create-app', () => {
    expect(getCommand('new').name).to.equal('create-app');
    expect(getAlias('new').deprecated).to.be.true;
  });

  it('should describe commands as plain data for MCP enumeration', () => {
    const described = describeCommands();
    expect(described).to.have.lengthOf(5);
    described.forEach((cmd) => {
      expect(cmd.handler).to.equal(undefined);
      expect(JSON.parse(JSON.stringify(cmd))).to.eql(cmd);
    });
  });

});

describe('argv parsing', () => {

  it('should map a positional onto the first declared arg', () => {
    const {command, args} = parseArgs(['create-app', 'my-app']);
    expect(command.name).to.equal('create-app');
    expect(args.appName).to.equal('my-app');
  });

  it('should apply the template default without marking it provided', () => {
    const {args, provided} = parseArgs(['create-app', 'my-app']);
    expect(args.template).to.equal(DEFAULT_TEMPLATE);
    expect(provided.has('template')).to.be.false;
  });

  it('should read a short alias and mark it provided', () => {
    const {args, provided} = parseArgs(['create-app', 'my-app', '-t', 'shell']);
    expect(args.template).to.equal('shell');
    expect(provided.has('template')).to.be.true;
  });

  it('should support --flag=value', () => {
    const {args} = parseArgs(['create-app', 'my-app', '--template=shell']);
    expect(args.template).to.equal('shell');
  });

  it('should negate booleans with --no-', () => {
    const {args} = parseArgs(['create-app', 'my-app', '--no-install']);
    expect(args.install).to.be.false;
    expect(args.git).to.be.true;
  });

  it('should collect global flags', () => {
    const {globals} = parseArgs(['create-app', 'my-app', '--json']);
    expect(globals.json).to.be.true;
  });

  it('should report unknown flags rather than ignoring them', () => {
    const {errors} = parseArgs(['create-app', 'my-app', '--nope']);
    expect(errors[0].code).to.equal('UNKNOWN_FLAG');
  });

  it('should explain a removed flag instead of calling it unknown', () => {
    const {errors} = parseArgs(['create-app', 'my-app', '--spa']);
    expect(errors[0].code).to.equal('REMOVED_FLAG');
    expect(errors[0].message).to.contain('--template');
  });

  it('should catch the 0.6.x short form of a removed flag', () => {
    // 0.6.8 matched both "-spa" and "--spa".
    const {errors} = parseArgs(['new', 'my-app', '-spa']);
    expect(errors[0].code).to.equal('REMOVED_FLAG');
  });

  it('should treat a bare invocation as having no command', () => {
    const {commandName, command} = parseArgs([]);
    expect(commandName).to.equal(undefined);
    expect(command).to.equal(undefined);
  });

});

describe('arg validation', () => {

  it('should flag a missing required arg', () => {
    const {command, args} = parseArgs(['create-app']);
    const errors = validateArgs(command, args);
    expect(errors[0].code).to.equal('MISSING_REQUIRED_ARG');
    expect(errors[0].arg).to.equal('appName');
  });

  it('should reject a value outside the declared enum', () => {
    const {command, args} = parseArgs(['create-app', 'my-app', '-t', 'nope']);
    const errors = validateArgs(command, args);
    expect(errors[0].code).to.equal('INVALID_ARG_VALUE');
  });

  it('should pass a fully specified invocation', () => {
    const {command, args} = parseArgs(['create-app', 'my-app', '-t', 'starter']);
    expect(validateArgs(command, args)).to.eql([]);
  });

});

describe('templates', () => {

  it('should expose both ratified templates', () => {
    expect(Object.keys(TEMPLATES)).to.eql(['starter', 'shell']);
  });

  it('should point at the spynejs org', () => {
    Object.values(TEMPLATES).forEach((t) => {
      expect(t.repo).to.match(/^https:\/\/github\.com\/spynejs\//);
    });
  });

  it('should silently accept the shell alias', () => {
    expect(resolveTemplate('app-shell')).to.equal('shell');
  });

  it('should default to starter when unspecified', () => {
    expect(resolveTemplate(undefined)).to.equal('starter');
  });

});
