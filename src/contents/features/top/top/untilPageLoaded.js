import $ from 'jQuery';

const TIMEOUT = 10;

// 読み込み待ち

export default () => new Promise((resolve, reject) => {
  let totalTime = 0;

  const reload = () => {
    const courseValue = $('.coursename');

    if (!(courseValue.length > 0)) {
      console.log('yet');
      totalTime += 1;

      if(totalTime < TIMEOUT) {
        setTimeout(reload, 500);
      } else {
        reject(new Error('Page load timeouted.'));
      }
    } else {
      console.log('done', courseValue);
      resolve();
    }
  };

  reload();
});
