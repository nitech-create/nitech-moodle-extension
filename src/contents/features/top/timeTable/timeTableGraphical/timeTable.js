import $ from 'jQuery';
import promiseWrapper from 'Lib/promiseWrapper.js';
import { isUndefined, isNullOrUndefined } from 'Lib/utils.js';
import { getCourses } from './courses.js';

export async function drawTimeTableGraphical() {
  console.log('graphical drawTimeTableGraphical');

  // const nowDate = new Date();
  // const nowDayOfWeekTxt = convertToDayOfWeekTxt(nowDate.getDay());
  // const nowTerm = getTermLetter(nowDate);
  // const shortYear = String(getFiscalYear(nowDate)).substring(2);

  const defaultOfTimeTableDate = getDefaultsOfTimeTableDate();

  const courses = await getCourses();
  console.log('courses: ', courses);

  // tables.html(時間割, Todoなど)をロードして枠を描画
  // const tablesHtmlFilePath = 'tables.html';
  const tablesHtml = getTablesHtml();
  // console.log('tablesFile: ', tablesHtml);
  const rootElement = $('#extension-main-area');
  rootElement.append(tablesHtml);
  // $('#page').append(tablesHtml);

  // 時間割内の授業を描画
  renderTimeTable(courses, ...defaultOfTimeTableDate);

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

/**
 * 年度にあたる数字を返す。
 * 例: 2022年4月～12月 & 2023年1月～3月 -> 2022
 * @param {Date} nowDate
 * @return {Number} 年度
 */
function getFiscalYear(nowDate) {
  // 年度で指定できるようにするところ。
  const month = nowDate.getMonth() + 1; // Monthは0-index
  if (1 <= month && month <= 3) {
    return Number(nowDate.getFullYear() - 1);
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
 *  デフォルト日付設定, 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)としてget
 * @return {Array} 現在の日付に基づく初期値
 */
function getDefaultsOfTimeTableDate() {
  const nowDate = new Date();
  // デフォルト日付設定, 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)としてget
  const selectedDayOfWeekNum = nowDate.getDay();
  const nowDayOfWeekTxt = convertToDayOfWeekTxt(selectedDayOfWeekNum);
  const nowTerm = getTermLetter(nowDate);
  const shortYear = String(getFiscalYear(nowDate)).substring(2);

  return [nowTerm, selectedDayOfWeekNum, nowDayOfWeekTxt, shortYear];
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
    'renderTimeTable?: term, shortYear, dayOfWeekNum, dayOfWeekTxt: ',
    selectedTerm,
    shortYear,
    selectedDayOfWeekNum,
    selectedDayOfWeekTxt,
  );

  // null or undefinedのときに、defaultを使用する
  const defaultOfTimeTableDate = getDefaultsOfTimeTableDate();
  if (isNullOrUndefined(selectedTerm)) {
    selectedTerm = defaultOfTimeTableDate[0];
  }
  if (isNullOrUndefined(selectedDayOfWeekNum)) {
    selectedDayOfWeekNum = defaultOfTimeTableDate[1];
  }
  if (isNullOrUndefined(selectedDayOfWeekTxt)) {
    selectedDayOfWeekTxt = defaultOfTimeTableDate[2];
  }
  if (isNullOrUndefined(shortYear)) {
    shortYear = defaultOfTimeTableDate[3];
  }

  console.log(
    'renderTimeTable: term, shortYear, dayOfWeekNum, dayOfWeekTxt: ',
    selectedTerm,
    shortYear,
    selectedDayOfWeekNum,
    selectedDayOfWeekTxt,
  );

  resetTables(); // 一度表示を消さないと、上書きするだけになって残る

  // 時間割の選択年の表示
  $('#year_select_extension').val(shortYear).prop('selected', true);
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
        getClassTimeFromDayOfWeek(course.times, course.dayOfWeeks, selectedDayOfWeekTxt),
        classTableSet,
      );
    }
  }

  // TODO: 空きコマ処理をif文で分岐するほうがきれい
  // 空きコマ埋め処理
  console.log('classTableSet: ', classTableSet);
  fillBlankOfClassTables(classTableSet);

  // reset and add event listener
  $('#day_select_extension').off('change');
  $('#day_select_extension').on('change', () => onSelectTableDate());
  $('#term_select_extension').off('change');
  $('#term_select_extension').on('change', () => onSelectTableDate());
  $('#year_select_extension').off('change');
  $('#year_select_extension').on('change', () => onSelectTableDate());

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

