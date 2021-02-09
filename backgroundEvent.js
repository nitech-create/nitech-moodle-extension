// 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(function() {
    var config = {};

    {
        var file = 'config.json';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL(file), true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                config = JSON.parse(xhr.responseText);
            }
        };
        xhr.send();
    }

    {
        for (key in config) {
            if (typeof config[key] === 'string' && config[key] != '') {
                console.log('key=' + key + ', value=' + config[key]);
            }
        }
    }
});