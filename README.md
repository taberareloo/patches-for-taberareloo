# Patches for Taberareloo

ここは、[Taberareloo](https://github.com/Constellation/taberareloo) のパッチ・レポジトリです。

## ファイル名

Taberareloo 用のパッチ・ファイルは、`.tbrl.js` の拡張子が必要です。これ以外の拡張子はインストールされません。

現在の Taberareloo のパッチ機構は、ファイル名がキーになっているので、インストールするファイル名は拡張内でユニークである必要があります。

## メタデータ

パッチ・ファイルに先頭には、以下のようなパッチに関するメタデータが必要です。

	// ==Taberareloo==
	// {
	//	 "name"        : "Patch Name"
	// , "description" : "Patch Description"
	// , "include"     : ["background", "content"]
	// , "match"       : ["https://*/*"]
	// , "version"     : "1.0"
	// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch_file_name.tbrl.js"
	// }
	// ==/Taberareloo==

* メタデータの領域は、`// ==Taberareloo==` の行で始まり、`// ==/Taberareloo==` で終了しなければなりません。
* メタデータは、行の先頭を `//` でコメントアウトされた JSON フォーマットです。
* JSON のそれぞれのキーや値は、ダブルクォート `""` で囲まれていなければなりません。

* `"name"`        : パッチの名前 (省略可、その場合はファイル名が名前になります)

* `"description"` : パッチの説明 (省略可)

* `"include"`     : パッチが適用されるページを配列で指定します ("background" または "content"、またはその両方)  
	"background" : Taberareloo 拡張本体の Background ページ  
	"content"    : ブラウザのタブで開かれたページ

* `"match"`       : `"include"` に "content" が指定された場合に、適用されるページの URL のパターンを配列で指定します。  
	マッチングに使われるパターンの記法は、[Match Patterms of Google Chrome](http://developer.chrome.com/extensions/match_patterns.html) に準拠します。  
	`"include"` が "background" のみの場合は、無視されます。

* `"version"`     : パッチのバージョン (省略可)

* `"downloadURL"` : パッチの提供元であるインストール可能なパッチ・ファイルへの URL を指定します。 (省略可)

## インストール

パッチは、`"downloadURL"` で示されるようなリモートのパッチ・ファイル上で右クリックから `Patch - Install this` を選択することでインストール出来ます。
また、Taberareloo のオプション・ページのパッチ・タブでローカル・ファイルからもインストール出来ます。

![](https://lh4.googleusercontent.com/-FLTw9_8eUPY/UUu64q4-zyI/AAAAAAAAHyc/lN9pqKA3LIw/s438/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88+2013-03-21+6.57.55+PM.png)
![](https://lh6.googleusercontent.com/-OFMtZgk4yqk/UUu63gOPurI/AAAAAAAAHyU/VIqb--1IMNY/s782/Taberareloo+Option+2013-03-21+18-57-36.jpg)

## 参加の仕方

1. フォークして、
1. ブランチを作って、 (git checkout -b my_patch)
1. パッチをコミットして、 (git commit -am "Added My Patch")
1. ブランチをプッシュして、 (git push origin my_patch)
1. Pull Request して下さい