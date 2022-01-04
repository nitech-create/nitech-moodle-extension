import optionsUtils from 'Options/optionsUtils.js';
import $ from 'jQuery';

async function onPageLoad() {
  console.log('onPageLoad');
  chrome.runtime.sendMessage({ item: 'getOptions' }, response => {
    generatePage(response.options);
    console.log('generated');
  });

  // const options = await optionsUtils.getOptions();
  // console.log(options);
  // generatePage(options);
}

function generatePage(options) {
  applyOptionsToPages(options);

  console.log('generatePage: options: ', options);
  // saveボタン
  $('#btnSave').on('click', () => {
    const options_ = {
      backgroundColor: $('#backgroundColor').val(),
      hideNavOnVideo: $('#hideNavOnVideo').prop('checked'),
    };

    chrome.runtime.sendMessage({ item: 'saveOptions', src: options_ });
  });

  // loadDefaultボタン
  $('#btnLoadDefault').on('click', () => {
    chrome.runtime.sendMessage({ item: 'getDefaultOptions' }, response => {
      applyOptionsToPages(response.getDefaultOptions); // response == options?
    });
  });

  // loadCurrentボタン
  $('#btnLoadCurrent').on('click', () => {
    chrome.runtime.sendMessage({ item: 'getOptions' }, response => {
      applyOptionsToPages(response.options);
    });
  });
}

function applyOptionsToPages(options) {
  // ページに設定を反映
  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}

onPageLoad(); // PageLoad時に実行する。
