function editCalender(calendar_month){
  // カレンダーがうまく動かない(first.jsのcalendar_miniとか、calendar_get_monthなんちゃらとかが関係してるけど、ちょっと読めない(miniのほうが大事そう)) ->issue立てて隠ぺいしよう!(人任せ)
  $('.arrow').css('visibility', 'hidden');
  $('.arrow_link').css('cursor', 'default');

  calendar_month
    .children('div')
    .append(
      '<br><a id="link-to-calendar" href="">カレンダーに移動する</a>',
    );
}
