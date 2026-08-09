import {expect} from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  applyProjectIdentity,
  createApp,
  detectSpyneProject,
  repoFor,
  sanitizePackageName,
  TEMPLATES,
} from '../src/core/create-app.js';
import {selectSizing, templateChoices} from '../src/cli/render.js';

const makeTempTemplate = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spyne-cli-test-'));
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'spyne-base-app',
    version: '1.0.0',
    repository: {type: 'git', url: 'https://github.com/spynejs/application-starter'},
    homepage: 'https://spynejs.com',
    dependencies: {spyne: '^0.26.6'},
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'src', 'index.tmpl.html'),
      '<html><head><title>SpyneJS Starter</title></head><body></body></html>');
  return dir;
};

describe('package name sanitising', () => {

  it('should lowercase and dash-separate', () => {
    expect(sanitizePackageName('My Cool App')).to.equal('my-cool-app');
  });

  it('should strip characters npm will not accept', () => {
    expect(sanitizePackageName('My App!!! (v2)')).to.equal('my-app-v2');
  });

  it('should fall back when nothing usable remains', () => {
    expect(sanitizePackageName('!!!')).to.equal('my-spyne-app');
  });

});

describe('post-clone project identity', () => {

  let templateDir;

  beforeEach(() => { templateDir = makeTempTemplate(); });
  afterEach(() => fs.rmSync(templateDir, {recursive: true, force: true}));

  it('should rename the package and reset its version', () => {
    applyProjectIdentity(templateDir, 'My Shop');
    const pkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));

    expect(pkg.name).to.equal('my-shop');
    expect(pkg.version).to.equal('0.1.0');
  });

  it('should drop template repository metadata from the new app', () => {
    applyProjectIdentity(templateDir, 'my-shop');
    const pkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));

    expect(pkg.repository).to.equal(undefined);
    expect(pkg.homepage).to.equal(undefined);
  });

  it('should retitle index.tmpl.html', () => {
    applyProjectIdentity(templateDir, 'My Shop');
    const html = fs.readFileSync(
        path.join(templateDir, 'src', 'index.tmpl.html'), 'utf-8');

    expect(html).to.contain('<title>My Shop</title>');
    expect(html).to.not.contain('SpyneJS Starter');
  });

  it('should not throw when a template omits index.tmpl.html', () => {
    fs.rmSync(path.join(templateDir, 'src', 'index.tmpl.html'));
    expect(() => applyProjectIdentity(templateDir, 'my-shop')).to.not.throw();
  });

});

describe('project detection', () => {

  it('should recognise a directory whose package.json depends on spyne', () => {
    const dir = makeTempTemplate();
    expect(detectSpyneProject(dir).isSpyneProject).to.be.true;
    fs.rmSync(dir, {recursive: true, force: true});
  });

  it('should not treat an unrelated directory as a spyne project', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'not-spyne-'));
    fs.writeFileSync(path.join(dir, 'package.json'),
        JSON.stringify({name: 'unrelated', dependencies: {react: '^19.0.0'}}));
    expect(detectSpyneProject(dir).isSpyneProject).to.be.false;
    fs.rmSync(dir, {recursive: true, force: true});
  });

});

describe('template repo resolution', () => {

  afterEach(() => {
    delete process.env.SPYNE_CLI_STARTER_REPO;
    delete process.env.SPYNE_CLI_SHELL_REPO;
  });

  it('should default to the ratified spynejs repos', () => {
    expect(repoFor('starter')).to.equal(TEMPLATES.starter.repo);
    expect(repoFor('shell')).to.equal(TEMPLATES.shell.repo);
  });

  it('should honour a per-template env override', () => {
    process.env.SPYNE_CLI_STARTER_REPO = 'https://example.com/fork.git';
    expect(repoFor('starter')).to.equal('https://example.com/fork.git');
    expect(repoFor('shell')).to.equal(TEMPLATES.shell.repo);
  });

  it('should derive the env var name from the template key', () => {
    process.env.SPYNE_CLI_SHELL_REPO = 'https://example.com/shell.git';
    expect(repoFor('shell')).to.equal('https://example.com/shell.git');
    expect(repoFor('starter')).to.equal(TEMPLATES.starter.repo);
  });

  it('should point both templates at the spynejs application-* repos', () => {
    expect(TEMPLATES.starter.repo).
        to.equal('https://github.com/spynejs/application-starter.git');
    expect(TEMPLATES.shell.repo).
        to.equal('https://github.com/spynejs/application-shell.git');
  });

});

describe('select sizing', () => {

  let realRows;
  beforeEach(() => { realRows = Object.getOwnPropertyDescriptor(process.stdout, 'rows'); });
  afterEach(() => {
    if (realRows) Object.defineProperty(process.stdout, 'rows', realRows);
  });
  const setRows = (rows) =>
      Object.defineProperty(process.stdout, 'rows', {value: rows, configurable: true});

  it('should keep every choice visible when the terminal reports no height', () => {
    setRows(0);
    const {limit, rows} = selectSizing(5);
    expect(limit).to.equal(5);
    // enquirer clamps with Math.min(limit, rows); rows must clear the list.
    expect(Math.min(limit, rows)).to.equal(5);
  });

  it('should keep every choice visible in a very short pane', () => {
    setRows(3);
    const {limit, rows} = selectSizing(5);
    expect(Math.min(limit, rows)).to.equal(5);
  });

  it('should defer to a roomy terminal', () => {
    setRows(50);
    expect(selectSizing(5).rows).to.equal(50);
  });

});

describe('template picker choices', () => {

  it('should use the template key as the choice value, not the label', () => {
    // enquirer returns choice.name; if that were the label, createApp would
    // reject every interactive selection as an unknown template.
    templateChoices().forEach((choice) => {
      expect(TEMPLATES[choice.name], `choice "${choice.name}"`).to.not.equal(undefined);
    });
  });

  it('should offer both templates in the picker', () => {
    expect(templateChoices().map((ch) => ch.name)).
        to.eql(['starter', 'shell']);
  });

  it('should show a label and a description for each', () => {
    templateChoices().forEach((choice) => {
      expect(choice.message).to.be.a('string').and.not.be.empty;
      expect(choice.hint).to.be.a('string').and.not.be.empty;
    });
  });

  it('should resolve every offered choice through createApp validation', async () => {
    for (const choice of templateChoices()) {
      const result = await createApp({appName: '', template: choice.name});
      // Fails on the missing name, never on the template.
      expect(result.error.code).to.equal('MISSING_APP_NAME');
    }
  });

});

describe('createApp guards', () => {

  it('should require an app name', async () => {
    const result = await createApp({});
    expect(result.ok).to.be.false;
    expect(result.error.code).to.equal('MISSING_APP_NAME');
  });

  it('should reject an unknown template before touching the network', async () => {
    const result = await createApp({appName: 'x', template: 'nope'});
    expect(result.ok).to.be.false;
    expect(result.error.code).to.equal('UNKNOWN_TEMPLATE');
  });

  it('should refuse to overwrite an existing directory', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spyne-existing-'));
    const cwd = process.cwd();
    process.chdir(path.dirname(dir));

    const result = await createApp({appName: path.basename(dir)});

    process.chdir(cwd);
    fs.rmSync(dir, {recursive: true, force: true});

    expect(result.ok).to.be.false;
    expect(result.error.code).to.equal('DIRECTORY_EXISTS');
  });

});
