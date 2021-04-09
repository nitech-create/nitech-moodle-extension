import $ from 'jQuery';
import { classifyCourseList } from './courseList.js';
import { createDropDown } from './extensionArea.js'

export function drawTimeTable(rootElement, courseList){
  $(rootElement).append($('<h5>').text('時間割表'));

  const classifiedCourseList = classifyCourseList(courseList);
  const categories = Object.keys(classifiedCourseList).sort().map((categoryName) => {
    let name = categoryName;

    if(categoryName === 'others'){
      name = 'その他';
    }else{
      if(/^\d+-(0|1)$/.test(categoryName)){
        const temp = categoryName.split('-');
        name = `20${temp[0]}年度 ${temp[1] == '0' ? '前' : '後'}期`
      }
    }

    return {
      text: name,
      id: categoryName,
    }
  });

  let active = nowCategory;
  if(!categories.some((c) => c.id === active)){
    active = categories[0].id;
  }

  $(rootElement).append(createDropDown('fa-filter', categories, active, (id) => {
    console.log(id);
  }));
}

function nowCategory(){
  const now = new Date();
  return `${now.getFullYear()}-${[3, 4, 5, 6, 7, 8].includes(now.getMonth()) ? 0 : 1}`;
}
