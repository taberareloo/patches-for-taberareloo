// ==Taberareloo==
// {
//   "name"        : "Extractor for Feedeen"
// , "description" : "Extract an article on Feedeen"
// , "include"     : ["content"]
// , "match"       : ["*://feedeen.com/*"]
// , "version"     : "0.0.3"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.feedeen.tbrl.js"
// }
// ==/Taberareloo==

// https://github.com/Alty/tombfix/blob/master/tombfix.extractor.feedeen.js
// https://sites.google.com/a/feedeen.com/help/developer/scrapping

(function() {
  Extractors.register([
    {
      name: 'Feedeen',
      getItem: function (ctx, getOnly) {
        if (!ctx.href.match(/\/\/feedeen.com\/d/)) {
          return null;
        }

        var item = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," fd_item ")]', ctx.target)[0];
        if (!item) {
          return null;
        }

        var res = {
          author : '',
          title  : item.querySelector('.fd_title').textContent,
          feed   : item.querySelector('.fd_sitename').textContent,
          href   : item.querySelector('.fd_url').getAttribute('href').replace(/[?&;](fr?(om)?|track|ref|FM)=(r(ss(all)?|df)|atom)([&;].*)?/,'')
        };

        if (!getOnly) {
          ctx.title = res.title + (res.title && res.feed ? ' - ' : '') + res.feed;
          ctx.href  = res.href;
          ctx.host  = res.href.match(/https?:\/\/([^\/]*)/)[1];
        }

        return res;
      }
    },

    {
      name: 'Quote - Feedeen',
      ICON: 'http://feedeen.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedeen.getItem(ctx, true) && ctx.selection;
      },
      extract: function (ctx) {
        Extractors.Feedeen.getItem(ctx);
        return Extractors.Quote.extract(ctx);
      }
    },

    {
      name: 'ReBlog - Feedeen',
      ICON: 'http://feedeen.com/favicon.ico',
      check: function (ctx) {
        var item = Extractors.Feedeen.getItem(ctx, true);
        return item && (
          item.href.match(/^http:\/\/.*?\.tumblr\.com\//) ||
          (ctx.onImage && ctx.target.src.match(/^http:\/\/data\.tumblr\.com\//)));
      },
      extract: function (ctx) {
        Extractors.Feedeen.getItem(ctx);
        return Extractors.ReBlog.extractByLink(ctx, ctx.href);
      }
    },

    {
      name: 'Photo - Feedeen',
      ICON: 'http://feedeen.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedeen.getItem(ctx, true) && ctx.onImage;
      },
      extract: function (ctx) {
        Extractors.Feedeen.getItem(ctx);
        return Extractors.check(ctx)[0].extract(ctx);
      }
    },

    {
      name: 'Link - Feedeen',
      ICON: 'http://feedeen.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedeen.getItem(ctx, true);
      },
      extract: function (ctx) {
        Extractors.Feedeen.getItem(ctx);
        return Extractors.Link.extract(ctx);
      }
    }
  ], 'LDR');

  UserScripts.register({
    name  : 'Feedeen + Taberareloo',
    check : function () {
      var key = TBRL.config.post.shortcutkey_ldr_plus_taberareloo;
      if (/^https?:\/\/feedeen.com\/d/.test(location.href) && TBRL.config.post.ldr_plus_taberareloo && key) {
        this.key = key;
        return true;
      } else {
        return false;
      }
    },
    exec : function () {
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = chrome.runtime.getURL('styles/reader.css');
      document.head.appendChild(style);
      document.addEventListener('keydown', this.wrap, false);
    },
    unload : function () {
      document.removeEventListener('keydown', this.wrap, false);
    },
    fire : function (ev) {
     var key = keyString(ev);
      if (key !== this.key) {
        return null;
      }
      if (!('selectionStart' in ev.target && ev.target.disabled !== true)) {
        var item = this.getCurrentItem();
        if (!item) {
          return null;
        }
        stop(ev);
        var sel = createFlavoredString(window.getSelection());
        var ctx = update({
          document  : document,
          window    : window,
          selection : (sel.raw) ? sel : null,
          target    : item.target,
          event     : {},
          title     : null,
          mouse     : null,
          menu      : null
        }, window.location);
        item.parent.classList.add('TBRL_posted');
        var ext = Extractors.check(ctx)[0];
        return TBRL.share(ctx, ext, ext.name.match(/^Link /));
      } else {
        return null;
      }
    },
    getCurrentItem : function () {
      var item = {
        parent: null,
        body: null,
        target: null,
        feed: {
          channel: {
            link: null
          }
        }
      }, link;
      try {
        var fd_expanded = document.querySelector('.fd_expanded');
        if (!fd_expanded) {
          throw 'get_current_item error';
        } else {
          item.target = fd_expanded;
          item.parent = fd_expanded;
          item.body   = fd_expanded;
          item.feed.channel.link = fd_expanded.querySelector('.fd_siteurl').href;
          return item;
        }
      } catch (e) {
        return null;
      }
    },
    wrap : function (ev) {
      return UserScripts['Feedeen + Taberareloo'].fire(ev);
    }
  });

  if (UserScripts['Feedeen + Taberareloo'].check()) {
    UserScripts['Feedeen + Taberareloo'].exec();
  }
})();
