// 'use strict';
import $ from 'jQuery';
import promiseWrapper from 'Lib/promiseWrapper';

const defaultOptions = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

// TODO: defaultOptionsと完全に同一かどうか不安になる。
const options = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

export function onLoad() {
  // console.log('default: ', defaultOptions);
  Object.assign(options, defaultOptions); // 不安なので、コピーをする
  loadOptions(options);
  console.log('loadOptions: ', options);

  generatePage(options);

  // storageの設定を読み込んで反映
  applyOptionsToPages(options);
}

function generatePage(options) {
  // saveボタン
  $('#btnSave').on('click', () => {
    options.backgroundColor = $('#backgroundColor').val();
    options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');

    saveOptions(options);
  });
  // loadDefaultボタン
  $('#btnLoadDefault').on('click', () => {
    Object.assign(options, defaultOptions);
    saveOptions(options);
    applyOptionsToPages(options);
  });

  // loadCurrentボタン
  $('#btnLoadCurrent').on('click', () => {
    // setOptionsFromStorage();
    // saveToStorage(setOptions(defaultOptions));
  });
}

// first
// ロード時にoptionsを読み込む
// function loadOptionFromDefault() {
//   chrome.runtime.sendMessage({ item: 'defaultOptions' }, function (response) {
//     defaultOptions = response.defaultOptions; // defaultOptionsへ設定ファイルからのものを代入。(関数のブロック構造に注意?)

//     console.log('response: ', response);
//     console.log('default: ', defaultOptions);
//     const options = {};
//     Object.assign(options, defaultOptions);

//     // saveボタン
//     $('#btnSave').on('click', function () {
//       options.backgroundColor = $('#backgroundColor').val();
//       options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');

//       saveOptions(options);
//     });
//     // loadDefaultボタン
//     $('#btnLoadDefault').on('click', function () {
//       Object.assign(options, defaultOptions);
//       saveOptions(options);
//       applyOptionsToPages(options);
//     });

//     // loadCurrentボタン
//     $('#btnLoadCurrent').on('click', function () {
//       setOptionsFromStorage();
//       saveToStorage(setOptions(defaultOptions));
//     });

//     // storageの設定を読み込んで反映
//     (async () => {
//       await loadOptions(options);
//       console.log('loadOptions: ', options);
//       applyOptionsToPages(options);
//     })();
//   });
// }

async function loadOptions(options) {
  // storageから現在の設定を取得

  const loadedOptions = await promiseWrapper.local.get('options');
  options.backgroundColor = loadedOptions.backgroundColor;
  options.hideNavOnVideo = loadedOptions.hideNavOnVideo;

  try {
    // options.backgroundColor = await promiseWrapper.local.get('backgroundColor');
    // options.hideNavOnVideo = await getStorage('hideNavOnVideo');
  } catch (e) {
    console.log(e);
  }
}

function applyOptionsToPages(options) {
  // ページに設定を反映
  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}

function saveOptions(options) {
  // storageにデータを保存
  console.log('save: ', options);
  promiseWrapper.local.set({ options: options });
  // chrome.storage.local.set({}); // TODO
  // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
  // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
}
