// ==Taberareloo==
// {
//   "name"        : "Google Image Search Menu"
// , "description" : "Menu for Google Image Search"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/menu.google.image.search.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    Menus._register({
      title: 'Photo - Search - GoogleImage',
      contexts: ['image'],
      onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusSearchGoogleImage',
          content: info
        });
      }
    }, null, 'Photo - Capture', true);
    Menus.create();

    Models.register({
      name : 'GoogleImage',
      ICON :  Models.Google.ICON,
      checkSearch : function(ps) {
        return ps.type === 'photo' && !ps.file;
      },
      search: function(ps) {
        // search by itemUrl
        var ret = new Deferred();
        var url = "http://www.google.co.jp/searchbyimage" + queryString({
          image_url: ps.itemUrl
        }, true);
        chrome.tabs.create({
          url: url
        }, function() {
          ret.callback();
        });
        return ret;
      }
    });

    TBRL.setRequestHandler('search', function (req, sender, callback) {
      // currently, used for GoogleImageSearch
      callback({});
      var ps = req.content;
      if (Models.GoogleImage.checkSearch(ps)) {
        Models.GoogleImage.search(ps);
      }
    });
    return;
  }

  Extractors.register({
    name : 'Photo - Google Image Search',
    ICON : 'http://www.google.com/favicon.ico',
    check : function (ctx) {
      return ctx.host === 'images.google.co.jp' && ctx.onImage && ctx.onLink;
    },
    extract : function (ctx) {
      var link  = $X('parent::a/@href', ctx.target)[0];
      var itemUrl = decodeURIComponent(link.match(/imgurl=([^&]+)/)[1]);
      ctx.href = decodeURIComponent(link.match(/imgrefurl=([^&]+)/)[1]);

      return request(ctx.href).addCallback(function (res) {
        ctx.title =
          res.responseText.extract(/<title.*?>([\s\S]*?)<\/title>/im).replace(/[\n\r]/g, '').trim() ||
          createURI(itemUrl).fileName;

        return {
          type    : 'photo',
          item    : ctx.title,
          itemUrl : itemUrl
        };
      });
    }
  }, 'Photo - Blogger', true);

  TBRL.setRequestHandler('contextMenusSearchGoogleImage', function (req, sender, callback) {
    callback({});
    var content = req.content;
    var ctx = update({
      onImage: true,
      contextMenu: true
    }, TBRL.createContext(document.querySelector('img[src=' + JSON.stringify(content.srcUrl) + ']') || TBRL.getContextMenuTarget()));
    var ext = Extractors.check(ctx).filter(function (m) {
      return (/^Photo/).test(m.name);
    })[0];
    TBRL.extract(ctx, ext).addCallback(function (ps) {
      chrome.runtime.sendMessage(TBRL.id, {
        request: 'search',
        show   : false,
        content: update({
          page    : ctx.title,
          pageUrl : ctx.href
        }, ps)
      }, function () { });
    });
  });
})();
