// ==Taberareloo==
// {
//   "name"        : "wri.pe Model"
// , "description" : "Post to wri.pe"
// , "include"     : ["background"]
// , "version"     : "0.1.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.wripe.tbrl.js"
// }
// ==/Taberareloo==

(function() {

  Models.register({
    name       : 'wri.pe',
    ICON       : 'http://wri.pe/favicon.ico',
    LINK       : 'http://wri.pe/',
    LOGIN_URL  : 'http://wri.pe/',

    NEW_URL    : 'http://wri.pe/new',

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
 
      return request(this.NEW_URL).addCallback(function(res) {
        var doc = createHTML(res.responseText);

        var csrf_token = $X('//meta[@name="csrf-token"]/@content', doc)[0];
        var form       = $X('id("edit_page")', doc)[0];
        if (!form) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        var post_url   = self.LINK + form.getAttribute('action').substring(1);

        var sendContent = {
          utf8                    : '✓',
          _method                 : 'patch',
          authenticity_token      : csrf_token,
          'page[lock_version]'    : 0,
          'page[title]'           : ps.item || ps.page,
          'page[body]'            : body,
          'page[read_permission]' : 10 
        };

        return request(post_url, {
          sendContent : sendContent,
          heeaders    : {
            'X-CSRF-Token'     : csrf_token,
            'X-Requested-With' : 'XMLHttpRequest'
          }
        });
      });
    }
  });
})();