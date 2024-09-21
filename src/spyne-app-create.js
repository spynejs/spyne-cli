// SpyneAppCreator.js

import c from 'ansi-colors';
import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import cliCursor from 'cli-cursor';

class SpyneAppCreator {
  constructor(args) {
    this.args = args;
    this.createAppBool = this.checkCreateAppCommand();
  }

  // Method to check if 'create' command is used with 'appFolder' argument
  checkCreateAppCommand() {
    const createIndex = this.args.indexOf('create');
    if (createIndex !== -1 && this.args[createIndex + 1]) {
      this.appFolder = this.args[createIndex + 1];
      this.parseOptions(createIndex + 2); // Start parsing options after 'appFolder'
      return true;
    }
    return false;
  }

  // Method to parse additional command-line options
  parseOptions(startIndex) {
    this.options = {
      templateName: 'starter-app', // Default template
      skipInstall: false,
      skipGit: false,
    };

    for (let i = startIndex; i < this.args.length; i++) {
      const arg = this.args[i];
      if (arg === '--template' && this.args[i + 1]) {
        this.options.templateName = this.args[i + 1];
        i++; // Skip the next argument since it's the value of --template
      } else if (arg === '--no-install') {
        this.options.skipInstall = true;
      } else if (arg === '--skip-git') {
        this.options.skipGit = true;
      }
    }
  }

  // Getter for createAppBool
  get createAppBool() {
    return this._createAppBool;
  }

  // Setter for createAppBool
  set createAppBool(value) {
    this._createAppBool = value;
  }

  // Method to initiate app creation
  async createApp() {
    const appFolder = this.appFolder;
    const { templateName, skipInstall, skipGit } = this.options;
    const repoUrl = this.getTemplateRepoUrl(templateName);
    const appPath = path.resolve(process.cwd(), appFolder);

    console.log(c.green(`\nCreating a new Spyne app in ${c.cyan(appPath)} using the "${c.cyan(templateName)}" template...\n`));

    try {
      // Hide the cursor
      cliCursor.hide();

      // Clone the repository
      await this.cloneRepository(repoUrl, appFolder);

      // Remove the .git directory
      await fs.remove(path.join(appFolder, '.git'));

      // Initialize a new Git repository if not skipped
      if (!skipGit) {
        await this.initGitRepo(appFolder);
      }

      // Install dependencies if not skipped
      if (!skipInstall) {
        await this.installDependencies(appFolder);
      }

      // Update package.json
      await this.updatePackageJson(appFolder);

      // Provide post-installation instructions
      this.printSuccessMessage(appFolder, appPath, skipInstall);
    } catch (error) {
      console.error(c.red(`\nError: ${error.message}`));
    } finally {
      // Show the cursor again
      cliCursor.show();
    }
  }

  // Method to get the repository URL based on the template name
  getTemplateRepoUrl(templateName) {
    const templates = {
      'starter-app': 'https://github.com/nybatista/starter-app-alpha.git',
      // Add more templates here if needed
    };
    if (!templates[templateName]) {
      throw new Error(`Template "${templateName}" not found.`);
    }
    return templates[templateName];
  }

  // Method to clone the repository with spinner
  cloneRepository(repoUrl, appFolder) {
    return new Promise((resolve, reject) => {
      const spinner = ora(c.green('Cloning repository...')).start();

      exec(`git clone --depth=1 ${repoUrl} ${appFolder}`, (error) => {
        if (error) {
          spinner.fail(c.red('Failed to clone repository.'));
          reject(new Error(`Failed to clone repository: ${error.message}`));
        } else {
          spinner.succeed(c.green('Repository cloned successfully.'));
          resolve();
        }
      });
    });
  }

  // Method to initialize a new Git repository with spinner
  initGitRepo(appFolder) {
    return new Promise((resolve) => {
      const spinner = ora(c.green('Initializing Git repository...')).start();

      exec('git --version', (gitError) => {
        if (gitError) {
          spinner.warn(c.yellow('Git is not installed. Skipping Git initialization.'));
          resolve();
        } else {
          exec('git init', { cwd: appFolder }, (initError) => {
            if (initError) {
              spinner.fail(c.red('Failed to initialize Git repository.'));
            } else {
              spinner.succeed(c.green('Git repository initialized.'));
            }
            resolve();
          });
        }
      });
    });
  }

  // Method to install dependencies with spinner
  installDependencies(appFolder) {
    return new Promise((resolve) => {
      const spinner = ora(c.green('Installing dependencies...')).start();

      exec('npm install', { cwd: appFolder }, (installError) => {
        if (installError) {
          spinner.fail(c.red('Failed to install dependencies.'));
          resolve(); // Proceed even if installation fails
        } else {
          spinner.succeed(c.green('Dependencies installed successfully.'));
          resolve();
        }
      });
    });
  }

  // Method to update package.json with spinner
  updatePackageJson(appFolder) {
    return new Promise((resolve, reject) => {
      const spinner = ora(c.green('Updating package.json...')).start();
      const pkgPath = path.join(appFolder, 'package.json');

      fs.readJson(pkgPath)
      .then((pkg) => {
        pkg.name = path.basename(appFolder);
        return fs.writeJson(pkgPath, pkg, { spaces: 2 });
      })
      .then(() => {
        spinner.succeed(c.green('package.json updated.'));
        resolve();
      })
      .catch((err) => {
        spinner.fail(c.red('Failed to update package.json.'));
        reject(new Error(`Failed to update package.json: ${err.message}`));
      });
    });
  }

  // Method to print success message
  printSuccessMessage(appFolder, appPath, skipInstall) {
    console.log(c.green(`\nSuccess! Created ${c.cyan(appFolder)} at ${c.cyan(appPath)}\n`));
    console.log('Inside that directory, you can run several commands:\n');
    console.log(`  ${c.cyan('npm start')}`);
    console.log('    Starts the development server.\n');
    console.log(`  ${c.cyan('npm run build')}`);
    console.log('    Bundles the app into static files for production.\n');
    console.log('We suggest that you begin by typing:\n');
    console.log(`  ${c.cyan('cd')} ${appFolder}`);
    if (skipInstall) {
      console.log(`  ${c.cyan('npm install')}`);
    }
    console.log(`  ${c.cyan('npm start')}\n`);
    console.log(c.green('Happy coding!'));
  }
}

export default SpyneAppCreator;
