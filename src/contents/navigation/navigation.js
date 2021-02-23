/* global promiseWrapper */ // <- ./lib/promiseWrapper.js must be loaded

window.addEventListener('extensionPreprocessFinished', () => {
  if($('.depth_1 ul')[0] !== undefined){
    reformNavi();
    restoreTree();
  }
});

function restoreTree(){
  // ナビゲーションが動かないのを修正
  const code = `M.util.js_pending('block_navigation/navblock'); require(['block_navigation/navblock'], function(amd) {amd.init("20"); M.util.js_complete('block_navigation/navblock');});`;
  const script = $('<script>')[0];
  script.textContent = code;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

async function reformNavi() {
  const courses = (await promiseWrapper.storage.local.get('courses')).courses;

  console.log(courses);

  // マイコース取得
  const list = $('.depth_1 ul').first().children('li').eq(2).children('ul').children('li');

  // 構造
  // <li class="type_course depth_3 contains_branch" aria-labelledby="label_3_21" tabindex="-1">
  //   <p class="tree_item branch" role="treeitem" id="expandable_branch_20_202" aria-expanded="false" data-requires-ajax="true" data-loaded="false" data-node-id="expandable_branch_20_202" data-node-key="202" data-node-type="20" tabindex="-1" aria-selected="false">
  //     <a tabindex="-1" id="label_3_21" title="体育実技Ⅰ 202010355 前期 月曜3-4限_cls" href="https://cms6.ict.nitech.ac.jp/moodle38a/course/view.php?id=202">
  //       20-1-0355
  //     </a>
  //   </p>
  // </li>

  // <li aria-labelledby="label_3_$$">の$$
  // 連番にならないといけない筈
  const firstNum = parseInt(list.first().attr('aria-labelledby').match(/\d+$/)[0]);
  // <p data-node-key="$$$$">の$$$$
  // idとかと一致して重複しなければ大丈夫だと思う
  const firstKey = parseInt(list.find('p').first().attr('data-node-key'));
  // <p data-node-type="$$">の$$
  const type = parseInt(list.find('p').first().attr('data-node-type'));

  // 一度全て消去
  list.children().remove()

  // 追加
  let num = firstNum;
  let key = firstKey;
  const ul = $('.depth_1 ul').first().children('li').eq(2).children('ul');

  for(const course of courses){
    const li = $('<li/>')
      .addClass('type_course depth_3 contains_branch')
      .attr('aria-labelledby', 'label_3_' + num)
      .attr('tabindex', -1);
    const p = $('<p/>')
      .addClass('tree_item branch')
      .attr('role', 'treeitem')
      .attr('id', 'expandable_branch_' + type + '_' + key)
      .attr('aria-expanded', false)
      .attr('data-requires-ajax', true)
      .attr('data-loaded', false)
      .attr('data-node-id', 'expandable_branch_' + type + '_' + key)
      .attr('data-node-key', key)
      .attr('data-node-type', type)
      .attr('tabindex', -1)
      .attr('aria-selected', false);
    const a = $('<a/>')
      .attr('tabindex', -1)
      .attr('id', 'label_3_' + num)
      .attr('title', course.name)
      .attr('href', course.url)
      .text(course.name)

    ul.append(li.append(p.append(a)));

    num += 1;
    key -= 1;
    while($('[data-node-key=' + key + ']')[0] !== undefined) key -= 1;
  }
}
