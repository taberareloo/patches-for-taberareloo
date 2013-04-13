// ==Taberareloo==
// {
//   "name"        : "Video Extractor for youku"
// , "description" : "Extract a youku video"
// , "include"     : ["content"]
// , "match"       : ["http://v.youku.com/v_show/*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.youku.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Video - youku',

    check : function(ctx) {
      return ctx.host.match(/youku\.com/) && this.getTag(ctx);
    },

    extract : function(ctx) {
      var tag = this.getTag(ctx);

      return {
        type      : 'video',
        item      : $X('//meta[@itemprop="name"]/@content', ctx.document)[0],
        itemUrl   : $X('//meta[@itemprop="url"]/@content', ctx.document)[0],
        body      : tag
      };
    },

    getTag : function(ctx) {
      return $X('id("link4")/@value', ctx.document)[0];
    }
  }, 'Audio');
})();
