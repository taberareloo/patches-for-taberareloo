# Patches for Taberareloo

Here is a patch repository for [Taberareloo](https://github.com/Constellation/taberareloo).

## Filename

* A patch for Taberareloo must have an extension ".tbrl.js". Otherwise, it won't be installed.
* The file name is a key in the Taberareloo patch system, so it must be unique in the entire system.

## Metadata

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

* A patch must have a metadata about its patch.
* The metadata area in a patch must start with "// ==Taberareloo==" line and end with "// ==/Taberareloo==" line.
* The metadata is a JSON format led by "//" at each line and commented out.
* "name"        : The name of a patch (optional)
* "description" : The description of a patch (optional)
* "include"     : An array of target contexts ("background" and/or "content")  
	"background" : The background context of Taberareloo  
	"content"    : A page context opened in a browser tab
* "match"       : An array of target page patterns, if "include" has "content".  
	The match patterns are equivalent of [Match Patterms of Google Chrome](http://developer.chrome.com/extensions/match_patterns.html).  
	If "include" has only "background", it's ignored.
* "version"     : The version of a patch (optional)
* "downloadURL" : A URL where a patch can be found and installed (optional)

## Installation

* A patch can be installed from a local file at the options page of Taberareloo, or by selecting "Patch - Install this" in the Taberareloo context menu on a remote file pointed by "downloadURL".

![](https://lh6.googleusercontent.com/-OFMtZgk4yqk/UUu63gOPurI/AAAAAAAAHyU/VIqb--1IMNY/s782/Taberareloo+Option+2013-03-21+18-57-36.jpg)
![](https://lh4.googleusercontent.com/-FLTw9_8eUPY/UUu64q4-zyI/AAAAAAAAHyc/lN9pqKA3LIw/s438/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88+2013-03-21+6.57.55+PM.png)