function getClassTimeFromDayOfWeek(times, dayOfWeeks, selectedDayOfWeekTxt) {
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
        renderClassTableItem('#onegen_extension', 1, course);
        set[0] = true;
        break;
      case '3':
      case '4':
        renderClassTableItem('#threegen_extension', 3, course);
        set[1] = true;
        break;
      case '5':
      case '6':
        renderClassTableItem('#fivegen_extension', 5, course);
        set[2] = true;
        break;
      case '7':
      case '8':
        renderClassTableItem('#sevengen_extension', 7, course);
        set[3] = true;
        break;
      case '9':
      case '10':
        renderClassTableItem('#ninegen_extension', 9, course);
        set[4] = true;
        break;
    }
  }
}

function renderClassTableItem(element, classTime, course) {
  $(element).text(course.name);
  $(element).append('<br><a href="' + course.url + '">この授業のページに移動する</a>');
  $(element).append(
    '<br>' +
      '<input type="checkbox" id="extension_checkbox_complete_' +
      classTime +
      '" value="' +
      classTime +
      '" class="extension_checkbox_complete" name="完了"><label for="extension_checkbox_complete_' +
      classTime +
      '">完了</label>',
  );
  $('#extension_checkbox_complete_' + classTime).on('change', () =>
    onCheckboxComplete(course.courseNumberTxt, classTime),
  );
  $('#extension_checkbox_complete_' + classTime).prop('checked', course.isCompleted);
}

async function onCheckboxComplete(courseNumberTxt, classTime) {
  $('#extension_checkbox_complete_' + classTime);
  console.log('onCheckboxComplete: ', courseNumberTxt, classTime);

  const courses = (await promiseWrapper.storage.local.get('courses')).courses;
  if (Array.isArray(courses)) {
    const course = courses.find(course => course.courseNumberTxt == courseNumberTxt);

    course.isCompleted = $('#extension_checkbox_complete_' + classTime).prop('checked'); // checkboxのresultを得る
    course.completeDateTime = course.isCompleted ? Date.now() : -1;

    promiseWrapper.storage.local.set({ courses: courses }); // save to storage

    console.log('onCheckboxComplete: ', course, courses);
  }
}

