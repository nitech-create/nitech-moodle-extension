# nitech-moodle-chrome

NITech の moodle を使いやすくする Chrome 拡張機能です。<br>
Chrome Extension for NITech moodle(38a).

## 対象

NITech 在校生。

## 注意点

- 開発途中です！
- タブ(ページ)を reload しないと設定が反映されない仕様です！
- 動作確認ブラウザ: Chrome, Kinza
- moodle サイトの表示に改変を加えてるのみで、不正なことは行いません。

### 開発の注意点

- moodle サイトは落ちやすいため、リーロード処理、自分から情報を追加で呼び出すなどはやめること！

## 利用方法(開発版)

1. GitHub コードページの「Code」ボタンから「Download ZIP」より zip ファイルをダウンロード後、展開する。<br>または`git clone`を行う。(※開発版のため)
1. Chromium 系ブラウザ(Chrome, ~~Edge~~, Kinza, ~~Vivaldi~~)にて`chrome://extensions/`(拡張機能のページ)を開く。(打ち消し線は動作未確認)
1. 「デベロッパーモード」を有効にする。
1. 先程入手したフォルダをドラッグ&ドロップする。<br>(または「パッケージ化されていない拡張機能を読み込む」から該当フォルダを選択)
1. NITech moodle サイトへログインし、拡張機能が動作しているか確認する。

## 機能

### 全体

- ナビゲーションのマイコースの項目を授業番号(コース名)から授業名へ変更

### トップページ

- 全体的に配置を大きく変更
- 時間割
- 今日やるべきこと一覧(ToDo リスト)

### 動画視聴ページ

- 動画の表示サイズを大きくする
- 動画視聴時にナビゲーションを隠す

## 開発環境

- jQuery v3.5.1
- VSCode or Atom
- ESLint + Prettier: JavaScript 整形ソフト

## ライセンス

未定

## 連絡先

### バグ報告

GitHub の issue、または Discord の専用チャンネルへ。

### 質問

未定(Twitter で開発者に聞く…？)

### その他

開発者: 未定
