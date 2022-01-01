// 'use strict';
import $ from 'jQuery';
import promiseWrapper from 'Lib/promiseWrapper';

const optionsUtils = {};
const defaultOptions = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

// TODO: defaultOptionsと完全に同一かどうか不安になる。
const options = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

export function onLoad() {
  Object.assign(options, getOptions());
  console.log('options: ', options);

  generatePage(options);
}

function generatePage(options) {
  // saveボタン
  $('#btnSave').on('click', () => {
    options.backgroundColor = $('#backgroundColor').val();
    options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');

    saveOptions(options);
  });

  // loadDefaultボタン
  $('#btnLoadDefault').on('click', () => {
    Object.assign(options, defaultOptions);
    saveOptions(options);
    applyOptionsToPages(options);
  });

  // loadCurrentボタン
  $('#btnLoadCurrent').on('click', () => {
    // saveToStorage(setOptions(defaultOptions));
  });

  applyOptionsToPages(options);
}

async function getOptions() {
  return await promiseWrapper.local
    .get('options')
    .then(data => {
      return data.options;
    })
    .catch(error => {
      // console.error(error);
      return defaultOptions;
    });
}

function applyOptionsToPages(options) {
  // ページに設定を反映
  $('#backgroundColor').val(options.backgroundColor);
  $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
}

function saveOptions(options) {
  // storageにデータを保存
  console.log('save options: ', options);
  promiseWrapper.local.set({ options: options });
}

export default optionsUtils;
