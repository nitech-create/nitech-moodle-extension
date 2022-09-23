import promiseWrapper from 'Lib/promiseWrapper.js';

// calenderの選択ボタンは本来、コース名(授業番号)となってしまっているため、授業名に表示のみ差し替える機能。
async function changeDisplayName() {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(result => {
      return result.courses;
    })
    .catch(err => {
      console.log('[getCourses] cannot load old courses.');
      return undefined;
    });

  const options = document.getElementById('menucourse').options;
  Array.prototype.forEach.call(options, function (option) {
    const course = courses.find(course => course.courseNumberTxt == option.label);
    if (course == undefined) {
      if (!(option.value == 1 && option.label == 'すべてのコース')) {
        console.log('Cannot find!: ' + option.label);
      }
    } else {
      option.label = course.name + ' (' + course.courseNumberTxt + ')';
    }
  });
}

import config from './calendar.json5';
export default {
  config,
  func: changeDisplayName,
};
