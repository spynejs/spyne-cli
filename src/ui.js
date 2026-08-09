import figlet from 'figlet';
import chalk from 'chalk';
import { readFileSync } from 'fs';

const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

export class SpyneCliUI {

  constructor() {}
  static title(){
    const figletTxt = figlet.textSync(`spyne-cli ${version}`, {
      horizontalLayout: 'universal smushing'
    })
    const chalkOutput = chalk.blue(figletTxt);
    return console.log(chalkOutput);

  }

}
