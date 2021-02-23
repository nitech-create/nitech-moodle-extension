'use strict';

// 設定値をデフォルト設定から複製
let defaultOptions;

// entry
window.onload = () => {
  chrome.runtime.sendMessage({ item: 'defaultOptions' }, function (response) {
    defaultOptions = response.defaultOptions; // defaultOptionsへ設定ファイルからのものを代入。(関数のブロック構造に注意?)

    console.log('response: ', response);
    console.log('default: ', defaultOptions);
    const options = {};
    Object.assign(options, defaultOptions);

    // saveボタン
    $('#btnSave').on('click', function () {
      options.backgroundColor = $('#backgroundColor').val();
      options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');

      saveOptions(options);
    });
    // loadDefaultボタン
    $('#btnLoadDefault').on('click', function () {
      Object.assign(options, defaultOptions);
      saveOptions(options);
      applyOptions(options);
    });
    // loadCurrentボタン
    $('#btnLoadCurrent').on('click', function () {
      setOptionsFromStorage();
      saveToStorage(setOptions(defaultOptions));
    });

    // storageの設定を読み込んで反映
    (async () => {
      await loadOptions(options);
      console.log('loadOptions: ', options);
      applyOptions(options);
    })();
  });
};

function getStorage(key) {
  // chrome.storage.local.getのPromiseラッパー

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function (data) {
      if (!data.hasOwnProperty(key)) {
        // ストレージにキーが存在しない
        if (defaultOptions.hasOwnProperty(key)) {
          console.log('loading default option of ' + key);
          resolve(defaultOptions[key]);
        } else {
          reject(new Error('undefined key: ' + key));
        }
      } else {
        resolve(data[key]);
      }
    });
  });
}

async function loadOptions(options) {
  // storageから現在の設定を取得

  try {
    options.backgroundColor = await getStorage('backgroundColor');
    options.hideNavOnVideo = await getStorage('hideNavOnVideo');
  } catch (e) {
    console.log(e);
  }
}

function applyOptions(options) {
  // ページに設定を反映

  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}

function saveOptions(options) {
  // storageにデータを保存
  console.log('save: ', options);
  chrome.storage.local.set(options); // TODO
  // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
  // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
}
