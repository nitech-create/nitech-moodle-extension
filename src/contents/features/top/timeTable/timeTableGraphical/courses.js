import $ from 'jQuery';
import { isUndefined, isNullOrUndefined } from 'Lib/utils.js';
import promiseWrapper from 'Lib/promiseWrapper.js';
import optionsUtils from 'Options/optionsUtils.js';

const coursesVersion = '0.0.0.2';
const Term = {
  // TODO: あんまりキレイじゃない
  firstSemester: Symbol('前期'),
  secondSemester: Symbol('後期'),
  intensiveCourse: Symbol('集中'),

  getTerm: termText => {
    switch (termText) {
      case '前期':
        return Term.firstSemester;
      case '後期':
        return Term.secondSemester;
      case '集中':
        return Term.intensiveCourse;
      default:
        return undefined;
    }
  },
};

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

  // TODO: 検証中
  getCourseList();

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
    .replace(/\s+/g, '')
    .split('コース星付きコース名');
  courseList.shift();

  return courseList;
}

/**
 * courseList: 通常コース: (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls, 特殊コースはSpecialCourseはcourseShortNumberが無い。
 * @return {Object} courses = {term, shortYear, courseNumberTxt, shortCourseNumberTxt, name, dayOfWeeks = {月, 日}, times = {1-2, 9-10}, url} (ただし特殊授業の場合: term, dayOfWeek = undefined)
 * specialCourse {boolean}, categoryName = {}
          categoryName,
          shortenedName,
          shortenedYear,
          url,
          name,
          semester,
          dayOfWeek,
          startPeriod,
          endPeriod,
 */
export function getCourseList() {
  // TODO:
  console.log('start getCourseList');

  const courseList = [];
  courseList.coursesVersion = coursesVersion;

  const rootJElement = $('#block-region-content div[data-region="courses-view"]');
  if (rootJElement.length <= 0) return [];

  rootJElement.find('li').each((index, itemElement) => loopOfElement(index, itemElement)); // TODO: 内部に入れると分かりづらいので分離したが、キレイではない
  function loopOfElement(index, itemElement) {
    /* ループ */
    try {
      const categoryName = $(itemElement).find('.categoryname').text().trim(); // (21)[1]5-8, (22)[1]0-3など, 0-3は前期、5-8は後期？
      const courseNumberTxt = $(itemElement).find('.categoryname').siblings().last().text().trim(); // 21-1-6162 こういうやつ
      const shortenedYear = parseInt(courseNumberTxt.split('-')[0]); // 西暦20nn年のnn部分
      const courseName = $(itemElement).find('.coursename')[0].childNodes[4].textContent.trim(); // trim済み, (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_(cls|cla)
      const url = $(itemElement).find('a.coursename').attr('href');

      // console.log('TEST', categoryName);
      if (/\(\d+\)\[\d\]\d+-\d+/.test(categoryName)) {
        // console.log('TEST2', categoryName);
        // const courseNameSplit = courseName.split(' '); // 空白でsplit
        // const name = courseNameSplit.slice(0, -3).join(' '); // 授業名, 複数曜日でx
        // const name = courseNameSplit[0]; // Academic Englishなどがx
        const shortCourseNumber = String(20) /* ← 西暦 */ + courseNumberTxt.replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
        const courseNameSplit = courseName.split(shortCourseNumber).map(value => value.trim()); // 番号でsplit
        const name = courseNameSplit[0]; // 授業名

        // if (categoryName == '(20)[1]0-3' && name.includes('理系基礎演習')) {
        //   // console.log('AAA', courseNameSplit);
        //   console.log('AAA NAME', name);
        // }

        // console.log('|courseName: [' + name + ']', courseName.replace(name, '').trim());

        if (
          /^(\d+)\s*([前後]期)\s*([月火水木金]曜\d+-\d+限\s*)+.*$/.test(
            courseName.replace(name, '').trim(),
          )
        ) {
          console.log('|courseName OK: ', name);
          // 通常授業
          courseList.push(
            parseCourseName(
              courseName,
              name,
              courseNameSplit[1],
              courseNumberTxt,
              courseList,
              categoryName,
              url,
              shortenedYear,
            ),
          );
          return;
        } else {
          console.log('|courseName NO');
        }
      }

      courseList.push({
        specialCourse: true,
        categoryName,
        shortenedName: courseNumberTxt,
        shortenedYear,
        url,
        name: courseName,
      });
    } catch (e) {
      // do nothing
    }
  }

  console.log('courseList: ', courseList);
  return courseList;
}

/**
 * courseNameをパースしてcourseListに追加可能な形式にします。
 * @param {String} courseName 授業名というか、長いコース名
 * @param {String} name 授業名
 * @param {String} courseNameSplitOtherTxt 授業名(name)とcourseNumber以外のcourseName部分 理系基礎演習 202010131 "前期 火曜9-10限  金曜5-6限_cls"
 * @param {*} courseNumberTxt: 授業番号表記(-あり)。 (-なしはshort付き) 21-1-6162 こういうやつ
 * @param {*} categoryName: (21)[1]5-8, (22)[1]0-3など, 0-3は前期、5-8は後期？
 * @param {*} url: URL
 * @param {*} shortenedYear: 西暦20nn年のnn部分
 * @return {course} course
 */
