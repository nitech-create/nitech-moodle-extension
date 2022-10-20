import $ from 'jQuery';
import optionsUtils from 'Options/optionsUtils.js';

async function videoArea() {
  const options = await optionsUtils.getOptions();

  // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
  // location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php'
  if (options.hideNavOnVideo === true) {
    $('#page-content.blocks-pre').addClass('hidedenNavigation');
    setTimeout(() => {
      // 何が原因化は不明だが、何かしらが読み込まれてないとbtnが実行されないため、delayさせる
      document.getElementById('scorm_toc_toggle_btn').click();
    }, 1000);
  }
}

import config from './videoArea.json5';
export default {
  config,
  func: videoArea,
};
