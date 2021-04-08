import $ from 'jQuery';

export default function(){
  if($('[data-block="calendar_month"]')[0] !== undefined){
    editCalender($('[data-block="calendar_month"]'));
  }
}

function editCalender(calendarMonth){
  // カレンダーに移動するナビゲーションを追加
  calendarMonth
    .children('div')
    .append(
      '<br><a id="link-to-calendar" href="">カレンダーに移動する</a>',
    );

  // カレンダーが更新されたときに再適用する処理
  const refleshFunc = () => {
    // 無限ループ防止
    observer.disconnect();

    // いらない要素の削除
    calendarMonth.find('caption .hide').remove();

    // 矢印の置き換え
    calendarMonth.find('table a[title="前月"]').html(`
      <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" xml:space="preserve">
      <g>
      	<polyline points="48 4 16 32 48 60" stroke="#808080" fill="transparent" stroke-width="8" stroke-linecap="round"  stroke-linejoin="round"></polyline>
      </g>
      </svg>
    `);
    calendarMonth.find('table a[title="来月"]').html(`
      <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" xml:space="preserve">
      <g>
      	<polyline points="16 4 48 32 16 60" stroke="#808080" fill="transparent" stroke-width="8" stroke-linecap="round"  stroke-linejoin="round"></polyline>
      </g>
      </svg>
    `);

    // wrap
    calendarMonth.find('caption').children().wrapAll('<div class="mini-calender-caption"></div>');

    // 今日をハイライト
    const now = new Date();
    const dayTop = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    calendarMonth.find('td[data-day-timestamp="' + dayTop.getTime()/1000 + '"]').addClass('mini-calender-today');

    // 再開
    startObserve();
  }

  const startObserve = () => {
    observer.observe(calendarMonth[0], {
      childList: true,
      subtree: true
    });
  }
  const observer = new MutationObserver(refleshFunc);
  refleshFunc();
  startObserve();
}
