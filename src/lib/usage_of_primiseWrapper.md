# primiseWrapper

```javascript
import promiseWrapper from 'Lib/promiseWrapper.js';
```

## storage

### 例:

courses の読み込み (エラー処理つき)
注意点は、await の部分をちゃんとカッコで囲ってあげることです！

```javascript
const oldCourses = await promiseWrapper.storage.local
  .get('courses')
  .then(result => {
    return result.courses;
  })
  .catch(err => {
    console.log('[getCourses] cannot load old courses.');
    return undefined;
  });
```

もしくは、エラー処理なしならば

```javascript
const oldCourses = (await promiseWrapper.storage.local.get('courses')).courses;
```

## sendMessage

実際に受けて動作を行うのは、`src/background/backgroundEvent.js`

### 例: options を読み込むとき(旧のやり方)

現在、設定ファイル(options)を読み込むときは、Options/optionsUtils.js のものを使用してください。

```js
const options = await promiseWrapper.runtime.sendMessage({
  item: 'loadOptions',
});
```
