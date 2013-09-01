// ==Taberareloo==
// {
//   "name"        : "WordPress Model"
// , "description" : "Post to WordPress"
// , "include"     : ["background"]
// , "version"     : "0.2.2"
// }
// ==/Taberareloo==

// Requirement : http://wordpress.org/plugins/json-api/

(function() {

  Models.register({
    name       : 'WordPress',
    ICON       : 'http://s.wordpress.org/favicon.ico',
    LINK       : 'http://wordpress.org/',
    LOGIN_URL  : 'http://wordpress.org/',

    WP_URL    : 'http://blog.yungsang.com',

    NONCE_API : '/',
    POST_API  : '/?json=posts.create_post',

    initialize : function () {
      this.ICON      = this.WP_URL + '/favicon.ico';
      this.LINK      = this.WP_URL;
      this.LOGIN_URL = this.WP_URL + '/wp-login.php';
    },

    check : function (ps) {
      return /regular|photo|quote|link/.test(ps.type);
    },

    getNonce : function () {
      return request(this.WP_URL + this.NONCE_API, {
        queryString : {
          json       : 'get_nonce',
          controller : 'posts',
          method     : 'create_post'
        }
      }).addCallback(function (res) {
        return JSON.parse(res.responseText).nonce;
      });
    },

    post : function (ps) {
      var self = this;

      var sendContent = {
        status  : 'draft',
        title   : ps.item || ps.page,
        content : joinText([
          ps.description,
          ps.body ? '“' + ps.body + '”' : null
        ], "\n\n"),
        tags    : joinText(ps.tags, ',')
      };

      if ((ps.type === 'photo') && !ps.file) {
        sendContent.content = joinText([
          sendContent.content,
          '<img src="' + ps.itemUrl + '" alt="" />'
        ], "\n\n");
      }

      if (ps.type !== 'regular') {
        var title = ps.page || ps.pageUrl;
        sendContent.content = joinText([
          sendContent.content,
          'via <a href="' + ps.pageUrl + '">' + title + '</a>'
        ], "\n\n");
      }

      if (ps.file) {
        sendContent.attachment = ps.file;
      }

      return this.getNonce().addCallback(function (nonce) {
        return request(self.WP_URL + self.POST_API, {
          sendContent : update(sendContent, {
            nonce   : nonce,
          })
        }).addCallback(function (res) {
          var json = JSON.parse(res.responseText);
          if (json.status !== 'ok') {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
        });
      });
    }
  });

  Models['WordPress'].initialize();
})();