// ==Taberareloo==
// {
//   "name"        : "pplog Model"
// , "description" : "Post to pplog.net"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.pplog.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'pplog',
    ICON      : 'https://dltvadzlmcsl3.cloudfront.net/assets/favicon-a0817290258726ffdc238a41b29fdd58.ico',
    LINK      : 'https://www.pplog.net/',
    LOGIN_URL : 'https://www.pplog.net/',

    FORM_URL : 'https://www.pplog.net/my/posts/new',
    POST_URL : 'https://www.pplog.net/my/posts',

    check : function (ps) {
      return (/(regular|photo|quote|link|video)/).test(ps.type);
    },

    getToken : function () {
      var self = this;
      return request(this.FORM_URL, {responseType : 'document'}).then(function (res) {
        var doc = res.response;
        var form = [].concat($X("id('new_post')", doc)).shift();
        if (!form) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return [].concat($X("//meta[@name='csrf-token']/@content", doc)).shift();
      });
    },

    post : function (ps) {
      var body = [];
      if (ps.type === 'regular') {
        body.push(ps.item, ps.description);
      } else {
        body.push(ps.description);
      }
      body = joinText(body, "\n", true);

      var info = [];
      if (ps.type === 'photo') {
        if (!ps.file) {
          info.push(ps.itemUrl);
        }
        info.push(ps.item);
        if (ps.itemUrl !== ps.pageUrl) {
          info.push(ps.pageUrl);
        }
      } else if (ps.type !== 'regular') {
        info.push(ps.item, ps.itemUrl);
      }

      var quote = (ps.body || '').trim();
      if (quote) {
        info.push('“' + quote + '”');
      }

      info = joinText(info, "\n", true);

      return this.update(ps, joinText([body, info], "\n\n"));
    },

    update : function (ps, content) {
      var self = this;
      return self.getToken().then(function (token) {
        return request(self.POST_URL, {
          sendContent : {
            utf8               : '✓',
            authenticity_token : token,
            'post[content]'    : content,
            'post[image]'      : ps.file || null
          },
          multipart   : true
        });
      });
    }
  });
})();
