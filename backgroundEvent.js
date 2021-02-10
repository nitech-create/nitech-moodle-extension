// onInstalled: 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(onLoad);

let defaultOptions;
function onLoad() {
  console.log('onLoad');

  // load defaultOptions
  loadJson('./options/defaultOptions.json', loadedDefaultOptions => {
    defaultOptions = loadedDefaultOptions; // backgroundEvent.jsが値を保持。

    // storageにoptionsが無い時、defaultを読み込んで保存する
    const key = 'optionsVersion';
    chrome.storage.local.get(key, data => {
      console.log('data: ', data[key]);

      if (
        !data.hasOwnProperty(key) ||
        !(data[key] === defaultOptions.optionsVersion)
      ) {
        // TODO: versionが違うとdefaultに戻っちゃう！？→上書きしない設定にするべき

        console.log('None options. And save options.');

        chrome.storage.local.set(defaultOptions);
        console.log('saved default options.');
      }
    });
  });
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('sender: ', sender);
  const src = request.src;
  switch (request.item) {
    case 'defaultOptions':
      sendResponse(defaultOptions);
      break;
    case 'loadJson':
      loadJson(src, json => {
        sendResponse(json);
      });
      break;
    case 'loadOptions':
      accessOptions.loadOptionsWrapper(loadedOptions => {
        sendResponse(loadedOptions);
      });
      break;
    case 'saveOptions':
      sendResponse(accessOptions.saveOptions(src));
      break;
    case 'clearStorage':
      sendResponse(accessStorage.clearStorage());
      break;
    case 'getStorage':
      accessStorage.getStorageWrapper(src, item => {
        // console.log('getStorage item: ', item);
        sendResponse(item);
      });
      break;
  }
  return true;
});

function loadJson(filePath, callback) {
  chrome.runtime.getPackageDirectoryEntry(function (root) {
    // get file
    root.getFile(filePath, { create: false }, function (sample) {
      // callback
      sample.file(function (file) {
        // read file
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', function (e) {
          // parse and return json
          // const response = {
          //   url: chrome.extension.getURL('data'),
          //   settings: JSON.parse(e.target.result),
          // };

          const json = JSON.parse(e.target.result);
          callback(json, chrome.extension.getURL('data'));
        });
      });
    });
  });
}

const accessOptions = {
  // eslint-disable-next-line no-unused-vars
  loadOptionsWrapper: async callback => {
    const options = {};
    Object.assign(options, defaultOptions);
    accessOptions.loadOptions(options, callback);
  },

  loadOptions: async (options, callback) => {
    // storageから現在の設定を取得
    try {
      options.backgroundColor = await accessStorage.getStorage(
        'backgroundColor',
      );
      options.hideNavOnVideo = await accessStorage.getStorage('hideNavOnVideo');
    } catch (e) {
      console.log(e);
    }
    callback(options);
  },

  saveOptions: options => {
    // storageにデータを保存
    chrome.storage.local.set(options);
    console.log('saved: ', options);
    // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
    // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
  },
};

// eslint-disable-next-line no-unused-vars
const accessStorage = {
  getStorageWrapper: async (key, callback) => {
    const item = await accessStorage.getStorage(key);
    callback(item);
    return item;
  },

  // eslint-disable-next-line no-unused-vars
  getStorage: key => {
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
  },

  // eslint-disable-next-line no-unused-vars
  clearStorage: () => {
    chrome.storage.local.clear(function () {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
    onLoad();
  },
};
