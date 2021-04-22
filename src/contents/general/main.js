import promiseWrapper from 'Lib/promiseWrapper.js';
import $ from 'jQuery';
import restoreMiniCalender from 'General/miniCalender/miniCalender.js';
import restoreNavigation from 'General/navigation/navigation.js';
import { onTopPage } from 'Contents/top/top.js';

$(async function onLoad() {
  // pageのロードが終わった時
  // TODO: chrome拡張機能のapiでもok?

  console.log('[moodle assistant for NITech] page: ' + location.href);

  // オプションを読み込んで対応する処理を行う
  const options = await promiseWrapper.runtime.sendMessage({
    item: 'loadOptions',
  });
  console.log('response options: ', options);
  $('body').css('background-color', options.backgroundColor); // 背景色変更

  // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
  if (
    options.hideNavOnVideo === true &&
    location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php'
  ) {
    $('#page-content.blocks-pre').addClass('hidedenNavigation');
  }

  const topPageUrl = /^https:\/\/cms6.ict.nitech.ac.jp\/moodle38a\/my\/(#|(index.php))?/;
  if (topPageUrl.test(location.href)) {
    // topページでの処理
    await onTopPage(location.href);
  } else if (location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/login/index.php') {
    // loginページでの処理 -> 以降を処理しない
    console.log('login page.');
    // return;
  } else {
    // topページ以外での処理
    await onOtherPage(location.href);
  }

  // ポストプロセス
  console.log('[Preprocess Finished]');
  restoreMiniCalender();
  restoreNavigation();
});

async function onOtherPage(loc) {
  // topページ以外での処理
  // TODO: generalで良いと思われる
}
