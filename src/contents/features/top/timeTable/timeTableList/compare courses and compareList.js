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

courses[i] = {
  version: coursesVersion /* いらないかも */,
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
