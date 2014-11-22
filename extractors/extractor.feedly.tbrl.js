// ==Taberareloo==
// {
//   "name"        : "Extractor for Feedly"
// , "description" : "Extract an article on Feedly"
// , "include"     : ["content"]
// , "match"       : ["*://feedly.com/*"]
// , "version"     : "0.5.2"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/extractors/extractor.feedly.tbrl.js"
// }
// ==/Taberareloo==

/*
 u0Entry     : Titles view
 u4Entry     : Magazine view and Timeline view
 u5Entry     : Card view
 u100Frame   : Full article view

 inlineFrame : Opened one -> u100Entry
*/

(function() {
  Extractors.register([
    {
      name: 'Feedly',
      getItem: function (ctx, getOnly) {
        if (!ctx.href.match(/\/\/feedly\.com\//)) {
          return null;
        }

        var u0Entry = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," u0Entry ")]', ctx.target)[0];
        var u4Entry = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," u4Entry ")]', ctx.target)[0];
        var u5Entry = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," u5Entry ")]', ctx.target)[0];
        var u100Frame = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," u100Frame ")]', ctx.target)[0];

        var item = u0Entry || u4Entry || u5Entry || u100Frame;
        if (!item) {
          item = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," inlineFrame ")]//div[contains(concat(" ",@class," ")," u100Entry ")]', ctx.target)[0];
        }
        if (!item) {
          return null;
        }

        var res = {
          author : '',
          title  : $X('@data-title', item)[0] || '',
          feed   : $X('.//span[@class="sourceTitle"]/a/text()', item)[0] || $X('.//a[@class="sourceTitle"]/text()', item)[0],
          href   : $X('@data-alternate-link', item)[0]
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
      name: 'Quote - Feedly',
      ICON: 'http://feedly.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedly.getItem(ctx, true) && ctx.selection;
      },
      extract: function (ctx) {
        Extractors.Feedly.getItem(ctx);
        return Extractors.Quote.extract(ctx);
      }
    },

    {
      name: 'ReBlog - Feedly',
      ICON: 'http://feedly.com/favicon.ico',
      check: function (ctx) {
        var item = Extractors.Feedly.getItem(ctx, true);
        return item && (
          item.href.match(/^http:\/\/.*?\.tumblr\.com\//) ||
          (ctx.onImage && ctx.target.src.match(/^http:\/\/data\.tumblr\.com\//)));
      },
      extract: function (ctx) {
        Extractors.Feedly.getItem(ctx);
        return Extractors.ReBlog.extractByLink(ctx, ctx.href);
      }
    },

    {
      name: 'Photo - Feedly',
      ICON: 'http://feedly.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedly.getItem(ctx, true) && ctx.onImage;
      },
      extract: function (ctx) {
        Extractors.Feedly.getItem(ctx);
        return Extractors.check(ctx)[0].extract(ctx);
      }
    },

    {
      name: 'Link - Feedly',
      ICON: 'http://feedly.com/favicon.ico',
      check: function (ctx) {
        return Extractors.Feedly.getItem(ctx, true);
      },
      extract: function (ctx) {
        Extractors.Feedly.getItem(ctx);
        return Extractors.Link.extract(ctx);
      }
    }
  ], 'LDR');

  UserScripts.register({
    name  : 'Feedly + Taberareloo',
    check : function () {
      var key = TBRL.config.post.shortcutkey_ldr_plus_taberareloo;
      if (/^https?:\/\/feedly\.com\//.test(location.href) && TBRL.config.post.ldr_plus_taberareloo && key) {
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
/*
        if (isImageFeed(item.feed.channel.link)) {
          ctx.onImage = true;
          ctx.target = $X('./descendant::img[0]', item.body)[0];
        }
*/
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
        item.target = $X('//*[contains(concat(" ",@class," ")," selectedEntry ")]')[0] || null;
        if (!item.target) {
          throw new Error('get_current_item error');
        } else {
          item.parent = $X('ancestor-or-self::div[contains(concat(" ",@class," ")," inlineFrame ")]', item.target)[0] || null;
          item.body = $X('.//div[contains(concat(" ",@class," ")," u100Entry ")]', item.parent)[0] || null;
          item.feed.channel.link = $X('@data-alternate-link', item.body)[0] || null;
          return item;
        }
      } catch (e) {
        return null;
      }
    },
    wrap : function (ev) {
      return UserScripts['Feedly + Taberareloo'].fire(ev);
    }
  });

  if (UserScripts['Feedly + Taberareloo'].check()) {
    UserScripts['Feedly + Taberareloo'].exec();
  }
})();
