// calenderの選択ボタンは本来、コース名(授業番号)となってしまっているため、授業名に表示のみ差し替える機能。
chrome.storage.local.get('courses', function (data) {
  if (data == undefined) {
    console.log('courses is undefined');
    return;
  }
  let courses = data.courses;

  let options = document.getElementById('menucourse').options;
  Array.prototype.forEach.call(options, function (option) {
    let course = courses.find(course => course.short == option.label);
    if (course == undefined) {
      if (!(option.value == 1 && option.label == 'すべてのコース')) {
        console.log('Cannot find!: ' + option.label);
      }
    } else {
      option.label = course.name + ' (' + course.short + ')';
    }
  });
});