function parseCourseName(
  courseName,
  name,
  courseNameSplitOtherTxt,
  courseNumberTxt,
  categoryName,
  url,
  shortenedYear,
) {
  const courseNameSplitWithSpace = courseNameSplitOtherTxt.split(' ').filter(value => {
    return value != ''; // なぜか発生する空白だけの要素をなくす
  });
  console.log('courseNameSplitWithSpace: ', courseNameSplitWithSpace);

  const getSemester = semesterText => {
    switch (semesterText) {
      case '前期':
        return 0;
      case '後期':
        return 1;
      default:
        return -1;
    }
    // return semesterText == '前期' ? 0 : 1;
  };
  const semester = getSemester(courseNameSplitWithSpace[0]);

  const term = Term.getTerm(courseNameSplitWithSpace[0]);

  // これは多分、複数曜日に非対応
  /** 授業の情報 | [0: 曜日, 1: start, 2: end] */
  const periodSplit = courseNameSplitWithSpace[
    courseNameSplitWithSpace.length - 1
  ] /* 空白でsplitした部分の最後の要素(= 授業名, courseNumberを除く) */
    .replace(
      /^(([月火水木金])曜(\d)-(\d)限\s*)+_(?:.+)$/,
      '$1 $2 $3',
    ) /* キャプチャした文字列を空白区切りに変換 */
    .split(' '); /* 配列化 */

  const parseCourseInfo = courseNameOthers => {
    const periodSplits = [];
    console.log('courseNameOthers: [' + name + ']', courseNameOthers);
    let tmp = courseNameOthers;

    // 最後の_clsとかを削除
    const indexOfUnderscore = tmp.lastIndexOf('_');
    if (tmp.length - 5 < indexOfUnderscore) {
      // indexが4文字以下
      tmp = tmp.slice(0, indexOfUnderscore).trim();
    }

    console.log('start parse [' + name + ']', tmp);
    for (let i = 0; tmp != '' && i < 5; i++) {
      // 5回以上曜日とかが出てこないと信じて
      console.log('tmp: [' + name + ']', tmp);
      tmp = tmp.replace(
        /^([月火水木金])曜(\d)-(\d)限(.*)/,
        '$1 $2 $3 $4',
      ); /* キャプチャした文字列を空白区切りに変換 */

      // $4は残りの情報
      console.log('tmp F: [' + name + ']', tmp, tmp.split(' '));
      const tmpSplit = tmp.split(' ');
      periodSplits.push(tmpSplit.slice(0, 3)); // 2重配列にする
      tmp = tmpSplit[tmpSplit.length - 1].trim();
    }
    console.log('end parse');
    return periodSplits;
  };
  const periodSplits = parseCourseInfo(
    courseNameSplitWithSpace[
      courseNameSplitWithSpace.length - 1
    ] /* 空白でsplitした部分の最後の要素(= 授業名, courseNumberを除く) */,
  );
  // console.log('periodSplits: ', periodSplits);
  // TODO: 「22-1-0019 微分積分Ⅰ及び演習 202210019 前期 水曜3-4限 金曜3-4限_c22」などは週に2回ある
  const dayOfWeek = ['月曜', '火曜', '水曜', '木曜', '金曜'].indexOf(periodSplit[0]);

  // 「プログラミングⅢ 202116630 後期 木曜5-8限_cla」のように、2コマのことがある
  const startPeriod = parseInt(periodSplit[1]);
  const endPeriod = parseInt(periodSplit[2]);

  const shortCourseNumber = /* 西暦→ */ '20' + courseNumberTxt.replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など

  return {
    version: coursesVersion,
    specialCourse: false,
    categoryName /** (21)[1]5-8, (22)[1]0-3など, 0-3は前期、5-8は後期？ */,
    name /** 授業名 */,
    shortenedName: courseNumberTxt /** 21-1-6162 こういうやつ */,
    courseNumberTxt,
    shortCourseNumber,
    url,
    shortenedYear,
    shortYear: shortenedYear,
    semester,
    term /* termはsemesterにさらに集中講義とかも含めているやつ if 集中以外のspecial courses → undefined */,
    dayOfWeek,
    dayOfWeeks: [],
    startPeriod,
    endPeriod,
    periodSplits,
  };
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

    const shortCourseNumber = String(20) /* ← 西暦 */ + courseNumberTxtList[i].replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
    const shortYear = courseNumberTxtList[i].split(new RegExp('-'))[0];
    if (/^.*（\d+-\d+-\d+[\s]*[前後]期[\s]*[月火水木金]曜[\s]*\d+-\d+限）$/.test(courseList[i])) {
      // ソフトウェア工学2022（22-1-2620 前期 木曜5-6限）など: ^.*（\d+-\d+-\d+[\s]*[前後]期[\s]*[月火水木金]曜[\s]*\d+-\d+限）$
      courseList[i]
        .split(/^.*（\d+-\d+-\d+[\s]*[前後]期[\s]*[月火水木金]曜[\s]*\d+-\d+限）$/)
        .filter(value => {
          return value != '';
        });
      // TODO
    }
    // 集中講義
    if (/^.*\s\d+\s([前後]期)\s(集中)[^]*$/.test(courseList[i])) {
      // TODO
    }
    // 通常講義
    if (/^.*\d+\s*([前後]期)(\s*[月火水木金]曜\d+-\d+限)+[^]*$/.test(courseList[i])) {
      // TODO
    }

    const courseContainerArray = courseList[i]
      .split(new RegExp(shortCourseNumber + '|期|曜|限|_cls'))
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
      termArray[i] = courseContainerArray[1]; // 前, 後 (string)

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
