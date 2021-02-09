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

          const settingsJson = JSON.parse(e.target.result);
          callback(settingsJson, chrome.extension.getURL('data'));
        });
      });
    });
  });
}

// 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(function () {
  console.log('onLoad');
  loadJson('./options/defaultOptions.json', settingsJson => {
    // TODO: load and save to storage (options.js).

    // test
    console.log('settingsJson', settingsJson);
    for (key in settingsJson) {
      if (typeof settingsJson[key] === 'string' && settingsJson[key] != '') {
        console.log('key=' + key + ', value=' + settingsJson[key]);
      }
    }
  });
});
