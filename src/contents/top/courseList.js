import $ from 'jQuery';

export function getCourseList(){
  const courseList = [];

  const rootJElement = $('#block-region-content div[data-region="courses-view"]');
  if(rootJElement.length <= 0) return [];

  rootJElement.find('li').each((index, itemElement) => {
    try{
      const categoryName = $(itemElement).find('.categoryname').text().trim();
      const shortenedName = $(itemElement).find('.categoryname').siblings().last().text().trim();
      const shortenedYear = parseInt(shortenedName.split('-')[0]);
      const courseName = $(itemElement).find('.coursename')[0].childNodes[4].textContent.trim();
      const url = $(itemElement).find('a.coursename').attr('href');

      if(/\(\d+\)\[\d\]\d+-\d+/.test(categoryName)){
        const nameSplit = courseName.split(' ');
        const name = nameSplit.slice(0, -3).join(' ');
        const semester = (nameSplit.slice(-2, -2)[0] == '前期' ? 0 : 1);
        const periodSplit = nameSplit[nameSplit.length - 1].replace(/^([月火水木金]曜)(\d+)-(\d+)限_(?:.+)$/, '$1 $2 $3').split(' ')
        const weekOfDay = ['月曜', '火曜', '水曜', '木曜', '金曜'].indexOf(periodSplit[0]);
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
          weekOfDay,
          startPeriod,
          endPeriod
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
    }catch(e){
      // do nothing
    }
  });

  return courseList;
}
