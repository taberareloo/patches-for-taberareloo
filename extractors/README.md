# Extractors

Extractor とは、Taberareloo から投稿する元のページ及びそこでのコンテンツの抽出方法を定義するスクリプトです。
ここには、Taberareloo 本体でサポートされていない新規の抽出方法が置かれています。

## パッチ一覧

* [extractor.chat.twitter.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.chat.twitter.tbrl.js)  
	Twitter のタイムラインで複数の Tweet を選択して、会話形式で Tumblr に投稿する為のパッチ

* [extractor.feedly.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.feedly.tbrl.js)  
	[Feedly](http://cloud.feedly.com/) の各記事のリンク先をポスト対象する為のパッチ  
	キーボードショートカットは「LDR + Taberareloo」のものと兼用

* [extractor.photo.diet.gif.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.photo.diet.gif.tbrl.js)  
	Tumblrにポストすると動かなくなる gif アニメを減色、縮小、コマの間引き等を行なって問題を回避するためのパッチ。  
	「[Tumblrにポストすると動かなくなるgifアニメを減色して動かすパッチ。](https://github.com/polygonplanet/tombloo/blob/master/tombloo.extractor.diet.gif.js)」から移植  
	[diet-gif](http://diet-gif.herokuapp.com/) を使っている。

* [extractor.quote.hatebu.comment.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.quote.hatebu.comment.tbrl.js)  
	[はてブ](http://b.hatena.ne.jp)のコメントを簡単に Quote するパッチ  
	「[はてブのコメントを簡単に Quote する tombloo パッチ](https://gist.github.com/saitamanodoruji/4263416)」から移植

* [extractor.quote.twitter.dashboard.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.quote.twitter.dashboard.tbrl.js)  
	[Twitter](https://twitter.com/) の Tweet をダッシュボード(ホーム)から簡単に Quote するパッチ  

* [extractor.reblog.googleplus.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.reblog.googleplus.tbrl)  
	[Google+](https://plus.google.com/) の Post をストリームから簡単に ReBlog/ReShare するパッチ

* [extractor.video.fc2.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.fc2.tbrl.js)  
	[FC2](http://video.fc2.com/) の動画を投稿する為のパッチ

* [extractor.video.youku.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.youku.tbrl.js)  
	[Youku](http://www.youku.com/) の動画を投稿する為のパッチ
