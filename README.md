# nitech-moodle-extention

名古屋工業大学のオンライン授業サポートシステムとして採用されている moodle を使いやすくする Chrome 拡張機能です。非公式であり、問題が起きても責任は取れません。<br>
Chrome Extension for NITech moodle(38a).

## 対象

NITech 在校生。

## 注意点

- 開発途中です！
- 設定ページが未完成です。(タブ(ページ)を reload しないと設定が反映されない仕様です！)
- 動作確認ブラウザ: Chrome, Kinza
- moodle サイトの表示に改変を加えてるのみで、不正なことは行いません。

### 開発の注意点

- moodle サイトは落ちやすいため、リーロード処理、自分から情報を追加で呼び出すなどは控えること！
- 情報基盤センターからの推薦ブラウザはEdge(Chromium)であり、Chromeも使用可能という感じであること

## 利用方法

### ChromeWebStore

一般公開を下記リンクのChromeWebStoreページにて行っています！

[nitech-moodle-extension - ChromeWebStore](https://chrome.google.com/webstore/detail/nitech-moodle-extension/ibhjlbmhcgcmnipnbecooagnfannciol?hl=ja)

(情報基盤センターから、公開に問題がない旨を受けております 2021年4月5日付)

### GitHub開発版

1. 【Chromeの準備】<br>Chromium 系ブラウザ(Chrome, ~~Edge~~, ~~Vivaldi~~, おすすめ: Chrome Beta)にて`chrome://extensions/`(拡張機能のページ)を開く。(打ち消し線ブラウザは動作未確認)
2. (右上の)「デベロッパーモード」を有効にする。
3. 【ソースコードの準備】<br>GitHubの「Code」ページの「Code」ボタンから「Download ZIP」より zip ファイルをダウンロード後、展開する。<br>または`git clone`を行う。
4. 先程入手したフォルダにて`npm install`
5. 同ディレクトリにて`npm run build`(開発ビルド: `npm run dev`) (※これはWebpackによるbundleを行っています)
6. 【拡張機能の読み込み】<br>生成される`dist`フォルダをドラッグ&ドロップする。<br>(または「パッケージ化されていない拡張機能を読み込む」から該当フォルダを選択)
7. NITech moodle サイトへログインし、拡張機能が動作しているか確認する。

#### watch機能を使う場合 (おすすめ)

watch機能を使うことで、毎回`npm run dev`を行う必要がないのでおすすめです！

上記の4番目までは同じ。(通常4番目までは毎回の実行は不要)

5. `npm run watch`を実行する
6. `dist`フォルダを拡張機能にD&D。
7. moodleサイトを再読み込みして、拡張機能を使用する。
7. 終了は`Ctrl+C`キーを押す(`Y`を入力する)

## 機能

### 全体

- **サイトの背景色を変更する**

- ~~**ナビゲーション**: <br>すべてのコースを表示するようにして、さらにマイコースの項目をコース名(授業番号)の表示から授業名の表示へ書き換える~~
- ~~ヘッダーナビの改良: ※予定~~

### トップページ

- **全体的にナビボックス配置を大きく変更する**: <br>右左に散らばってしまっている細々な表示を左に集約する (またナビボックスとはナビゲーションを含む様々なボックスのこと)
- **時間割**: <br>前期/後期、年、曜日で指定ができる
  - Graphicalモード: 1日だけの、いわゆる時間割の表示をする
    - **完了ボタン機能**あり！: 完了が消える日にちを、1日だったり、3日だったり、~~1週間だったり~~と設定できます。(現在、1週間のときの挙動はおすすめしません)

  - Listモード: 1週間全ての授業を、曜日と時間を分かりやすく表示する

- ~~**ToDo リスト**: <br>課題と今日やるべきことの一覧と提出期限を強調する~~
- **ミニカレンダーの改良**: <br>デザインを改善し、今日の日付を枠で強調する

### 動画視聴ページ

- **動画の表示サイズを大きくする**
- ~~動画視聴時にナビゲーションを隠す~~

### カレンダーページ

- 課題の提出状況が確認できる ※予定
- プルダウンメニューのコース名を授業名へ変更する

## 開発環境

- NodeJS v16.14.0 (node-gyp v8.4.1, npm v8.4.1など) with Volta
- Webpack: JavaScriptモジュールバンドラー
- **VSCode** or Atom: エディター
- **ESLint** + **Prettier**: JavaScript 整形ソフト (使ってください)

## ライセンス

[Apache License version 2.0](LICENSE)([公式リンク](http://www.apache.org/licenses/LICENSE-2.0))

## 連絡先

### バグ報告

GitHub の issue、または [moodle assistant for NITech バグ報告](http://nitech-create.com/forms/moodle-assistant/bug/) へ。

### 質問

GitHub の issue は使用しないでください。[nitechCreateのTwitter](https://twitter.com/nitechCreate)へリプライがおすすめです。

### その他

主な開発者: nitech Create = [KoCSience, Sora513, .bin, smk7758]
