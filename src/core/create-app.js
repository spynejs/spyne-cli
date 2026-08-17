// Core app scaffolding. No terminal output — callers pass an optional
// onProgress callback and render however they like.

import fs from 'fs';
import path from 'path';
import {spawn} from 'child_process';
import simpleGit from 'simple-git';
import {fetchGeneratedApp} from './generate-app.js';

// Template keys mirror the distinguishing suffix of their repo names:
// spynejs/application-starter and spynejs/application-shell.
export const TEMPLATES = {
  starter: {
    value: 'starter',
    label: 'Application Starter',
    description: 'minimal: app.js + a hello-world view',
    repo: 'https://github.com/spynejs/application-starter.git',
  },
  shell: {
    value: 'shell',
    label: 'Application Shell',
    description: 'pages, navigation, and UI components built in',
    repo: 'https://github.com/spynejs/application-shell.git',
  },
};

// Accepted silently; only the canonical values are documented.
const TEMPLATE_ALIASES = {
  'app-shell': 'shell',
  'application-shell': 'shell',
  'application-starter': 'starter',
};

export const DEFAULT_TEMPLATE = 'starter';

export const resolveTemplate = (name) => {
  if (!name) return DEFAULT_TEMPLATE;
  const key = String(name).toLowerCase();
  return TEMPLATE_ALIASES[key] || key;
};

/**
 * Clone URL for a template. An env override lets a fork — or this repo before
 * the templates are published — scaffold from somewhere else. Read at call
 * time so it is settable per invocation.
 *
 *   SPYNE_CLI_STARTER_REPO, SPYNE_CLI_SHELL_REPO
 */
export const repoFor = (templateKey) => {
  const envKey = `SPYNE_CLI_${templateKey.toUpperCase().replace(/-/g, '_')}_REPO`;
  return process.env[envKey] || TEMPLATES[templateKey].repo;
};

export const sanitizePackageName = (appName) => String(appName).
    toLowerCase().
    replace(/\s+/g, '-').
    replace(/[^a-z0-9\-_.]/g, '') || 'my-spyne-app';

const run = (command, args, cwd) => new Promise((resolve) => {
  const child = spawn(command, args, {cwd, stdio: 'ignore', shell: false});
  child.on('close', (code) => resolve(code));
  child.on('error', () => resolve(-1));
});

const updateIndexTitle = (targetDir, appName) => {
  const indexFilePath = path.join(targetDir, 'src', 'index.tmpl.html');
  if (!fs.existsSync(indexFilePath)) return;
  const content = fs.readFileSync(indexFilePath, 'utf-8');
  fs.writeFileSync(indexFilePath,
      content.replace(/<title>.*<\/title>/, `<title>${appName}</title>`),
      'utf-8');
};

const updatePackageName = (targetDir, appName) => {
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.name = sanitizePackageName(appName);
  pkg.version = '0.1.0';
  delete pkg.repository;
  delete pkg.homepage;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
};

/**
 * Rebrand a freshly cloned template as the user's app. Exported so the
 * post-clone pipeline is testable without reaching the network.
 */
export const applyProjectIdentity = (targetDir, appName) => {
  updateIndexTitle(targetDir, appName);
  updatePackageName(targetDir, appName);
};

/**
 * Detect whether cwd (or an ancestor) looks like a SpyneJS project.
 * Used to guard `create-app` inside a project and module generation outside one.
 */
export const detectSpyneProject = (startDir = process.cwd()) => {
  let dir = path.resolve(startDir);
  while (true) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = {...pkg.dependencies, ...pkg.devDependencies};
        if (deps && deps.spyne) return {isSpyneProject: true, root: dir};
      } catch {
        // unreadable package.json — keep walking up
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return {isSpyneProject: false, root: null};
    dir = parent;
  }
};

