function isNullOrUndefined(o) {
  return typeof o === 'undefined' || o === null;
}

const Semester = {
  // TODO: あんまりキレイじゃない
  FIRST_SEMESTER: Symbol('前期'),
  SECOND_SEMESTER: Symbol('後期'),
  // intensiveCourse: Symbol('集中'),

  getSemester: semesterText => {
    switch (semesterText) {
      case '前期':
        return Semester.FIRST_SEMESTER;
      case '後期':
        return Semester.SECOND_SEMESTER;
      // case '集中':
      //   return Term.intensiveCourse;
      default:
        return undefined;
    }
  },
};
const DayOfWeek = {
  SUNDAY: Symbol('日'), // 0
  MONDAY: Symbol('月'), // 1
  TUESDAY: Symbol('火'), // 2
  WEDNESDAY: Symbol('水'), // 3
  THURSDAY: Symbol('木'), // 4
  FRIDAY: Symbol('金'), // 5
  SATURDAY: Symbol('土'), // 6
};
const DayOfWeeks = {
  values: [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ],
  getDayOfWeek: index => {
    return DayOfWeeks.values[index];
  },
  getDayOfWeekOfJapaneseChar: char => {
    return DayOfWeeks.values.find(value => value.description == char);
  },
  getDayOfWeekOfJapaneseText: text => {
    return DayOfWeeks.getIndexOfJapaneseChar(text[0]);
  },
  getIndexOf: dayOfWeek => {
    return DayOfWeek.values.indexOf(dayOfWeek);
  },
  getDayOfWeekOfEnglish: text => {
    return DayOfWeek[text];
  },
};

const parseCourseNameHighhandedly = courseName => {
  let semester = undefined;
  const periodList = [];
  for (let i = 0; i < courseName.length; i++) {
    const i_ = courseName.length - 1 - i; // 後ろから
    if (courseName[i_] == '期' && i_ >= 1) {
      semester = Semester.getSemester(courseName[i_ - 1] + '期'); // undefinedでも無視する(後で確認)
      console.log('semester: ', semester);
    } else if (courseName[i_] == '曜' && i_ >= 1) {
      // TODO: ← ?
      const dayOfWeek = DayOfWeeks.getDayOfWeekOfJapaneseChar(courseName[i_ - 1]);
      console.log('dayOfWeek: ', dayOfWeek);
      if (isNullOrUndefined(dayOfWeek)) {
        continue;
      }
      // 流石に曜日の後ろに限があるでしょ
      const tmpPeriod = courseName.slice(i_).match(/(?<startPeriod>\d+)-(?<endPeriod>\d+)限/);
      console.log('tmpPeriod: ', tmpPeriod);
      if (isNullOrUndefined(tmpPeriod.groups.startPeriod)) {
        continue;
      } else if (isNullOrUndefined(tmpPeriod.groups.endPeriod)) {
        continue;
      }

      // periodListの中身はNon-Null/Undef
      periodList.push({
        dayOfWeek,
        startPeriod: tmpPeriod.groups.startPeriod,
        endPeriod: tmpPeriod.groups.endPeriod,
      });
    }
  }

  return { semester, periodList };
};

// const text = 'ソフトウェア工学2022（22-1-2620 前期 木曜5-6限）';
const text = '地域研究Ⅰ（中国） 202010336 前期 火曜3-4限_cls';
parseCourseNameHighhandedly(text);
