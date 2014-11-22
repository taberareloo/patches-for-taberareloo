// ==Taberareloo==
// {
//   "name"        : "Book Meta Search System Menu"
// , "description" : "Menu for 書籍横断検索システム http://book.tsuhankensaku.com/hon/"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.book.meta.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - 書籍横断検索',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://book.tsuhankensaku.com/hon/" + queryString({
          t : 'booksearch',
          q : info.selectionText
        }, true),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
