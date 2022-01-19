import { injectScript } from 'Lib/utils.js';
import $ from 'jQuery';
import untilPageLoaded from './untilPageLoaded.js';
import optionsUtils from 'Options/optionsUtils.js';

const onTopPage = async () => {
  // topページでの処理
  changeCourseOverviewButton();
  await untilPageLoaded();

  const options = await optionsUtils.getOptions();

  (async function invisibleTopPageHeader() {
    if (!options.topPageHeaderVisible) {
      $('header#page-header').addClass('topPageHeaderInvisible');
    }
  })();

  changeCourseOverviewButton();
  await untilPageLoaded(); // TODO: なぜ2回loadしているのか、わからない…
  changeNavItemCourseName();
};

async function changeCourseOverviewButton() {
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

function changeNavItemCourseName() {
  // ナビゲーションのマイコースを講義名に変更
  $('li.type_course p.tree_item.branch a').each((_, e) => {
    const courseNumberTxt = $(e).text();
    $(e).text($(e).attr('title') + '(' + courseNumberTxt + ')');
  });
}

import config from './top.json5';
export default {
  config,
  func: onTopPage,
};
