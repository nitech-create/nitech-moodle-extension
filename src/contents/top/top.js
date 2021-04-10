import promiseWrapper from 'Lib/promiseWrapper.js';
import { isUndefined, injectScript } from 'Lib/utils.js';
import $ from 'jQuery';
import createExtensionArea from './extensionArea.js';
import { getEvenetList } from './eventList.js';
import { getCourseList } from './courseList.js';
import awaitPageLoading from './awaitPageLoading.js'
import * as deadlineUpdate from './deadlineUpdate.js';
import { drawTimeTable } from './timeTable.js';

export function onTopPage(url) {
  // topページでの処理

  return awaitPageLoading.then(async () => {
    const courseValue = $('.coursename');

    // コース概要のフィルタを「すべて表示(表示から削除済みを除く)」にする
    injectScript(`$('#groupingdropdown').next('.dropdown-menu').find('a[data-value="all"]').click();`);
    await awaitPageLoading;

    // コースの表示数を「すべて」にする
    injectScript(`$('button[data-action="limit-toggle"]').next('.dropdown-menu').find('a[data-limit="0"]').click();`);
    await awaitPageLoading;

    topPageMain();
    // await reformTopPage(courseValue.length);
    console.log('value: ', courseValue.length, courseValue);
  });
}

function topPageMain(){
  // 直近イベントを取得
  const eventList = getEvenetList();
  console.log(eventList);

  // 受講コースを取得
  const courseList = getCourseList();
  console.log(courseList);

  // 拡張機能用の場所を追加
  const extensionArea = createExtensionArea();

  // 時間割の描画
  drawTimeTable(extensionArea, courseList);

  // 残り時間の動的アップデート
  deadlineUpdate.register(eventList);

  return;
}
