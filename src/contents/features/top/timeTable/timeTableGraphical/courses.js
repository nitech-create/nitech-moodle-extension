import $ from 'jQuery';

export function getCourses() {
  // load courses
  const courseNumberTxtList = $('.course-listitem .text-muted div').text().slice(1).split('|'); // 取得してきたcourseの要素達
  const courseSize = $('.coursename').length;
  return convertToCourses(loadCourseList(), courseNumberTxtList, courseSize);
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
    .replace(/\s+/g, '')
    .split('コース星付きコース名');
  courseList.shift();

  return courseList;
}

/**
 * 取得してきたcourseの要素達から変換し、coursesを生成する。
 *
 * @param {Array} courseList: 通常コース: (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls, 特殊コースはSpecialCourseはcourseShortNumberが無い。
 * @param {String} courseNumberTxtList: 授業番号表記(-あり)。 (-なしはshort付き)
 * @param {int} courseSize
 * @return {Object} courses = {term, shortYear, courseNumberTxt, shortCourseNumberTxt, name, dayOfWeeks = {月, 日}, times = {1-2, 9-10}, url} (ただし特殊授業の場合: term, dayOfWeek = undefined)
 */
function convertToCourses(courseList, courseNumberTxtList, courseSize) {
  const courses = new Array(courseSize); // result

  // 変数名がわかりづらいかもしれない
  const termArray = new Array(courseSize);
  const nameArray = new Array(courseSize);
  const dayOfWeeksArray = new Array(courseSize);
  const timesArray = new Array(courseSize);
  const urlArray = new Array(courseSize);
  for (let i = 0; i < courseSize; i++) {
    const shortCourseNumber = String(20) + courseNumberTxtList[i].replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
    const shortYear = courseNumberTxtList[i].split(new RegExp('-'))[0];
    const courseContainerArray = courseList[i]
      .split(new RegExp(shortCourseNumber + '|期|曜|限|_cls'))
      .filter(value => {
        return value != '';
      });
    // courseContainerArray: [授業名, (前/後), (月/...), (n-n'), ((月/...), (n-n'),) ...] ※複数時間に注意

    nameArray[i] = courseContainerArray[0];
    urlArray[i] = $('.course-listitem .coursename').eq(i).attr('href');

    if (courseContainerArray.length == 1) {
      // 特殊なクラス(時間割じゃないコース)
      // TODO: 'none'ではなく「nilでもnullでもundefinedでもfalse」←ここらへんにしたい気がする。
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

    courses[i] = {
      term: termArray[i],
      shortYear: shortYear,
      courseNumberTxt: courseNumberTxtList[i],
      shortCourseNumberTxt: shortCourseNumber /* TODO: courseNumberで良いかもしれない */,
      name: nameArray[i],
      dayOfWeeks: dayOfWeeksArray[i],
      times: timesArray[i],
      url: urlArray[i],
    };
  }
  return courses;
}
