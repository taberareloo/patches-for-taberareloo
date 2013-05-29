// ==Taberareloo==
// {
//   "name"        : "Chat Extractor for Twitter"
// , "description" : "Extract tweets as a conversation"
// , "include"     : ["background", "content"]
// , "match"       : ["*://twitter.com/*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.chat.twitter.tbrl.js"
// }
// ==/Taberareloo==

// ported from https://gist.github.com/Constellation/125251

(function() {
  if (TBRL.ID) { // Is it in the background context?
    Menus._register({
      title    : 'Chat - Twitter',
      contexts : ['all'],
      documentUrlPatterns : ['*://twitter.com/*'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusChatTwitter',
          content: info
        });
      }
    }, null, 'Quote', true);
    Menus.create();
    return;
  }

  var onRequestsHandlers = {};
  var requestsHandler = function (req, sender, func) {
    var handler = onRequestsHandlers[req.request];
    if (handler) {
      handler.apply(this, arguments);
    }
  };

  onRequestsHandlers.contextMenusChatTwitter = function (req, sender, func) {
    var ctx = TBRL.createContext(TBRL.getContextMenuTarget());
    TBRL.share(ctx, Extractors['Chat - Twitter'], true);
  };

  chrome.runtime.onMessage.addListener(requestsHandler);

  Extractors.register([{
    name              : 'Chat',
    ICON              : Extractors['Quote - Twitter'].ICON,
    TARGET_BACKGROUND : '#ccc',

    extract : function(ctx, xpath) {
      return this.select(xpath);
    },
    select : function(xpath, doc) {
      var self = this;
      var deferred = new Deferred();
      doc = doc || MochiKit.DOM.currentDocument();

      var list = [];
      var now_target = null;
      function getChatElement(e) {
        return $X(xpath, e.target)[0];
      }
      function onMouseOver(e) {
        var target = null;
        if ((target = getChatElement(e)) && !target.captureSelected) {
          now_target = target;
          target.originalBackground = target.style.background;
          target.style.background = self.TARGET_BACKGROUND;
        }
      }
      function onMouseOut(e) {
        var target = null;
        if ((target = getChatElement(e)) && !target.captureSelected) {
          now_target = null;
          unpoint(target);
        }
      }
      function onClick(e) {
        cancel(e);
        var target = null;
        if (target = getChatElement(e)) {
          if (target.captureSelected = !target.captureSelected) {
            list.push(target);
          }
          else {
            var index = list.indexOf(target);
            if (!(index === -1)) {
              list.splice(index, 1);
            }
          }
        }
      }
      function onKeyDown(e) {
        cancel(e);

        switch (keyString(e)) {
        case 'ESCAPE':
          finalize();
          deferred.cancel();
          return;
        case 'RETURN':
          finalize();
          if (list.length) {
            deferred.callback(list);
          }
          else {
            deferred.cancel();
          }
          return;
        }
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

        list.forEach(function(elm) {
          elm.captureSelected = null;
          unpoint(elm);
        });
        if (now_target) {
          now_target.captureSelected = null;
          unpoint(now_target);
        }
      }

      doc.addEventListener('mouseover', onMouseOver, true);
      doc.addEventListener('mouseout', onMouseOut, true);
      doc.addEventListener('click', onClick, true);
      doc.addEventListener('keydown', onKeyDown, true);

      return deferred;
    },
    createChat : function(list) {
      var chat = list.map(function(item, index) {
        return escapeHTML(item.account) + ': ' + escapeHTML(item.body) + ' [' + item.source + ']';
      });
      return chat.join('\n');
    }
  },
  {
    name     : 'Chat - Twitter',
    ICON     : Extractors['Quote - Twitter'].ICON,
    li_xpath : './ancestor-or-self::li[starts-with(@id, "stream-item-tweet-")]',

    check : function(ctx) {
      return ctx.href.match('https?://twitter.com/');
    },
    extract : function(ctx) {
      var Chat = Extractors.Chat;
      return Chat.extract(ctx, this.li_xpath).addCallback(function(list) {
        list = list.map(function(li) {
          var elm = $X('.//p[contains(concat(" ",@class," ")," js-tweet-text ")]', li)[0];
          var cloneElm = elm.cloneNode(true);
          $A(cloneElm.getElementsByClassName('tco-ellipsis')).forEach(
            function(target) {
              target.parentNode.removeChild(target);
            }
          );
          var selection = createFlavoredString(cloneElm);
          return {
            account : $X('.//strong[contains(concat(" ",@class," ")," fullname ")]/text()', li)[0],
            body    : selection.raw,
            source  : $X('.//a[contains(concat(" ",@class," ")," details ")]', li)[0]
          };
        });
        return {
          type    : 'conversation',
          item    : ctx.title,
          itemUrl : ctx.href,
          body    : Chat.createChat(list)
        };
      });
    }
  }], 'Quote - Twitter', true);
})();
