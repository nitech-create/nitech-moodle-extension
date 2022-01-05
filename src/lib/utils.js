export function isUndefined(value) {
  return typeof value === 'undefined';
}

export function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

export function loadJson(filePath, callback) {
  // chrome.runtime.getPackageDirectoryEntry(function (root) {
  //   // get file
  //   root.getFile(filePath, { create: false }, function (sample) {
  //     // callback
  //     sample.file(function (file) {
  //       // read file
  //       const reader = new FileReader();
  //       reader.readAsText(file);
  //       reader.addEventListener('load', function (e) {
  //         // parse and return json
  //         // const response = {
  //         //   url: chrome.extension.getURL('data'),
  //         //   settings: JSON.parse(e.target.result),
  //         // };

  //         const json = JSON.parse(e.target.result);
  //         callback(json, chrome.extension.getURL('data'));
  //       });
  //     });
  //   });
  // });

  // 上記コードに対して下を実装。未検証
  loadFile(filePath, (result, url) => {
    const json = JSON.parse(result);
    callback(json, url);
  });
}

export function loadFile(filePath, callback) {
  chrome.runtime.getPackageDirectoryEntry(function (root) {
    // get file
    root.getFile(filePath, { create: false }, function (sample) {
      // callback
      sample.file(function (file) {
        // read file
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', function (e) {
          callback(e.target.result, chrome.extension.getURL('data'));
        });
      });
    });
  });
}
