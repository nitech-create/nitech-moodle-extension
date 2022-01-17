import $ from 'jquery';
import promiseWrapper from 'Lib/promiseWrapper.js';
import { isUndefined } from '../../../lib/utils';
// calenderの選択ボタンは本来、コース名(授業番号)となってしまっているため、授業名に表示のみ差し替える機能。
async function onLoad() {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(result => {
      return result.courses;
    })
    .catch(err => {
      console.log('[changeDisplayName] cannot load courses.');
      return undefined;
    });

  changeDisplayName(courses);
}

async function changeDisplayName(courses) {
  const options = document.getElementById('menucourse').options;
  console.log('[changeDisplayName] options: ', options);
  Array.prototype.forEach.call(options, option => {
    const course = courses.find(course => course.courseNumberTxt == option.label);

    if (isUndefined(course)) {
      if (!(option.value == 1 && option.label == 'すべてのコース')) {
        console.log('Cannot find!: ' + option.label);
      }
      return;
    }

    option.label = course.name + ' (' + course.courseNumberTxt + ')';
    console.log('[changeDisplayName] option.label: ', option.label);
  });
}

async function changeSubmittedTask(courses) {
  const events = $("#region-main li[data-region='event-item'] a");
  events.each((_, e) => {
    const url = new URL($(e).attr('href'));
    const id = url.searchParams.get('id');
    if (id && status[id])
      if (status[id].isSubmitted) $(e).children('span:first').css('background-color', '#66cc66');
  });
}

import config from './calendar.json5';
export default {
  config,
  func: onLoad,
};
