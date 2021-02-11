const promiseWrapper = {
  storage: {
    local: {
      // wrapper of chrome.storage.local.get
      get: null,
      // wrapper of chrome.storage.local.set
      set: null
    }
  }
}

// wrapper of chrome.storage.local.get
promiseWrapper.storage.local.get = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (data) => {
      if (!data.hasOwnProperty(key)) {
        // ストレージにキーが存在しない
        reject(new Error('undefined key: ' + key));
      } else {
        resolve(data[key]);
      }
    });
  });
}

// wrapper of chrome.storage.local.set
promiseWrapper.storage.local.set = (data) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      resolve(data);
    });
  });
}
