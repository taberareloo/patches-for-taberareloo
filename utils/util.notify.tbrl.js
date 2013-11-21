// ==Taberareloo==
// {
//   "name"        : "Notification for content scripts"
// , "description" : "Notify a message from content scripts"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/utils/util.notify.tbrl.js"
// }
// ==/Taberareloo==

/*
Usage:
  chrome.runtime.sendMessage(TBRL.id, {
    request : "notify",
    options : {
      title   : 'タイトル',
      message : 'メッセージ',
      timeout : 3,
      onclick : function() {
        this.close();
      }
    }
  }, function(notification) {});
*/

(function() {
  TBRL.setRequestHandler('notify', function (req, sender, func) {
    TBRL.Notification.notify(req.options).addCallback(function (notification) {
      func(notification);
    });
  });
})();
