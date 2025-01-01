import c from 'ansi-colors';
import simpleGit from 'simple-git';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function createNewApp(appName) {
  const targetDir = path.resolve(process.cwd(), appName);
  const repoUrl = 'https://github.com/nybatista/starter-app-alpha.git';
  const git = simpleGit();

  console.log(c.cyan(`\nCreating a new Spyne app in ${c.bold(appName)}...`));

  // 1) Clone repository
  try {
    console.log(c.cyan('Cloning starter-app repository...'));
    await git.clone(repoUrl, targetDir, ['--depth=1']);
    console.log(c.greenBright('Starter App cloned successfully!'));
  } catch (err) {
    console.error(c.red(`Failed to clone the repository: ${err.message}`));
    process.exit(1);
  }

  // 2) Remove .git (silent - no user message)
  try {
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
  } catch (err) {
    console.error(c.red(`Failed to remove .git folder: ${err.message}`));
    process.exit(1);
  }

  // 3) Install dependencies
  try {
    console.log(c.cyan('\nInstalling dependencies...'));
    execSync(`cd "${appName}" && npm install`, { stdio: 'ignore' });
    console.log(c.greenBright('Dependencies installed successfully!'));
  } catch (err) {
    console.error(c.red(`Failed to install dependencies: ${err.message}`));
    process.exit(1);
  }
  console.log(c.cyan('Cloning starter-app repository...'));

  // 4) Final success message
  console.log(`\n${c.greenBright('Success!')}`);
  console.log(c.cyan(`Created ${c.bold(appName)} at ${targetDir}\n`));
  console.log(c.greenBright(`Next steps:`));
  console.log(c.cyanBright(`cd ${appName} && npm start`));
}
