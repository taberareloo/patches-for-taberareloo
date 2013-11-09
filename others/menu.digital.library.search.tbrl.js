// ==Taberareloo==
// {
//   "name"        : "Digital Library Search Menu"
// , "description" : "Menu for 近代デジタルライブラリー http://kindai.ndl.go.jp/"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.digital.library.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - 近代デジタルライブラリー',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://kindai.ndl.go.jp/search/searchResult" + queryString({
          SID        : 'kindai',
          searchWord : info.selectionText
        }, true),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
