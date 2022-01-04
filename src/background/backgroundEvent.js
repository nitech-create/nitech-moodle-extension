// import promiseWrapper from 'Lib/promiseWrapper.js';
// import $ from 'jQuery';
import optionsUtils from 'Options/optionsUtils.js';

/**
 * インストール時の動作と、runtime messageの送受信を行うjsファイル
 */

// onInstalled: 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(async function onInstalled() {
  console.log('[BackgroundE] onInstalled');

  // optionsにdefaultOptionsを適用する
  const defaultOptions = await optionsUtils.getDefaultOptions();
  console.log('[BackgroundE] set default options: ', defaultOptions);
  await optionsUtils.saveOptions(defaultOptions);
  // TODO:
  const options = await optionsUtils.getOptions();
  console.log('[BackgroundE] get current options: ', options);
  console.log('[BackgroundE] onInstalled fin');
});
