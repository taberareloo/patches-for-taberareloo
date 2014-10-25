// ==Taberareloo==
// {
//   "name"        : "tsū Model"
// , "description" : "Post to tsu.co"
// , "include"     : ["background"]
// , "version"     : "0.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.tsu.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'tsū',
    ICON      : 'http://tsu-production-app.s3.amazonaws.com/assets/favicon-8a200fdedff0c42cc21c9c50be34f13a.ico',
    LINK      : 'http://www.tsu.co/',
    LOGIN_URL : 'http://www.tsu.co/users/sign_in',

    HOME_URL : 'http://www.tsu.co/',
    POST_URL : 'http://www.tsu.co/posts',
    META_URL : 'http://www.tsu.co/posts/parse_url',

    check : function (ps) {
      return (/(regular|photo|quote|link|video)/).test(ps.type) && !ps.file;
    },

    getToken : function () {
      var self = this;
      return request(this.HOME_URL, {
        responseType: 'document'
      }).then(function (res) {
        var doc = res.response;
        var notLoggedin = $X('id("sign-in")', doc)[0];
        if (notLoggedin) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return $X('//meta[@name="csrf-token"]/@content', doc)[0];
      });
    },

    post : function (ps) {
      var self = this;
      return this.getToken().then(function (token) {
        if (ps.type === 'video') {
          return self.getMetadata(ps.pageUrl, token).then(function (metadata) {
            return self.update(ps, token, metadata);
          });
        }
        else {
          return self.update(ps, token);
        }
      });
    },

    decodeHTMLEntities : function (str) {
      var div = $N('div');
      div.innerHTML = str;
      return div.innerText;
    },

    update : function (ps, token, metadata) {
      var body = ps.body || '';
      if (body) {
        body = body.replace(/\r\n/g, "\n");
        body = body.replace(/\n<br(\s*\/)?>/ig, "\n");
        body = body.replace(/<br(\s*\/)?>\n/ig, "\n");
        body = body.replace(/<br(\s*\/)?>/ig, "\n");
        body = body.trimTag().trim();
        body = this.decodeHTMLEntities(body);
        description = joinText([description, '“' + body + '”'], "\n\n");
      }

      var data = {
        utf8               : '✓',
        authenticity_token : token,
        title              : (ps.type === 'regular') ? (ps.item || ps.page) : '',
        message            : ps.description.trim() || '\u200B',
        has_link           : ps.pageUrl ? 'true' : 'false',
        link               : ps.pageUrl,
        link_title         : ps.page,
        link_description   : body,
        link_image_path    : (ps.type === 'photo') ? ps.itemUrl : '',
        provider_domain    : '',
        picture            : '',
        edit_picture_url   : '',
        privacy            : ps.private ? 1 : 0,
        from_popup         : 1
      };

      if (metadata) {
        data.link_description = body || metadata.description;
        data.link_image_path  = metadata.pictures[0] && metadata.pictures[0].link_image_path;
      }

      return request(this.POST_URL, {
        multipart   : true,
        sendContent : data,
        headers     : {
          'X-CSRF-Token'     : token,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      });
    },

    getMetadata : function (url, token) {
      return request(this.META_URL + '?' + queryString({
        url : url
      }), {
        responseType : 'json',
        headers      : {
          'X-CSRF-Token'     : token,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      }).then(function (res) {
        return res.response;
      });
    }
  });
})();
