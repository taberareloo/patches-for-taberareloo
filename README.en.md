# Patches for Taberareloo

Here is a patch repository for [Taberareloo](https://github.com/Constellation/taberareloo).

## Requirements

* [Google Chrome](http://www.google.com/chrome) 26+
* [Taberareloo](https://chrome.google.com/webstore/detail/taberareloo/ldcnohnnlpgglecmkldelbmiokgmikno) 3.0.3+

## Filename

A patch for Taberareloo must have an extension `.tbrl.js`. Otherwise, it won't be installed.

The file name is a key in the Taberareloo patch system, so it must be unique in the entire system.

## Metadata

A patch must have a metadata about its patch.

	// ==Taberareloo==
	// {
	//	 "name"        : "Patch Name"
	// , "description" : "Patch Description"
	// , "include"     : ["background", "content"]
	// , "match"       : ["https://*/*"]
	// , "version"     : "1.0.0"
	// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch_file_name.tbrl.js"
	// }
	// ==/Taberareloo==

* The metadata area in a patch must start with `// ==Taberareloo==` line and end with `// ==/Taberareloo==` line.
* The metadata is a JSON format led by `//` at each line and commented out.
* Each key and value must be quoted by double-quote `""`.

* `"name"`        : The name of a patch (optional)

* `"description"` : The description of a patch (optional)

* `"include"`     : An array of target contexts ("background", "content", "popup" and/or "options")  
	"background" : The background context of Taberareloo  
	"content"    : A page context opened in a browser tab  
	"popup"      : The popup window in which the QuickPostForm is (v3.0.1~)  
	"options"    : The option page (v3.0.3~)

* `"match"`       : An array of target page patterns, if `"include"` has "content".  
	The match patterns are equivalent of [Match Patterms of Google Chrome](http://developer.chrome.com/extensions/match_patterns.html).  
	If `"include"` doesn't have "content", it's ignored.

* `"version"`     : The version of a patch (optional)  
	The version format uses [Semantic Versioning](http://semver.org/).

* `"downloadURL"` : A URL where a patch can be found and installed (optional)  
	Taberareloo uses this URL and `"version"` to check updates of its patch and notifies it to you.

## Installation

A patch can be installed by right-clicking and selecting `Patch - Install this` in the Taberareloo context menu on a remote file like `"downloadURL"`, or from a local file at the Patch tab in the options page of Taberareloo.

![](https://lh4.googleusercontent.com/-FLTw9_8eUPY/UUu64q4-zyI/AAAAAAAAHyc/lN9pqKA3LIw/s438/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88+2013-03-21+6.57.55+PM.png)
![](https://lh4.googleusercontent.com/-W4ccbC3XZ2w/UVet7riNt9I/AAAAAAAAICE/x2JwC6F-czg/s782/Taberareloo+Option+2013-03-30+20-30-13.jpg)

## Updates Notification

If the metadata in a patch has `"downloadURL"` and `"version"`, Taberareloo will check updates of its patch automatically by comparing `"version"` in `"downloadURL"` and `"version"` in the installed patch.
And also users can check manually by clicking the button "Check Updates" at the Patch tab in the options page of Taberareloo.

![](https://lh6.googleusercontent.com/-18SdpKcMTAI/UVet-Sc0w1I/AAAAAAAAICM/c-r-ajgv18E/s782/Taberareloo+Option+2013-03-30+20-30-34.jpg)

## Contributing

1. Fork it.
1. Create a branch (git checkout -b my_patch)
1. Commit your changes (git commit -am "Added My Patch")
1. Push to the branch (git push origin my_patch)
1. Open a Pull Request