/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
/* global promiseWrapper */ // <- ./lib/promiseWrapper.js must be loaded

$(function onLoad() {
  // pageのロードが終わった時
  // TODO: chrome拡張機能のapiでもok?

  console.log('[moodle assistant for NITech] page: ' + location.href);

  // オプションを読み込んで対応する処理を行う
  (async () => {
    const options = await promiseWrapper.runtime.sendMessage({ item: 'loadOptions' });
    console.log('response options: ', options);
    console.log(options.backgroundColor);
    $('body').css('background-color', options.backgroundColor); // 背景色変更

    // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
    if (
      options.hideNavOnVideo === true &&
      location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php'
    ) {
      $('#page-content.blocks-pre').addClass('hidedenNavigation');
    }
  })();

  (async () => {
    const topPageUrl = /^https:\/\/cms6.ict.nitech.ac.jp\/moodle38a\/my\/(#|(index.php))?/;
    if (topPageUrl.test(location.href)) {
      // topページでの処理
      await onTopPage(location.href);
    } else if (location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/login/index.php') {
      // loginページでの処理 -> 以降を処理しない?
      console.log('login page.');
      // return;
    } else {
      // topページ以外での処理
      await onOtherPage(location.href);
    }

    // 処理終了イベント発火
    console.log('[Preprocess Finished]');
    window.dispatchEvent(new Event('extensionPreprocessFinished'));
  })();
});

function onTopPage(loc) {
  // topページでの処理

  // 読み込み待ち
  return new Promise(function (resolve, reject) {
    const reload = () => {
      const courseValue = $('.coursename');
      if (isUndefined(courseValue[0])) {
        console.log('yet');
        setTimeout(reload, 500);
      } else {
        console.log('done');
        reformTopPage(courseValue.length);
        // TODO:
        console.log('value: ', courseValue.length, courseValue);
        resolve();
      }
    };

    reload();
  });
}

async function onOtherPage(loc) {
  // topページ以外での処理

  const courses = (await promiseWrapper.storage.local.get('courses'))
    .then(data => {
      return data.courses;
    })
    .catch(reason => {
      console.log('test', reason);
      return {};
    });

  // ナビゲーション文字入れ替え
  const navigationSize = $('.depth_1 ul').first().children('li').eq(2).children('ul').children('li')
    .length;

  let navigationCount = 0;
  $('.depth_1 ul')
    .first()
    .children('li')
    .eq(2)
    .children('ul')
    .children('li')
    .each(function () {
      let okChangeCourseName = false;
      navigationCount++;
      for (const course of courses) {
        if ($(this).children('p').children('a').text() == course.short) {
          // course名の授業名への書き換え
          $(this).children('p').children('a').text(course.name);
          okChangeCourseName = true;
        }
      }
      if (okChangeCourseName === false) {
        if (navigationCount == navigationSize) {
          // トップに戻るボタン
          $(this).children('p').children('a').text('マイページに戻る');
        } else {
          $(this).remove();
        }
      }
    });

  return;
}

async function reformTopPage(courseSize) {
  // 読み込み終わったらの処理
  // todolistの作成(取得?)

  const courseNumberTxtList = $('.course-listitem .text-muted div').text().slice(1).split('|'); // 取得してきたcourseの要素達
  const courses = convertCourses(loadCourselist(), courseNumberTxtList, courseSize);
  console.log(courses);

  // ストレージに保持(local->syncで他拡張機能と共有可能?)
  // awaitする必要はない
  promiseWrapper.storage.local.set({ courses: courses });

  // nav: ページ上部にあるトップページとかマイページへのリンクがある領域
  // navバー操作
  // $('nav').prepend('<p>Hello Moodle</p>');

  // naviを左に集める＆順番最適化
  // nagi: もともとmoodleページの右側にあるコース検索・マイシラバスなどを集めた領域
  moveNaviToLeft();

  const search_course = $('[data-block="html"]').last();
  // let jyouhou_security=$("[data-block=\"html\"]").first()
  const navigator = $('[data-block="navigation"]');
  const mysyllabus = $('[data-block="mysyllabus"]');
  const private_files = $('[data-block="private_files"]');
  const calendar_upcoming = $('[data-block="calendar_upcoming"]');
  const badges = $('[data-block="badges"]');
  const calendar_month = $('[data-block="calendar_month"]');

  $('#block-region-side-post').empty();
  $('#block-region-side-pre').remove();
  $('#block-region-side-post').append(
    calendar_month,
    calendar_upcoming,
    navigator,
    search_course,
    mysyllabus,
    private_files,
    badges,
  );

  // tables.html(時間割, Todoなど)をロードして表示
  const tablesFilePath = 'tables.html';
  $('#page').append(
    await promiseWrapper.runtime.sendMessage({ item: 'loadFile', src: tablesFilePath }),
  );

  // events: moodleトップページにある「直近イベント」。moodleトップページの、eventクラスがついた部分のarray。
  // 直近イベントを見やすくする
  const events = Array.from(
    calendar_upcoming
      .children('div')
      .children('div')
      .children('div')
      .first()
      .children('div')
      .children('div'),
  );

  // TODO: 計算中って初期でこうやって管理するのやばいでしょ
  // eventを直近イベントに適応(描画).
  for (const event of events) {
    $(event).children('.date').append('');
    $(event)
      .children('.date')
      .append('<br>残り時間 ： <span class="date-left-extension">計算中</span>');
  }

  // 次の処理と同じ: let todolist = isUndefined(data_todolist.todolist) ? [] : data_todolist.todolist;
  // const todolist = (await promiseWrapper.storage.local.get('todolist')).todolist || [];
  const todolist = await reloadStorageTodo(events); // TODO: この書き方でok?(元々はここでgetしてた)
  console.log(todolist);
  const nowDate = new Date();

  const nowTerm = getCurrentTermLetter(nowDate); // 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)を指定

  // 時間割内の授業を追加(描画)
  await drawTables(courses, nowTerm, nowDate.getDay(), todolist);
  // 本当にawaitの必要があるんか？

  // 時間割外の授業を追加
  drawSpecialCourses(courses);

  // 動的に残り時間を変更
  // TODO:
  let oldmin = nowDate.getMinutes();
  setInterval(async () => {
    await updateTopPage(events, todolist, oldmin)
      .then(value => (oldmin = value))
      .catch(reason => console.error(reason));
  }, 1000);

  $('#link-to-calendar').attr('href', $('.current').eq(1).children('a').attr('href'));

  // reformTopPage: last line.
}

// TODO: async 必要？
async function updateTopPage(events, todolist, oldmin) {
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
    if (0 < taskDueDate - nowDate && taskDueDate - nowDate < 60000) {
      $($('.date-left-extension')[i]).text('1分以下');
    } else {
      $($('.date-left-extension')[i]).text(msToTime(taskDueDate - nowDate + 60000));
    }

    if (taskDueDate - nowDate < 86400000) {
      // 1日を切っている場合
      // 文字を赤くする
      $($('.date-left-extension')[i]).addClass('deadline');

      // Todoリストに追加
      addEventToTodoList(todolist, events[i], taskDueDate - nowDate);
    }
  }

  // todoを更新
  await renderTodolist(todolist);

  return newmin;
}

