// import promiseWrapper from 'Lib/promiseWrapper.js';
// import $ from 'jQuery';
import optionsUtils from 'Options/optionsUtils.js';

/**
 * インストール時の動作と、runtime messageの送受信を行うjsファイル
 */

// onInstalled: 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(onInstalled);

async function onInstalled() {
  console.log('[BackgroundE] onInstalled');

  // optionsにdefaultOptionsを適用する
  const defaultOptions = await optionsUtils.getDefaultOptions();
  console.log('[BackgroundE] set default options: ', defaultOptions);
  await optionsUtils.saveOptions(defaultOptions);
  // TODO:
  const options = await optionsUtils.getOptions();
  console.log('[BackgroundE] get current options: ', options);
}

// request Listener処理
// TODO: 複数同時指定
/*
chrome.runtime.onConnect.addListener(function (port) {
  console.log('port: ', port);
  // console.assert(port.name == 'backgroundEvent');
  port.onMessage.addListener(function (request) {
    console.log('request: ', request);
    const src = request.src;
    switch (request.item) {
      case 'defaultOptions':
        port.postMessage({ defaultOptions: defaultOptions });
        break;
      case 'loadJson':
        loadJson(src, json => {
          port.postMessage({ loadJson: json });
        });
        break;
      case 'loadOptions':
        port.postMessage({ loadOptions: accessOptions.loadOptions(src) });
        break;
      case 'saveOptions':
        port.postMessage({ saveOptions: accessOptions.saveOptions(src) });
      case 'clearStorage':
        port.postMessage({ clearStorage: accessStorage.clearStorage() });
        break;
      case 'getStorage':
        getStorageWrapper(src, item => {
          port.postMessage({ getStorage: item });
        });
        break;
    }
  });
});*/

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log('[BackgroundE] request: ', request);
//   console.log('[BackgroundE] sender: ', sender);
//   const src = request.src; // copyとかのsrcのイメージ
//   switch (request.item) {
//     // case 'loadJson':
//     // case 'loadFile':
//     //   loadFile(src, file => {
//     //     sendResponse(file);
//     //   });
//     //   break;

//     case 'getDefaultOptions':
//       optionsUtils.getDefaultOptions().then(defaultOptions => {
//         sendResponse(defaultOptions);
//       });
//       break;

//     case 'getOptions':
//       // case 'loadOptions':
//       getOptions(sendResponse);
//       break;

//     case 'saveOptions':
//       // sendResponse(accessOptions.saveOptions(src));
//       // promiseWrapper.storage.local.set({ options: src });
//       optionsUtils.saveOptions(src);
//       break;

//     // case 'clearStorage':
//     // sendResponse(accessStorage.clearStorage());
//     // break;
//     // case 'getStorage':
//     // accessStorage.getStorageWrapper(src, item => {
//     //   // console.log('getStorage item: ', item);
//     //   sendResponse(item);
//     // });
//     // break;
//   }
//   return true;
// });

/**
 * how to use:
 *   chrome.runtime.sendMessage({ item: 'getOptions' }, options => { write your process });
 * @param {function} sendResponse responseを送信するための関数
 */
// function getOptions(sendResponse) {
//   // accessOptions.loadOptionsWrapper(loadedOptions => {
//   //   sendResponse(loadedOptions);
//   // });
//   // promiseWrapper.storage.local.get('options').then(options => sendResponse(options));

//   optionsUtils.getOptions().then(options => {
//     // console.log('send get/loadOptions: ', options);
//     sendResponse(options);
//   });
// }

// function loadJson(filePath, callback) {
//   // chrome.runtime.getPackageDirectoryEntry(function (root) {
//   //   // get file
//   //   root.getFile(filePath, { create: false }, function (sample) {
//   //     // callback
//   //     sample.file(function (file) {
//   //       // read file
//   //       const reader = new FileReader();
//   //       reader.readAsText(file);
//   //       reader.addEventListener('load', function (e) {
//   //         // parse and return json
//   //         // const response = {
//   //         //   url: chrome.extension.getURL('data'),
//   //         //   settings: JSON.parse(e.target.result),
//   //         // };

//   //         const json = JSON.parse(e.target.result);
//   //         callback(json, chrome.extension.getURL('data'));
//   //       });
//   //     });
//   //   });
//   // });

//   // 未検証
//   loadFile(filePath, (result, url) => {
//     const json = JSON.parse(result);
//     callback(json, url);
//   });
// }

// function loadFile(filePath, callback) {
//   chrome.runtime.getPackageDirectoryEntry(function (root) {
//     // get file
//     root.getFile(filePath, { create: false }, function (sample) {
//       // callback
//       sample.file(function (file) {
//         // read file
//         const reader = new FileReader();
//         reader.readAsText(file);
//         reader.addEventListener('load', function (e) {
//           callback(e.target.result, chrome.extension.getURL('data'));
//         });
//       });
//     });
//   });
// }

// const accessOptions = {
//   // eslint-disable-next-line no-unused-vars
//   loadOptionsWrapper: async callback => {
//     const options = {};
//     Object.assign(options, defaultOptions);
//     accessOptions.loadOptions(options, callback);
//   },

//   loadOptions: async (options, callback) => {
//     // storageから現在の設定を取得
//     try {
//       options.backgroundColor = await accessStorage.getStorage('backgroundColor');
//       options.hideNavOnVideo = await accessStorage.getStorage('hideNavOnVideo');
//     } catch (e) {
//       console.log(e);
//     }
//     callback(options);
//   },

//   saveOptions: options => {
//     // storageにデータを保存
//     chrome.storage.local.set(options);
//     console.log('saved: ', options);
//     // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
//     // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
//   },
// };

// eslint-disable-next-line no-unused-vars
// const accessStorage = {
//   getStorageWrapper: async (key, callback) => {
//     const item = await accessStorage.getStorage(key);
//     callback(item);
//     return item;
//   },

//   // eslint-disable-next-line no-unused-vars
//   getStorage: key => {
//     // chrome.storage.local.getのPromiseラッパー

//     return new Promise((resolve, reject) => {
//       chrome.storage.local.get(key, function (data) {
//         if (!data.hasOwnProperty(key)) {
//           // ストレージにキーが存在しない
//           if (defaultOptions.hasOwnProperty(key)) {
//             console.log('loading default option of ' + key);
//             resolve(defaultOptions[key]);
//           } else {
//             reject(new Error('undefined key: ' + key));
//           }
//         } else {
//           resolve(data[key]);
//         }
//       });
//     });
//   },

//   // eslint-disable-next-line no-unused-vars
//   clearStorage: () => {
//     chrome.storage.local.clear(function () {
//       const error = chrome.runtime.lastError;
//       if (error) {
//         console.error(error);
//       }
//     });
//     onLoad();
//   },
// };
