// ==Taberareloo==
// {
//   "name"        : "Window Capture"
// , "description" : "Capture a viewport"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.capture.window.tbrl.js"
// }
// ==/Taberareloo==

(function(exports) {
  if (inContext('background')) {
    Menus._register({
      title    : 'Photo - Capture - Window',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusCaptureWindow',
          content: info
        });
      }
    }, null, 'Photo - Capture', true);
    Menus.create();
    return;
  }

  TBRL.setRequestHandler('contextMenusCaptureWindow', function (req, sender, func) {
    func({});
    var ctx = update({
      contextMenu : true,
      captureType : 'View'
    }, TBRL.createContext(TBRL.getContextMenuTarget()));
    TBRL.share(ctx, Extractors['Photo - Capture'], true);
  });

  update(Extractors['Photo - Capture'], {
    extract : function (ctx) {
      var self = this;
      // ショートカットキーからポストするためcaptureTypeを追加
      // var type = ctx.captureType || input({'Capture Type' : ['Region', 'Element', 'View', 'Page']});
      var type = ctx.captureType || 'Region';
      if (!type) {
        return null;
      }

      var win = ctx.window;
      self.makeOpaqueFlash(ctx.document);

      return succeed().addCallback(function () {
        switch (type) {
        case 'Region':
          return self.selectRegion(ctx).addCallback(function (region) {
            return self.capture(win, region.position, region.dimensions);
          });

        case 'Element':
          return self.selectElement(ctx).addCallback(function (elm) {
            var rect = elm.getBoundingClientRect();
            return self.capture(win, {
              x: Math.round(rect.left),
              y: Math.round(rect.top)
            }, getElementDimensions(elm));
          });

        case 'View':
          return self.capture(win, getViewportPosition(), getViewportDimensions());

        case 'Page':
          return self.capture(win, { x : 0, y : 0 }, {
            w : document.width || document.body.offsetWidth,
            h : document.height || document.body.offsetHeight
          });
        }
        return null;
      }).addCallback(function (file) {
        return {
          type: 'photo',
          item: ctx.title,
          fileEntry: file
        };
      });
    }
  });

})(this);
