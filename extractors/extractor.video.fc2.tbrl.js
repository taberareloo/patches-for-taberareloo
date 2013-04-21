// ==Taberareloo==
// {
//   "name"        : "Video Extractor for FC2"
// , "description" : "Extract an FC2 video"
// , "include"     : ["content"]
// , "match"       : ["http://video.fc2.com/content/*"]
// , "version"     : "1.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.fc2.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Video - FC2',

    check : function(ctx) {
      return ctx.host.match(/fc2\.com/) && this.getTag(ctx);
    },

    extract : function(ctx) {
      var tag = this.getTag(ctx);

      ctx.title = $X('//meta[@itemprop="name"]/@content', ctx.document)[0];
      ctx.href  = $X('//meta[@itemprop="url"]/@content', ctx.document)[0];

      return {
        type      : 'video',
        item      : ctx.title,
        itemUrl   : ctx.href,
        body      : tag.extract(/(<object.+object>)/)
      };
    },

    getTag : function(ctx) {
      return $X('id("watch_embed_code")/text()', ctx.document)[0];
    }
  }, 'Audio');
})();