/**
 * Create a new SpyneJS application.
 *
 * @param {Object} args
 * @param {string} args.appName
 * @param {string} [args.template] 'starter' | 'shell'
 * @param {boolean} [args.install] install dependencies (default true)
 * @param {boolean} [args.git] initialise a fresh git repo (default true)
 * @param {Function} [args.onProgress] ({step, status, message}) => void
 * @returns {Promise<Object>} structured result
 */
export async function createApp(args = {}) {
  const {appName, onProgress = () => {}} = args;
  const install = args.install !== false;
  const initGit = args.git !== false;

  if (!appName) {
    return {
      ok: false,
      error: {code: 'MISSING_APP_NAME', message: 'An app name is required.'},
    };
  }

  const templateKey = resolveTemplate(args.template);
  const template = TEMPLATES[templateKey];

  if (!template) {
    return {
      ok: false,
      error: {
        code: 'UNKNOWN_TEMPLATE',
        message: `Unknown template "${args.template}". Expected one of: ${Object.keys(
            TEMPLATES).join(', ')}.`,
      },
    };
  }

  const targetDir = path.resolve(process.cwd(), appName);

  if (fs.existsSync(targetDir)) {
    return {
      ok: false,
      error: {
        code: 'DIRECTORY_EXISTS',
        message: `${targetDir} already exists.`,
      },
      path: targetDir,
    };
  }

  // A site description routes the shell template through the AI generator
  // instead of a plain clone; everything after acquisition is shared.
  const sitePrompt = args.prompt && String(args.prompt).trim();
  if (sitePrompt && templateKey !== 'shell') {
    return {
      ok: false,
      error: {
        code: 'PROMPT_UNSUPPORTED',
        message: 'A site description generates from the shell template. ' +
            'Use --template shell (or drop --prompt).',
      },
    };
  }

  const repo = repoFor(templateKey);
  let generated;

  if (sitePrompt) {
    generated = await fetchGeneratedApp({sitePrompt, targetDir, onProgress});
    if (!generated.ok) return generated;
  } else {
    onProgress({step: 'clone', status: 'start', message: 'Cloning template...'});
    try {
      await simpleGit().clone(repo, targetDir,
          ['--branch=main', '--single-branch', '--depth=1']);
      onProgress({step: 'clone', status: 'success', message: 'Template cloned.'});
    } catch (err) {
      onProgress({step: 'clone', status: 'fail', message: 'Clone failed.'});
      return {
        ok: false,
        error: {
          code: 'CLONE_FAILED',
          message: `Could not clone ${repo}: ${err.message}`,
        },
      };
    }

    // No .git leakage from the template repo.
    fs.rmSync(path.join(targetDir, '.git'), {recursive: true, force: true});
  }

  applyProjectIdentity(targetDir, appName);

  let gitInitialized = false;
  if (initGit) {
    onProgress({step: 'git', status: 'start', message: 'Initialising git...'});
    gitInitialized = await run('git', ['init', '--quiet'], targetDir) === 0;
    onProgress({
      step: 'git',
      status: gitInitialized ? 'success' : 'skip',
      message: gitInitialized ? 'Git repository initialised.' : 'Skipped git init.',
    });
  }

  let dependenciesInstalled = false;
  if (install) {
    onProgress({
      step: 'install',
      status: 'start',
      message: 'Installing dependencies...',
    });
    dependenciesInstalled =
        await run('npm', ['install', '--silent'], targetDir) === 0;
    onProgress({
      step: 'install',
      status: dependenciesInstalled ? 'success' : 'fail',
      message: dependenciesInstalled
          ? 'Dependencies installed.'
          : 'Dependency install failed — run npm install manually.',
    });
  }

  return {
    ok: true,
    appName,
    path: targetDir,
    template: templateKey,
    ...(generated
        ? {generated: true, appId: generated.appId}
        : {templateRepo: repo}),
    gitInitialized,
    dependenciesInstalled,
    nextSteps: [
      `cd ${appName}`,
      ...(dependenciesInstalled ? [] : ['npm install']),
      'npm start',
      ...(generated ? ['see GETTING-STARTED.md for the CMS claim + AI editing'] : []),
    ],
  };
}
