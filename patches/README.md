# Patches

ここには、Taberareloo 本体で使用されているスクリプトへのパッチが置かれています。

## パッチ一覧

* <del>[patch.model.delicious.getinfo.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.delicious.getinfo.tbrl.js)  
	[Delicious](https://delicious.com) の下記の問題に対応するパッチ。  
	https://github.com/Constellation/taberareloo/issues/183</del>

* [patch.model.delicious.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.delicious.tbrl.js)  
	[Delicious](https://delicious.com) の新デザイン／APIに対応させる為のパッチ。

* <del>[patch.model.googleplus.icon.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.icon.tbrl.js)  
	Taberareloo 内で使用されている [Google+](https://plus.google.com) アイコンを最新のものに差し替えるパッチ。</del>  
	Taberareloo v 3.0.2 より Google+ の新しい API 対応に統合されました。

* [patch.model.googleplus.post.fullimage.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.post.fullimage.tbrl.js)  
	[Google+](https://plus.google.com) への全ての画像投稿を「Upload from cache」と同様にアップロードしてフルサイズの画像を投稿するパッチ。

* <del>[patch.model.googleplus.quote.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.quote.tbrl.js)  
  [Google+](https://plus.google.com) に長い引用を投稿すると、200 文字でカットされてしまうのを、本文欄に移すことによって全文引用を可能にしるパッチ。</del>  
  Taberareloo v 3.0.2 より Google+ の新しい API 対応に統合されました。

* [patch.model.pinterest.repin.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.pinterest.repin.tbrl.js)  
	[Pinterest](http://pinterest.com) のダッシュボードのサムネイル表示から直接投稿する為のパッチ。

* [patch.model.twitter.createstatus.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.twitter.createstatus.tbrl.js)  
	[Twitter](https://twitter.com) への投稿で文字数オーバーを避ける為のパッチ。

* [patch.tumblr.getform.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.tumblr.getform.tbrl.js)  
	[Tumblr](http://www.tumblr.com) への投稿で Twitter/Facebook への共有を有効にしている場合、Taberareloo のオプションに関わらず、自動的にTumblrでの設定を使用する為のパッチ。ダッシュボードでの高速化も追加。

* [patch.util.checkhttps.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.util.checkhttps.tbrl.js)  
	URL が HTTPS で始まるページや画像を投稿しようとすると、投稿ポップアップ画面にワーニングが表示されますが、それを抑制するパッチ。
