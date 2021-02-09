let defaultOptions;
// onInstalled: 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(onLoad);

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

// request Listener処理
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('sender: ', sender);
  switch (request.item) {
    case 'defaultOptions':
      sendResponse({ defaultOptions: defaultOptions });
      BroadcastChannel;
    case 'accessStorage':
      sendResponse({ accessStorage: accessStorage });
    case 'accessOptions':
      sendResponse({ accessOptions: accessOptions });
  }
});

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
        !(data[key] === loadedDefaultOptions.optionsVersion)
      ) {
        // TODO: versionが違うとdefaultに戻っちゃう！？→上書きしない設定にするべき

        console.log('None options. And save options.');

        chrome.storage.local.set(loadedDefaultOptions);
        console.log('saved default options.');
      }
    });
  });
}

const accessOptions = {
  // eslint-disable-next-line no-unused-vars
  loadOptions: async function loadOptions(options) {
    // storageから現在の設定を取得

    try {
      options.backgroundColor = await getStorage('backgroundColor');
      options.hideNavOnVideo = await getStorage('hideNavOnVideo');
    } catch (e) {
      console.log(e);
    }
  },

  saveOptions: function saveOptions(options) {
    // storageにデータを保存
    console.log('save: ', options);
    chrome.storage.local.set(options); // TODO
    // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
    // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
  },
};

// eslint-disable-next-line no-unused-vars
const accessStorage = {
  // eslint-disable-next-line no-unused-vars
  getStorage: function getStorage(key) {
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
  clearStorage: function clearStorage() {
    chrome.storage.local.clear(function () {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
    onLoad();
  },
};
