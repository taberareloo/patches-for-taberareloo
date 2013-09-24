// ==Taberareloo==
// {
//   "name"        : "Photo Extractor for Twitter Media Grid"
// , "description" : "Extract tweets on a media grid page"
// , "include"     : ["content"]
// , "match"       : ["*://twitter.com/*"]
// , "version"     : "0.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.photo.twitter.media-grid.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Photo - Twitter Media Grid',

    check : function(ctx) {
      return !!this.getTweet(ctx);
    },

    extract : function(ctx) {
      var node = this.saved_node;

      var status = $X('.//p[contains(concat(" ",@class," ")," tweet-text ")]', node)[0];

      ctx.title = 'Twitter / ' + node.dataset.name;
      ctx.href  = 'https://twitter.com' + $X('.//a[contains(concat(" ",@class," ")," js-permalink ")]/@href', node)[0];
      return {
        type     : 'photo',
        item     : ctx.title,
        itemUrl  : node.dataset.resolvedUrlLarge,
        body     : status.innerText,
        flavors  : {
          html : status.innerHTML
        },
        favorite : {
          name : 'Twitter',
          id   : node.dataset.statusId
        }
      };
    },

    getTweet : function(ctx) {
      var node = ctx.target;
      this.saved_node = $X('./ancestor-or-self::span[contains(concat(" ",@class," ")," grid-tweet ")]', node)[0];
      return this.saved_node;
    }
  }, 'Quote - Twitter', true);
})();
