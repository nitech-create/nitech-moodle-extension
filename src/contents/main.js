import promiseWrapper from 'Lib/promiseWrapper.js';
import $ from 'jQuery';
import loadFeature from './featureLoader.js';
import optionsUtils from 'Options/optionsUtils.js';

import extensionArea from 'Features/top/extensionArea/extensionArea.js';
import timeTable from 'Features/top/timeTable/timeTable.js';
import restoreNavigation from 'Features/general/restoreNavigation/restoreNavigation.js';
import restoreMiniCalendar from 'Features/general/restoreMiniCalendar/restoreMiniCalendar';
import deadlineUpdate from 'Features/top/deadlineUpdate/deadlineUpdate';
import calendar from 'Features/calendar/calendar.js';
import topMain from 'Features/top/top/top.js';
import videoArea from 'Features/general/videoArea/videoArea.js';

const features = [
  topMain,
  extensionArea,
  timeTable,
  restoreNavigation,
  restoreMiniCalendar,
  deadlineUpdate,
  calendar,
  videoArea,
];

$(async function onLoad() {
  // pageのロードが終わった時
  // TODO: chrome拡張機能のapiでもok?

  console.log('[moodle assistant for NITech] page: ' + location.href);

  // オプションを読み込んで対応する処理を行う
  const options = await optionsUtils.getOptions();
  console.log('response options: ', options);

  if (!options.extentionEnable) {
    console.log('The extension is disabled. options.extentionEnable: ', options.extentionEnable);
    return;
  }

  // 背景色変更
  $('body').css('background-color', options.backgroundColor);

  const topPageUrl = /^https:\/\/cms6.ict.nitech.ac.jp\/moodle38a\/my\/(#|(index.php))?/;
  const loginPageUrl = 'https://cms6.ict.nitech.ac.jp/moodle38a/login/index.php';
  let environment = '';
  if (topPageUrl.test(location.href)) {
    // topページでの処理
    if (options.topPageEnable) {
      environment = 'top';
    }
  } else if (location.href === loginPageUrl) {
    // loginページでの処理 -> 以降を処理しない
    environment = 'login';
    // console.log('login page.');
  } else {
    // topページ以外での処理
    environment = 'other';
  }

  // ポストプロセス
  console.log('[Preprocess Finished]');

  // featuerを読み込み
  loadFeature(features, environment, location.href);
});
