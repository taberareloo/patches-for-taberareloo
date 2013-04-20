// ==Taberareloo==
// {
//   "name"        : "Handle dynamic inserted dashboard iframe in ReBlog Extractor"
// , "description" : "Handle dynamic inserted dashboard iframe in ReBlog Extractor"
// , "include"     : ["content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.extractor.tumblr.reblog.pr-186.tbrl.js"
// }
// ==/Taberareloo==

// https://github.com/Constellation/taberareloo/pull/186

(function() {
  update(Extractors['ReBlog'], {
    extractByPage : function(ctx, doc){
      var that = this;
      var params = queryHash(unescapeHTML(this.getFrameUrl(doc)));
      ctx.reblog_id = params.pid;
      ctx.reblog_key = params.rk;
      ctx.post_type = false;
      return this.getFormKeyAndChannelId(ctx).addCallback(function(){
        return that.extractByEndpoint(ctx, that.TUMBLR_URL + 'reblog/' + params.pid + '/' + params.rk);
      });
    },
    getFrameUrl : function(doc){
      var elm = $X('//iframe[(starts-with(@src, "http://www.tumblr.com/iframe") or starts-with(@src, "http://assets.tumblr.com/iframe")) and contains(@src, "pid=")]/@src', doc);
      if (elm.length) {
        return elm[0];
      }

      var iframeInsertScript = createHTML(
        doc.body.innerHTML.match(/<!-- BEGIN TUMBLR CODE -->[\s\S]+<!-- END TUMBLR CODE -->/)
      ).scripts[0];
      if (iframeInsertScript) {
        var matches = iframeInsertScript.textContent.match(/document\.write\('<iframe src="(.+)" width=/);
        if (matches) {
          return matches[1];
        }
      }

      return '';
    }
  });
})();
