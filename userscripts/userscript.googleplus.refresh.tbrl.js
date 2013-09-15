// ==Taberareloo==
// {
//   "name"        : "Google+ Auto Refresh"
// , "description" : "Get new posts on Google+ automatically"
// , "include"     : ["background", "content"]
// , "match"       : ["https://plus.google.com/*"]
// , "version"     : "0.6.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/userscripts/userscript.googleplus.refresh.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    var auto_refresh = (localStorage.getItem('googleplus_auto_refresh') === 'true') || false;

    var documentUrlPatterns = [
      'https://plus.google.com/*'
    ];
    Menus._register({
      type     : 'separator',
      contexts : ['all'],
      documentUrlPatterns : documentUrlPatterns
    });
    Menus._register({
      type     : 'checkbox',
      title    : 'Option - Google+ Auto Refresh',
      checked  : auto_refresh,
      contexts : ['all'],
      documentUrlPatterns : documentUrlPatterns,
      onclick  : function(info, tab) {
        auto_refresh = info.checked;
        localStorage.setItem('googleplus_auto_refresh', auto_refresh);
      }
    });
    Menus.create();

    var previous_message      = '';
    var previous_notification = null;
    TBRL.setRequestHandler('googleplus_notify', function (req, sender, func) {
      if (previous_message !== req.content.message) {
        previous_message = req.content.message;
        var notification = update({}, req.content);
        if (auto_refresh) {
          notification.timeout = 3;
        }
        notification.onclick = function() {
          chrome.tabs.update(sender.tab.id, {
            active : true
          });
          chrome.tabs.sendMessage(sender.tab.id, {
            request : 'googleplus_refresh',
            force   : true
          });
          previous_message      = '';
          previous_notification = null;
          this.close();
        };
        if (previous_notification) {
          previous_notification.close();
        }
        previous_notification = TBRL.Notification.notify(notification);
      }
      if (auto_refresh) {
        chrome.tabs.sendMessage(sender.tab.id, {
          request : 'googleplus_refresh',
          force   : false
        });
      }
    });
    return;
  }

  var timer = null;

  var button_selector = 'div[role="button"].c-b-M';
  var message_class   = 'M4DNS';
  var reload_class    = 'AcWGPc';
  var resume_class    = 'QZZuJ';

  function check_message() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    var button = document.body.querySelector(button_selector);
    if (button) {
      var message = $X('./div[@class="'+ message_class + '"]/text()', button)[0];
      var resume  = $X('./div[@class="'+ resume_class + '"]', button)[0];

      if (message && !resume) {
        chrome.runtime.sendMessage(TBRL.id, {
          request : 'googleplus_notify',
          content : {
            title   : 'New Post on Google+',
            message : message
          }
        });
      }
    }
    timer = setTimeout(check_message, 5 * 1000);
  }

  check_message();

  function can_refresh() {
    if (document.body.scrollTop) return false;
    var notifications_box = document.body.querySelector('#gbwc');
    if (!notifications_box || (notifications_box.style.length === 0) || (notifications_box.style.display === 'none')) {
      return true;
    }
    return false;
  }

  TBRL.setRequestHandler('googleplus_refresh', function (req, sender, func) {
    if (can_refresh() || req.force) {
      var button = document.body.querySelector(button_selector);
      if (button) {
        var reload = $X('./div[@class="'+ reload_class + '"]', button)[0];
        if (reload) button.click();
      }
    }
  });
})();
