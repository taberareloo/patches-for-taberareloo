// ==Taberareloo==
// {
//   "name"        : "Chat Extractor for Twitter"
// , "description" : "Extract tweets as a conversation"
// , "include"     : ["background", "content", "popup"]
// , "match"       : ["*://twitter.com/*"]
// , "version"     : "0.5.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.chat.twitter.tbrl.js"
// }
// ==/Taberareloo==

// ported from https://gist.github.com/Constellation/125251

(function() {
  if (inContext('background')) {
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

  if (inContext('content')) {
    TBRL.setRequestHandler('contextMenusChatTwitter', function (req, sender, func) {
      var ctx = TBRL.createContext(TBRL.getContextMenuTarget());
      var ext = Extractors['Chat - Twitter Dashboard'];
      if (ctx.href.match(/\/\/twitter\.com\/.*?\/(?:status|statuses)\/\d+/)) {
        ext = Extractors['Chat - Twitter'];
      }
      TBRL.share(ctx, ext, true);
    });

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
        var nodes = [];
        var now_target = null;
        function getChatElement(e) {
          return $X(xpath, e.target)[0];
        }
        function onMouseOver(e) {
          var target = getChatElement(e);
          if (target && !target.captureSelected) {
            now_target = target;
            target.originalBackground = target.style.background;
            target.style.background = self.TARGET_BACKGROUND;
          }
        }
        function onMouseOut(e) {
          var target = getChatElement(e);
          if (target && !target.captureSelected) {
            now_target = null;
            unpoint(target);
          }
        }
        function onClick(e) {
          cancel(e);
          var target = getChatElement(e);
          if (target) {
            var tweets = $X('.//div[contains(concat(" ",@class," ")," js-stream-tweet ")]', target);
            target.captureSelected = !target.captureSelected;
            if (target.captureSelected) {
              list.push(target);
              tweets.forEach(function(node) {
                nodes.push(node);
              });
            }
            else {
              var index = list.indexOf(target);
              if (index !== -1) {
                list.splice(index, 1);
              }
              tweets.forEach(function(node) {
                var index = nodes.indexOf(node);
                if (index !== -1) {
                  nodes.splice(index, 1);
                }
              });
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
            if (nodes.length) {
              deferred.callback(nodes);
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
      createChat : function(tweets) {
        var chat = tweets.map(function(tweet, index) {
          return escapeHTML(tweet.account) + ': ' + escapeHTML(tweet.body) + ' [' + tweet.source + ']';
        });
        return chat.join('\n');
      }
    },
    {
      name  : 'Chat - Twitter',
      ICON  : Extractors['Quote - Twitter'].ICON,

      check : function(ctx) {
        return ctx.href.match(/\/\/twitter\.com\/.*?\/(?:status|statuses)\/\d+/);
      },
      extract : function(ctx) {
        var nodes = $X('id("page-container")//div[contains(concat(" ",@class," ")," js-stream-tweet ")]');
        var tweets = nodes.map(this.extractTweet);
        return {
          type    : 'conversation',
          item    : ctx.title,
          itemUrl : ctx.href,
          body    : Extractors.Chat.createChat(tweets)
        };
      },
      extractTweet : function(tweet) {
        var elm = $X('.//p[contains(concat(" ",@class," ")," js-tweet-text ")]', tweet)[0];
        var cloneElm = elm.cloneNode(true);
        $A(cloneElm.getElementsByClassName('tco-ellipsis')).forEach(
          function(target) {
            target.parentNode.removeChild(target);
          }
        );
        var selection = createFlavoredString(cloneElm);
        return {
          account : $X('.//strong[contains(concat(" ",@class," ")," fullname ")]/text()', tweet)[0],
          body    : selection.raw.replace(/[\r\n]/g, ' ').trim(),
          source  : $X('.//a[contains(concat(" ",@class," ")," details ")]', tweet)[0]
        };
      }
    },
    {
      name     : 'Chat - Twitter Dashboard',
      ICON     : Extractors['Quote - Twitter'].ICON,
      li_xpath : './ancestor-or-self::li[starts-with(@id,"stream-item-tweet-")]',

      check : function(ctx) {
        return ctx.href.match('https?://twitter.com/') && !ctx.href.match(/\/\/twitter\.com\/.*?\/(?:status|statuses)\/\d+/);
      },
      extract : function(ctx) {
        return Extractors.Chat.extract(ctx, this.li_xpath).addCallback(function(nodes) {
          var tweets = nodes.map(Extractors['Chat - Twitter'].extractTweet);
          return {
            type    : 'conversation',
            item    : ctx.title,
            itemUrl : ctx.href,
            body    : Extractors.Chat.createChat(tweets)
          };
        });
      }
    }], 'Quote - Twitter', true);
    return;
  }

  update(Form.prototype, {
    conversation: function () {
      var ps = this.ps;
      this.savers.item = this.title = new Title(ps);
      this.savers.itemUrl = this.link = new Link(ps, true);
      this.savers.body = this.body  = new Body(ps);
      this.savers.tags = this.tags  = new Tags(ps, true);
      this.savers.description = this.desc = new Desc(ps, true);
      this.toggles = [this.title, this.tags, this.link, this.desc];
      callLater(0.5, Form.resize);
    }
  });
})();
