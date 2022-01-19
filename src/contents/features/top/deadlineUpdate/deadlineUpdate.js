import $ from 'jQuery';

import { getEvenetList } from './eventList.js';

let intervalId = null;
function register() {
  const eventList = getEvenetList();

  console.log('[deadlineUpdate] eventList: ', eventList);

  eventList.forEach(event => {
    $(event.domElement).find('hr').before(createTimeArea);
  });

  clearInterval(intervalId);
  intervalId = setInterval(update, 500, eventList);
}

function createTimeArea() {
  const wrapper = $('<div>');
  const label = $('<span>');
  const time = $('<span>');

  wrapper.addClass('extension-remaining-view');
  label.text('残り時間: ');
  time.addClass('remainingTime');

  return wrapper.append(label).append(time);
}

function update(eventList) {
  const now = Date.now();
  eventList.forEach(event => {
    const remainingTime = event.deadline.getTime() - now;
    const text = remainingTimeDisplay(remainingTime);

    // DOMの再描画を減らしたい
    if ($(event.domElement).find('.remainingTime').text() != text) {
      $(event.domElement).find('.remainingTime').text(text);
    }

    if (remainingTime < 86400000) {
      // 1日を切っている場合強調用のクラスを付与
      $(event.domElement).find('.remainingTime').addClass('deadline');
    }
  });
}

function remainingTimeDisplay(duration) {
  if (duration < 0) {
    return remainingTimeDisplay(-duration) + ' 超過しています';
  }

  if (duration < 60000) {
    return '1分以下';
  }

  const minutes = Math.floor(duration / (1000 * 60)) % 60;
  const hours = Math.floor(duration / (1000 * 60 * 60)) % 24;
  const days = Math.floor(duration / (1000 * 60 * 60 * 24)) % 365;

  if (days == 0) {
    if (hours == 0) {
      return minutes + '分';
    }
    return hours + '時間 ' + minutes + '分';
  }
  return days + '日 ' + hours + '時間 ' + minutes + '分';
}

import config from './deadlineUpdate.json5';
export default {
  config,
  func: register,
};
