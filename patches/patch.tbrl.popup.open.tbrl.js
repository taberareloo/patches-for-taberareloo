// ==Taberareloo==
// {
//   "name"        : "Patch for PR-200"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Patch to open the QuickPostForm at new tab in case of Mac fullscreen mode"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.tbrl.popup.open.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(TBRL.Popup, {
    open : function (tab, ps) {
      var id = 'QuickPost' + (TBRL.Popup.count++);
      var query = queryString({
        'quick': 'true',
        'id': id
      }, true);
      TBRL.Popup.data[id] = {
        'ps': ps,
        'tab': tab
      };
      chrome.windows.get(tab.windowId, function(win) {
        var pos = localStorage.getItem('popup_position');
        if (pos) {
          pos = JSON.parse(pos);
        }
        else {
          pos = {
            top  : 50,
            left : 50
          };
        }
        if ((/mac/i.test(navigator.platform)) && (win.state === 'fullscreen')) {
          chrome.tabs.create({
            windowId : win.id,
            url      : chrome.extension.getURL('popup.html') + query
          });
        }
        else {
          chrome.windows.create({
            url     : chrome.extension.getURL('popup.html') + query,
            top     : win.top  + pos.top,
            left    : win.left + pos.left,
            width   : 450,
            height  : 200,
            focused : true,
            type    : 'popup'
          });
        }
      });
    }
  });
})();
