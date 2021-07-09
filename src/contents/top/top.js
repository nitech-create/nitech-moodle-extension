import { injectScript } from 'Lib/utils.js';
import $ from 'jQuery';
import awaitPageLoading from './awaitPageLoading.js'

export async function onTopPage(url) {
  // topページでの処理
  await awaitPageLoading;

  const courseValue = $('.coursename');

  // コース概要のフィルタを「すべて表示(表示から削除済みを除く)」にする
  injectScript(`$('#groupingdropdown').next('.dropdown-menu').find('a[data-value="all"]').click();`);
  await awaitPageLoading;

  // コースの表示数を「すべて」にする
  injectScript(`$('button[data-action="limit-toggle"]').next('.dropdown-menu').find('a[data-limit="0"]').click();`);
  await awaitPageLoading;

  console.log('value: ', courseValue.length, courseValue);
}