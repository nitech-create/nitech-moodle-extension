const pageElements = {
  backgroundColorInput: document.getElementById('backgroundColor'),
  invisibleLeftNavigationOnlyVideo: document.getElementById(
    'invisibleLeftNavigationOnlyVideo',
  ),
};

const defaultOptions = {
  backgroundColor: 'NavajoWhite',
  invisibleLeftNavigationOnlyVideo: true,
};

// 関数定義
function setOptionsFromStorage() {
  // storageから現在の値を取得して、表示を変更
  // TODO: よりよい関数名, もともとはloadStorageOptions. 時間がかかりそうなイメージがほしい

  chrome.storage.local.get('backgroundColor', function (data) {
    if (data.backgroundColor == undefined) {
      data.backgroundColor = defaultOptions.backgroundColor;
    }
    console.log('storage: ' + data.backgroundColor);
    pageElements.backgroundColorInput.value = data.backgroundColor;
  });

  chrome.storage.local.get('invisibleLeftNavigationOnlyVideo', function (data) {
    if (data.invisibleLeftNavigationOnlyVideo == undefined) {
      data.invisibleLeftNavigationOnlyVideo =
        defaultOptions.invisibleLeftNavigationOnlyVideo;
    }
    invisibleLeftNavigationOnlyVideo.checked =
      data.invisibleLeftNavigationOnlyVideo;
  });
}

function setOptions(options) {
  // TODO: 関数名にToPageをつけるか？
  console.log('setPage: ' + options.backgroundColor);
  pageElements.backgroundColorInput.value = options.backgroundColor;
  return options;
}

function loadPageOptions() {
  return (loadedOptions = {
    backgroundColor: pageElements.backgroundColorInput.value,
    invisibleLeftNavigationOnlyVideo:
      pageElements.invisibleLeftNavigationOnlyVideo.checked,
  });
}

function saveToStorage(options) {
  console.log('save: ' + options);
  chrome.storage.local.set(options); // TODO
  // chrome.storage.local.set({"backgroundColor": options.backgroundColor});
  // chrome.storage.local.set({"backgroundColor": backgroundColor.value});
}

// page load時.start
console.log('default: ' + defaultOptions.backgroundColor);
setOptionsFromStorage();
// page load時.finish

// Pageのボタンなどの設定.start
document.getElementById('save').addEventListener('click', function () {
  saveToStorage(loadPageOptions());
});

// loadDefault
document.getElementById('loadDefault').addEventListener('click', function () {
  setOptions(defaultOptions);
  // saveToStorage(setOptions(defaultOptions));
});

// loadCurrent
document.getElementById('loadCurrent').addEventListener('click', function () {
  setOptionsFromStorage();
  // saveToStorage(setOptions(defaultOptions));
});
// Pageのボタンなどの設定.finish
