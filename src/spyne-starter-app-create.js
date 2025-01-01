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
    // Use --silent to suppress npm logs
    const child = spawn('npm', ['install', '--silent'], {
      cwd: appName,
      // stdio: 'ignore' → all output is ignored, the spinner continues unblocked
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

export async function createNewApp(appName) {
  const targetDir = path.resolve(process.cwd(), appName);
  const repoUrl = 'https://github.com/nybatista/starter-app-alpha.git';
  const git = simpleGit();

  console.log(c.cyan(`\nCreating a new Spyne app in ${c.bold(appName)}...`));

  // 1) Clone repository with Ora spinner
  let spinner = ora({
    text: c.cyan('Cloning starter-app repository...'),
    spinner: 'dots',
  }).start();

  try {
    await git.clone(repoUrl, targetDir, ['--depth=1']);
    spinner.succeed(c.greenBright('Starter App cloned successfully!'));
  } catch (err) {
    spinner.fail(c.red(`Failed to clone the repository: ${err.message}`));
    process.exit(1);
  }

  // 2) Remove .git (silent - no user message)
  try {
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
  } catch (err) {
    console.error(c.red(`Failed to remove .git folder: ${err.message}`));
    process.exit(1);
  }

  // 3) Asynchronous install (silent)
  try {
    await installDependencies(appName);
  } catch (err) {
    console.error(c.red(err.message));
    process.exit(1);
  }

  // 4) Final success message
  console.log(`\n${c.greenBright('Success!')}`);
  console.log(c.cyan(`Created ${c.bold(appName)} at ${targetDir}\n`));
  console.log(c.greenBright('Next steps:'));
  console.log(c.bgCyan(c.black(`  cd ${appName} && npm start`)));
}
