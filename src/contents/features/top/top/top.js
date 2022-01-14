import { injectScript } from 'Lib/utils.js';
import $ from 'jQuery';
import untilPageLoaded from './untilPageLoaded.js';
import optionsUtils from 'Options/optionsUtils.js';

const onTopPage = async () => {
  // topページでの処理
  changeCourseOverViewButton();
  await untilPageLoaded();

  const options = await optionsUtils.getOptions();

  (async function invisibleTopPageHeader() {
    if (!options.topPageHeaderVisible) {
      $('header#page-header').addClass('topPageHeaderInvisible');
    }
  })();

  changeCourseOverViewButton();
  await untilPageLoaded(); // TODO: なぜ2回loadしているのか、わからない…
};

async function changeCourseOverViewButton() {
  // コース概要のフィルタを「すべて表示(表示から削除済みを除く)」にする
  injectScript(
    `$('#groupingdropdown').next('.dropdown-menu').find('a[data-value="all"]').trigger('click');`,
  );
  // await untilPageLoaded();

  // コースの表示数を「すべて」にする
  injectScript(
    `$('button[data-action="limit-toggle"]').next('.dropdown-menu').find('a[data-limit="0"]').trigger('click');`,
  );
}

import config from './top.json5';
export default {
  config,
  func: onTopPage,
};
