# Others

ここには、各パッチ・カテゴリに当てはまらないその他のパッチが置かれています。

## パッチ一覧

* <del>[menu.backup.config.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.backup.config.tbrl.js)  
	Taberareloo のオプションの設定データをバックアップ／リストアする為のパッチ(実験中。Experimental)  
	バックアップは、設定データを含んだ DataURL が生成されるので、それをブックマークします。  
	リストアは、ブックマークした DataURL のページを開いて行います。  
	※) リストア時のパッチは全て新規にダウンロード／インストールされます。  
	※) ローカルファイルからインストールしたパッチは復元されません。(ただし、downloadURL が設定されているものは、downloadURL からインストールされます。)</del>  
	Taberareloo v 3.0.3 よりバックアップ／リストア機能が実装されました。

* [menu.gunosy.rss.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.gunosy.rss.tbrl.js)  
	[Gunosy](http://gunosy.com) の RSS フィード生成 Web サービス [Gunosy RSS](http://dai-shi.github.io/gunosy-rss/) の上級者向け RSS リンク(学習可能バージョン)を自動生成するツール

* [menu.make.posts.private.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.make.posts.private.tbrl.js)  
	投稿を非公開(Private)にする為のパッチ。  
	対応サービス(Tumblr, Pinboard, Delicious, YahooBookmarks, Diigo, Zootool)

* [menu.photo.search.ascii2d.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.photo.search.ascii2d.tbrl.js)  
	選択した画像を [二次元画像詳細検索](http://www.ascii2d.net/imagesearch) で検索するパッチ

* [menu.photo.search.tineye.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.photo.search.tineye.tbrl.js)  
	選択した画像を [TinEye](http://www.tineye.com) で検索するパッチ
	https://github.com/to/tombloo/blob/master/patches/action.TinEye.js から移植。

* [menu.preset.models.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.preset.models.tbrl.js)  
	予めプリセットした投稿先に振り分けて投稿する為のメニューを追加するパッチ。(実験中。Experimental)  
	Gestures と KeyConfig との連携も追加。  
	ダウンロードしてから、PRESET_MODELS (24−25行目) の部分を自分の好きな投稿先に変更してオプションページよりインストールして下さい。

* [menu.taberareloo.no-popup.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.taberareloo.no-popup.tbrl.js)  
	Tombloo のようにコンテキストに合わせたメニューを動的に生成しつつ、ポップアップ画面無しで投稿できるようにするパッチ(実験中。Experimental)

* [menu.view.tumblr.dashboard.tbrl.js](https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.view.tumblr.dashboard.tbrl.js)  
	Tumblr のアーカイブ(個別)ページからそのページを含む DashBoard のページを表示する為のパッチ(実験中。Experimental)  
	※) Custom Domain では動作しません。Follow 中でないもの(DashBoardに元々無いもの)はうまくいかないようです。  
	https://github.com/polygonplanet/tombloo/blob/master/tombloo.model.tumblr.view.dashboard.by.permalink.js から一部を移植。
