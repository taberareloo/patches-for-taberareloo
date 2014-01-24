// ==Taberareloo==
// {
//   "name"        : "pplog Model"
// , "description" : "Post to pplog.net"
// , "include"     : ["background"]
// , "version"     : "0.1.1"
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
      return request(this.FORM_URL, {responseType : 'document'}).addCallback(function (res) {
        var doc = res.response;
        var form = [].concat($X("id('new_post')", doc)).shift();
        if (!form) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return [].concat($X("//meta[@name='csrf-token']/@content", doc)).shift();
      });
    },

    post : function (ps) {
      var info = [];
      info.push(ps.item, ps.description);
      if (ps.type === 'photo') {
        info.push(ps.itemUrl);
/*
        if (ps.item !== ps.page) {
          info.push(ps.page);
        }
*/
        if (ps.itemUrl !== ps.pageUrl) {
          info.push(ps.pageUrl);
        }
      } else if (ps.type !== 'regular') {
/*
        if (ps.item !== ps.page) {
          info.push(ps.page);
        }
*/
        info.push(ps.itemUrl);
        if (ps.type === 'quote') {
          var body = (ps.body || '').trim();
          info.push(body ? '“' + body + '”' : '');
        }
      }
      return this.update(ps, joinText(info, "\n", true));
    },

    update : function (ps, content) {
      var self = this;
      return self.getToken().addCallback(function(token) {
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
