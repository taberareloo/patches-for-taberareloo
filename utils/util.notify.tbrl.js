// ==Taberareloo==
// {
//   "name"        : "Notification for content scripts"
// , "description" : "Notify a message from content scripts"
// , "include"     : ["background"]
// , "version"     : "0.1.1"
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
  var version = chrome.runtime.getManifest().version;
  version = version.split('.');
  if (version.length > 3) {
    version.pop();
  }
  version = version.join('.');
  if (semver.gte(version, '3.0.12')) {
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/utils/util.notify.tbrl.js', true);
    return;
  }

  TBRL.setRequestHandler('notify', function (req, sender, func) {
    TBRL.Notification.notify(req.options).addCallback(function (notification) {
      func(notification);
    });
  });
})();
