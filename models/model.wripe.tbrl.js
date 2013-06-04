// ==Taberareloo==
// {
//   "name"        : "wri.pe Model"
// , "description" : "Post to wri.pe"
// , "include"     : ["background"]
// , "version"     : "0.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.wripe.tbrl.js"
// }
// ==/Taberareloo==

(function() {

  Models.register({
    name      : 'wri.pe',
    ICON      : 'https://wri.pe/favicon.ico',
    LINK      : 'https://wri.pe/',
    LOGIN_URL : 'https://wri.pe/',

    SESS_URL  : 'https://wri.pe/session.json',
    POST_URL  : 'https://wri.pe/pages.json',

    YOUTUBE_REGEX : /http(?:s)?:\/\/(?:.*\.)?youtube.com\/watch\?v=([a-zA-Z0-9_-]+)[-_.!~*'()a-zA-Z0-9;\/?:@&=+\$,%#]*/g,

    check : function(ps) {
      return /regular|photo|quote|link|video/.test(ps.type) && !ps.file;;
    },

    post : function(ps) {
      var self = this;

      var body = '';
      if (ps.type !== 'video') {
        body = joinText([
          ps.description,
          (ps.type === 'photo') ? "![" + ps.item + "](" + ps.itemUrl + ")" : '',
          (ps.body) ? '“' + ps.body + '”' : '',
         'via ( [' + ps.page + '](' + ps.pageUrl + ") )"
       ], "  \n");
      }
      else {
        if (ps.itemUrl.match(this.YOUTUBE_REGEX)) {
          var video_id = ps.itemUrl.replace(this.YOUTUBE_REGEX, '$1');
          ps.body = '<iframe width="640" height="360" src="http://www.youtube.com/embed/' + video_id + '" frameborder="0" allowfullscreen="allowfullscreen"></iframe>';
        }
        body = joinText([
          ps.description,
          ps.body,
          'via ( [' + ps.page + '](' + ps.pageUrl + ") )"
        ], "  \n");
      }

      return request(this.SESS_URL).addCallback(function(res) {
        var json = JSON.parse(res.responseText);

        var sendContent = {
          'page[title]'        : ps.item || ps.page,
          'page[body]'         : body,
          'page[dates_json]'   : JSON.stringify([Math.floor((new Date()).getTime() / 1000)]),
          'page[lock_version]' : 0,
          'page[archived]'     : false
        };

        return request(self.POST_URL, {
          sendContent : sendContent,
          headers    : {
            'X-CSRF-Token'     : json.csrf_token,
            'X-Requested-With' : 'XMLHttpRequest'
          }
        });
      }).addErrback(function() {
        throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
      });
    }
  });
})();