// 'use strict';
import promiseWrapper from 'Lib/promiseWrapper.js';
import $ from 'jQuery';

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

const optionsUtils = {
  onLoad: () => {
    Object.assign(options, optionsUtils.getOptions());
    console.log('options: ', options);

    optionsUtils.generatePage(options);
  },

  generatePage: options => {
    // saveボタン
    $('#btnSave').on('click', () => {
      options.backgroundColor = $('#backgroundColor').val();
      options.hideNavOnVideo = $('#hideNavOnVideo').prop('checked');

      optionsUtils.saveOptions(options);
    });

    // loadDefaultボタン
    $('#btnLoadDefault').on('click', () => {
      Object.assign(options, defaultOptions);
      optionsUtils.saveOptions(options);
      optionsUtils.applyOptionsToPages(options);
    });

    // loadCurrentボタン
    $('#btnLoadCurrent').on('click', () => {
      // saveToStorage(setOptions(defaultOptions));
    });

    optionsUtils.applyOptionsToPages(options);
  },

  getOptions: async () => {
    return await promiseWrapper.storage.local
      .get('options')
      .then(data => {
        return data.options;
      })
      .catch(error => {
        console.error(error);
        return defaultOptions;
      });
  },

  applyOptionsToPages: options => {
    // ページに設定を反映
    $('#backgroundColor').val(options.backgroundColor);
    $('#hideNavOnVideo').prop('checked', options.hideNavOnVideo);
  },

  saveOptions: options => {
    // storageにデータを保存
    console.log('save options: ', options);
    promiseWrapper.local.set({ options: options });
  },
};

export default optionsUtils;
