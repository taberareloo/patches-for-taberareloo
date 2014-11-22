// ==Taberareloo==
// {
//   "name"        : "Google+ Auto Refresh"
// , "description" : "Get new posts on Google+ automatically"
// , "include"     : ["background", "content"]
// , "match"       : ["https://plus.google.com/*"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/userscripts/userscript.googleplus.refresh.tbrl.js"
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
          chrome.windows.update(sender.tab.windowId, {
            focused : true
          });
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
          previous_notification = null;
        }
        Promise.resolve(TBRL.Notification.notify(notification)).then(function (n) {
          previous_notification = n;
        });
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

  var notifications_id = '#gbwc, #gbsfw';
  var button_selector  = 'div[role="button"].c-b-M, div[role="button"].b-c-T, div[role="button"].b-c-U';
  var message_selector = 'div.M4DNS, div.lZb, div.g1b';
  var reload_selector  = 'div.AcWGPc, div.cBc, div.eBc, div.rDc, div.tDc';
  var resume_selector  = 'div.QZZuJ, div.dBc, div.sDc';

  function check_message() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    var button = document.querySelector(button_selector);
    if (button) {
      var message = button.querySelector(message_selector);
      var resume  = button.querySelector(resume_selector);

      if (message && !resume) {
        chrome.runtime.sendMessage(TBRL.id, {
          request : 'googleplus_notify',
          content : {
            title   : 'New Post on Google+',
            message : message.innerText
          }
        });
      }
    }
    timer = setTimeout(check_message, 5 * 1000);
  }

  check_message();

  function can_refresh() {
    if (document.body.scrollTop) return false;
    var notifications_box = document.querySelector(notifications_id);
    var style = document.defaultView.getComputedStyle(notifications_box, '');
    if (!notifications_box || (notifications_box.style.length === 0) || (notifications_box.style.display === 'none') || (style.display === 'none')) {
      return true;
    }
    return false;
  }

  TBRL.setRequestHandler('googleplus_refresh', function (req, sender, func) {
    if (can_refresh() || req.force) {
      var button = document.querySelector(button_selector);
      if (button) {
        var reload = button.querySelector(reload_selector);
        if (reload) button.click();
      }
    }
  });
})();
