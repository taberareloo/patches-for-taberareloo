// ==Taberareloo==
// {
//   "name"        : "Goo.gl Model"
// , "description" : "Add Google URL Shortener for Twitter"
// , "include"     : ["background"]
// , "version"     : "2.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/models/model.googl.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.Twitter.SHORTEN_SERVICE = 'goo.gl';

  Models.register({
    name     : 'goo.gl',
    ICON     : 'http://www.gstatic.com/urlshortener/favicon.ico',
    HOME_URL : 'http://goo.gl/',
    POST_URL : 'http://goo.gl/api/shorten',

    getSecurityToken : function () {
      return request(this.HOME_URL, { responseType: 'document' }).then(function (res) {
        var doc = res.response;
        var security_token = $X('//input[@name="security_token"]/@value', doc)[0];
        if (!security_token) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', 'Google URL Shortener'));
        }
        return security_token;
      });
    },

    shorten : function (url) {
      var self = this;
      if(/\/\/goo\.gl\//.test(url)) {
        return Promise.resolve(url);
      }

      return this.getSecurityToken().then(function (security_token) {
        return request(self.POST_URL, {
          sendContent : {
            url            : url,
            security_token : security_token
          },
          responseType : 'json'
        }).then(function (res) {
          return res.response ? res.response.short_url : '';
        }).catch(function (res) {
          return '';
        });
      });
    }
  });
})();
