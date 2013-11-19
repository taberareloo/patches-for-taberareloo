// ==Taberareloo==
// {
//   "name"        : "RollingWord Search Menu"
// , "description" : "Menu for RollingWord Search"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/oumu/patches-for-taberareloo/master/others/menu.rollingword.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: 'Quote - Search - 滚去背单词',
    contexts: ['selection'],
    onclick: function (info, tab) {
      chrome.tabs.create({
        url    : "http://rollingword.com/app#query/" + encodeURIComponent(info.selectionText),
        active : false
      });
    }
  }, null, 'Quote', true);
  Menus.create();
})();
