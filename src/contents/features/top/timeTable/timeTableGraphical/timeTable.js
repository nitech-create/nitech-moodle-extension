import $ from 'jQuery';
import promiseWrapper from 'Lib/promiseWrapper.js';
import { isUndefined, loadFile } from 'Lib/utils.js';
import { getCourses } from './courses.js';

export async function drawTimeTableGraphical() {
  console.log('graphical drawTimeTableGraphical');

  const nowDate = new Date();
  // デフォルト日付設定, 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)としてget
  const nowDayOfWeekTxt = convertToDayOfWeekTxt(nowDate.getDay());
  const nowTerm = getTermLetter(nowDate);
  const shortYear = String(getFiscalYear(nowDate)).substring(2);

  const courses = getCourses();
  console.log('courses: ', courses);

  // tables.html(時間割, Todoなど)をロードして枠を描画
  const tablesFilePath = 'tables.html';
  // const tablesFile = loadFile(tablesFilePath);
  // console.log('tablesFile: ', tablesFile);
  // $('#page').append(tablesFile);

  loadFile(tablesFilePath, (tablesFile, url) => {
    $('#page').append(tablesFile);
    console.log('tablesFile: ', tablesFile);
  });

  // 時間割内の授業を描画
  // TODO: 本当にawaitの必要があるか？
  renderTimeTable(courses, nowTerm, nowDate.getDay(), nowDayOfWeekTxt, shortYear);

  renderSpecialCourses(courses);
}

/**
 * 与えられた日付が前期か後期か判定したものを返します。
 * @param {Date} day 日付
 * @return {String} 前期なら前, 後期なら後を返す
 */
function getTermLetter(day) {
  const month = day.getMonth() + 1; // Monthは0-index
  return 4 <= month && month <= 9 ? '前' : '後';
}

function getFiscalYear(nowDate) {
  // 年度で指定できるようにするところ。
  if (1 <= nowDate.getMonth() + 1 <= 3) {
    return Number(nowDate.getFullYear()) - 1;
  }
  return Number(nowDate.getFullYear());
}

function changeTermOption(nowTerm) {
  if (nowTerm == '前') {
    $('#term_select_extension option').eq(0).prop('selected', true);
  } else {
    $('#term_select_extension option').eq(1).prop('selected', true);
  }
}

function renderSpecialCourses(courses) {
  $('#special_class_extension').empty();
  const specialCourses = courses.filter(course => isUndefined(course.times));
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
    'drawTables: term, shortYear, dayOfWeekNum, dayOfWeekTxt: ',
    selectedTerm,
    shortYear,
    selectedDayOfWeekNum,
    selectedDayOfWeekTxt,
  );

  resetTables();

  // 時間割の選択年の表示
  $('#year_select_extension option').val(shortYear).prop('selected', true);
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
      !isUndefined(course.term) &&
      !isUndefined(course.dayOfWeeks) /* term, dayOfWeeksがundefのときはspecialCourses */ &&
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
  if (isUndefined($('#overlay_extension').val())) {
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

function convertToDayOfWeekTxt(dayOfWeekNum) {
  return ['日', '月', '火', '水', '木', '金', '土'][dayOfWeekNum];
}
