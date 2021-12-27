import figlet from 'figlet';
import chalk from 'chalk';

export class SpyneCliUI {

  constructor() {}
  static title(){
    const figletTxt = figlet.textSync('spyne-cli', {
      horizontalLayout: 'universal smushing'
    })
    const chalkOutput = chalk.blue(figletTxt);
    return console.log(chalkOutput);

  }

}