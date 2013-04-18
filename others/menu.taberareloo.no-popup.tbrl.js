// ==Taberareloo==
// {
//   "name"        : "Post without the popup window"
// , "description" : "Post without the popup window"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.taberareloo.no-popup.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (TBRL.ID) { // Is it in the background context?
    var name = 'Taberareloo - Taberareloo';
    Menus._register({
      title    : name,
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusNoPopup',
          content: info
        });
      }
    }, null, 'Taberareloo');

    Menus.create();

    onRequestsHandlers.updateContextMenu = function(req, sender, func) {
      var menu_id = Menus[name].id;
      var title   = 'Taberareloo - ' + req.extractor.name;
      chrome.contextMenus.update(menu_id, {
        title : title
      }, function() {
        func({});
      });
    };

    return;
  }

  onRequestHandlers.contextMenusNoPopup = function(req, sender, func) {
    func({});
    var content = req.content;
    var ctx = {};
    var query = null;
    switch (content.mediaType) {
      case 'video':
        ctx.onVideo = true;
        ctx.target = $N('video', {
          src: content.srcUrl
        });
        query = 'video[src="'+content.srcUrl+'"]';
        break;
      case 'audio':
        ctx.onVideo = true;
        ctx.target = $N('audio', {
          src: content.srcUrl
        });
        query = 'audio[src="'+content.srcUrl+'"]';
        break;
      case 'image':
        ctx.onImage = true;
        ctx.target = $N('img', {
          src: content.srcUrl
        });
        query = 'img[src="'+content.srcUrl+'"]';
        break;
      default:
        if (content.linkUrl) {
          // case link
          ctx.onLink = true;
          ctx.link = ctx.target = $N('a', {
            href: content.linkUrl
          });
          ctx.title = content.linkUrl;
          query = 'a[href="'+content.linkUrl+'"]';
        }
        break;
    }
    update(ctx, TBRL.createContext((query && document.querySelector(query)) || TBRL.getContextMenuTarget()));
    TBRL.share(ctx, Extractors.check(ctx)[0], false);
  };

  function updateContextMenu(event) {
    var ctx = {};
    switch (event.target.nodeName) {
    case 'IMG':
      ctx.onImage = true;
      ctx.target  = event.target;
      break;
    case 'A':
      ctx.onLink = true;
      ctx.link   = event.target;
      ctx.title  = event.target.title || event.target.text.trim() || event.target.href;
      break;
    }
    update(ctx, TBRL.createContext(event.target));

    var extractor = Extractors.check(ctx)[0];

    chrome.extension.sendMessage(TBRL.id, {
      request   : "updateContextMenu",
      extractor : extractor
    }, function(res){
    });
  }

  window.addEventListener("mousedown", function(event) {
    if (event.button === 2) {
      updateContextMenu(event);
    }
  }, true);
  document.addEventListener("mousedown", function(event) {
    if (event.button === 2) {
      updateContextMenu(event);
    }
  }, true);

  window.addEventListener("contextmenu", function(event) {
    updateContextMenu(event);
  }, true);
  document.addEventListener("contextmenu", function(event) {
    updateContextMenu(event);
  }, true);
})();
