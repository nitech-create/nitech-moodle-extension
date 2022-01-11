/**
 * courselist:
 * (授業名)(courseShortNumber)(前/後)期(月/...)曜(n-n')限_cls
 * SpecialCourseはcourseShortNumberが無い
 *
 * @return {Array} courseList
 */
function loadCourseList() {
  const courseList = $('.course-listitem .coursename')
    .text()
    .replace(/\s+/g, '')
    .split('コース星付きコース名');
  courseList.shift();

  return courseList;
}
