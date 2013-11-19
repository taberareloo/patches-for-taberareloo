// ==Taberareloo==
// {
//   "name"        : "TheFreeDictionary Search Menu"
// , "description" : "Menu for TheFreeDictionary Search"
// , "include"     : ["background"]
// , "version"     : "1.0.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.tfd.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - TheFreeDictionary',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://www.tfd.com/" + encodeURIComponent(info.selectionText),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
