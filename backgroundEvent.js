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

// Listener処理
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('sender: ', sender);
  if (request.item == 'defaultOptions')
    sendResponse({ defaultOptions: defaultOptions });
});

let defaultOptions;

// onInstalled: 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(onLoad);

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

// eslint-disable-next-line no-unused-vars
function clearStorage() {
  chrome.storage.local.clear(function () {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
  onLoad();
}
