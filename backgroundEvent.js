// 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(function () {
  let config = {};
  {
    const file = 'config.json';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL(file), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        config = JSON.parse(xhr.responseText);
      }
    };
    xhr.send();
  }

  {
    for (key in config) {
      if (typeof config[key] === 'string' && config[key] != '') {
        console.log('key=' + key + ', value=' + config[key]);
      }
    }
  }
});