function changeTermOption(nowTerm) {
  if (nowTerm == '前') {
    $('#term_select_extension option').eq(0).prop('selected', true);
  } else {
    $('#term_select_extension option').eq(1).prop('selected', true);
  }
}

async function reloadStorageTodo(events) {
  // 関数名旧: filterAndSaveStorageTodo, updateにするかreloadにするか迷ったが、値を返すことでreloadとする。
  // events: 直近イベント
  // 古いtodoを新しくするというか、時間割内授業をfilterする？

  // 次の処理と同じ: let todolist = isUndefined(data_todolist.todolist) ? [] : data_todolist.todolist;
  // const todolist = (await promiseWrapper.storage.local.get('todolist')).todolist || [];
  const oldTodolist = await promiseWrapper.storage.local
    .get('todolist')
    .then(data => {
      return data.todolist;
    })
    .catch(reason => {
      // console.log(reason);
      console.log(
        '[moodle assistant for NITech] INFO: cannot get todolist. (This loading might be the first time.): ',
        reason,
      );
      return [];
    });

  console.log('reloadStorageTodo: ', oldTodolist);

  // TODO: 後半の条件がわからない→わかったら上にも書く
  // 古いやつ削除で新しく入れる
  const newTodolist = oldTodolist.filter(element => {
    return (
      /-/.test(element.time) || events.some(event => $(event).children('a').text() == element.name)
    );
  });

  await promiseWrapper.storage.local.set({ todolist: newTodolist });

  return newTodolist;
}

