import $ from 'jQuery';

// メインカラムに拡張機能用のエリアを追加
export default function createExtensionArea(){
  const outer = $('<aside>');
  const outer2 = $('<section>');
  const el = $('<div>');
  outer2.addClass('block_myoverview block card mb-3');
  el.attr('id', 'extension-main-area');
  el.addClass('card-body p-3');

  $(outer).append($(outer2).append(el));
  $('#maincontent').after(outer);

  return el;
}
