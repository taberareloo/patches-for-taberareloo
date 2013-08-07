// ==Taberareloo==
// {
//   "name"        : "Window Capture"
// , "description" : "Capture a viewport"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.5.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.capture.window.tbrl.js"
// }
// ==/Taberareloo==

(function(exports) {
  if (inContext('background')) {
    var parent = 'Photo - Capture';

    Menus._register({
      title: 'Photo - Capture - Area',
      contexts: ['all'],
      onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusCapture',
          content: info
        });
      }
    }, parent);
    Menus._register({
      title    : 'Photo - Capture - Element',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusCaptureElement',
          content: info
        });
      }
    }, parent);
    Menus._register({
      title    : 'Photo - Capture - Window',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusCaptureWindow',
          content: info
        });
      }
    }, parent);
    Menus._register({
      title    : 'Photo - Capture - Page',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusCapturePage',
          content: info
        });
      }
    }, parent);
    Menus.create();

    setTimeout(function () {
      chrome.contextMenus.update(Menus[parent].id, {
        title : 'Photo - Capture ...'
      }, function() {});
    }, 500);

    var originalY  = 0;
    var views      = [];
    var pageY      = 0;
    var pageWidth  = 0;
    var pageHeight = 0;
    var viewHeight = 0;

    TBRL.setRequestHandler('capturePage', function (req, sender, callback) {
      originalY  = req.originalY;
      views      = [];
      pageY      = 0;
      pageWidth  = req.pageWidth;
      pageHeight = req.pageHeight;
      viewHeight = req.viewHeight;
      chrome.tabs.executeScript(sender.tab.id, {
        code  : 'scrollTo(0, ' + pageY + ');',
        runAt : 'document_end'
      }, function() {
        setTimeout(function () {
          captureViewport(sender.tab, callback);
        }, 500);
      });
    });

    function captureViewport(tab, callback) {
      chrome.tabs.captureVisibleTab(tab.windowId, { format : 'png' }, function (src) {
        var img = new Image();
        img.src = src;
        img.onload = function() {
          views.push(this);
          if ((pageHeight - pageY) <= viewHeight) {
            createCaptureImage(tab, callback);
          }
          else {
            pageY += viewHeight;
            if (pageY > (pageHeight - viewHeight)) {
              pageY = pageHeight - viewHeight;
            }
            nextViewport(tab, callback);
          }
        };
      });
    }

    function nextViewport(tab, callback) {
      chrome.tabs.executeScript(tab.id, {
        code  : 'scrollTo(0, ' + pageY + ');',
        runAt : 'document_end'
      }, function() {
        setTimeout(function () {
          captureViewport(tab, callback);
        }, 500);
      });
    }

    function createCaptureImage(tab, callback) {
      var canvas = document.createElement('canvas');
      canvas.width  = pageWidth;
      canvas.height = pageHeight;
      var ctx = canvas.getContext('2d');
      pageY = 0;
      for (var i = 0, len = views.length ; i < len; i++) {
        var offset = 0;
        var height = views[i].height;
        if (pageY > (pageHeight - viewHeight)) {
          offset = pageY + viewHeight - pageHeight;
          height = viewHeight - offset;
        }
        ctx.drawImage(views[i], 0, offset, pageWidth, height, 0, pageY, pageWidth, height);
        views[i] = null;
        pageY += viewHeight;
      }
      views.length = 0;
      chrome.tabs.executeScript(tab.id, {
        code  : 'scrollTo(0, ' + originalY + ');',
        runAt : 'document_end'
      }, function() {
        callback(canvas.toDataURL('image/png', ''));
        canvas = null;
      });
    }

    return;
  }

  TBRL.setRequestHandler('contextMenusCaptureElement', function (req, sender, func) {
    func({});
    var ctx = update({
      contextMenu : true,
      captureType : 'Element'
    }, TBRL.createContext(TBRL.getContextMenuTarget()));
    TBRL.share(ctx, Extractors['Photo - Capture'], true);
  });

  TBRL.setRequestHandler('contextMenusCaptureWindow', function (req, sender, func) {
    func({});
    var ctx = update({
      contextMenu : true,
      captureType : 'View'
    }, TBRL.createContext(TBRL.getContextMenuTarget()));
    TBRL.share(ctx, Extractors['Photo - Capture'], true);
  });

  TBRL.setRequestHandler('contextMenusCapturePage', function (req, sender, func) {
    func({});
    var ctx = update({
      contextMenu : true,
      captureType : 'Page'
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
          return self.capture(win, { x : 0, y : 0 }, getViewportDimensions());

        case 'Page':
          return self.capturePage(win, { x : 0, y : 0 }, getViewportDimensions());
        }
        return null;
      }).addCallback(function (file) {
        return {
          type: 'photo',
          item: ctx.title,
          fileEntry: file
        };
      });
    },

    capturePage : function (win, pos, dim) {
      var defer = new Deferred();
      var width = win.innerWidth;
      chrome.runtime.sendMessage(TBRL.id, {
        request    : 'capturePage',
        originalY  : document.body.scrollTop || document.documentElement.scrollTop,
        pageWidth  : document.width || document.body.offsetWidth,
        pageHeight : document.height || document.body.offsetHeight,
        viewHeight : dim.h
      }, function (res) {
        base64ToFileEntry(res).addCallback(function (url) {
          defer.callback(url);
        });
      });
      return defer;
    }
  });

})(this);
