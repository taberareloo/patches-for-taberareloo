// ==Taberareloo==
// {
//   "name"        : "Google Image Search Menu"
// , "description" : "Menu for Google Image Search"
// , "include"     : ["background"]
// , "version"     : "2.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.google.image.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus.remove('Photo - Search - GoogleImage');
  Menus._register({
    title: 'Photo - Search - GoogleImage',
    contexts: ['image'],
    onclick: function (info, tab) {
      if ((info.mediaType !== 'image') || (!info.srcUrl)) return;

      chrome.tabs.create({
        url    : "http://www.google.co.jp/searchbyimage" + queryString({
          image_url : info.srcUrl
        }, true),
        active : false
      });
    }
  }, null, 'Photo - Capture', true);
  Menus.create();
})();
