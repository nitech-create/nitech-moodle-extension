const promiseWrapper = {
  storage: {
    local: {
      /**
       * Wrapper of chrome.storage.local.get.
       * storageにキーに対応するデータがないにErrorをthrowします。しっかりcatchしましょう。
       * @param {String} key
       * @return {Promise}
       */
      get: key => {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(key, data => {
            if (!data.hasOwnProperty(key)) {
              // ストレージにキーが存在しない
              reject(new Error('storage access by undefined key: ' + key));
            } else {
              resolve(data);
            }
          });
        });
      },
      /**
       * Wrapper of chrome.storage.local.get.
       * storageにキーに対応するデータがないにErrorをthrowします。しっかりcatchしましょう。
       * @param {String} key
       * @return {Promise}
       */
      // wrapper of chrome.storage.local.set
      set: data => {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set(data, () => {
            resolve(data);
          });
        });
      },
    },
  },
  runtime: {
    // wrapper of chrome.runtime.sendMessage
    sendMessage: data => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(data, response => {
          resolve(response);
        });
      });
    },
  },
  tabs: {
    // wrapper of chrome.tabs.query
    query: options => {
      return new Promise((resolve, reject) => {
        chrome.tabs.query(options, tabs => {
          resolve(tabs);
        });
      });
    },
    // wrapper of chrome.tabs.sendMessage
    sendMessage: (tabId, data) => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(tabId, data, response => {
          resolve(response);
        });
      });
    },
  },
};

export default promiseWrapper;
