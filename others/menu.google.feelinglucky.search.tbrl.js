// ==Taberareloo==
// {
//   "name"        : "I'm Feeling Lucky Search Menu"
// , "description" : "Menu for Google's I'm Feeling Lucky Search"
// , "include"     : ["background"]
// , "version"     : "1.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.google.feelinglucky.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - Google - I\'m Feeling Lucky',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "https://www.google.com/search" + queryString({
          btnI : 'I\'m+Feeling+Lucky',
          q    : info.selectionText
        }, true),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