async function onSelectTableDate() {
  const courses = (await promiseWrapper.storage.local.get('courses')).courses;

  const selectedDayOfWeekNum = $('#day_select_extension').val();
  const selectedTerm = $('#term_select_extension').val();
  const selectedYear = $('#year_select_extension').val();

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
 * TODO: 未実装です。
 * @param {Object} courses = {}
 */
async function renderWeekClassTable(courses) {
  // TODO: renderWeekClassTable
  // const weekClassTableHtmlPath = 'weekClassTable.html';
  // const weekClassTableCssPath = 'weekClassTable.css';

  console.log('週間表示');
  if (isUndefined($('#overlay_extension').val())) {
    $('#page').append();
    $('body').append('<div id="overlay_extension"></div>');
    $('head').append(getWeekClassTableCss());
    $('#overlay_extension').append(getWeekClassTableHtml());

    addWeekOfDayRowToTable(courses); // 週間表示

    $('#btnCloseWeekClassTable').on('click', () => {
      console.log('close weekClassTable.');
      $('#overlay_extension').addClass('hide');
    });
  } else {
    $('#overlay_extension').removeClass('hide');
  }
}

function renderClassTableWeek(course, time, dayOfWeek) {
  // for-loopで回すのはやりすぎかもしれない
  if (!/[1-9]-[1-9]/.test(time)) {
    return;
  }
  const timeArray = time.split(/-/); // 時間: 1-4を[1, 4]にする
  for (const timeNum of timeArray) {
    switch (timeNum) {
      case '1':
      case '2':
        renderClassTableItem('#extension_timetable_week_' + dayOfWeek + '_1', 1, course);
        // set[0] = true;
        break;
      case '3':
      case '4':
        renderClassTableItem('#extension_timetable_week_' + dayOfWeek + '_3', 3, course);
        // set[1] = true;
        break;
      case '5':
      case '6':
        renderClassTableItem('#extension_timetable_week_' + dayOfWeek + '_5', 5, course);
        // set[2] = true;
        break;
      case '7':
      case '8':
        renderClassTableItem('#extension_timetable_week_' + dayOfWeek + '_7', 7, course);
        // set[3] = true;
        break;
      case '9':
      case '10':
        renderClassTableItem('#extension_timetable_week_' + dayOfWeek + '_9', 9, course);
        // set[4] = true;
        break;
    }
  }
}

function addWeekOfDayRowToTable(courses) {
  // 表への参照を取得
  const tableRef = document.getElementById('classtable_extension_overlay');

  // 1行目を取得
  let rowTest = tableRef.rows[1];

  for (let i = 1; i < 15; i++) {
    rowTest = tableRef.rows[i]; // i行目を取得
    if (i % 3 == 2) {
      // 授業のコマ後半(無視)
      continue;
    } else if (i % 3 == 1) {
      // 授業のコマ前半
      for (let j = 1; j < 6; j++) {
        // その行の j の位置にセルを挿入
        const newCell = rowTest.insertCell(j);
        newCell.rowSpan = 2; // セル結合
        newCell.appendChild(document.createTextNode('-')); // そのセルにテキストノードを追加
        console.log(
          'extension_timetable_week_' + convertToDayOfWeekTxt(j) + '_' + (i - (i - (i % 3)) / 3),
        );
        newCell.id =
          'extension_timetable_week_' + convertToDayOfWeekTxt(j) + '_' + (i - (i - (i % 3)) / 3);
      }
    } else {
      // 休憩のコマ
    }
  }

  for (const course of courses) {
    if (
      !isUndefined(course.term) &&
      !isUndefined(course.dayOfWeeks) /* term, dayOfWeeksがundefのときはspecialCourses */ &&
      course.term == document.getElementById('term_select_extension').value &&
      course.shortYear == document.getElementById('year_select_extension').value
    ) {
      for (const dayOfWeek of course.dayOfWeeks) {
        /* courseが指定されたterm, 曜日であるとき */
        console.log('drawTables: course: ', course);
        // 時間割のコマ(class)を描画！
        renderClassTableWeek(
          course,
          getClassTimeFromDayOfWeek(course.times, course.dayOfWeeks, dayOfWeek),
          dayOfWeek,
        );
      }
    }
  }
}

function getWeekClassTableHtml() {
  return `<button id="btnCloseWeekClassTable">close</button>  <table id="classtable_extension_overlay">   <tr>     <th></th>     <th>月曜</th>     <th>火曜</th>     <th>水曜</th>     <th>木曜</th>     <th>金曜</th>   </tr>   <tr>     <td style="height: 90px">1限<br />8：50～9：35</td>     <td rowspan="2" id="onegen_extension_overlay"></td>   </tr>   <tr>     <td style="height: 90px">2限<br />9：35～10：20</td>   </tr>   <tr>     <td style="height: 20px">休憩<br />10：20～10：30</td>     <td class="tenminyasumi"></td>   </tr>   <tr>     <td style="height: 90px">3限<br />10：30～11：15</td>     <td rowspan="2" id="threegen_extension_overlay"></td>   </tr>   <tr>     <td style="height: 90px">4限<br />11：15～12：00</td>   </tr>   <tr>     <td style="height: 120px">昼休み<br />12：00～13：00</td>     <td class="tenminyasumi"></td>   </tr>   <tr>     <td style="height: 90px">5限<br />13：00～13：45</td>     <td rowspan="2" id="fivegen_extension_overlay"></td>   </tr>   <tr>     <td style="height: 90px">6限<br />13：45～14：30</td>   </tr>   <tr>     <td style="height: 20px">休憩<br />14：30～14：40</td>     <td class="tenminyasumi"></td>   </tr>   <tr>     <td style="height: 90px">7限<br />14：40～15：25</td>     <td rowspan="2" id="sevengen_extension_overlay"></td>   </tr>   <tr>     <td style="height: 90px">8限<br />15：25～16：10</td>   </tr>   <tr>     <td style="height: 20px">休憩<br />16：10～60：20</td>     <td class="tenminyasumi"></td>   </tr>   <tr>     <td style="height: 90px">9限<br />16：20～17：05</td>     <td rowspan="2" id="ninegen_extension_overlay"></td>   </tr>   <tr>     <td style="height: 90px">10限<br />17：05～17：50</td>   </tr> </table>`;
}

function getWeekClassTableCss() {
  // weekClassTable.cssの改行を削除してここに貼る。ブラウザのURL欄にコピペすると良い。
  return `#overlay_extension::-webkit-scrollbar {   width: 10px; }  #overlay_extension::-webkit-scrollbar-track {   background: #fff;   border: none;   border-radius: 10px;   box-shadow: inset 0 0 2px #777; }  #overlay_extension::-webkit-scrollbar-thumb {   background: #ccc;   border-radius: 10px;   box-shadow: none; }  #classtable_extension_overlay {   border-collapse: collapse; }  .hide {   display: none; }`;
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

function getTablesHtml() {
  // tables.htmlの改行を削除してここに貼る。ブラウザのURL欄にコピペすると良い。
  // CSSはStylesに記載
  return '<div   id="main_extension"   style="     /* position: absolute;     top: 100px;     left: 400px;     width: calc(100vw - 450px); */     background-color: #f8f9fa;     border-radius: 3px;   " >   <div id="content_extension" style="padding: 16px">     <h1 style="font-size: 18.75px; font-weight: medium">時間割・授業</h1>     <div style="display: flex; margin: 50px 50px">       <div style="background-color: #e9ecef; border-radius: 3px; padding: 16px">         <h1 style="font-size: 18.75px; font-weight: medium">           <span class="extension_delete">今日(</span           ><span id="classtable_extension_term">Null</span>期<span id="classtable_extension_day"             >Null</span           >曜日<span class="extension_delete">)</span>の時間割           <select name="term_select_extension" id="term_select_extension">             <option value="前">前期</option>             <option value="後">後期</option>           </select>           <select name="year_select_extension" id="year_select_extension">             <option value="20">2020</option>             <option value="21">2021</option>             <option value="22">2022</option>           </select>           <select name="day_select_extension" id="day_select_extension">             <option value="0">日曜日</option>             <option value="1">月曜日</option>             <option value="2">火曜日</option>             <option value="3">水曜日</option>             <option value="4">木曜日</option>             <option value="5">金曜日</option>             <option value="6">土曜日</option>             <option value="7">週間表示</option>           </select>         </h1>         <table style="border-collapse: collapse" id="classtable_extension">           <tr>             <td style="height: 90px">1限<br />8：50～9：35</td>             <td rowspan="2" id="onegen_extension"></td>           </tr>           <tr>             <td style="height: 90px">2限<br />9：35～10：20</td>           </tr>           <tr>             <td style="height: 20px">休憩<br />10：20～10：30</td>             <td class="tenminyasumi"></td>           </tr>           <tr>             <td style="height: 90px">3限<br />10：30～11：15</td>             <td rowspan="2" id="threegen_extension"></td>           </tr>           <tr>             <td style="height: 90px">4限<br />11：15～12：00</td>           </tr>           <tr>             <td style="height: 120px">昼休み<br />12：00～13：00</td>             <td class="tenminyasumi"></td>           </tr>           <tr>             <td style="height: 90px">5限<br />13：00～13：45</td>             <td rowspan="2" id="fivegen_extension"></td>           </tr>           <tr>             <td style="height: 90px">6限<br />13：45～14：30</td>           </tr>           <tr>             <td style="height: 20px">休憩<br />14：30～14：40</td>             <td class="tenminyasumi"></td>           </tr>           <tr>             <td style="height: 90px">7限<br />14：40～15：25</td>             <td rowspan="2" id="sevengen_extension"></td>           </tr>           <tr>             <td style="height: 90px">8限<br />15：25～16：10</td>           </tr>           <tr>             <td style="height: 20px">休憩<br />16：10～60：20</td>             <td class="tenminyasumi"></td>           </tr>           <tr>             <td style="height: 90px">9限<br />16：20～17：05</td>             <td rowspan="2" id="ninegen_extension"></td>           </tr>           <tr>             <td style="height: 90px">10限<br />17：05～17：50</td>           </tr>         </table>       </div>       <div style="background-color: #e9ecef; border-radius: 3px; padding: 16px">         <h1 style="font-size: 18.75px; font-weight: medium">今日やるべきこと</h1>         <table id="today_todo_extension">           <tr>             <td id="task_done_extension">               今日のやるべきことがまだ残っています！<br />今日もがんばりましょう...！             </td>           </tr>         </table>       </div>        <div style="background-color: #e9ecef; border-radius: 3px; padding: 16px">         <h1 style="font-size: 18.75px; font-weight: medium">時間割外のクラス</h1>         <table id="special_class_extension">           <tr>             <td>登録されていないようです。</td>           </tr>         </table>       </div>     </div>   </div> </div>';
}
