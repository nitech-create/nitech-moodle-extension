import $ from 'jQuery';

function onPageLoad() {
  chrome.runtime.sendMessage({ item: 'getOptions' }, response => {
    generatePage(response);
  });
}

function generatePage(options) {
  // saveボタン
  $('#btnSave').on('click', () => {
    options = {
      backgroundColor: $('#backgroundColor').val(),
      hideNavOnVideo: $('#hideNavOnVideo').prop('checked'),
    };

    chrome.runtime.sendMessage({ item: 'saveOptions', src: options });
  });

  // loadDefaultボタン
  $('#btnLoadDefault').on('click', () => {
    chrome.runtime.sendMessage({ item: 'getDefaultOptions' }, response => {
      applyOptionsToPages(response); // response == options?
    });
  });

  // loadCurrentボタン
  $('#btnLoadCurrent').on('click', () => {
    chrome.runtime.sendMessage({ item: 'getOptions' }, response => {
      applyOptionsToPages(response);
    });
  });

  applyOptionsToPages(options);
}

function applyOptionsToPages(options) {
  // ページに設定を反映
  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}

onPageLoad(); // PageLoad時に実行する。
