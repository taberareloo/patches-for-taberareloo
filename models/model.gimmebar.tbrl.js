// ==Taberareloo==
// {
//   "name"        : "GimmeBar Model"
// , "description" : "Post to gimmebar.com"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.gimmebar.tbrl.js"
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
      return request(this.INIT_URL).addCallback(function(res) {
        if (res.responseText) {
          var data = {};
          try {
            data = JSON.parse(res.responseText);
          }
          catch (e) {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
          return data.csrf_token;
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

      return this.getCSRFToken().addCallback(function(csrftoken) {
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
      })).addCallback(function(res) {
        if (res.responseText) {
          var data = JSON.parse(res.responseText);
          sendContent.assimilator = JSON.stringify(data[0]);
          return self.getCSRFToken().addCallback(function(csrftoken) {
            sendContent._csrf = csrftoken;
            return request(self.POST_URL, {
              sendContent : sendContent
            });
          });
        }
      }).addErrback(function(e) {
        throw new Error('Not supported a video post on this site.');
      });
    },

    upload : function(ps, sendContent) {
      var self = this;

      return fileToDataURL(ps.file).addCallback(function (dataURL) {
        sendContent.raw = dataURL;
        return self.getCSRFToken().addCallback(function(csrftoken) {
          sendContent._csrf = csrftoken;
          return request(self.POST_URL, {
            sendContent : sendContent
          });
        });
      });
    }
  });
})();
