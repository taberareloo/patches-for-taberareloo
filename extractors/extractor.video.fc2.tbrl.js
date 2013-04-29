// ==Taberareloo==
// {
//   "name"        : "Video Extractor for FC2"
// , "description" : "Extract an FC2 video"
// , "include"     : ["content"]
// , "match"       : ["http://video.fc2.com/content/*"]
// , "version"     : "1.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.fc2.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Video - FC2',

    check : function(ctx) {
      return ctx.href.match(/^http:\/\/video\.fc2\.com\/content\//) && this.getTag(ctx);
    },

    extract : function(ctx) {
      var tag = this.getTag(ctx);

      ctx.title = $X('//meta[@property="og:title"]/@content', ctx.document)[0];
      ctx.href  = $X('//meta[@property="og:url"]/@content', ctx.document)[0];

      return {
        type    : 'video',
        item    : ctx.title,
        itemUrl : ctx.href,
        body    : tag.extract(/(<object.+object>)/),
        data    : {
          thumbnail   : $X('//meta[@property="og:image"]/@content', ctx.document)[0],
          description : $X('//meta[@property="og:description"]/@content', ctx.document)[0]
        }
      };
    },

    getTag : function(ctx) {
      return $X('id("watch_embed_code")/text()', ctx.document)[0];
    }
  }, 'Audio');
})();
