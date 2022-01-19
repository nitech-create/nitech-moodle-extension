import $ from 'jquery';
import promiseWrapper from 'Lib/promiseWrapper.js';

async function onLoad() {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(result => {
      return result.courses;
    })
    .catch(err => {
      console.log('[getCourses] cannot load old courses.');
      return undefined;
    });

  appendCourseName(courses);
}

function appendCourseName(courses) {
  // 直近イベントに講義名を付加
  $('section.block_calendar_upcoming div.event').each((_, e) => {
    const url = new URL($(e).children('a').attr('href'));
    const course = courses.find(course => course.id == url.searchParams.get('course'));

    console.log(
      'appendCourseName: ',
      course,
      $(e).children('a').attr('href'),
      url.searchParams.get('course'),
    );

    $(e).prepend(`<p>${course.name}</p>`);
  });
}

import config from './upcommingEvents.json5';
export default {
  config,
  func: onLoad,
};
