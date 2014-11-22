// ==Taberareloo==
// {
//   "name"        : "GimmeBar Model"
// , "description" : "Post to gimmebar.com"
// , "include"     : ["background"]
// , "version"     : "2.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/models/model.gimmebar.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'GimmeBar',
    ICON      : 'https://gimmebar.com/img/favicon.png',
    LINK      : 'https://gimmebar.com/',
    LOGIN_URL : 'https://gimmebar.com/login',

    INIT_URL  : 'https://gimmebar.com/ajax/bookmarklet_data',
    POST_URL  : 'https://gimmebar.com/bookmarklet/capture',
    CHECK_URL : 'https://gimmebar.com/ajax/content_url',

    check : function(ps) {
      return /photo|quote|link|video/.test(ps.type);
    },

    getCSRFToken : function() {
      var self = this;
      return request(this.INIT_URL, {
        responseType : 'json'
      }).then(function (res) {
        if (res.response) {
          return res.response.csrf_token;
        } else {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
      });
    },

    post : function(ps) {
      var self = this;

      var sendContent = {
        source   : ps.pageUrl,
        title    : ps.item || ps.page,
        private  : 1,
        use_prev : 0
      };

      if (ps.description) {
        sendContent.description = ps.description;
      }

      switch (ps.type) {
      case 'photo':
        sendContent.url = ps.itemUrl;
        if (ps.file) {
          return this.upload(ps, sendContent);
        }
        break;
      case 'quote':
        sendContent.text = ps.body;
        break;
      case 'link':
        sendContent.url = ps.itemUrl;
        break;
      case 'video':
        return this.post_video(ps, sendContent);
      }

      return this.getCSRFToken().then(function (csrftoken) {
        sendContent._csrf = csrftoken;
        return request(self.POST_URL, {
          sendContent : sendContent
        });
      });
    },

    post_video : function(ps, sendContent) {
      var self = this;
      return request(this.CHECK_URL + '?' + queryString({
        check : ps.itemUrl || ps.pageUrl
      }), {
        responseType : 'json'
      }).then(function (res) {
        if (res.response) {
          var data = res.response;
          sendContent.assimilator = JSON.stringify(data[0]);
          return self.getCSRFToken().then(function (csrftoken) {
            sendContent._csrf = csrftoken;
            return request(self.POST_URL, {
              sendContent : sendContent
            });
          });
        }
      }).catch(function (e) {
        throw new Error('Not supported a video post on this site.');
      });
    },

    upload : function(ps, sendContent) {
      var self = this;

      return fileToDataURL(ps.file).then(function (dataURL) {
        sendContent.raw = dataURL;
        return self.getCSRFToken().then(function (csrftoken) {
          sendContent._csrf = csrftoken;
          return request(self.POST_URL, {
            sendContent : sendContent
          });
        });
      });
    }
  });
})();
