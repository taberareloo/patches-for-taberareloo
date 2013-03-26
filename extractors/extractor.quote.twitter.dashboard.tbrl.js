// ==Taberareloo==
// {
//   "name"        : "Quote Extractor for Twitter Dashboard"
// , "description" : "Extract a tweet on a dashboard"
// , "include"     : ["content"]
// , "match"       : ["*://twitter.com/*"]
// , "version"     : "1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.quote.twitter.dashboard.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Quote - Twitter Dashboard',

    check : function(ctx) {
      return !!this.getTweet(ctx);
    },

    extract : function(ctx) {
      var node      = this.saved_node;
      var link      = $X('.//a[contains(concat(" ",@class," ")," details ")]', node)[0];
      var username  = $X('.//strong[contains(concat(" ",@class," ")," fullname ")]/text()', node)[0];
      var selection = createFlavoredString($X('.//p[@class="js-tweet-text"]', node)[0]);
      if (ctx.selection) {
        selection = ctx.selection;
      }
      return {
        type    : 'quote',
        item    : 'Twitter / ' + username,
        itemUrl : link.href,
        body    : selection.raw,
        flavors : {
          html  : selection.html
        }
      };
    },

    saved_node : null,

    getTweet : function(ctx) {
      var node = ctx.target;
      if (ctx.selection) {
        node = ctx.window.getSelection().anchorNode;
      }
      this.saved_node = $X('./ancestor-or-self::li[starts-with(@id, "stream-item-tweet-")]', node)[0];
      return this.saved_node;
    }
  }, 'Quote - Twitter', true);
})();
