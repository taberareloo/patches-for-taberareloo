// ==Taberareloo==
// {
//   "name"        : "Plurk Model"
// , "description" : "Post to plurk.com"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
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
          (ps.body) ? '“' + strip_tags(ps.body) + '”' : ''], "\n");
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

  function strip_tags(input, allowed) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Luke Godfrey
    // +      input by: Pul
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +      input by: Alex
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Marc Palau
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Eric Nagel
    // +      input by: Bobby Drake
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Tomasz Wesolowski
    // +      input by: Evertjan Garretsen
    // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
    // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    // *     returns 2: '<p>Kevin van Zonneveld</p>'
    // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
    // *     example 4: strip_tags('1 < 5 5 > 1');
    // *     returns 4: '1 < 5 5 > 1'
    // *     example 5: strip_tags('1 <br/> 1');
    // *     returns 5: '1  1'
    // *     example 6: strip_tags('1 <br/> 1', '<br>');
    // *     returns 6: '1  1'
    // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
    // *     returns 7: '1 <br/> 1'
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }
})();
