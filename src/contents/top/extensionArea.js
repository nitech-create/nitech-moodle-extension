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

export function createDropDown(iconClass, dropdownList, _active, callback){
  let active = _active;

  const wrapper = $('<div>');
  wrapper.addClass('dropdown mb-1 mr-auto');
  // add .show when active

  const button = $('<button>');
  const icon = $('<i>')
  const buttonLabel = $('<span>');
  button.attr('type', 'button');
  button.addClass('btn btn-outline-secondary dropdown-toggle')
  icon.addClass('icon fa fa-fw');
  icon.addClass(iconClass);
  buttonLabel.addClass('d-sm-inline-block');
  button.append(icon).append(buttonLabel);

  const dropdown = $('<ul>');
  dropdown.addClass('dropdown-menu');
  // add .show when active

  const update = () => {
    dropdown.find('a').removeClass('active');
    const a = dropdown.find(`li.id-${active} a`);
    a.addClass('active')
    buttonLabel.text(a.text());
  }

  dropdownList.forEach((item) => {
    const li = $('<li>');

    if(item === 'divider'){
      li.addClass('dropdown-divider');
    }else{
      const a = $('<a>');
      li.addClass('id-' + item.id);
      a.addClass('dropdown-item');
      if(active == item.id){
        a.addClass('active')
        buttonLabel.text(item.text);
      }
      a.attr('href', '#');
      a.text(item.text);

      li.on('click', () => {
        active = item.id;
        update();
        callback(item.id);
      });

      li.append(a);
    }

    dropdown.append(li);
  });

  button.on('click', () => {
    if(!wrapper.hasClass('show')){
      setTimeout(() => {
        const listener = () => {
          wrapper.removeClass('show');
          dropdown.removeClass('show');
          document.removeEventListener('click', listener);
        }
        document.addEventListener('click', listener);
      }, 4);
    }

    wrapper.addClass('show');
    dropdown.addClass('show');
  });

  return wrapper.append(button).append(dropdown);
}
