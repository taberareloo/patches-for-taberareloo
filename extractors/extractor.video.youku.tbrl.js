// ==Taberareloo==
// {
//   "name"        : "Video Extractor for youku"
// , "description" : "Extract a youku video"
// , "include"     : ["content"]
// , "match"       : ["http://v.youku.com/v_show/*"]
// , "version"     : "1.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.video.youku.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name : 'Video - youku',

    check : function(ctx) {
      return ctx.href.match(/http:\/\/v\.youku\.com\/v_show\//) && this.getTag(ctx);
    },

    extract : function(ctx) {
      var tag = this.getTag(ctx);

      var video_id = ctx.pathname.extract(/v_show\/id_([^.]+)\.html/);

      ctx.title = $X('//h1[@class="title"]/@title', ctx.document)[0] || ctx.title;
      ctx.href  = $X('id("link1")/@value', ctx.document)[0];

      return {
        type    : 'video',
        item    : ctx.title,
        itemUrl : ctx.href,
        body    : tag,
        data    : {
          thumbnail   : $X('id("item_' + video_id + '")//img/@src', ctx.document)[0],
          description : $X('//meta[@name="description"]/@content', ctx.document)[0]
        }
      };
    },

    getTag : function(ctx) {
      return $X('id("link4")/@value', ctx.document)[0];
    }
  }, 'Audio');
})();
