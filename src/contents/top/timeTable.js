import $ from 'jQuery';

export function drawTimeTable(rootElement, courseList){
  $(rootElement).append($('<h5>').text('時間割表'));
}
