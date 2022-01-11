// 'use strict';
import promiseWrapper from 'Lib/promiseWrapper.js';
// import $ from 'jQuery';

const defaultOptions = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  timeTableMode: 'list', // 'list' or 'graphical'
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

// TODO: defaultOptionsと完全に同一かどうか不安になる。
const options = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  timeTableMode: 'list', // 'list' or 'graphical'
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

const optionsUtils = {
  onLoad: () => {
    // Object.assign(options, optionsUtils.getOptions()); // TODO: おかしい
    // console.log('options: ', options);
    // optionsUtils.generatePage(options);
  },

  getOptions: async () => {
    return promiseWrapper.storage.local
      .get('options')
      .then(data => {
        console.log('[options/getOptions] options:', data.options);
        return data.options;
      })
      .catch(error => {
        console.error(error);
        return defaultOptions;
      });
  },

  getDefaultOptions: () => {
    const copiedDefaultOptions = {};
    Object.assign(copiedDefaultOptions, defaultOptions);
    return copiedDefaultOptions; // TODO: defaultOptionsの中身が操作される…？
  },

  saveOptions: options => {
    // storageにデータを保存
    console.log('save options: ', options);
    promiseWrapper.storage.local.set({ options: options });
  },
};

export default optionsUtils;
