import promiseWrapper from 'Lib/promiseWrapper.js';
import utils from 'Lib/utils.js';
import $ from 'jQuery';
import createExtensionArea from './extensionArea.js';
import { getEvenetList } from './eventList.js';
import { getCourseList } from './courseList.js';
import awaitPageLoading from './awaitPageLoading.js'
import * as deadlineUpdate from './deadlineUpdate.js';

const top = {
  onTopPage: null,
};

top.onTopPage = (url) => {
  // topページでの処理

  return awaitPageLoading.then(async () => {
    const courseValue = $('.coursename');

    // コース概要のフィルタを「すべて表示(表示から削除済みを除く)」にする
    const script = document.createElement('script');
    script.textContent = `$('#groupingdropdown').next('.dropdown-menu').find('a[data-value="all"]').click();`;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
    await awaitPageLoading;

    topPageMain();
    // await reformTopPage(courseValue.length);
    console.log('value: ', courseValue.length, courseValue);
  });
};

function topPageMain(){
  // 直近イベントを取得
  const eventList = getEvenetList();
  console.log(eventList);

  // 受講コースを取得
  const courseList = getCourseList();
  console.log(courseList);

  // 拡張機能用の場所を追加
  const extensionArea = createExtensionArea();
  $(extensionArea).append($('<h5>').text('時間割表'));

  // 残り時間の動的アップデート
  deadlineUpdate.register(eventList);

  return;
}







async function reformTopPage(courseSize) {
  // 読み込み終わったらの処理

  // blockを左に集める＆順番最適化
  // block: もともとmoodleページの右側にあるコース検索・マイシラバスなどを集めた領域
  // TODO: ここなにをしているのか, 多分左に集めるやつ？, ハードコーディング？(関数内)
  const blocks = loadBlocks();

  // events: moodleトップページにある「直近イベント」のarray
  const events = convertToEvents(blocks.calendarUpcomingEventBlock);
  console.log('##EVENTS', events);

  // tables.html(時間割, Todoなど)をロードして描画
  const tablesFilePath = 'tables.html';
  $('#page').append(
    await promiseWrapper.runtime.sendMessage({ item: 'loadFile', src: tablesFilePath }),
  );

  const nowDate = new Date();
  // 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)としてget
  const nowDayOfWeekTxt = convertToDayOfWeekTxt(nowDate.getDay());
  const nowTerm = getTermLetter(nowDate);
  const shortYear = String(nowDate.getFullYear()).substring(2);

  // load courses
  const courseNumberTxtList = $('.course-listitem .text-muted div').text().slice(1).split('|'); // 取得してきたcourseの要素達
  const courses = convertToCourses(loadCourseList(), courseNumberTxtList, courseSize);
  console.log('reformTopPage: courses: ', courses);
  // ストレージに保持(local->syncで他拡張機能と共有可能?)
  promiseWrapper.storage.local.set({ courses: courses });

  // 時間割の選択年の追加
  const years = new Set();
  courses.forEach(course => {
    years.add(course.shortYear);
  });
  years.forEach(yearItem => {
    $('#year_select_extension').append($('<option>').html(yearItem).val(yearItem));
  });

  // 時間割内の授業を描画
  // TODO: 本当にawaitの必要があるか？
  await renderTimeTable(courses, nowTerm, nowDate.getDay(), nowDayOfWeekTxt, shortYear);

  // 時間割外の授業を追加
  renderSpecialCourses(courses);

  // 直近イベントに残り時間を描画
  renderEventDeadline(events);

  // 動的に残り時間を変更
  let oldmin = nowDate.getMinutes();
  setInterval(async () => {
    await updateTopPage(events, oldmin)
      .then(value => (oldmin = value))
      .catch(reason => console.error(reason));
  }, 1000);
}

function convertToEvents(calendarUpcomingEventBlock) {
  return Array.from(
    calendarUpcomingEventBlock
      .children('div')
      .children('div')
      .children('div')
      .first()
      .children('div')
      .children('div'),
  );
}

function renderEventDeadline(events) {
  // TODO: 計算中って初期でこうやって管理するのやばいのでは？(ハードコーディングですので)

  for (const event of events) {
    $(event).children('.date').append('');
    $(event)
      .children('.date')
      .append('<br>残り時間 ： <span class="date-left-extension">計算中</span>');
  }
}

function loadBlocks() {
  const blocks = {
    searchCourseBlock: $('[data-block="html"]').last(),
    jyouhouSecurityBlock: $('[data-block="html"]').first(),
    navigatorBlock: $('[data-block="navigation"]'),
    mySyllabusBlock: $('[data-block="mysyllabus"]'),
    privateFilesBlock: $('[data-block="private_files"]'),
    calendarUpcomingEventBlock: $('[data-block="calendar_upcoming"]'),
    badgesBlock: $('[data-block="badges"]'),
    monthCalendarBlock: $('[data-block="calendar_month"]'),
  };
  return blocks;
}

