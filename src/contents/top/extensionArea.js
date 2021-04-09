import $ from 'jQuery';

// メインカラムに拡張機能用のエリアを追加
export default function createExtensionArea(){
  const outer = document.createElement('aside');
  const outer2 = document.createElement('section');
  outer2.className = 'block_myoverview block card mb-3';
  const el = document.createElement('div');
  el.id = 'extension-main-area';
  el.className = 'card-body p-3';

  $(outer).append($(outer2).append(el));
  $('#maincontent').after(outer);

  return el;
}
