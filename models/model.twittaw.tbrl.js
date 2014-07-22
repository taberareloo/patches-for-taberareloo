// ==Taberareloo==
// {
//   "name"        : "Twittaw Model"
// , "namespace"   : "http://yungsang.com/"
// , "description" : "Post to twittaw.com"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.twittaw.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'Twittaw',
    ICON      : 'http://twittaw.appspot.com/favicon.ico',
    LINK      : 'http://twittaw.appspot.com/',
    LOGIN_URL : 'http://twittaw.appspot.com/',

    HOME_URL : 'http://twittaw.appspot.com/',
    POST_URL : 'http://twittaw.appspot.com/thread/post',

    check : function(ps) {
      return (/(regular|photo|quote|link|video)/).test(ps.type) && !ps.file;
    },

    getToken : function() {
      return request(this.HOME_URL).then(function (res) {
        var token =  res.responseText.extract(/name="token" value="([a-z0-9-]+?)"/);
        if (!token) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return {token : token};
      });
    },

    post : function(ps){
      var info = [ps.item, ps.itemUrl, ps.body, ps.description];
      if (ps.type == 'photo') {
        info.push(ps.pageUrl);
      }
      var tags = joinText(ps.tags, ' #');
      if (tags) {
        info.push('#' + tags);
      }
      return this.update(joinText(info, "\n", true));
    },

    update : function(title) {
      var self = this;
      return self.getToken().then(function (token) {
        return request(self.POST_URL, {
          sendContent : update(token, {title : title})
        });
      });
    }
  });
})();
