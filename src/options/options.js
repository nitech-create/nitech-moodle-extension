import optionsUtils from 'Options/optionsUtils.js';
import $ from 'jQuery';

(async function onPageLoad() {
  console.log('onPageLoad');

  const options = await optionsUtils.getOptions();
  console.log(options);
  generatePage(options);
})(); // PageLoad時に実行する。

function generatePage(options) {
  applyPageFromOptions(options);

  console.log('generatePage: options: ', options);
  // saveボタン
  $('#btnSave').on('click', () => {
    applyOptionsFromPage(options);
    optionsUtils.saveOptions(options);
    // chrome.runtime.sendMessage({ item: 'saveOptions', src: options_ });
  });

  // loadDefaultボタン
  $('#btnLoadDefault').on('click', async () => {
    const defaultOptions = await optionsUtils.getDefaultOptions();
    applyPageFromOptions(defaultOptions);
    // chrome.runtime.sendMessage({ item: 'getDefaultOptions' }, options => {
    //   applyOptionsToPages(options); // response == options?
    // });
  });

  // loadCurrentボタン
  $('#btnLoadCurrent').on('click', async () => {
    const options = await optionsUtils.getOptions();
    applyPageFromOptions(options);
    // chrome.runtime.sendMessage({ item: 'getOptions' }, options => {
    //   applyOptionsToPages(options);
    // });
  });
}

/**
 * optionsの要素に、optionsページの要素の値を代入します。
 * see: applyPageFromOptions, 類似関数にapplyPageFromOptionsがあることに注意してください。
 * @param {array} options
 * @return {array} page内容が代入されたoptions
 */
function applyOptionsFromPage(options) {
  console.log('applyOptionsFromPage: ', options);
  options.backgroundColor = $('#backgroundColor').val();
  options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');
  return options;
}

/**
 * optionsページに、引数のoptionsの要素の値を適用します。
 * see: applyOptionsFromPage, 類似関数にapplyOptionsFromPageがあることに注意してください。
 * @param {array} options
 */
function applyPageFromOptions(options) {
  console.log('applyPageFromOptions: ', options);
  // ページに設定を反映
  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}
