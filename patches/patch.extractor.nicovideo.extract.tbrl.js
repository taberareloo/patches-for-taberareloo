// ==Taberareloo==
// {
//   "name"        : "Fix extractor for Nico Nico Douga"
// , "namespace"   : "https://github.com/taberareloo/patches-for-taberareloo"
// , "description" : "Fix extractor for Nico Nico Douga"
// , "include"     : ["content"]
// , "match"       : ["http://www.nicovideo.jp/watch/*"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/patches/patch.extractor.nicovideo.extract.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Extractors['Video - Nico Nico Douga'], {
    extract : function(ctx) {
      var externalPlayerURL = 'http://ext.nicovideo.jp/thumb_' + ctx.pathname.slice(1) + '?thumb_mode=swf&ap=1&c=1';

      var video_id = ctx.pathname.extract(/watch\/(sm\d+)/);
      return request('http://ext.nicovideo.jp/api/getthumbinfo/' + video_id).then(function (res) {
        var xml = res.responseXML;

        var status = xml.getElementsByTagName('nicovideo_thumb_response')[0].getAttribute('status');
        if (status !== 'ok') {
          var message = xml.getElementsByTagName('description')[0].textContent;
          console.error('This video can\'t be shared. (' + message + ')');
          throw new Error(message);
        }

        ctx.title       = xml.getElementsByTagName('title')[0].textContent;
        ctx.href        = xml.getElementsByTagName('watch_url')[0].textContent;
        var embeddable  = xml.getElementsByTagName('embeddable')[0].textContent;
        var thumbnail   = xml.getElementsByTagName('thumbnail_url')[0].textContent;
        var description = xml.getElementsByTagName('description')[0].textContent;

        if (embeddable) {
          return {
            type    : 'video',
            item    : ctx.title,
            itemUrl : ctx.href,
            body    : '<embed type="application/x-shockwave-flash" width="485" height="385" src="' + externalPlayerURL + '"/>',
            data    : {
              thumbnail   : thumbnail,
              description : description
            }
          };
        }
        else {
          return {
            type    : 'photo',
            item    : ctx.title,
            itemUrl : thumbnail,
            body    : description
          };
        }
      });
    }
  });
})();
