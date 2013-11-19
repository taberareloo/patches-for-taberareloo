// ==Taberareloo==
// {
//   "name"        : "Image Search with ImgOps.com"
// , "description" : "Operate image with online image utilities at ImgOps.com"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/oumu/patches-for-taberareloo/master/others/menu.photo.search.imgops.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title    : 'Photo - Search - ImgOps',
    contexts : ['image'],
    onclick  : function(info, tab) {
      if ((info.mediaType !== 'image') || (!info.srcUrl)) return;

      chrome.tabs.create({
        url    : 'http://imgops.com/' + info.srcUrl,
        active : false
      }, function(tab) {
      });
    }
  }, null, 'Photo - Capture', true);

  Menus.create();
})();
