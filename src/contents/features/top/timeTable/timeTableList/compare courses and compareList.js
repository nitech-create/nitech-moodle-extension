// compare courses and compareList

courses[i] = {
  version: coursesVersion /* いらないかも */,
  term: termArray[i] /* if special courses → undefined */,
  shortYear: shortYear,
  courseNumberTxt: courseNumberTxtList[i] /* 一意(unique)のはず */,
  shortCourseNumber: shortCourseNumber,
  name: nameArray[i] /* 再履修など、一意ではない */,
  dayOfWeeks: dayOfWeeksArray[i] /* dayOfWeeks = {月, 日}, if special courses → undefined*/,
  times: timesArray[i] /* times = {1-2, 9-10} */,
  url: urlArray[i],
  isCompleted: completeResult.isCompleted,
  completeDateTime: completeResult.completeDateTime,
};

courseList.push({
  specialCourse: false, // OK
  categoryName /* なにこれ */,
  shortenedName /* なにこれ */,
  shortenedYear, // OK
  url, // OK
  name, // OK
  semester, // → term
  dayOfWeek, // → dayOfWeeks
  startPeriod /* わからん */,
  endPeriod /* わからん */,
});

0:
categoryName: "(20)[1]0-3"
dayOfWeek: 0
endPeriod: 8
name: "フレッシュマンセミナー"
semester: 0
shortenedName: "20-1-0346"
shortenedYear: 20
specialCourse: false
startPeriod: 7
url: "https://cms6.ict.nitech.ac.jp/moodle38a/course/view.php?id=196"

0:
completeDateTime: -1
courseNumberTxt: "20-1-0346"
dayOfWeeks: ['月']
isCompleted: false
name: "フレッシュマンセミナー"
shortCourseNumber: "202010346"
shortYear: "20"
term: "前"
times: ['7-8']
url: "https://cms6.ict.nitech.ac.jp/moodle38a/course/view.php?id=196"
version: "0.0.0.2"

courses[i] = {
  version: coursesVersion,
  term: termArray[i] /* if special courses → undefined */, // ← semester
  shortYear: shortYear, // → shortenedYear
  courseNumberTxt: courseNumberTxtList[i] /* 一意(unique)のはず */,
  shortCourseNumber: shortCourseNumber,
  name: nameArray[i] /* 再履修など、一意ではない */, // OK
  dayOfWeeks: dayOfWeeksArray[i] /* dayOfWeeks = {月, 日}, if special courses → undefined*/, // ← dayOfWeek
  times: timesArray[i] /* times = {1-2, 9-10} */, // ← startPeriod, endPeriod ?
  url: urlArray[i], // OK
  specialCourse: false, // add
  isCompleted: completeResult.isCompleted,
  completeDateTime: completeResult.completeDateTime,
};
