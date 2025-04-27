import c from 'ansi-colors';
import simpleGit from 'simple-git';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ora from 'ora';

async function installDependencies(appName) {
  const spinner = ora({
    text: c.cyan('Installing dependencies...'),
    spinner: 'dots'
  }).start();

  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install', '--silent'], {
      cwd: appName,
      stdio: 'ignore',
    });

    child.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(c.greenBright('Dependencies installed successfully!'));
        resolve();
      } else {
        spinner.fail(c.red(`Failed to install dependencies (exit code: ${code}).`));
        reject(new Error('npm install failed'));
      }
    });
  });
}

/**
 * Update <title> in index.tmpl.html
 * @param {string} targetDir
 * @param {string} appName
 */
function updateIndexTitle(targetDir, appName) {
  const indexFilePath = path.join(targetDir, 'src', 'index.tmpl.html');
  if (!fs.existsSync(indexFilePath)) return; // skip if not found

  let content = fs.readFileSync(indexFilePath, 'utf-8');
  // Replace first occurrence of <title>...</title>
  content = content.replace(/<title>.*<\/title>/, `<title>${appName}</title>`);

  fs.writeFileSync(indexFilePath, content, 'utf-8');
}

/**
 * Update "name" field in package.json
 * @param {string} targetDir
 * @param {string} appName
 */
function updatePackageName(targetDir, appName) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return; // skip if not found

  const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // sanitize: e.g. convert to lowercase, replace spaces with dashes
  const sanitizedName = appName
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-_]/g, ''); // remove any non-alphanumeric (optional)

  pkgData.name = sanitizedName || 'my-spyne-app';

  fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2), 'utf-8');
}

/**
 * Update the project details (title, pkg name)
 */
function updateProjectDetails(targetDir, appName) {
  updateIndexTitle(targetDir, appName);
  updatePackageName(targetDir, appName);
}

/**
 * Creates a new Spyne app in the directory `appName`.
 * If isSPA is true, clones the single-page-app template (spa-base-alpha).
 * Otherwise, clones the default starter-app-alpha.
 *
 * @param {string} appName - Name of the app / folder
 * @param {boolean} isSPA  - Whether to clone the SPA repo
 */
export async function createNewApp(appName, isSPA = false) {
  const targetDir = path.resolve(process.cwd(), appName);

  // Choose repo based on isSPA flag
  const repoUrl = isSPA
      ? 'https://github.com/nybatista/spa-base-alpha.git'
      : 'https://github.com/nybatista/starter-app-alpha.git';

  const git = simpleGit();

  console.log(c.cyan(`\nCreating a new Spyne app in ${c.bold(appName)}...`));
  console.log(c.yellow(`Using repo: ${repoUrl}`));

  // 1) Clone repository with Ora spinner
  let spinner = ora({
    text: c.cyan('Cloning repository...'),
    spinner: 'dots',
  }).start();

  try {
    await git.clone(repoUrl, targetDir, [
      '--branch=main',
      '--single-branch',
      '--depth=1'
    ]);

    spinner.succeed(c.greenBright('Repository cloned successfully!'));
  } catch (err) {
    spinner.fail(c.red(`Failed to clone the repository: ${err.message}`));
    process.exit(1);
  }

  // 2) Remove .git
  try {
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
  } catch (err) {
    console.error(c.red(`Failed to remove .git folder: ${err.message}`));
    process.exit(1);
  }

  // 3) Update index.tmpl.html <title> and package.json name
  try {
    updateProjectDetails(targetDir, appName);
  } catch (err) {
    console.error(c.red(`Failed to update project details: ${err.message}`));
    // not a fatal error in most cases, but you can decide to exit if needed
  }

  // 4) Install dependencies
  try {
    await installDependencies(appName);
  } catch (err) {
    console.error(c.red(err.message));
    process.exit(1);
  }

  // 5) Final message
  console.log(`\n${c.greenBright('Success!')}`);
  console.log(c.cyan(`Created ${c.bold(appName)} at ${targetDir}\n`));
  console.log(c.greenBright('Next steps:'));
  console.log(c.bgCyan(c.black(`  cd ${appName} && npm start`)));
}
