// ==Taberareloo==
// {
//   "name"        : "Video Extractor for Dailymotion"
// , "description" : "Extract a Dailymotion video"
// , "include"     : ["content"]
// , "match"       : ["http://www.dailymotion.com/video/*"]
// , "version"     : "1.0.0"
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

      return {
        type      : 'video',
        item      : $X('//meta[@property="og:title"]/@content', ctx.document)[0],
        itemUrl   : $X('//meta[@property="og:url"]/@content', ctx.document)[0],
        body      : '<iframe frameborder="0" width="480" height="270" src="' + player + '"></iframe>'
      };
    },
    getPlayer : function(ctx) {
      return $X('//meta[@name="twitter:player"]/@value', ctx.document)[0];
    }
  });
})();