// TODO: async 必要？
async function updateTopPage(events, oldmin) {
  const doUpdate = await promiseWrapper.storage.local
    .get('doUpdate')
    .then(data => {
      console.log('updateTopPage, doUpdate: ', data.doUpdate);
      return data.doUpdate;
    })
    .catch(async reason => {
      console.log(reason);
      await promiseWrapper.storage.local.set({ doUpdate: true });
      return true;
    });

  if (!doUpdate) {
    return;
  }

  const nowDate = new Date();
  const newmin = nowDate.getMinutes();

  if (oldmin == newmin) return;

  // 分が変わっていれば表示を初期化
  $('.date-left-extension').empty();

  // 各eventに対して、残り時間と、期限(日時?時間?)を取得
  for (let i = 0; i < events.length; i++) {
    // task_date_txt:
    // YYYY年 0n月 nn日, 23:59<br>残り時間 ： n日 n時間 n分
    const taskDueDateString = $(events[i]).children('.date').text();
    const taskDueDate = convertTaskDueDateTxtToDate(taskDueDateString, nowDate);

    // 残り時間を表示
    const remainingTime = taskDueDate - nowDate;
    if (0 < remainingTime && remainingTime < 60000) {
      $($('.date-left-extension')[i]).text('1分以下');
    } else {
      $($('.date-left-extension')[i]).text(msToTime(remainingTime + 60000));
    }

    if (remainingTime < 86400000) {
      // 1日を切っている場合
      // 文字を赤くする
      $($('.date-left-extension')[i]).addClass('deadline');
    }
  }

  return newmin;
}

