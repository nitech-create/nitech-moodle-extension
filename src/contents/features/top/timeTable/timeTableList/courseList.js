import $ from 'jQuery';

/**
 * 取得してきたcourseの要素達から変換し、coursesを生成する。
 * courseList: 通常コース: (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls, 特殊コースはSpecialCourseはcourseShortNumberが無い。
 * @return {Object} courses = {term, shortYear, courseNumberTxt, shortCourseNumberTxt, name, dayOfWeeks = {月, 日}, times = {1-2, 9-10}, url} (ただし特殊授業の場合: term, dayOfWeek = undefined)
 * specialCourse {boolean}, categoryName = {}
          categoryName,
          shortenedName,
          shortenedYear,
          url,
          name,
          semester,
          dayOfWeek,
          startPeriod,
          endPeriod,
 */
export function getCourseList() {
  const courseList = [];

  const rootJElement = $('#block-region-content div[data-region="courses-view"]');
  if (rootJElement.length <= 0) return [];

  rootJElement.find('li').each((index, itemElement) => {
    try {
      const categoryName = $(itemElement).find('.categoryname').text().trim();
      const shortenedName = $(itemElement).find('.categoryname').siblings().last().text().trim();
      const shortenedYear = parseInt(shortenedName.split('-')[0]);
      const courseName = $(itemElement).find('.coursename')[0].childNodes[4].textContent.trim();
      const url = $(itemElement).find('a.coursename').attr('href');

      if (/\(\d+\)\[\d\]\d+-\d+/.test(categoryName)) {
        const nameSplit = courseName.split(' ');
        const name = nameSplit.slice(0, -3).join(' ');
        const semester = nameSplit[nameSplit.length - 2] == '前期' ? 0 : 1;
        const periodSplit = nameSplit[nameSplit.length - 1]
          .replace(/^([月火水木金]曜)(\d+)-(\d+)限_(?:.+)$/, '$1 $2 $3')
          .split(' ');
        const dayOfWeek = ['月曜', '火曜', '水曜', '木曜', '金曜'].indexOf(periodSplit[0]);
        const startPeriod = parseInt(periodSplit[1]);
        const endPeriod = parseInt(periodSplit[2]);

        // 授業コース
        courseList.push({
          specialCourse: false,
          categoryName,
          shortenedName,
          shortenedYear,
          url,
          name,
          semester,
          dayOfWeek,
          startPeriod,
          endPeriod,
        });
        return;
      }

      courseList.push({
        specialCourse: true,
        categoryName,
        shortenedName,
        shortenedYear,
        url,
        name: courseName,
      });
    } catch (e) {
      // do nothing
    }
  });

  console.log('courseList: ', courseList);

  return courseList;
}

/**
 * 各年前後期とその他に分ける
 *
 * @param {number} courseList course
 * @return {array} classifiedList keyは内部関数getCategory(course)から得られる、n-nもしくはothers
 */
export function classifyCourseList(courseList) {
  // 各年前後期とその他に分ける
  const getCategory = course => {
    if (!course.specialCourse) {
      return `${course.shortenedYear}-${course.semester}`;
    }
    return 'others';
  };

  // 分類を列挙
  const categorySet = new Set(courseList.map(course => getCategory(course)));

  const classifiedList = [];
  categorySet.forEach(category => (classifiedList[category] = []));
  courseList.forEach(course => classifiedList[getCategory(course)].push(course));

  return classifiedList;
}
