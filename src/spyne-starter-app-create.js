import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import simpleGit from 'simple-git';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createNewApp(appName) {
  // 1. Define where the new app folder will be created
  const targetDir = path.join(process.cwd(), appName);

  // 2. Define the repository URL for your starter app
  //    Change this to the actual URL of your public "starter-app" repo
  //const repoUrl = 'https://github.com/YourUser/starter-app.git';
  const repoUrl = 'https://github.com/nybatista/starter-app-alpha.git';
  // 3. Use simple-git to clone the repo
  const git = simpleGit();

  console.log(`\nCreating a new Spyne app in: ${targetDir}\n`);
  console.log('Cloning the starter-app repository...');

  // Shallow clone with --depth=1
  await git.clone(repoUrl, targetDir, ['--depth=1']);

  // 4. Remove the .git folder, so the new folder isn't tied to your repo
  const gitFolder = path.join(targetDir, '.git');
  fs.rmSync(gitFolder, { recursive: true, force: true });

  // 5. Install dependencies
  console.log(`\nInstalling dependencies in "${appName}"...\n`);
  execSync(`cd "${appName}" && npm install`, { stdio: 'inherit' });

  // 6. Print success message and usage
  console.log(`\nSuccess! Created ${appName} at ${targetDir}`);
  console.log('Inside that directory, you can run several commands including:\n');
  console.log(`  npm run dev`);
  console.log('\nWe suggest that you begin by typing:\n');
  console.log(`  cd ${appName}`);
  console.log(`  npm run dev\n`);
  console.log('Happy coding!');
}
