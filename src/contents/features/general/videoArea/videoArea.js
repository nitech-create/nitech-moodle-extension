import $ from 'jQuery';
import optionsUtils from 'Options/optionsUtils.js';

async function videoArea() {
  const options = await optionsUtils.getOptions();

  // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
  // location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php'
  if (options.hideNavOnVideo === true) {
    $('#page-content.blocks-pre').addClass('hidedenNavigation');
  }
}

import config from './videoArea.json5';
export default {
  config,
  func: videoArea,
};
