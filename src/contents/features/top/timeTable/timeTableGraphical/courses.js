import $ from 'jQuery';
import { isUndefined, isNullOrUndefined } from 'Lib/utils.js';
import promiseWrapper from 'Lib/promiseWrapper.js';
import optionsUtils from 'Options/optionsUtils.js';

const coursesVersion = '0.0.0.2';

/** 注意: 内部的にstorageに保存を行っています */
export async function getCourses() {
  // load courses
  const courseNumberTxtList = $('.course-listitem .text-muted div').text().slice(1).split('|'); // 取得してきたcourseの要素達
  if (isUndefined(courseNumberTxtList)) {
    console.error('[courses/getCourses] cannot load courseNumberTxtList');
    return undefined;
  }
  // console.log('courseNumberTxtList: ', courseNumberTxtList);

  const courseSize = $('.coursename').length;
  const courseList = loadCourseList();
  if (isUndefined(courseList)) {
    console.error('[courses/getCourses] cannot load courseList');
    return undefined;
  }
  // console.log('courseList: ', courseList);

  const oldCourses = await promiseWrapper.storage.local
    .get('courses')
    .then(result => {
      return result.courses;
    })
    .catch(err => {
      console.log('[getCourses] cannot load old courses.');
      return undefined;
    });
  console.log('oldCourses: ', oldCourses);
  const options = await optionsUtils.getOptions();

  const courses = generateCourses(courseList, courseNumberTxtList, courseSize, oldCourses, options);

  // ボタンによる呼び出しなどで用いるため、保存する
  await promiseWrapper.storage.local.set({ courses: courses });

  return courses;
}

/**
 * courselist:
 * (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls
 * SpecialCourseはcourseShortNumberが無い
 *
 * @return {Array} courseList
 */
function loadCourseList() {
  const courseList = $('.course-listitem .coursename')
    .text()
    .replace(/\s+/g, '') /* これいる？ */
    .split('コース星付きコース名');
  courseList.shift();

  return courseList;
}

/**
 * 取得してきたcourseの要素達から変換し、coursesを生成する。
 *
 * @param {Array} courseList: スペースなし授業名, 通常コース: (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_(cls|cla), 特殊コースはSpecialCourseはcourseShortNumberが無い。
 * @param {String} courseNumberTxtList: 授業番号表記(-あり)。 (-なしはshort付き)
 * @param {int} courseSize
 * @param {Object} oldCourses
 * @param {Object} options
 * @return {Object} courses = {term, shortYear, courseNumberTxt, shortCourseNumberTxt, name, dayOfWeeks = {月, 日}, times = {1-2, 9-10}, url} (ただし特殊授業の場合: term, dayOfWeek = undefined)
 */
