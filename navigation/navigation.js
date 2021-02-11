/* global promiseWrapper */ // <- ./lib/promiseWrapper.js must be loaded

window.addEventListener('extensionPreprocessFinished', () => {
  if($('.depth_1 ul')[0] !== undefined){
    //reformNavi();
    console.log('navigation');
  }
});

async function reformNavi() {
  const courses = await promiseWrapper.storage.local.get('courses');
  const courseSize = courses.length;

  // ナビゲーション文字入れ替え
  const listnum = $('.depth_1 ul').first().children('li').eq(2).children('ul').children('li').length;

  let count = 0;
  // ナビゲーション(表)の最初の要素に対して、
  $('.depth_1 ul')
    .first() /* ダッシュボード */
    .children('li')
    .last() /* マイコース */
    .children('ul')
    .children('li')
    .each(function () {
      /* マイコースの要素 */
      let success = false; // TODO: 関数に落とし込む
      count++;

      for (let i = 0; i < courseSize; i++) {
        if ($(this).children('p').children('a').text() == courses[i].short) {
          // 授業名(コース名)がshort(授業番号)の表示だったら、授業名に書き換え
          $(this).children('p').children('a').text(courses[i].name);
          success = true;
          console.log('replaced');
        }
      }

      if (success === false) {
        if (count == listnum) {
          // トップに戻るボタン
          $(this).remove();
        } else {
          $(this).remove();
        }
      }
    });
}
