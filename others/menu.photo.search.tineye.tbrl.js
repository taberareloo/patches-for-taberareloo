// ==Taberareloo==
// {
//   "name"        : "Image Search with TinEye.com"
// , "description" : "Search Creative Commons images at TinEye.com"
// , "include"     : ["background"]
// , "version"     : "1.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.photo.search.tineye.tbrl.js"
// }
// ==/Taberareloo==

// https://github.com/to/tombloo/blob/master/patches/action.TinEye.js

(function() {
  Menus._register({
    title    : 'Photo - Search - TinEye',
    contexts : ['image'],
    onclick  : function(info, tab) {
      if ((info.mediaType !== 'image') || (!info.srcUrl)) return;

      chrome.tabs.create({
        url    : 'http://www.tineye.com/search/?url=' + encodeURIComponent(info.srcUrl),
        active : false
      }, function(tab) {
      });
    }
  }, null, 'Photo - Capture', true);

  Menus.create();
})();
