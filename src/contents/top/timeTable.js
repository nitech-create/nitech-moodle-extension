import $ from 'jQuery';
import { classifyCourseList } from './courseList.js';

export function drawTimeTable(rootElement, courseList){
  $(rootElement).append($('<h5>').text('時間割表'));

  console.log(classifyCourseList(courseList));
}