async function renderTodolist(todolist) {
  $('#today_todo_extension').empty();

  // TODO: 同じ処理？(drawTable内)
  for (let i = 0; i < todolist.length; i++) {
    renderTodoItem(todolist[i], i);
  }

  renderTaskDoneTxt(todolist);

  $('.todo_button_extension').click(function () {
    if ($(this).parent().parent().css('opacity') == '1') {
      $(this).parent().parent().animate({ opacity: '0.6' }, 100);
      $(this).text('未完了に戻す');
      $(this).parent().parent().children('.strike_todo_extension').wrap('<s>');
      todolist[$(this).attr('data-index_extension')].complete = true;

      chrome.storage.local.set({ todolist: todolist }, function () {}); // TODO:
    } else {
      $(this).parent().parent().animate({ opacity: '1.0' }, 100);
      $(this).text('完了する');
      $(this).parent().parent().children('s').children('.strike_todo_extension').unwrap();
      todolist[$(this).attr('data-index_extension')].complete = false;

      chrome.storage.local.set({ todolist: todolist }, function () {}); // TODO:
    }

    $('#today_todo_extension tr').first().remove();
    renderTaskDoneTxt(todolist);
  });
}

function renderTaskDoneTxt(todolist) {
  $('#today_todo_extension').append(
    todolist.some(todoItem => isTodoItemCompleted(todoItem) == true)
      ? '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>'
      : '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
  );
}

function renderTodoItem(todoItem, todoItemIndex) {
  // todolistの中身を確認して、
  if (/-/.test(todoItem.time)) {
    // 時間割の授業(n-n')のとき (つまり、timeに-があるとき)
    $('#today_todo_extension').append(
      '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">授業<button data-index_extension="' +
        todoItemIndex +
        '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
        todoItem.name +
        '<br>時間 ： ' +
        timetableToTime(todoItem.time) +
        '</span><br><a href="' +
        todoItem.url +
        '">この授業のページに移動する</a></td></tr>',
    );
  } else {
    // 直近イベントから取得した課題のとき (timeが上以外のとき)
    $('#today_todo_extension').append(
      '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">課題<button data-index_extension="' +
        todoItemIndex +
        '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
        todoItem.name +
        '<br>残り時間 ： ' /* TODO: 残り時間でtimeを用いるな仕様の非統一！！ */ +
        timetableToTime(todoItem.time) +
        '</span><br><a href="' +
        todoItem.url +
        '">この課題の提出先に移動する</a></td></tr>',
    );
  }

  if (todoItem.complete == true) {
    // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension"))
    // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent())
    $('#today_todo_extension tr')
      .last()
      .children('td')
      .children('h1')
      .children('.todo_button_extension')
      .parent()
      .parent()
      .animate({ opacity: '0.6' }, 100);
    $('#today_todo_extension tr')
      .last()
      .children('td')
      .children('h1')
      .children('.todo_button_extension')
      .text('未完了に戻す');
    $('#today_todo_extension tr')
      .last()
      .children('td')
      .children('h1')
      .children('.todo_button_extension')
      .parent()
      .parent()
      .children('.strike_todo_extension')
      .wrap('<s>');
  }
}

