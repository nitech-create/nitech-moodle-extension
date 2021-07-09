import $ from 'jQuery';

// 直近イベントを取得
export function getEvenetList(){
  // Entry
  const eventList = [];

  const rootJElement = $('.block_calendar_upcoming');
  if(rootJElement.length <= 0) return [];

  rootJElement.find('div.event').each((index, itemElement) => {
    const titleLabel = $(itemElement).find('a[data-type="event"]').text();
    const dateLabel  = $(itemElement).find('div.date').text();
    eventList.push({
      name: titleLabel,
      deadline: convertDate(dateLabel),
      deadlineText: dateLabel,
      domElement: itemElement
    })
  });

  return eventList;
}

// 日付テキストをDateに変換
function convertDate(dateLabel, nowDate = new Date) {
  const arr = dateLabel.replace(/[\s+,]/g, '').split(/[:年日月残]/);
  // [YYYY, MM, DD, hh, mm (, 余り)] or
  // [明日, hh, mm (, 余り)] or [本日, hh, mm (, 余り)]

  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;

  if (arr[0] == '本') {
    // 本日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate();
    hour = arr[1];
    minute = arr[2];
  } else if (arr[0] == '明') {
    // 明日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate() + 1;
    hour = arr[1];
    minute = arr[2];
  } else {
    // YYYY年 MM月 DD日, hh:mm
    year = arr[0];
    month = arr[1] - 1;
    day = arr[2];
    hour = arr[3];
    minute = arr[4];
  }

  return new Date(year, month, day, hour, minute);
}
