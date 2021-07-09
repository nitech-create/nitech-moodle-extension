import { isUndefined } from 'Lib/utils.js';
import $ from 'jQuery';

// 読み込み待ち
export default new Promise(function (resolve, reject) {
  const reload = () => {
    const courseValue = $('.coursename');
    if (isUndefined(courseValue[0])) {
      console.log('yet');
      setTimeout(reload, 500);
    } else {
      console.log('done');
      resolve();
    }
  };

  reload();
});
