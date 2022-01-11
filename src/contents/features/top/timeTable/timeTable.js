import { drawTimeTableList } from './timeTableList/timeTable.js';
import { drawTimeTableGraphical } from './timeTableGraphical/timeTable.js';
import optionsUtils from 'Options/optionsUtils.js';

async function drawTimeTable() {
  const options = await optionsUtils.getOptions();
  console.log('timeTableMode: ' + options.timeTableMode);

  switch (options.timeTableMode) {
    case 'list':
      drawTimeTableList();
      break;
    case 'graphical':
      drawTimeTableGraphical();
      break;
  }
}

import config from './timeTable.json5';
export default {
  config,
  func: drawTimeTable,
};
