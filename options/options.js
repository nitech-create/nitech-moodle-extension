'use strict';

// 設定値をデフォルト設定から複製
const defaultOptions = {
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};
const options = {};
Object.assign(options, defaultOptions);

// entry
window.onload = () => {
  console.log('default: ', defaultOptions);

  // saveボタン
  $('#btnSave').on('click', function () {
    options.backgroundColor = $('#backgroundColor').val();
    options.hideNavOnVideo =  $('#hideNavOnVideo').prop('checked');

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
    applyOptions(options);
  })();
}

function getStorage(key){
  // chrome.storage.local.getのPromiseラッパー

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function (data) {
      if (!data[key]) {
        // ストレージにキーが存在しない
        if(defaultOptions.hasOwnProperty(key)){
          console.log("loading default option of " + key);
          resolve(defaultOptions[key]);
        }else{
          reject('undefined key: ' + key);
        }
      }else{
        resolve(data.backgroundColor);
      }
    });
  });
}

async function loadOptions(options) {
  // storageから現在の設定を取得

  try{
    options.backgroundColor = await getStorage('backgroundColor');
    options.hideNavOnVideo = await getStorage('hideNavOnVideo');
  }catch(e){
    console.log(e);
  }
}

function applyOptions(options){
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