function generateCourses(courseList, courseNumberTxtList, courseSize, oldCourses, options) {
  const courses = new Array(courseSize); // result
  courses.coursesVersion = coursesVersion;

  // 変数名がわかりづらいかもしれない
  const termArray = new Array(courseSize);
  const nameArray = new Array(courseSize);
  const dayOfWeeksArray = new Array(courseSize);
  const timesArray = new Array(courseSize);
  const urlArray = new Array(courseSize);
  for (let i = 0; i < courseSize; i++) {
    if (isUndefined(courseNumberTxtList[i])) {
      console.log('[courses/convertToCourses] courseNumberTxtList[i] is undefined.');
      continue;
    }
    if (isUndefined(courseList[i])) {
      console.log('[courses/convertToCourses] courseList[i] is undefined.');
      continue;
    }

    const shortCourseNumber = String(20) + courseNumberTxtList[i].replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
    const shortYear = courseNumberTxtList[i].split(new RegExp('-'))[0];
    if (
      /^.*（\\d+-\\d+-\\d+[\\s]*[前後]期[\\s]*[月火水木金]曜[\\s]*\\d+-\\d+限）$/.test(
        courseList[i],
      )
    ) {
      // ソフトウェア工学2022（22-1-2620 前期 木曜5-6限）など
      courseList[i]
        .split(/^.*（\\d+-\\d+-\\d+[\\s]*[前後]期[\\s]*[月火水木金]曜[\\s]*\\d+-\\d+限）$/)
        .filter(value => {
          return value != '';
        });
      // TODO
    }
    // 集中講義
    if (/^.*\\s\\d+\\s([前後]期)\\s(集中)[^]*$/.test(courseList[i])) {
      // TODO
    }
    // 通常講義: ^.*\d+\s*([前後]期)(\s*[月火水木金]曜\d+-\d+限)+[^]*$
    if (/^.*\\d+\\s*([前後]期)(\\s*[月火水木金]曜\\d+-\\d+限)+[^]*$/.test(courseList[i])) {
      // TODO
    }

    const courseContainerArray = courseList[i]
      .split(new RegExp(shortCourseNumber + '|期|曜|限|_cls|_cla'))
      .filter(value => {
        return value != '';
      });
    // courseContainerArray: [授業名, (前/後), (月/...), (n-n'), ((月/...), (n-n'),) ...] ※複数時間に注意

    nameArray[i] = courseContainerArray[0];
    urlArray[i] = $('.course-listitem .coursename').eq(i).attr('href');

    // timeとtermのパーサー
    if (courseContainerArray.length == 1) {
      // 特殊なクラス(時間割じゃないコース)
      termArray[i] = undefined;
      timesArray[i] = undefined;
    } else {
      // 通常クラス
      termArray[i] = courseContainerArray[1];

      // 週複数授業の曜日と時間(限)
      dayOfWeeksArray[i] = [];
      timesArray[i] = [];
      for (let j = 2; j < courseContainerArray.length; j += 2) {
        dayOfWeeksArray[i].push(courseContainerArray[j]);
        timesArray[i].push(courseContainerArray[j + 1]);
      }
    }

    const completeResult = getCompleteValues(oldCourses, courseNumberTxtList[i], options);
    courses[i] = {
      version: coursesVersion /* いらないかも */,
      term: termArray[i] /* if special courses → undefined */,
      shortYear: shortYear,
      courseNumberTxt: courseNumberTxtList[i] /* 一意(unique)のはず */,
      shortCourseNumber: shortCourseNumber,
      name: nameArray[i] /* 再履修など、一意ではない */,
      dayOfWeeks: dayOfWeeksArray[i] /* dayOfWeeks = {月, 日}, if special courses → undefined*/,
      times: timesArray[i] /* times = {1-2, 9-10} */,
      url: urlArray[i],
      isCompleted: completeResult.isCompleted,
      completeDateTime: completeResult.completeDateTime,
    };
  }
  return courses;
}

function getCompleteValues(oldCourses, courseNumberTxt, options) {
  if (!Array.isArray(oldCourses) || oldCourses.length < 1) {
    return { isCompleted: false, completeDateTime: -1 };
  }

  if (oldCourses.isCompleted) {
    // TODO: テスト
    console.log('oldCourses.isCompleted: ', oldCourses.isCompleted);
  }

  const oldCourse = oldCourses.find(course => course.courseNumberTxt == courseNumberTxt);
  const oneDayTime = 1000 * 60 * 60 * 24; // (86400000 millisec)
  const timeTableCompleteTime = oneDayTime * parseFloat(options.timeTableCompleteMode);

  if (
    !isNullOrUndefined(oldCourse) &&
    !isNullOrUndefined(oldCourse.isCompleted) &&
    oldCourse.isCompleted
  ) {
    const now = Date.now();
    if (!isNullOrUndefined(oldCourse.completeDateTime)) {
      const diffTime = now - oldCourse.completeDateTime;
      console.log('[getCompleteValues] diffTime: ', diffTime);
      if (diffTime <= timeTableCompleteTime) {
        // 完了時から現在の時間差が1日以下
        return { isCompleted: true, completeDateTime: oldCourses.completeDateTime };
      }
    }
  }
  return { isCompleted: false, completeDateTime: -1 };
}
