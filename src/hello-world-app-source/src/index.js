import'./scss/main.scss';
import {SpyneApp} from 'spyne';
import {AppView} from './app/app-view';

const config = {
  debug:true
};

SpyneApp.init(config);

if (process.env.NODE_ENV === 'development') {
  const {SpynePluginConsole} = require('spyne-plugin-console');
  new SpynePluginConsole({position: ['bottom', 'right'], minimize: true});
}

new AppView().prependToDom(document.body);