function updateTodolistTable(todolist) {
  if ($(this).parent().parent().css('opacity') == '1') {
    $(this).parent().parent().animate({ opacity: '0.6' }, 100);
    $(this).text('未完了に戻す');
    $(this).parent().parent().children('.strike_todo_extension').wrap('<s>');
    todolist[$(this).attr('data-index_extension')].complete = true;
  } else {
    $(this).parent().parent().animate({ opacity: '1.0' }, 100);
    $(this).text('完了する');
    $(this).parent().parent().children('s').children('.strike_todo_extension').unwrap();
    todolist[$(this).attr('data-index_extension')].complete = false;
  }

  // chrome.storage.local.set({ todolist: todolist }, function () {}); // TODO: 必要なのかとpromiseであるべきなのか

  if (isTodoItemCompleted(todolist) == true) {
    $('#today_todo_extension tr').first().remove();
    $('#today_todo_extension').prepend(
      '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>',
    );
  } else {
    $('#today_todo_extension tr').first().remove();
    $('#today_todo_extension').prepend(
      '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
    );
  }
}

function addEventToTodoList(todolist, event, remainingTime) {
  // イベントをTodoリストに追加

  // Todoリスト内を検索
  const existTodoItem = todolist.some(item => item.name === $(event).children('a').text());

  if (isUndefined(existTodoItem)) {
    // Todoリストに新規追加
    todolist.push({
      name: $(event).children('a').text(),
      time: msToTime(remainingTime),
      url: $(event).children('a').attr('href'),
      complete: false,
    });
  } else {
    // リストのアイテムを書き換え
    existTodoItem.time = msToTime(remainingTime);
    existTodoItem.url = $(event).children('a').attr('href');
  }
}

function moveNaviToLeft() {
  $('#page-header').after('<div id="side-nav-extension"></div>');

  $('#side-nav-extension').append($('.columnleft').html());
  $('.columnleft').remove();

  $('#side-nav-extension').append($('.columnright').html());
  $('.columnright').remove();
}

/**
 * courselist:
 * (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls
 * SpecialCourseはcourseShortNumberが無い
 *
 * @return {Array} courselist
 */
function loadCourselist() {
  const courselist = $('.course-listitem .coursename')
    .text()
    .replace(/\s+/g, '')
    .split('コース星付きコース名');
  courselist.shift();

  return courselist;
}

/**
 * 取得してきたcourseの要素達から変換し、coursesを生成する。
 *
 * @param {Array} courseList: 通常コース: (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls, 特殊コースはSpecialCourseはcourseShortNumberが無い。
 * @param {String} courseNumberTxtList: 授業番号表記(-あり)。 (-なしはshort付き)
 * @param {int} courseSize
 * @return {Object} courses = {term, name, dayOfWeeks, times, url, courseNumberTxt} (ただし特殊授業の場合: term, dayOfWeek = undefined)
 */
function convertCourses(courseList, courseNumberTxtList, courseSize) {
  const courses = new Array(courseSize); // result

  // 変数名がわかりづらいかもしれない
  const term = new Array(courseSize);
  const name = new Array(courseSize);
  const dayOfWeeks = new Array(courseSize);
  const times = new Array(courseSize);
  const url = new Array(courseSize);
  for (let i = 0; i < courseSize; i++) {
    const shortCourseNumberItem = String(20) + courseNumberTxtList[i].replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
    const courseContainerArray = courseList[i]
      .split(new RegExp(shortCourseNumberItem + '|期|曜|限|_cls'))
      .filter(value => {
        return value != '';
      });
    // courseContainerArray: [授業名, (前/後), (月/...), (n-n'), ((月/...), (n-n'),) ...] ※複数時間に注意

    name[i] = courseContainerArray[0];
    url[i] = $('.course-listitem .coursename').eq(i).attr('href');

    if (courseContainerArray.length == 1) {
      // 特殊なクラス(時間割じゃないコース)
      // TODO: 'none'ではなく「nilでもnullでもundefinedでもfalse」←ここらへんにしたい気がする。
      term[i] = undefined;
      times[i] = undefined;
    } else {
      // 通常クラス
      term[i] = courseContainerArray[1];

      // 週複数授業の曜日と時間(限)
      dayOfWeeks[i] = [];
      times[i] = [];
      for (let j = 2; j < courseContainerArray.length; j += 2) {
        dayOfWeeks[i].push(courseContainerArray[j]);
        times[i].push(courseContainerArray[j + 1]);
      }
    }

    courses[i] = {
      term: term[i],
      name: name[i],
      dayOfWeeks: dayOfWeeks[i],
      times: times[i],
      url: url[i],
      courseNumberTxt: courseNumberTxtList[i], // ここだけ妙に見えるかもしれないが、わかりづらくて申し訳ない。
    };
  }
  return courses;
}

