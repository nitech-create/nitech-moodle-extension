let backgroundColor = document.getElementById('backgroundColor');

// storageから現在の値を取得して、表示を変更
chrome.storage.local.get('backgroundColor', function(data) {
  if (data.backgroundColor == undefined) {
    data.backgroundColor = "NavajoWhite";
  }
  backgroundColor.value = data.backgroundColor;
});

function save() {
  console.log(backgroundColor.value);
  chrome.storage.local.set({"backgroundColor": backgroundColor.value});
}

// saveボタンを押したときにstorageへ保管
document.getElementById('save').addEventListener('click', function () {
  save();
});

// TODO: reset butoon
