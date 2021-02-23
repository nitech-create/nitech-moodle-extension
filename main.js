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
        if ($(this).children('p').children('a').text() == course.shortCourseNumberTxt) {
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

  // TODO: navバー
  // nav: ページ上部にあるトップページとかマイページへのリンクがある領域
  // navバー操作
  // $('nav').prepend('<p>Hello Moodle</p>');

  // naviを左に集める＆順番最適化
  // nagi: もともとmoodleページの右側にあるコース検索・マイシラバスなどを集めた領域
  // TODO: ここなにをしているのか, 多分左に集めるやつ？, ハードコーディング？(関数内)
  const blocks = loadBlocks();
  reformBlocks(blocks);

  // tables.html(時間割, Todoなど)をロードして表示
  const tablesFilePath = 'tables.html';
  $('#page').append(
    await promiseWrapper.runtime.sendMessage({ item: 'loadFile', src: tablesFilePath }),
  );

  // events: moodleトップページにある「直近イベント」のarray
  const events = Array.from(
    blocks.calendarUpcomingEventBlock
      .children('div')
      .children('div')
      .children('div')
      .first()
      .children('div')
      .children('div'),
  );

  // TODO: 計算中って初期でこうやって管理するのやばいのでは…？
  // eventを直近イベントに適応(描画).
  for (const event of events) {
    $(event).children('.date').append('');
    $(event)
      .children('.date')
      .append('<br>残り時間 ： <span class="date-left-extension">計算中</span>');
  }

  const nowDate = new Date();
  const nowDayOfWeekTxt = convertToDayOfWeekTxt(nowDate.getDay());
  const nowTerm = getTermLetter(nowDate); // 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)を指定

  // load courses
  const courseNumberTxtList = $('.course-listitem .text-muted div').text().slice(1).split('|'); // 取得してきたcourseの要素達
  const courses = convertToCourses(loadCourseList(), courseNumberTxtList, courseSize);
  console.log('reformTopPage: ', courses);
  // ストレージに保持(local->syncで他拡張機能と共有可能?)
  // awaitする必要はない
  promiseWrapper.storage.local.set({ courses: courses });

  // 次の処理と同じ: let todolist = isUndefined(data_todolist.todolist) ? [] : data_todolist.todolist;
  // const todolist = (await promiseWrapper.storage.local.get('todolist')).todolist || [];
  const todolist = await reloadStorageTodo(events); // TODO: この書き方でok?(元々はここでgetしてた)
  console.log('reformTopPage todolist: ', todolist);

  // TODO: nowWorking
  console.log('reformTopPage dayOfWeek dayOfWeekTxt: ', nowDate.getDay(), nowDayOfWeekTxt);

  // 時間割内の授業を追加(描画)
  // TODO: 本当にawaitの必要があるか？
  await drawTables(courses, nowTerm, nowDate.getDay(), nowDayOfWeekTxt);
  await updateTodolistFromCourses(todolist, courses, nowTerm, nowDate.getDay(), nowDayOfWeekTxt);

  // 時間割外の授業を追加
  drawSpecialCourses(courses);

  // 動的に残り時間を変更
  let oldmin = nowDate.getMinutes();
  setInterval(async () => {
    await updateTopPage(events, todolist, oldmin)
      .then(value => (oldmin = value))
      .catch(reason => console.error(reason));
  }, 1000);

  // カレンダーへのリンクを追加
  $('#link-to-calendar').attr('href', $('.current').eq(1).children('a').attr('href'));
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

function reformBlocks(blocks) {
  // TODO: 未リファクタリング

  $('#page-header').after('<div id="side-nav-extension"></div>');

  $('#side-nav-extension').append($('.columnleft').html());
  $('.columnleft').remove();

  $('#side-nav-extension').append($('.columnright').html());
  $('.columnright').remove();

  $('#block-region-side-post').empty();
  $('#block-region-side-pre').remove();
  $('#block-region-side-post').append(
    blocks.monthCalendarBlock,
    blocks.calendarUpcomingEventBlock,
    blocks.navigatorBlock,
    blocks.searchCourseBlock,
    blocks.mySyllabusBlock,
    blocks.privateFilesBlock,
    blocks.badgesBlock,
    blocks.jyouhouSecurityBlock,
  );

  return calendarUpcomingEventBlock;
}

// TODO: async 必要？
async function updateTopPage(events, todolist, oldmin) {
  console.log('updateTopPage');
  const doUpdate = await promiseWrapper.storage.local
    .get('doUpdate')
    .then(data => {
      console.log('doUpdate: ', data.doUpdate);
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

      // Todoリストに追加および更新
      updateTodoListFromEvent(todolist, events[i], remainingTime);
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
  const newTodolist = oldTodolist.filter(todolistItem => {
    return (
      /-/.test(todolistItem.deadline) ||
      events.some(event => $(event).children('a').text() == todolistItem.name)
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

  $('#today_todo_extension').click(function () {
    if ($('#today_todo_extension').parent().parent().css('opacity') == '1') {
      $('#today_todo_extension').parent().parent().animate({ opacity: '0.6' }, 100);
      $('#today_todo_extension').text('未完了に戻す');
      $('#today_todo_extension').parent().parent().children('.strike_todo_extension').wrap('<s>');
      todolist[$('#today_todo_extension').attr('data-index_extension')].complete = true;

      chrome.storage.local.set({ todolist: todolist }, function () {}); // TODO:
    } else {
      $('#today_todo_extension').parent().parent().animate({ opacity: '1.0' }, 100);
      $('#today_todo_extension').text('完了する');
      $('#today_todo_extension')
        .parent()
        .parent()
        .children('s')
        .children('.strike_todo_extension')
        .unwrap();
      todolist[$('#today_todo_extension').attr('data-index_extension')].complete = false;

      chrome.storage.local.set({ todolist: todolist }, function () {}); // TODO:
    }

    $('#today_todo_extension tr').first().remove();
    renderTaskDoneTxt(todolist);
  });
}

function renderTaskDoneTxt(todolist) {
  console.log('renderTaskDoneTxt: ', todolist);

  $('#today_todo_extension').append(
    todolist.some(todoItem => isTodolistCompleted(todoItem) == true)
      ? '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>'
      : '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
  );
}

function renderTodoItem(todoItem, todoItemIndex) {
  // todolistの中身を確認して、
  if (/-/.test(todoItem.deadline)) {
    // 時間割の授業(n-n')のとき (つまり、timeに-があるとき)
    $('#today_todo_extension').append(
      '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">授業<button data-index_extension="' +
        todoItemIndex +
        '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
        todoItem.name +
        '<br>時間 ： ' +
        timetableToTime(todoItem.deadline) +
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
        '<br>残り時間 ： ' /* TODO: 残り時間でtimeを用いるべきなのか？ */ +
        timetableToTime(todoItem.deadline) +
        '</span><br><a href="' +
        todoItem.url +
        '">この課題の提出先に移動する</a></td></tr>',
    );
  }

  if (todoItem.complete == true) {
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

  if (isTodolistCompleted(todolist) == true) {
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

async function updateTodolistFromCourses(
  todolist,
  courses,
  selectedTerm,
  selectedDayOfWeekNum,
  selectedDayOfWeekTxt,
) {
  if (isUndefined(todolist)) {
    console.log('updateTodolistFromCourses: todolist is undef. (This might be the first launcher)');
    todolist = [];
  }

  // todolist: 時間割と、直近イベント(課題)
  for (const course of courses) {
    console.log('course: ', course);

    // toddolistに加える
    // TODO: なぜ？
    if (
      course.term == selectedTerm &&
      course.dayOfWeeks.includes(selectedDayOfWeekTxt) &&
      !isCourseExixstsInTodo(todolist, course)
    ) {
      /* 指定されたterm, 曜日であるとき */
      // 指定の時間割であるとき(前後期、曜日)
      // TODO: todoは当日のほうがいい？連動したいから？
      todolist.push({
        deadline: getCourseTimeFromDayOfWeek(
          course.times,
          course.dayOfWeeks,
          selectedDayOfWeekTxt,
        ) /* 時間割: 1-2とか */ /* TODO: 暫定, 「todolist.time」は期限→ deadlineにした, 残り時間は？ */,
        name: course.name,
        url: course.url,
        complete: false,
      });

      console.log('todolist: ', todolist);
    }
  }

  // TODO: 上と統合してはどうか
  // todoリストにあるけど今日の授業にない昨日の授業を消去?
  const newTodolist = todolist.filter(function (todoItem) {
    return (
      !/-/.test(todoItem.deadline) ||
      courses.some(course => {
        return (
          course.term == selectedTerm &&
          course.dayOfWeeks.includes(selectedDayOfWeekNum) &&
          course.name == todoItem.name
        );
      })
    );
  });

  // TODO: これでいいかな↓
  // todo更新を保存
  await promiseWrapper.storage.local.set({ todolist: newTodolist });
}

function updateTodoListFromEvent(todolist, event, remainingTime) {
  // イベントをTodoリストに追加

  // Todoリスト内を検索
  const existingTodoItem = todolist.some(
    todolistItem => todolistItem.name === $(event).children('a').text(), // 直近イベント
  );

  if (isUndefined(existingTodoItem)) {
    // Todoリストに新規追加
    todolist.push({
      name: $(event).children('a').text(),
      deadline: msToTime(remainingTime),
      url: $(event).children('a').attr('href'),
      complete: false,
    });
  } else {
    // Todoリストのアイテムを更新
    existingTodoItem.deadline = msToTime(remainingTime);
    existingTodoItem.url = $(event).children('a').attr('href');
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
 * @return {Object} courses = {term, courseNumberTxt, shortCourseNumberTxt, name, dayOfWeeks = {月, 日}, times = {1-2, 9-10}, url} (ただし特殊授業の場合: term, dayOfWeek = undefined)
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
    const shortCourseNumberItem = String(20) + courseNumberTxtList[i].replace(/-/g, ''); // -を消去し西暦と授業番号の組み合わせ、固有な値: 202010001 など
    const courseContainerArray = courseList[i]
      .split(new RegExp(shortCourseNumberItem + '|期|曜|限|_cls'))
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
      courseNumberTxt: courseNumberTxtList[i],
      shortCourseNumberTxt: shortCourseNumberItem,
      name: nameArray[i],
      dayOfWeeks: dayOfWeeksArray[i],
      times: timesArray[i],
      url: urlArray[i],
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
 * Tablesを描画します。
 *
 * @param {Object} courses
 * @param {String} selectedTerm
 * @param {Integer} selectedDayOfWeekNum
 * @param {String} selectedDayOfWeekTxt
 */
async function drawTables(courses, selectedTerm, selectedDayOfWeekNum, selectedDayOfWeekTxt) {
  console.log(
    'drawTables: term, dayOfWeekNum, dayOfWeekTxt: ',
    selectedTerm,
    selectedDayOfWeekNum,
    selectedDayOfWeekTxt,
  );

  // TODO: 内部を分割し、drawSpecialCoursesとdrawCoursesとdrawTodolistを呼び出す形にしたい
  // TODO: 時間割: Courses or TimeSchedule ならびに、drawかrenderか; courseの型
  // TODO: 土日のときどうするか？

  resetTables();

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

  const classTableSet = [false, false, false, false, false];
  for (const course of courses) {
    if (
      !isUndefined(course.term) &&
      !isUndefined(course.dayOfWeeks) /* term, dayOfWeeksがundefのときはspecialCourses */ &&
      course.term == selectedTerm &&
      course.dayOfWeeks.includes(selectedDayOfWeekTxt)
    ) {
      /* 指定されたterm, 曜日であるとき */
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
  removeBlankOfClassTables();
  console.log(classTableSet);
  fillBlankOfClassTables(classTableSet);

  const newTodolist = undefined; // TODO: todolist移動したため暫定
  // reset and add event listener
  $('#day_select_extension').off('change');
  $('#day_select_extension').change(() =>
    onSelectTableDay.call($('#day_select_extension'), courses, newTodolist),
  );
  $('#term_select_extension').off('change');
  $('#term_select_extension').change(() =>
    onSelectTableTerm.call($('#term_select_extension'), courses, newTodolist),
  );
  $('.todo_button_extension').off('click');
  $('.todo_button_extension').click(() =>
    updateTodolistTable.call($('.todo_button_extension'), newTodolist),
  );

  function resetTables() {
    // TODO: emptyだとblankClassが消えなかったため、removeを使ってみると大丈夫。なぜ？
    $('#onegen_extension').empty();
    $('#threegen_extension').empty();
    $('#fivegen_extension').empty();
    $('#sevengen_extension').empty();
    $('#ninegen_extension').empty();
  }

  function removeBlankOfClassTables() {
    // TODO: emptyだとblankClassが消えなかったため、removeを使ってみると大丈夫。なぜ？
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

// TODO:
function isTodolistCompleted(todolist) {
  let isCompleted = true;
  for (const todoItem of todolist) {
    if (todoItem.complete == false) {
      // todoItemが未完了のとき
      isCompleted = false;
      break;
    }
  }
  return isCompleted;
}

// TODO:
function isCourseExixstsInTodo(todolist, course) {
  let already_exixsts_todo = false;
  for (const todoItem of todolist) {
    if (todoItem.name == course.name) {
      // TODO: todolistに授業がすでに存在するとき: これって書き込み段階でされるべき処理では？
      already_exixsts_todo = true;
    }
  }
  return already_exixsts_todo;
}

function onSelectTableDay(courses, todolist) {
  const selectedDayOfWeekNum = $(this).val();
  const selectedTerm = $('#term_select_extension').val();

  console.log('onSelectTableDay: ', selectedDayOfWeekNum); // 曜日

  drawTables(
    courses,
    selectedTerm,
    selectedDayOfWeekNum,
    convertToDayOfWeekTxt(selectedDayOfWeekNum),
  );
}

function onSelectTableTerm(courses, todolist) {
  const selectedDayOfWeekNum = $('#day_select_extension').val();
  const selectedTerm = $(this).val();

  console.log('onSelectTableTerm: ', selectedTerm);

  drawTables(
    courses,
    selectedTerm,
    selectedDayOfWeekNum,
    convertToDayOfWeekTxt(selectedDayOfWeekNum),
  );
}

/**
 * 週間表示の時間割の描画。
 * TODO: 実装途中です。
 * @param {Object} courses = {}
 */
async function renderWeekClassTable(courses) {
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

function convertToDayOfWeekTxt(dayOfWeekNum) {
  return ['日', '月', '火', '水', '木', '金', '土'][dayOfWeekNum];
}

function isUndefined(value) {
  return typeof value === 'undefined';
}
