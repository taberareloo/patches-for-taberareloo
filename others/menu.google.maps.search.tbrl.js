// ==Taberareloo==
// {
//   "name"        : "Google Maps Search Menu"
// , "description" : "Menu for Google Maps Search"
// , "include"     : ["background"]
// , "version"     : "0.1.2"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.google.maps.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - Google Maps',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "https://maps.google.com/" + queryString({
          q : info.selectionText
        }, true),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
