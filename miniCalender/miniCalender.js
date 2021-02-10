function editCalender(calendar_month){
  // カレンダーが動くように初期化
  const code = `require(['jquery', 'core_calendar/calendar_mini'], function($, CalendarMini) {
      CalendarMini.init($('[id^=calendar-month]')[0], !0);
  });`;
  const script = $('<script>')[0];
  script.textContent = code;
  (document.head||document.documentElement).appendChild(script);
  script.remove();

  // カレンダーに移動するナビゲーションを追加
  calendar_month
    .children('div')
    .append(
      '<br><a id="link-to-calendar" href="">カレンダーに移動する</a>',
    );

  // カレンダーが更新されたときに再適用する処理
  const startObserve = () => {
    observer.observe(calendar_month[0], {
      childList: true,
      subtree: true
    });
  }
  const observer = new MutationObserver(() => {
    // 無限ループ防止
    observer.disconnect();

    // いらない要素の削除
    calendar_month.find('caption .hide').remove();

    // 矢印の置き換え
    calendar_month.find('table a[title="前月"]').html(`
      <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" xml:space="preserve">
      <g>
      	<polyline points="48 4 16 32 48 60" stroke="#808080" fill="transparent" stroke-width="8" stroke-linecap="round"  stroke-linejoin="round"></polyline>
      </g>
      </svg>
    `);
    calendar_month.find('table a[title="来月"]').html(`
      <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" xml:space="preserve">
      <g>
      	<polyline points="16 4 48 32 16 60" stroke="#808080" fill="transparent" stroke-width="8" stroke-linecap="round"  stroke-linejoin="round"></polyline>
      </g>
      </svg>
    `);

    // wrap
    calendar_month.find('caption').children().wrapAll('<div class="mini-calender-caption"></div>');

    // 今日をハイライト
    const now = new Date();
    const dayTop = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    calendar_month.find('td[data-day-timestamp="' + dayTop.getTime()/1000 + '"]').addClass('mini-calender-today');

    // 再開
    startObserve();
  });
  startObserve();
}
