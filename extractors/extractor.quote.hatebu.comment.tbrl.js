// ==Taberareloo==
// {
//   "name"        : "Quote Extractor for Hatebu Comment"
// , "description" : "Extract a hatebu comment"
// , "include"     : ["content"]
// , "match"       : ["http://b.hatena.ne.jp/entry/*"]
// , "version"     : "1.2.1"
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
      var node      = this.saved_node;
      var link      = $X('.//a[@class="username"]', node)[0];
      var username  = node.id.replace(/bookmark-user-([A-Za-z0-9_-]{3,15})/, '$1');
      var selection = createFlavoredString($X('.//span[@class="comment"]', node)[0]);
      if (ctx.selection) {
        selection = ctx.selection;
      }
      return {
        type    : 'quote',
        item    : ctx.title.replace(/-/, '- ' + username + ' -'),
        itemUrl : link.href,
        body    : selection.raw,
        flavors : {
          html  : selection.html
        }
      };
    },

    saved_node : null,

    getComment : function(ctx) {
      var node = ctx.target;
      if (ctx.selection) {
        node = ctx.window.getSelection().anchorNode;
      }
      this.saved_node = $X('./ancestor-or-self::li[starts-with(@id, "bookmark-user-")]', node)[0];
      return this.saved_node;
    }
  }, 'Quote');
})();
