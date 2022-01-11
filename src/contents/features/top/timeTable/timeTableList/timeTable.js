import $ from 'jQuery';
import { classifyCourseList, getCourseList } from './courseList.js';
import { createDropDown } from './createDropDown.js';

export function drawTimeTableList() {
  const rootElement = $('#extension-main-area');
  const courseList = getCourseList();

  $(rootElement).append($('<h5>').text('授業/コース一覧'));

  const content = $('<div>');
  $(rootElement).append(content);

  if (courseList.length > 0) {
    const classifiedCourseList = classifyCourseList(courseList);

    const tableWrapperJElement = createTimeTable(classifiedCourseList);
    $(content).append(tableWrapperJElement);

    $(content).prepend(
      createUniqueDropDown(rootElement, classifiedCourseList, id => {
        tableWrapperJElement.find('ul').addClass('hidden');
        tableWrapperJElement.find(`ul.category-${id}`).removeClass('hidden');
      }),
    );
  }

  console.log('drawTimeTable compleated');
}

function createUniqueDropDown(rootElement, classifiedCourseList, callback) {
  const categories = Object.keys(classifiedCourseList)
    .sort()
    .map(categoryName => {
      let name = categoryName;

      if (categoryName === 'others') {
        name = 'その他';
      } else {
        if (/^\d+-(0|1)$/.test(categoryName)) {
          const temp = categoryName.split('-');
          name = `20${temp[0]}年度 ${temp[1] == '0' ? '前' : '後'}期`;
        }
      }

      return {
        text: name,
        id: categoryName,
      };
    });

  let active = nowCategory();
  if (!categories.some(c => c.id === active)) {
    active = categories[0].id;
  }

  const el = createDropDown('fa-filter', categories, active, callback);
  callback(active);
  return el;
}

function nowCategory() {
  const now = new Date();
  return `${now.getFullYear()}-${[3, 4, 5, 6, 7, 8].includes(now.getMonth()) ? 0 : 1}`.slice(2);
}

function createTimeTable(classifiedCourseList) {
  const wrapper = $('<div>');

  Object.keys(classifiedCourseList)
    .sort()
    .forEach(categoryName => {
      const category = [...classifiedCourseList[categoryName]].sort((a, b) => {
        return a.dayOfWeek * 100 + a.startPeriod - (b.dayOfWeek * 100 + b.startPeriod);
      });

      const table = $('<ul>');
      table.addClass('list-group');
      table.addClass('category-' + categoryName);

      category.forEach(course => {
        const item = $('<li>');
        item.addClass('list-group-item');
        if (course.specialCourse) {
          item.text(course.name);
        } else {
          item.text(
            `${['月曜', '火曜', '水曜', '木曜', '金曜'][course.dayOfWeek]} ${course.startPeriod}-${
              course.endPeriod
            } ${course.name}`,
          );
        }

        item.on('click', () => {
          const a = $('<a>');
          a.attr('href', course.url);
          a[0].click();
        });

        table.append(item);
      });

      wrapper.append(table);
    });

  return wrapper;
}

// import config from './timeTable.json5';
// export default {
//   config,
//   func: drawTimeTableList,
// };