function changeTermOption(nowTerm) {
  if (nowTerm == '前') {
    $('#term_select_extension option').eq(0).prop('selected', true);
  } else {
    $('#term_select_extension option').eq(1).prop('selected', true);
  }
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

function renderSpecialCourses(courses) {
  $('#special_class_extension').empty();
  const specialCourses = courses.filter(course => utils.isUndefined(course.times));
  if (specialCourses <= 0) {
    $('#special_class_extension').append('<tr><td>登録されていないようです。</td></tr>');
    return;
  }

  specialCourses.forEach(course => {
    $('#special_class_extension').append(
      '<tr><td>' +
        course.name +
        '<br><a href="' +
        course.url +
        '">この授業のページに移動する</a></td></tr>',
    );
  });
}

/**
 * Tablesを描画します。
 *
 * @param {Object} courses
 * @param {String} selectedTerm
 * @param {Integer} selectedDayOfWeekNum
 * @param {String} selectedDayOfWeekTxt
 * @param {Int} shortYear
 */
async function renderTimeTable(
  courses,
  selectedTerm,
  selectedDayOfWeekNum,
  selectedDayOfWeekTxt,
  shortYear,
) {
  console.log(
    'drawTables: term, dayOfWeekNum, dayOfWeekTxt: ',
    selectedTerm,
    selectedDayOfWeekNum,
    selectedDayOfWeekTxt,
  );

  resetTables();

  // 時間割の選択年の表示
  $('#year_select_extension option').eq(shortYear).prop('selected', true);
  // 時間割の選択termの表示
  changeTermOption(selectedTerm);
  // 時間割の選択曜日の表示
  $('#day_select_extension option').eq(selectedDayOfWeekNum).prop('selected', true);
  // 時間割タイトルにtermの表示
  $('#classtable_extension_term').text(selectedTerm);
  // 時間割タイトルに曜日の表示
  $('#classtable_extension_day').text(selectedDayOfWeekTxt);

  if (selectedDayOfWeekNum == 7) {
    // 週間の選択が、一覧の場合の処理
    renderWeekClassTable(courses);
  }

  // 空きコマ埋めの初期化
  removeBlankOfClassTables();

  const classTableSet = [false, false, false, false, false];
  for (const course of courses) {
    if (
      !utils.isUndefined(course.term) &&
      !utils.isUndefined(course.dayOfWeeks) /* term, dayOfWeeksがundefのときはspecialCourses */ &&
      course.term == selectedTerm &&
      course.dayOfWeeks.includes(selectedDayOfWeekTxt) &&
      course.shortYear == shortYear
    ) {
      /* courseが指定されたterm, 曜日であるとき */
      console.log('drawTables: course: ', course);
      // classを描画！
      renderClassTable(
        course,
        getCourseTimeFromDayOfWeek(course.times, course.dayOfWeeks, selectedDayOfWeekTxt),
        classTableSet,
      );
    }
  }
  // TODO: 空きコマ処理をif文で分岐するほうがきれい
  // 空きコマ埋め処理
  console.log(classTableSet);
  fillBlankOfClassTables(classTableSet);

  // reset and add event listener
  $('#day_select_extension').off('change');
  $('#day_select_extension').change(() => onSelectTableDay('#day_select_extension'));
  $('#term_select_extension').off('change');
  $('#term_select_extension').change(() => onSelectTableTerm('#term_select_extension'));
  $('#year_select_extension').off('change');
  $('#year_select_extension').change(() => onSelectTableYear('#year_select_extension'));

  function resetTables() {
    $('#onegen_extension').empty();
    $('#threegen_extension').empty();
    $('#fivegen_extension').empty();
    $('#sevengen_extension').empty();
    $('#ninegen_extension').empty();
  }

  function removeBlankOfClassTables() {
    $('#onegen_extension').removeClass('blankClass');
    $('#threegen_extension').removeClass('blankClass');
    $('#fivegen_extension').removeClass('blankClass');
    $('#sevengen_extension').removeClass('blankClass');
    $('#ninegen_extension').removeClass('blankClass');
  }

  /**
   * 空きコマをblankにする処理
   * @param {Array.boolean} classTableSet 授業が入っているか(なし→false)を表す、5要素のboolean配列
   */
  function fillBlankOfClassTables(classTableSet) {
    for (let i = 0; i < classTableSet.length; i++) {
      if (classTableSet[i] == false) {
        // まだtableが埋まってなかったら
        switch (i) {
          case 0:
            $('#onegen_extension').addClass('blankClass');
            break;
          case 1:
            $('#threegen_extension').addClass('blankClass');
            break;
          case 2:
            $('#fivegen_extension').addClass('blankClass');
            break;
          case 3:
            $('#sevengen_extension').addClass('blankClass');
            break;
          case 4:
            $('#ninegen_extension').addClass('blankClass');
            break;
        }
      }
    }
  }
}

function getCourseTimeFromDayOfWeek(times, dayOfWeeks, selectedDayOfWeekTxt) {
  return times[dayOfWeeks.indexOf(selectedDayOfWeekTxt)];
}

function renderClassTable(course, time, set) {
  // TODO: 変数名renderClassTable?
  // for-loopで回すのはやりすぎかもしれない
  const timeArray = time.split(/-/); // 時間: 1-4を[1, 4]にする
  for (const timeNum of timeArray) {
    switch (timeNum) {
      case '1':
      case '2':
        $('#onegen_extension').text(course.name);
        $('#onegen_extension').append(
          '<br><a href="' + course.url + '">この授業のページに移動する</a>',
        );
        set[0] = true;
        break;
      case '3':
      case '4':
        $('#threegen_extension').text(course.name + '\n');
        $('#threegen_extension').append(
          '<br><a href="' + course.url + '">この授業のページに移動する</a>',
        );
        set[1] = true;
        break;
      case '5':
      case '6':
        $('#fivegen_extension').text(course.name + '\n');
        $('#fivegen_extension').append(
          '<br><a href="' + course.url + '">この授業のページに移動する</a>',
        );
        set[2] = true;
        break;
      case '7':
      case '8':
        $('#sevengen_extension').text(course.name + '\n');
        $('#sevengen_extension').append(
          '<br><a href="' + course.url + '">この授業のページに移動する</a>',
        );
        set[3] = true;
        break;
      case '9':
      case '10':
        $('#ninegen_extension').text(course.name + '\n');
        $('#ninegen_extension').append(
          '<br><a href="' + course.url + '">この授業のページに移動する</a>',
        );
        set[4] = true;
        break;
    }
  }
}

async function onSelectTableDay(element) {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(data => {
      return data.courses;
    })
    .catch(reason => {
      console.log('Cannot load.', reason);
      return {};
    });
  const selectedDayOfWeekNum = $(element).val();
  const selectedTerm = $('#term_select_extension').val();
  const selectedYear = $('#year_select_extension').val();

  console.log('onSelectTableDay: ', selectedDayOfWeekNum); // 曜日

  renderTimeTable(
    courses,
    selectedTerm,
    selectedDayOfWeekNum,
    convertToDayOfWeekTxt(selectedDayOfWeekNum),
    selectedYear,
  );
}

// TODO: この3つ、同じでいいんじゃないか？
async function onSelectTableYear(element) {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(data => {
      return data.courses;
    })
    .catch(reason => {
      console.log('Cannot load.', reason);
      return {};
    });
  const selectedDayOfWeekNum = $('#day_select_extension').val();
  const selectedTerm = $('#term_select_extension').val();
  const selectedYear = $(element).val();

  console.log('onSelectTableYear: ', selectedTerm);

  renderTimeTable(
    courses,
    selectedTerm,
    selectedDayOfWeekNum,
    convertToDayOfWeekTxt(selectedDayOfWeekNum),
    selectedYear,
  );
}

async function onSelectTableTerm(element) {
  const courses = await promiseWrapper.storage.local
    .get('courses')
    .then(data => {
      return data.courses;
    })
    .catch(reason => {
      console.log('Cannot load.', reason);
      return {};
    });
  const selectedDayOfWeekNum = $('#day_select_extension').val();
  const selectedTerm = $(element).val();
  const selectedYear = $('#year_select_extension').val();

  console.log('onSelectTableTerm: ', selectedTerm);

  renderTimeTable(
    courses,
    selectedTerm,
    selectedDayOfWeekNum,
    convertToDayOfWeekTxt(selectedDayOfWeekNum),
    selectedYear,
  );
}

/**
 * 週間表示の時間割の描画。
 * TODO: 実装途中です。
 * @param {Object} courses = {}
 */
async function renderWeekClassTable(courses) {
  // TODO: renderWeekClassTable
  const weekClassTableHtmlPath = 'weekClassTable.html';
  const weekClassTableCssPath = 'weekClassTable.css';

  console.log('週間表示');
  if (utils.isUndefined($('#overlay_extension').val())) {
    $('#page').append();
    $('body').append('<div id="overlay_extension"></div>');
    $('head').append(
      await promiseWrapper.runtime.sendMessage({ item: 'loadFile', src: weekClassTableCssPath }),
    );
    $('#overlay_extension').append(
      await promiseWrapper.runtime.sendMessage({ item: 'loadFile', src: weekClassTableHtmlPath }),
    );
    $('#btnCloseWeekClassTable').on('click', () => {
      console.log('close weekClassTable.');
      $('#overlay_extension').addClass('hide');
    });
  } else {
    $('#overlay_extension').removeClass('hide');
  }
}

/**
 * 与えられた日付が前期か後期か判定したものを返します。
 * @param {Date} day 日付
 * @return {String} 前期なら前, 後期なら後を返す
 */
function getTermLetter(day) {
  const month = day.getMonth();
  return 4 <= month && month <= 9 ? '前' : '後';
}

function convertTaskDueDateTxtToDate(taskDueDateTxt, nowDate) {
  // task_due_date: Array
  //   [YYYY, MM, DD, hh, mm (, 余り)] or
  //   [明日, hh, mm (, 余り)] or [本日, hh, mm (, 余り)]
  const arr = taskDueDateTxt.replace(/[\s+,]/g, '').split(/[:年日月残]/); // TODO: arr?
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;

  if (arr[0] == '本') {
    // 本日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate();
    hour = arr[1];
    minute = arr[2];
  } else if (arr[0] == '明') {
    // 明日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate() + 1;
    hour = arr[1];
    minute = arr[2];
  } else {
    // YYYY年 MM月 DD日, hh:mm
    year = arr[0];
    month = arr[1] - 1;
    day = arr[2];
    hour = arr[3];
    minute = arr[4];
  }

  return new Date(year, month, day, hour, minute);
}

// 時間割(n-n')から時間(hh:mm～hh:mm)にするやつ
function timeToTimeTxt(time) {
  const timetableSplited = time.split(/-/);
  const timetableStart = timetableSplited[0];
  const timetableEnd = timetableSplited[1];
  const timearrayStart = [
    '8：50',
    '9：35',
    '10：30',
    '11：15',
    '13：00',
    '13：45',
    '14：40',
    '15：25',
    '16：20',
    '17：05',
  ];
  const timearrayEnd = [
    '9：35',
    '10：20',
    '11：15',
    '12：00',
    '13：45',
    '14：30',
    '15：25',
    '16：10',
    '17：05',
    '17：50',
  ];
  const timeTxt = timearrayStart[timetableStart - 1] + '～' + timearrayEnd[timetableEnd - 1];
  return timeTxt;
}

// ミリ秒から時間計算するやつ
function msToTime(duration) {
  if (duration < 0) {
    return msToTime(-duration) + ' 超過しています';
  }

  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365);

  if (days == 0) {
    if (hours == 0) {
      return minutes + '分';
    }
    return hours + '時間 ' + minutes + '分';
  }
  return days + '日 ' + hours + '時間 ' + minutes + '分';
}

function convertToDayOfWeekTxt(dayOfWeekNum) {
  return ['日', '月', '火', '水', '木', '金', '土'][dayOfWeekNum];
}

export default top;
