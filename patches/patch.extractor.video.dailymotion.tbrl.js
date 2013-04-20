// ==Taberareloo==
// {
//   "name"        : "Video Extractor for Dailymotion"
// , "description" : "Extract a Dailymotion video"
// , "include"     : ["content"]
// , "match"       : ["http://www.dailymotion.com/video/*"]
// , "version"     : "1.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.extractor.video.dailymotion.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Extractors['Video - Dailymotion'], {
    check : function(ctx) {
      return ctx.host.match(/dailymotion\.com/) && this.getPlayer(ctx);
    },
    extract : function(ctx) {
      var player = this.getPlayer(ctx);
      var width  = $X('//meta[@name="twitter:player:width"]/@content', ctx.document)[0];
      var height = $X('//meta[@name="twitter:player:height"]/@content', ctx.document)[0];

      ctx.title = $X('//meta[@property="og:title"]/@content', ctx.document)[0];
      ctx.href  = $X('//meta[@property="og:url"]/@content', ctx.document)[0];

      return {
        type    : 'video',
        item    : ctx.title,
        itemUrl : ctx.href,
        body    : '<iframe frameborder="0" width="'+width+'" height="'+height+'" src="'+player+'"></iframe>'
      };
    },
    getPlayer : function(ctx) {
      return $X('//meta[@name="twitter:player"]/@value', ctx.document)[0];
    }
  });
})();