function drawSpecialCourses(courses) {
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
 *
 * @param {Object} courses
 * @param {String} selectedTerm
 * @param {String} selectedDayOfWeekNum
 * @param {Array} todolist
 */
async function drawTables(courses, selectedTerm, selectedDayOfWeekNum, todolist) {
  resetTables();

  // TODO: 時間割: Courses or TimeSchedule ならびに、drawかrenderか; courseの型
  // TODO: 土日のときどうするか？

  // 時間割の選択termの表示
  changeTermOption(selectedTerm);
  // 時間割の選択曜日の表示
  $('#day_select_extension option')
    .eq(selectedDayOfWeekNum - 1)
    .prop('selected', true);

  // 時間割タイトルにtermの表示
  $('#classtable_extension_term').text(selectedTerm);
  // 時間割タイトルに曜日の表示
  const selectedDayOfWeekTxt = ['日', '月', '火', '水', '木', '金', '土'][selectedDayOfWeekNum];
  $('#classtable_extension_day').text(selectedDayOfWeekTxt);

  console.log('drawTables: term, dayOfWeek: ' + selectedTerm, selectedDayOfWeekTxt);

  const classTableSet = [false, false, false, false, false];

  if (!isUndefined(todolist)) {
    courses
      .filter(course => {
        /* 指定されたterm, 曜日であるとき */
        return course.term == selectedTerm && course.dayOfWeeks.includes(selectedDayOfWeekTxt);
      })
      .forEach(course => {
        // toddolistに加える
        // TODO: なぜ？
        // helper.htmlの中身に対して、操作している！
        console.log('drawTables: course: ', course);
        renderClassTable(course, classTableSet);

        if (!isExixstsTodo(todolist, course)) {
          // 指定の時間割であるとき(前後期、曜日)←todoは当日のほうがいい？連動したいから？
          todolist.push({
            time: course.times[0] /* TODO: 暫定, 「todolist.time」は期限！ */,
            name: course.name,
            url: course.url,
            complete: false,
          });
        }
      });

    // TODO: 長い(上と統合できそう)
    // todoリストにあるけど今日の授業にない昨日の授業を消去?
    // if (!isUndefined(todolist)) {
    const newTodolist = todolist.filter(function (element) {
      return (
        !/-/.test(element.time) ||
        courses.some(course => {
          return (
            course.term == selectedTerm &&
            course.dayOfWeeks.includes(selectedDayOfWeekNum) &&
            course.name == element.name
          );
        })
      );
    });

    // TODO: これでいいかな↓
    await promiseWrapper.storage.local.set({ todolist: newTodolist });
    // todoを追加

    // TODO: now working 2回呼ばれてそう
    // for (let i = 0; i < todolist.length; i++) {
    //   // 各itemごとにhelper.htmlに対して操作をする
    //   // TODO: now working
    //   console.log('todolist: ', todolist);
    //   renderTodoItem(todolist[i], i);
    // }

    // reset and add event listener
    $('#day_select_extension').off('change');
    $('#day_select_extension').change(() =>
      updateTablesSelect.call($('#day_select_extension'), courses, newTodolist),
    );
    $('#term_select_extension').off('change');
    $('#term_select_extension').change(() =>
      updateTablesSelect_.call($('#term_select_extension'), courses, newTodolist),
    );
    $('.todo_button_extension').off('click');
    $('.todo_button_extension').click(() =>
      updateTodolistTable.call($('.todo_button_extension'), newTodolist),
    );
  }

  // 空きコマ埋め処理
  removeBlankClass();
  console.log(classTableSet);
  fillBlankOfClassTable(classTableSet);

  function resetTables() {
    // TODO: emptyだとblankClassが消えなかったため、removeを使ってみると大丈夫。なぜ？
    $('#onegen_extension').empty();
    $('#threegen_extension').empty();
    $('#fivegen_extension').empty();
    $('#sevengen_extension').empty();
    $('#ninegen_extension').empty();
  }

  function removeBlankClass() {
    // TODO: emptyだとblankClassが消えなかったため、removeを使ってみると大丈夫。なぜ？
    $('#onegen_extension').removeClass('blankClass');
    $('#threegen_extension').removeClass('blankClass');
    $('#fivegen_extension').removeClass('blankClass');
    $('#sevengen_extension').removeClass('blankClass');
    $('#ninegen_extension').removeClass('blankClass');
  }
}

// TODO: 1-2だけじゃないやつなどの対応。動的にするべき！
function renderClassTable(course, set) {
  switch (course.times[0] /* TODO: 暫定 */) {
    // TODO: これが時間割の根本部分！
    case '1-2':
      $('#onegen_extension').text(course.name);
      $('#onegen_extension').append(
        '<br><a href="' + course.url + '">この授業のページに移動する</a>',
      );
      set[0] = true;
      break;
    case '3-4':
      $('#threegen_extension').text(course.name + '\n');
      $('#threegen_extension').append(
        '<br><a href="' + course.url + '">この授業のページに移動する</a>',
      );
      set[1] = true;
      break;
    case '5-6':
      $('#fivegen_extension').text(course.name + '\n');
      $('#fivegen_extension').append(
        '<br><a href="' + course.url + '">この授業のページに移動する</a>',
      );
      set[2] = true;
      break;
    case '7-8':
      $('#sevengen_extension').text(course.name + '\n');
      $('#sevengen_extension').append(
        '<br><a href="' + course.url + '">この授業のページに移動する</a>',
      );
      set[3] = true;
      break;
    case '9-10':
      $('#ninegen_extension').text(course.name + '\n');
      $('#ninegen_extension').append(
        '<br><a href="' + course.url + '">この授業のページに移動する</a>',
      );
      set[4] = true;
      break;
  }
}

// TODO:
function isTodoItemCompleted(todolist) {
  let isCompleted = true;
  for (let i = 0; i < todolist.length; i++) {
    if (todolist[i].complete == false) {
      // todoItemが未完了のとき
      isCompleted = false;
      break;
    }
  }
  return isCompleted;
}

// TODO:
function isExixstsTodo(todolist, course) {
  let already_exixsts_todo = false;

  for (let j = 0; j < todolist.length; j++) {
    if (todolist[j].name == course.name) {
      // TODO: todolistに授業がすでに存在するとき: これって書き込み段階でされるべき処理では？
      already_exixsts_todo = true;
    }
  }
  return already_exixsts_todo;
}

// TODO: this! 関数名
function updateTablesSelect(courses, todolist) {
  const selectedDayOfWeek = $(this).val();
  const selectedTerm = $('#term_select_extension').val();

  console.log(selectedDayOfWeek); // 曜日
  if (selectedDayOfWeek == 6) {
    // 週間の選択が、一覧の場合の処理
    // 未実装
    renderWeekClassTable(courses);

    console.log('週間表示は未実装です。');
  }

  // TODO: 時間割を表示している↓？
  drawTables(courses, selectedTerm, $(this).val(), todolist); // TODO: 引数にtodolistが必要なのか?
  $('.extension_delete').empty();
}

// TODO: this! 関数名
function updateTablesSelect_(courses, todolist) {
  const selectedDayOfWeek = $('#day_select_extension').val();
  const selectedTerm = $(this).val();

  drawTables(courses, selectedTerm, selectedDayOfWeek, todolist); // TODO: どういう処理なのか, 引数にtodolistが必要なのか?
  $('.extension_delete').empty();
}

/**
 * 空きコマをblankにする処理
 * @param {Array.boolean} classTableSet 授業が入っているか(なし→false)を表す、5要素のboolean配列
 */
function fillBlankOfClassTable(classTableSet) {
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

/**
 * 一週間表示の時間割の描画。
 * TODO: 未実装です。
 * @param {Object} courses
 */
function renderWeekClassTable(courses) {
  // console.log('一週間表示');
  // $('body').append('<div id="overlay_extension"></div>');
  // $('head').append(
  //   '<style>#overlay_extension::-webkit-scrollbar{width: 10px;}#overlay_extension::-webkit-scrollbar-track{background: #fff;border: none;border-radius: 10px;box-shadow: inset 0 0 2px #777;}#overlay_extension::-webkit-scrollbar-thumb{background: #ccc;border-radius: 10px;box-shadow: none;}</style>',
  // );
  // $('#overlay_extension').append(
  //   '<table style="border-collapse: collapse" id="classtable_extension_overlay"><tr><td style="height:90px">1限<br>8：50～9：35</td><td rowspan="2" id="onegen_extension_overlay"></td></tr><tr><td style="height:90px">2限<br>9：35～10：20</td></tr><tr><td style="height:20px">休憩<br>10：20～10：30</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">3限<br>10：30～11：15</td><td rowspan="2" id="threegen_extension_overlay"></td></tr><tr><td style="height:90px">4限<br>11：15～12：00</td></tr><tr><td style="height:120px">昼休み<br>12：00～13：00</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">5限<br>13：00～13：45</td><td rowspan="2" id="fivegen_extension_overlay"></td></tr><tr><td style="height:90px">6限<br>13：45～14：30</td></tr><tr><td style="height:20px">休憩<br>14：30～14：40</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">7限<br>14：40～15：25</td><td rowspan="2" id="sevengen_extension_overlay"></td></tr><tr><td style="height:90px">8限<br>15：25～16：10</td></tr><tr><td style="height:20px">休憩<br>16：10～60：20</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">9限<br>16：20～17：05</td><td rowspan="2" id="ninegen_extension_overlay"></td></tr><tr><td style="height:90px">10限<br>17：05～17：50</td></tr></table>',
  // );
}

/**
 * 与えられた日付が前期か後期か判定したものを返します。
 * @param {Date} day 日付
 * @return {String} 前期なら前, 後期なら後を返す
 */
function getCurrentTermLetter(day) {
  const month = day.getMonth();
  return 4 <= month && month <= 9 ? '前' : '後';
}

function convertTaskDueDateTxtToDate(taskDueDateTxt, nowDate) {
  // task_due_date: Array
  //   [YYYY, MM, DD, hh, mm (, 余り)] or
  //   [明日, hh, mm (, 余り)] or [本日, hh, mm (, 余り)]
  const arr = taskDueDateTxt.replace(/[\s+,]/g, '').split(/[:年日月残]/);
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

// TODO: ここを書き換えれば issue#14 におおよそ対応できる?
// 時間割(n-n')から時間(hh:mm～hh:mm)にするやつ
function timetableToTime(timetable) {
  const timetableSplited = timetable.split(/-/);
  const timetable_start = timetableSplited[0];
  const timetable_end = timetableSplited[1];
  const timearray_start = [
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
  const timearray_end = [
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
  const time = timearray_start[timetable_start - 1] + '～' + timearray_end[timetable_end - 1];
  return time;
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

function isUndefined(value) {
  return typeof value === 'undefined';
}
