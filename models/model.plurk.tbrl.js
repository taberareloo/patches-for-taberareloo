// ==Taberareloo==
// {
//   "name"        : "Plurk Model"
// , "description" : "Post to plurk.com"
// , "include"     : ["background"]
// , "version"     : "1.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.plurk.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name       : 'Plurk',
    ICON       : 'http://statics.plurk.com/b872d9e40dbce69e5cde4787ccb74e60.png',
    LINK       : 'http://www.plurk.com/',
    LOGIN_URL  : 'http://www.plurk.com/Users/showLogin',

    POST_URL   : 'http://www.plurk.com/TimeLine/addPlurk',

    check : function(ps) {
      return (/(regular|photo|quote|link|video)/).test(ps.type) && !ps.file;
    },

    getUserID : function() {
      return request(this.LINK).addCallback(function(res) {
        var user_id =  res.responseText.extract(/"user_id": ([0-9]+),/);
        if (!user_id) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return user_id;
      });
    },

    post : function(ps) {
      var self = this;

      var maxLength = 210;

      var text = '';
      if (ps.type === 'regular') {
        text = joinText([ps.item, ps.description], "\n");
      }
      else {
        var title = (ps.item || ps.page || '');
        if (ps.pageUrl && title) {
          title = ps.pageUrl + ' (' + title + ')';
        }
        else {
          title = joinText([title, ps.pageUrl], "\n");
        }
        text = joinText([
          (ps.type === 'photo') ? ps.itemUrl : '',
          title,
          (ps.body) ? '“' + ps.body + '”' : ''], "\n", true);
        text = joinText([ps.description, text], "\n\n");
      }

      if (text.length > maxLength) {
        text = text.substring(0, maxLength - 3) + '...';
      }

      return this.getUserID().addCallback(function(user_id) {
        return request(self.POST_URL, {
          sendContent : {
            posted      : (new Date()).toISOString(),
            qualifier   : 'shares',
            content     : text,
            lang        : 'en',
            no_comments : 0,
            uid         : user_id
          }
        }).addCallback(function(res) {
        });
      });
    }
  });
})();
