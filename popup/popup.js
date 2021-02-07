// invisibleLeftNavigationOnlyVideo
// popup.htmlのボタンの取得
let invisibleLeftNavigationOnlyVideo = document.getElementById('invisibleLeftNavigationOnlyVideo');

// storageから現在の値を取得して、表示を変更
chrome.storage.local.get('invisibleLeftNavigationOnlyVideo', function(data) {
    invisibleLeftNavigationOnlyVideo.checked = data.invisibleLeftNavigationOnlyVideo;
    invisibleLeftNavigationOnlyVideo.setAttribute('checked', data.invisibleLeftNavigationOnlyVideo);
});

// ボタンを押した時
invisibleLeftNavigationOnlyVideo.onclick = function(element) {
    chrome.storage.local.set({'invisibleLeftNavigationOnlyVideo': element.target.checked}, function() {
        console.log("popup>invisibleLeftNavigationOnlyVideo: " + element.target.checked);
    })
};