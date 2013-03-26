// ==Taberareloo==
// {
//   "name"        : "Quote Extractor for Hatebu Comment"
// , "description" : "Post to twittaw.com"
// , "include"     : ["content"]
// , "match"       : ["http://b.hatena.ne.jp/entry/*"]
// , "version"     : "1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.quote.hatebu.comment.tbrl.js"
// }
// ==/Taberareloo==

// Ported from https://gist.github.com/saitamanodoruji/4263416

(function() {
  Extractors.register({
    name : 'Quote - Hatena Bookmark',

    check : function(ctx) {
      return !!this.getComment(ctx);
    },

    extract : function(ctx) {
      var node      = this.getComment(ctx);
      var link      = $X('.//a[@class="username"]', node)[0];
      var username  = node.id.replace(/bookmark-user-([A-Za-z0-9_-]{3,15})/, '$1');
      var selection = createFlavoredString($X('.//span[@class="comment"]', node)[0]);

      if (ctx.selection) {
        selection = ctx.selection;
      }
      var ps = {
        type    : 'quote',
        item    : ctx.title.replace(/-/, '- ' + username + ' -'),
        itemUrl : link.href,
        body    : selection.raw,
        flavors : {
          html  : selection.html
        }
      };
      return ps;
    },

    getComment : function(ctx) {
      var node = ctx.target;
      if (ctx.selection) {
        node = ctx.window.getSelection().anchorNode;
      }
      return $X('./ancestor-or-self::li[starts-with(@id, "bookmark-user-")]', node)[0];
    }
  }, 'Quote');
})();