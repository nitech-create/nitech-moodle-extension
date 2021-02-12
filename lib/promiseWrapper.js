const promiseWrapper = {
  storage: {
    local: {
      // wrapper of chrome.storage.local.get
      get: null,
      // wrapper of chrome.storage.local.set
      set: null,
    },
  },
  runtime: {
    // wrapper of chrome.runtime.sendMessage
    sendMessage: null,
  },
  tabs: {
    // wrapper of chrome.tabs.query
    query: null,
    // wrapper of chrome.tabs.sendMessage
    sendMessage: null,
  },
};

/**
 * Wrapper of chrome.storage.local.get.
 * storageにキーに対応するデータがないにErrorをthrowします。しっかりcatchしましょう。
 * @param {String} key
 * @return {Promise}
 */
promiseWrapper.storage.local.get = key => {
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
};

// wrapper of chrome.storage.local.set
promiseWrapper.storage.local.set = data => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      resolve(data);
    });
  });
};

// wrapper of chrome.runtime.sendMessage
promiseWrapper.runtime.sendMessage = data => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(data, response => {
      resolve(response);
    });
  });
};

// wrapper of chrome.tabs.query
promiseWrapper.tabs.query = options => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(options, tabs => {
      resolve(tabs);
    });
  });
};

// wrapper of chrome.tabs.sendMessage
promiseWrapper.tabs.sendMessage = (tabId, data) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(tabId, data, response => {
      resolve(response);
    });
  });
};
