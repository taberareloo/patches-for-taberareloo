// ==Taberareloo==
// {
//   "name"        : "Window Capture"
// , "description" : "Capture a viewport"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.capture.window.tbrl.js"
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

    TBRL.setRequestHandler('capturePage', function (req, sender, callback) {
      var views      = [];
      var pageX      = req.originalX;
      var pageY      = 0;
      var originalX  = req.originalX;
      var originalY  = req.originalY;
      var pageWidth  = req.pageWidth;
      var pageHeight = req.pageHeight;
      var viewWidth  = req.viewWidth;
      var viewHeight = req.viewHeight;

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

      chrome.tabs.executeScript(sender.tab.id, {
        code  : 'scrollTo(' + pageX + ', ' + pageY + ');',
        runAt : 'document_end'
      }, function() {
        setTimeout(function () {
          captureViewport(sender.tab, callback);
        }, 100);
      });
    });

    var GIF_timer    = null;
    var GIF_len      = 0;
    var GIF_frames   = [];
    var GIF_promises = [];
    var GIF_tab      = null;
    var GIF_pos      = {};
    var GIF_dim      = {};
    var GIF_gif      = null;
    var GIF_timeout  = null;

    function captureGifFrame () {
      chrome.tabs.executeScript(GIF_tab.id, {
        code  : 'message=document.querySelector("#taberareloo_capture_message");' +
          'if(message)message.innerHTML="Capturing... ' +
          ((GIF_len++ * GIF_INTERVAL) / 1000).toFixed(1) + 's";',
        runAt : 'document_end'
      }, function() {
      });
      chrome.tabs.captureVisibleTab(GIF_tab.windowId, { quality : CAP_QUALITY }, function (src) {
        GIF_promises.push(new Promise(function (resolve) {
          var img = new Image();
          img.onload = function () {
            resolve();
          };
          img.src = src;
          GIF_frames.push(img);
        }));
      });
    }

    TBRL.setRequestHandler('captureGifAnimationStart', function (req, sender, callback) {
      if (GIF_timer) {
        clearInterval(GIF_timer);
        GIF_timer = null;
      }
      if (GIF_timeout) {
        clearTimeout(GIF_timeout);
        GIF_timeout = null;
      }
      GIF_len = 0;
      GIF_frames.length = 0;
      GIF_promises.length = 0;
      GIF_tab = sender.tab;
      GIF_pos = req.pos;
      GIF_dim = req.dim;
      GIF_gif = null;

      GIF_timer = setInterval(captureGifFrame, GIF_INTERVAL);
      captureGifFrame();
      GIF_timeout = setTimeout(captureGifAnimationAbort, (GIF_MAX_SEC + 1) * 1000);
      callback();
    });

    TBRL.setRequestHandler('captureGifAnimationEnd', function (req, sender, callback) {
      if (GIF_timer) {
        clearInterval(GIF_timer);
        GIF_timer = null;
      }
      if (GIF_timeout) {
        clearTimeout(GIF_timeout);
        GIF_timeout = null;
      }
 
      Promise.all(GIF_promises).then(function () {
        if (!GIF_frames.length) {
          callback(null);
          return;
        }

        GIF_gif = new GIF({
          workers      : Math.round(GIF_frames.length / 10) || 1,
          quality      : 10,
          workerScript : '/third_party/gifjs/gif.worker.js',
          width        : GIF_dim.w,
          height       : GIF_dim.h
        });
        GIF_gif.on('finished', function (blob) {
          console.groupEnd();
          fileToDataURL(blob).then(function (url) {
            callback(url);
          });
        });
        GIF_gif.on('progress', function (p) {
          chrome.tabs.executeScript(GIF_tab.id, {
            code  : 'message=document.querySelector("#taberareloo_capture_message");' +
            'if(message)message.innerHTML="Rendering... ' + Math.round(p * 100) + '%";',
            runAt : 'document_end'
          }, function() {
          });
        });

        var canvas = document.createElement('canvas');
        canvas.width  = GIF_dim.w;
        canvas.height = GIF_dim.h;
        var ctx = canvas.getContext('2d');

        GIF_frames.forEach(function (img) {
          ctx.drawImage(img, GIF_pos.x, GIF_pos.y, GIF_dim.w, GIF_dim.h, 0, 0, GIF_dim.w, GIF_dim.h);
          GIF_gif.addFrame(ctx, {copy: true, delay: GIF_INTERVAL});
        });
        GIF_frames.length = 0;
        console.groupCollapsed('GIF.rendering');
        GIF_gif.render();
      });
    });

    function captureGifAnimationAbort(req, sender, callback) {
      if (GIF_timer) {
        clearInterval(GIF_timer);
        GIF_timer = null;
      }
      if (GIF_timeout) {
        clearTimeout(GIF_timeout);
        GIF_timeout = null;
      }
      if (GIF_gif) {
        GIF_gif.abort();
        GIF_gif = null;
      }
      GIF_frames.length = 0;
      GIF_promises.length = 0;
      console.groupEnd();
      console.warn('captureGifAnimationAbort');
      if (callback) callback();
    }
    TBRL.setRequestHandler('captureGifAnimationAbort', captureGifAnimationAbort);

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

      var dim = getViewportDimensions();
      dim.w = document.body.clientWidth; // without vertical scrollbar
      var scrollbar = window.innerWidth - document.body.clientWidth;
      if (scrollbar > 0) {
        dim.h -= scrollbar; // without horizontal scrollbar
      }

      return defer().then(function () {
        switch (type) {
        case 'Region':
          return self.selectRegion(ctx).then(function (region) {
            return self.capture(win, region.position, region.dimensions);
          });

        case 'Element':
          return self.selectElement(ctx).then(function (elm) {
            var rect = elm.getBoundingClientRect();
            return self.capture(win, {
              x: Math.round(rect.left),
              y: Math.round(rect.top)
            }, getElementDimensions(elm));
          });

        case 'View':
          return self.capture(win, { x : 0, y : 0 }, dim);

        case 'Page':
          return self.capturePage(win, {
            x : document.body.scrollLeft,
            y : document.body.scrollTop
          }, dim);

        case 'GifAnimation':
          return self.selectRegion(ctx).then(function (region) {
            return self.captureGifAnimation(win, region.position, region.dimensions);
          });
        }
        return null;
      }).then(function (file) {
        return {
          type: 'photo',
          item: ctx.title,
          fileEntry: file
        };
      });
    },

    capturePage : function (win, pos, dim) {
      return new Promise(function (resolve) {
        chrome.runtime.sendMessage(TBRL.id, {
          request    : 'capturePage',
          originalX  : pos.x,
          originalY  : pos.y,
          pageWidth  : document.body.scrollWidth  || document.documentElement.scrollWidth,
          pageHeight : document.body.scrollHeight || document.documentElement.scrollHeight,
          viewWidth  : dim.w,
          viewHeight : dim.h
        }, function (res) {
          base64ToFileEntry(res).then(function (url) {
            resolve(url);
          });
        });
      });
    },

    captureGifAnimation : function (win, pos, dim) {
      return new Promise(function (resolve, reject) {
        var doc = win.document;

        var end_timer = null;

        function finalize() {
          if (end_timer) {
            clearTimeout(end_timer);
            end_timer = null;
          }

          win.removeEventListener('beforeunload', finalize, true);
          win.removeEventListener('keydown', onKeyDown, true);

          if (button.classList.contains('capturing')) {
            chrome.runtime.sendMessage(TBRL.id, {
              request : 'captureGifAnimationAbort'
            }, function (res) {
            });
          }

          region.parentNode.removeChild(region);
          style.parentNode.removeChild(style);
        }
        win.addEventListener('beforeunload', finalize, true);

        function onKeyDown(e) {
          cancel(e);
          switch (keyString(e)) {
          case 'ESCAPE':
            finalize();
            reject();
            return;
          }
        }
        win.addEventListener('keydown', onKeyDown, true);

        var style = doc.createElement('style');
        style.innerHTML = [
          '#taberareloo_capture_region {',
          '  box-sizing  : content-box;',
          '}',
          '#taberareloo_capture_region * {',
          '  font-family : Arial, sans-serif;',
          '  font-size   : 16px;',
          '  line-height : 20px;',
          '  box-sizing  : content-box;',
          '}',
          '#taberareloo_capture_region a {',
          '  display         : inline-block;',
          '  float           : right;',
          '  border-radius   : 3px;',
          '  padding         : 5px;',
          '  background      : -webkit-gradient(linear, left top, left bottom, from(#acdeed), to(#acdeed));',
          '  margin-left     : 10px;',
          '  width           : 60px;',
          '  height          : 20px;',
          '  color           : #000;',
          '  text-align      : center;',
          '  text-decoration : none;',
          '  font-weight     : bold;',
          '}',
          '#taberareloo_capture_region a:hover {',
          '  color      : #FFF;',
          '  background : -webkit-gradient(linear, left top, left bottom, from(#0066cc), to(#0e0e69));',
          '}',
          '#taberareloo_capture_region a.disabled {',
          '  color      : #ccc;',
          '  background : -webkit-gradient(linear, left top, left bottom, from(#666), to(#666));',
          '  cursor     : wait',
          '}'
        ].join("\n");
        doc.querySelector('head').appendChild(style);

        var region = doc.createElement('div');
        setStyle(region, {
          'border'   : 'inset 20px rgba(0,0,0,0.7)',
          'border-bottom-width' : '60px',
          'position' : 'fixed',
          'zIndex'   : '999999999',
          'top'      : (pos.y - 20) + 'px',
          'left'     : (pos.x - 20) + 'px',
          'width'    : dim.w + 'px',
          'height'   : dim.h + 'px'
        });
        region.setAttribute('id', 'taberareloo_capture_region');
        doc.body.appendChild(region);
        var ui = $N('div');
        setStyle(ui, {
          'position'    : 'absolute',
          'top'         : (dim.h + 15) + 'px',
          'width'       : '100%'
        });
        ui.innerHTML = [
          '<a id="taberareloo_capture_button" href="#">Start</a>',
          '<a id="taberareloo_capture_cancel" href="#">Cancel</a>',
          '<div id="taberareloo_capture_message"></div>'
        ].join("\n");
        region.appendChild(ui);
        var message = doc.querySelector("#taberareloo_capture_message");
        setStyle(message, {
          'color'   : 'white',
          'padding' : '5px'
        });
        message.innerHTML = 'Max ' + GIF_MAX_SEC + ' seconds';
        var btnCancel = doc.querySelector("#taberareloo_capture_cancel");
        btnCancel.addEventListener('click', function (e) {
          cancel(e);
          finalize();
          reject();
          return false;
        }, true);
        var button = doc.querySelector("#taberareloo_capture_button");
        button.addEventListener('click', function onClick(e) {
          if (e) {
            cancel(e);
          }

          if (end_timer) {
            clearTimeout(end_timer);
            end_timer = null;
          }

          if (button.classList.contains('disabled')) {
            return false;
          }

          if (button.classList.contains('capturing')) {
            button.classList.add('disabled');
            chrome.runtime.sendMessage(TBRL.id, {
              request : 'captureGifAnimationEnd'
            }, function (res) {
              button.classList.remove('capturing');
              finalize();
              if (res) {
                base64ToFileEntry(res).then(function (url) {
                  resolve(url);
                });
              } else {
                reject();
              }
            });
          } else {
            button.classList.add('capturing');
            button.innerHTML = 'Stop';
            chrome.runtime.sendMessage(TBRL.id, {
              request : 'captureGifAnimationStart',
              pos     : pos,
              dim     : dim
            }, function (res) {
              end_timer = setTimeout(onClick, GIF_MAX_SEC * 1000);
            });
          }

          return false;
        }, true);

        region.focus();
      });
    }
  });

})();
