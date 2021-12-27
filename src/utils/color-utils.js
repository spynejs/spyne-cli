import c from 'ansi-colors';

const colorsArr = [c.black, c.cyan,  c.red,   c.green, c.greenBright, c.yellow,  c.yellowBright, c.blue,   c.blueBright, c.magenta,  c.magentaBright, c.cyan,  c.cyanBright, c.white, c.whiteBright, c.gray]

const bgColorsArr = [c.bgBlack, c.bgBlackBright, c.bgRed, c.bgRedBright, c.bgGreen,
  c.bgGreenBright, c.bgYellow, c.bgYellowBright, c.bgBlue, c.bgBlueBright, c.bgMagenta, c.bgMagentaBright, c.cyan, c.cyanBright, c.bgWhite, c.bgWhiteBright]



const addColorToStr =  (str)=>(cFn)=>cFn(str);


const viewAllColors =(str="File saved successfully.")=>{
  const testColor = (cFn)=>{
    const coloredStr = cFn(str);
    console.log(coloredStr);

  }

  const testBgColors = (bgFn)=>{
    const strToColor = addColorToStr(str);
    const mappedAll = colorsArr.map(strToColor);
    const nestColors = (cFn)=>{
      const nestedColor = bgFn(cFn);
      console.log(nestedColor);
    }
    mappedAll.forEach(nestColors)

  }

  colorsArr.forEach(testColor)
  bgColorsArr.forEach(testBgColors);

}

export {viewAllColors}
