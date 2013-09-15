// ==Taberareloo==
// {
//   "name"        : "Photo Extractor to Diet Gif Animation"
// , "description" : "Diet a gif animation to post properly"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.photo.diet.gif.tbrl.js"
// }
// ==/Taberareloo==

// Ported from https://github.com/polygonplanet/tombloo/blob/master/tombloo.extractor.diet.gif.js

(function() {
  if (inContext('background')) {
    Menus._register({
      title: 'Photo - Diet Gif Animation',
      contexts: ['image'],
      targetUrlPatterns : ['*://*/*.gif'],
      onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusDietGifAnimation',
          content: info
        });
      }
    }, null, 'Photo - Upload from Cache', true);

    Menus.create();
    return;
  }

  TBRL.setRequestHandler('contextMenusDietGifAnimation', function (req, sender, func) {
    var content = req.content;
    var ctx = update({
      onImage: true,
      contextMenu: true
    }, TBRL.createContext(document.querySelector('img[src=' + JSON.stringify(content.srcUrl) + ']') || TBRL.getContextMenuTarget()));
    TBRL.share(ctx, Extractors['Photo - Diet Gif Animation'], true);
  });

  Extractors.register({
    name  : 'Photo - Diet Gif Animation',
    ICON  : chrome.extension.getURL('skin/') + 'photo.png',

    check : function (ctx) {
      return /[.]gif$/i.test(this.getMediaURI(ctx));
    },

    getMediaURI : function(ctx) {
      return ((tagName(ctx.target) === 'object') && ctx.target.data) ||
        (ctx.onImage && ctx.target && ctx.target.src) ||
        (ctx.onLink && ctx.link && ctx.link.href);
    },

    extract : function(ctx) {
      ctx.target = {
        href : 'http://diet-gif.herokuapp.com/' + this.getMediaURI(ctx)
      };
      return Extractors.Photo.extract(ctx);
    }
  }, 'Photo - Upload from Cache', true);
})();