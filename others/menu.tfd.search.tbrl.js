// ==Taberareloo==
// {
//   "name"        : "TheFreeDictionary Search Menu"
// , "description" : "Menu for TheFreeDictionary Search"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/oumu/patches-for-taberareloo/master/others/menu.tfd.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - TheFreeDictionary',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://www.tfd.com/" + info.selectionText,
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
