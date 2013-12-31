// ==Taberareloo==
// {
//   "name"        : "Window Capture"
// , "description" : "Capture a viewport"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.9.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.capture.window.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var CAP_QUALITY  = 100;
  var GIF_MAX_SEC  = 10;
  var GIF_INTERVAL = 100;

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

    if (window.GIF) {
      Menus._register({
        title    : 'Photo - Capture - Gif Animation',
        contexts : ['all'],
        onclick: function(info, tab) {
          chrome.tabs.sendMessage(tab.id, {
            request: 'contextMenusCaptureGifAnimation',
            content: info
          });
        }
      }, parent);
    }

    Menus.create();

    setTimeout(function () {
      chrome.contextMenus.update(Menus[parent].id, {
        title : 'Photo - Capture ...'
      }, function() {});
    }, 500);

    TBRL.setRequestHandler('captureGifAnimation', function (req, sender, callback) {
      var pos = req.pos;
      var dim = req.dim;
      var sec = (req.sec > GIF_MAX_SEC) ? GIF_MAX_SEC : req.sec;

      var frames = (sec * 1000) / GIF_INTERVAL;

      var gif = new GIF({
        workers: Math.round(frames / 10) || 1,
        quality: 10,
        workerScript: '/third_party/gifjs/gif.worker.js',
        width: dim.w,
        height: dim.h
      });
      gif.on('finished', function (blob) {
        console.groupEnd();
        TBRL.Notification.notify({
          id      : notification.tag,
          title   : 'Gif Animation',
          message : 'Rendering... Done',
          timeout : 3
        });
        fileToDataURL(blob).addCallback(function (url) {
          callback(url);
        });
      });
      gif.on('progress', function (p) {
        TBRL.Notification.notify({
          id      : notification.tag,
          title   : 'Gif Animation',
          message : 'Rendering... ' + Math.round(p * 100) + '%'
        });
      });

      var canvas = document.createElement('canvas');
      canvas.width  = dim.w;
      canvas.height = dim.h;
      var ctx = canvas.getContext('2d');

      var deferredList = [];
      for (i = 0 ; i < frames ; i++) {
        deferredList.push(new Deferred());
      }

      var images = [];

      function captureGifFrame (frame) {
        if (((frame * GIF_INTERVAL) % 1000) === 0) {
          TBRL.Notification.notify({
            id      : notification.tag,
            title   : 'Gif Animation',
            message : 'Capturing... ' + (frame * GIF_INTERVAL / 1000) + 's'
          });
        }
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { quality : CAP_QUALITY }, function (src) {
          var img = new Image();
          img.onload = function () {
            deferredList[frame].callback();
          };
          img.src = src;
          images.push(img);
        });
        if ((frame + 1) < frames) {
          setTimeout(function () {
            captureGifFrame(frame + 1);
          }, GIF_INTERVAL);
        }
      }

      var notification = null;
      maybeDeferred(TBRL.Notification.notify({
        title   : 'Gif Animation',
        message : 'Capturing...',
        timeout : sec
      })).addCallback(function (n) {
        notification = n;
        captureGifFrame(0);
      });

      return new DeferredList(deferredList).addCallback(function () {
        images.forEach(function (img) {
          ctx.drawImage(img, pos.x, pos.y, dim.w, dim.h, 0, 0, dim.w, dim.h);
          gif.addFrame(ctx, {copy: true, delay: GIF_INTERVAL});
        });
        images.length = 0;
        TBRL.Notification.notify({
          id      : notification.tag,
          title   : 'Gif Animation',
          message : 'Rendering...'
        });
        console.groupCollapsed('gif.render');
        gif.render();
      });
    });

    var views      = [];
    var pageX      = 0;
    var pageY      = 0;
    var originalX  = 0;
    var originalY  = 0;
    var pageWidth  = 0;
    var pageHeight = 0;
    var viewWidth  = 0;
    var viewHeight = 0;

    TBRL.setRequestHandler('capturePage', function (req, sender, callback) {
      views      = [];
      pageX      = req.originalX;
      pageY      = 0;
      originalX  = req.originalX;
      originalY  = req.originalY;
      pageWidth  = req.pageWidth;
      pageHeight = req.pageHeight;
      viewWidth  = req.viewWidth;
      viewHeight = req.viewHeight;
      chrome.tabs.executeScript(sender.tab.id, {
        code  : 'scrollTo(' + pageX + ', ' + pageY + ');',
        runAt : 'document_end'
      }, function() {
        setTimeout(function () {
          captureViewport(sender.tab, callback);
        }, 100);
      });
    });

    function captureViewport(tab, callback) {
      chrome.tabs.captureVisibleTab(tab.windowId, { quality : CAP_QUALITY }, function (src) {
        var img = new Image();
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
        img.src = src;
      });
    }

    function nextViewport(tab, callback) {
      chrome.tabs.executeScript(tab.id, {
        code  : 'scrollTo(' + pageX + ', ' + pageY + ');',
        runAt : 'document_end'
      }, function() {
        setTimeout(function () {
          captureViewport(tab, callback);
        }, 100);
      });
    }

    function createCaptureImage(tab, callback) {
      var canvas = document.createElement('canvas');
      canvas.width  = viewWidth;
      canvas.height = pageHeight;
      var ctx = canvas.getContext('2d');
      pageY = 0;
      views.forEach(function (view) {
        var offset = 0;
        var height = view.height;
        if (pageY > (pageHeight - viewHeight)) {
          offset = pageY + viewHeight - pageHeight;
          height = viewHeight - offset;
        }
        ctx.drawImage(view, 0, offset, viewWidth, height, 0, pageY, viewWidth, height);
        pageY += viewHeight;
      });
      views.length = 0;
      chrome.tabs.executeScript(tab.id, {
        code  : 'scrollTo(' + pageX + ', ' + originalY + ');',
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

  TBRL.setRequestHandler('contextMenusCaptureGifAnimation', function (req, sender, func) {
    func({});
    var ctx = update({
      contextMenu : true,
      captureType : 'GifAnimation'
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

      var dim = getViewportDimensions();
      dim.w = document.body.clientWidth; // without vertical scrollbar
      var scrollbar = window.innerWidth - document.body.clientWidth;
      if (scrollbar > 0) {
        dim.h -= scrollbar; // without horizontal scrollbar
      }

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
          return self.capture(win, { x : 0, y : 0 }, dim);

        case 'Page':
          return self.capturePage(win, getViewportPosition(), dim);

        case 'GifAnimation':
          return self.selectRegion(ctx).addCallback(function (region) {
            var sec = window.prompt("How long do you want to capture? (max " + GIF_MAX_SEC + "s)", 5);
            if (sec) {
              return self.captureGifAnimation(win, region.position, region.dimensions, sec);
            }
            else {
              cancel();
            }
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
    },

    capturePage : function (win, pos, dim) {
      var defer = new Deferred();
      var width = win.innerWidth;
      chrome.runtime.sendMessage(TBRL.id, {
        request    : 'capturePage',
        originalX  : pos.x,
        originalY  : pos.y,
        pageWidth  : document.body.scrollWidth  || document.documentElement.scrollWidth,
        pageHeight : document.body.scrollHeight || document.documentElement.scrollHeight,
        viewWidth  : dim.w,
        viewHeight : dim.h
      }, function (res) {
        base64ToFileEntry(res).addCallback(function (url) {
          defer.callback(url);
        });
      });
      return defer;
    },

    captureGifAnimation : function (win, pos, dim, sec) {
      var defer = new Deferred();
      var width = win.innerWidth;
      chrome.runtime.sendMessage(TBRL.id, {
        request : 'captureGifAnimation',
        pos     : pos,
        dim     : dim,
        sec     : sec
      }, function (res) {
        base64ToFileEntry(res).addCallback(function (url) {
          defer.callback(url);
        });
      });
      return defer;
    },

    selectElement : function (ctx) {
      var deferred = new Deferred();
      var self = this;
      var doc = ctx ? ctx.document : document;

      var target;
      function onMouseOver(e) {
        target = e.target;
        target.originalBackground = target.style.background;
        target.style.background = self.TARGET_BACKGROUND;
      }
      function onMouseOut(e) {
        unpoint(e.target);
      }
      function onClick(e) {
        cancel(e);

        finalize();
        deferred.callback(target);
      }
      function onKeyDown(e) {
        cancel(e);

        switch (keyString(e)) {
        case 'ESCAPE':
          finalize();
          deferred.cancel();
          return;
        }
      }
      function onCntextMenu(e) {
        cancel(e);

        finalize();
        deferred.cancel();
      }
      function unpoint(elm) {
        if (elm.originalBackground !== null) {
          elm.style.background = elm.originalBackground;
          elm.originalBackground = null;
        }
      }
      function finalize() {
        doc.removeEventListener('mouseover', onMouseOver, true);
        doc.removeEventListener('mouseout', onMouseOut, true);
        doc.removeEventListener('click', onClick, true);
        doc.removeEventListener('keydown', onKeyDown, true);
        doc.removeEventListener('contextmenu', onCntextMenu, true);

        unpoint(target);
      }

      doc.addEventListener('mouseover', onMouseOver, true);
      doc.addEventListener('mouseout', onMouseOut, true);
      doc.addEventListener('click', onClick, true);
      doc.addEventListener('keydown', onKeyDown, true);
      doc.addEventListener('contextmenu', onCntextMenu, true);

      return deferred;
    }
  });

})();
