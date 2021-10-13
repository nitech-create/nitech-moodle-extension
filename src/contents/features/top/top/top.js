import { injectScript } from 'Lib/utils.js';
import $ from 'jQuery';
import untilPageLoaded from './untilPageLoaded.js'

const onTopPage = async function() {
  // topページでの処理
  await untilPageLoaded();

  const courseValue = $('.coursename');

  // コース概要のフィルタを「すべて表示(表示から削除済みを除く)」にする
  injectScript(`$('#groupingdropdown').next('.dropdown-menu').find('a[data-value="all"]').click();`);
  await untilPageLoaded();

  // コースの表示数を「すべて」にする
  injectScript(`$('button[data-action="limit-toggle"]').next('.dropdown-menu').find('a[data-limit="0"]').click();`);
  await untilPageLoaded();

  console.log('value: ', courseValue.length, courseValue);
}


import config from './top.json5';
export default {
  config,
  func: onTopPage
}