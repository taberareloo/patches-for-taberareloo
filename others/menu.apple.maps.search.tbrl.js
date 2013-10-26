// ==Taberareloo==
// {
//   "name"        : "Apple Maps Search Menu"
// , "description" : "Menu for Apple Maps Search"
// , "include"     : ["background"]
// , "version"     : "0.1.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.apple.maps.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - Apple Maps',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://maps.apple.com/" + queryString({
          q : info.selectionText
        }, true),
        active : false
      }, function (tab) {
        setTimeout(function () {
          chrome.tabs.remove(tab.id);
        }, 500);
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
