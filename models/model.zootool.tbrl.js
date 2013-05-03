// ==Taberareloo==
// {
//   "name"        : "Zootool Model"
// , "description" : "Post an image to zootool.com"
// , "include"     : ["background"]
// , "version"     : "1.2.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.zootool.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'Zootool',
    ICON      : 'http://zootool.com/favicon.ico',
    LINK      : 'http://zootool.com/',
    LOGIN_URL : 'http://zootool.com/',

    ITEM_URL  : 'http://zootool.com/post/item/',
    POST_URL  : 'http://zootool.com/post/actions/',

    check : function(ps) {
      return (/(photo|quote|link|video)/).test(ps.type) && !ps.file;
    },

    getAuthCookie: function() {
      var self = this;
      return getCookies('zootool.com', 'zoo').addCallback(function(cookies) {
        if (cookies.length) {
          var zoo = cookies[cookies.length-1].value;
          if (zoo === 'cookie-test') {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
          return zoo;
        } else {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
      });
    },

    post : function(ps) {
      var self = this;
      return this.getAuthCookie().addCallback(function(zoo) {
        return request(self.ITEM_URL + '?' + queryString({
          iframe  : 'true',
          url     : ps.itemUrl || ps.pageUrl,
          title   : ps.item || ps.page,
          referer : ps.pageUrl
        }), { responseType: 'document' }).addCallback(function(res) {
          var form = res.response.getElementById('dropdown-tab-add');
          var params = {};
          if (form) {
            params = formContents(form, true);
          }
          else {
            throw new Error('It has already been collected.');
          }

          params.description = joinText([
            ps.description,
            ps.body ? '“' + ps.body + '”' : null
          ], "\n\n");
          params.tags   = ps.tags ? ps.tags.join(',') : '';
          params.public = ps.private ? 'n' : 'y';

          return request(self.POST_URL, {
            sendContent : params,
            headers : {
              'X-Requested-With' : 'XMLHttpRequest'
            }
          }).addCallback(function(res) {
            var json = JSON.parse(res.responseText);
            if (json.status !== 'success') {
              throw new Error(json.msg);
            }
          });
        });
      });
    }
  });
})();
