import { drawTimeTableList } from './timeTableList/timeTable.js';

function drawTimeTable() {
  drawTimeTableList();


}

import config from './timeTable.json5';
export default {
  config,
  func: drawTimeTable,
};
