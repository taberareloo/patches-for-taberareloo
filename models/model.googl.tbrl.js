// ==Taberareloo==
// {
//   "name"        : "Goo.gl Model"
// , "description" : "Add Google URL Shortener for Twitter"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.googl.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.Twitter.SHORTEN_SERVICE = 'goo.gl';

  Models.register({
    name     : 'goo.gl',
    ICON     : 'http://www.gstatic.com/urlshortener/favicon.ico',
    HOME_URL : 'http://goo.gl/',
    POST_URL : 'http://goo.gl/api/shorten',

    getSecurityToken : function() {
      return request(this.HOME_URL, { responseType: 'document' }).addCallback(function(res) {
        var doc = res.response;
        var security_token = $X('//input[@name="security_token"]/@value', doc)[0];
        if (!security_token) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', 'Google URL Shortener'));
        }
        return security_token;
      });
    },

    shorten : function(url) {
      var self = this;
      if(/\/\/goo\.gl\//.test(url)) {
        return succeed(url);
      }

      return this.getSecurityToken().addCallback(function(security_token) {
        return request(self.POST_URL, {
          sendContent : {
            url            : url,
            security_token : security_token
          }
        }).addCallback(function(res) {
          var json = JSON.parse(res.responseText);
          return json.short_url;
        });
      });
    }
  });
})();
