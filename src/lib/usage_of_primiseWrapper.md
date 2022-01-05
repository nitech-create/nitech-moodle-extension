# primiseWrapper

```javascript
import promiseWrapper from 'Lib/promiseWrapper.js';
```



## storage

### 例: 

restoreNavigation.js/reformNavi

```javascript
  const courses = await promiseWrapper.storage.local
    .get('courseList')
    .then(data => data.courseList)
    .catch(error => {
      console.error(error);
      return undefined;
    });xxxxxxxxxx const   const courses = await promiseWrapper.storage.local    .get('courseList')    .then(data => data.courseList)    .catch(error => {      console.error(error);      return undefined;    });
```



## sendMessage

実際に受けて動作を行うのは、`src/background/backgroundEvent.js`

### 例: optionsを読み込むとき(旧のやり方)

設定ファイル(options)を読み込むとき？

```js
  const options = await promiseWrapper.runtime.sendMessage({
    item: 'loadOptions',
  });
```

