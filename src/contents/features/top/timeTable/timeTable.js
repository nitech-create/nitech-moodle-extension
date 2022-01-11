import { drawTimeTableList } from './timeTableList/timeTable.js';
import optionsUtils from 'Options/optionsUtils.js';

function drawTimeTable() {
  switch (optionsUtils.getOptions().timeTableMode) {
    case 'list':
      drawTimeTableList();
      break;
    case 'graphical':
  }
}

import config from './timeTable.json5';
export default {
  config,
  func: drawTimeTable,
};
