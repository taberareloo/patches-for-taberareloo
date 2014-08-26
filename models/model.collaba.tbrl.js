// ==Taberareloo==
// {
//   "name"        : "Collaba Model"
// , "description" : "Post to collaba.jp"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.collaba.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'Collaba',
    ICON      : 'data:image/png;base64,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',
    LINK      : 'http://collaba.jp/',
    LOGIN_URL : 'http://collaba.jp/',

    HOME_URL : 'http://collaba.jp/',
    POST_URL : 'http://collaba.jp/_/post/send',

    check : function (ps) {
      return /regular|photo|quote|link|video/.test(ps.type);
    },

    getToken : function () {
      var self = this;
      return getCookies('collaba.jp', 'logged_in').then(function (cookies) {
        var cookie = cookies[0];
        if (!cookie || cookie !== 'yes') {
          new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return request(self.HOME_URL).then(function (res) {
          var token = res.responseText.extract(/meta content="([^"]+?)" name="csrf-token"/);
          return {token : token};
        });
      });
    },

    post : function (ps) {
      var self = this;

      var description = ps.description || '';
      if (ps.type === 'regular') {
        description = joinText([ps.item, ps.description], "\n");
      }
      else {
        var body = ps.body || '';
        if (body) {
          body = body.replace(/\r\n/g, "\n");
          body = body.replace(/\n<br(\s*\/)?>/ig, "\n");
          body = body.replace(/<br(\s*\/)?>\n/ig, "\n");
          body = body.replace(/<br(\s*\/)?>/ig, "\n");
          body = body.trimTag().trim();
          body = self.decodeHTMLEntities(body);
        }
        body = joinText([
          (ps.item || ps.page) ? (ps.item || ps.page) : '', ps.pageUrl,
          body ? '“' + body + '”' : ''], "\n");
        description = joinText([ps.description, body], "\n\n");
      }

      return (
        ((ps.type === 'photo') && !ps.file) ? self.download(ps) : Promise.resolve(ps.file)
      ).then(function (file) {
        ps.file = file;
        return self.getToken().then(function (token) {
          var sendContent = {
            message    : description,
            is_twitter : 'false'
          };

          if (ps.file) {
            sendContent['post[s3_image]'] = ps.file;
          }

          return request(self.POST_URL, {
            sendContent : sendContent,
            multipart   : true,
            headers     : {
              'X-CSRF-Token' : token.token
            },
            responseType : 'json'
          }).then(function (res) {
            var json = res.response;
            if (json.state === false) {
              throw new Error('');
            }
          });
        });
      });
    },

    download : function (ps) {
      var self = this;
      return (
        ps.file ? Promise.resolve(ps.file) :
          download(ps.itemUrl, getFileExtension(ps.itemUrl)).then(function (entry) {
            return getFileFromEntry(entry);
          }).catch(function (e) {
            throw new Error('Could not get an image file.');
          })
      );
    },

    decodeHTMLEntities : function(str) {
      var div = $N('div');
      div.innerHTML = str;
      return div.innerText;
    }
  });
})();
