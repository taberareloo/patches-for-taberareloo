// ==Taberareloo==
// {
//   "name"        : "Reblog Extractor for Google+"
// , "description" : "Extract posts to reblog/reshare"
// , "include"     : ["content"]
// , "match"       : ["https://plus.google.com/*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/extractors/extractor.reblog.googleplus.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register({
    name     : 'ReBlog - Google+',
    ICON     : 'https://ssl.gstatic.com/s2/oz/images/faviconr3.ico',
    HOME_URL : 'https://plus.google.com',

    check : function (ctx) {
      return (/(plus\.google\.com)\//).test(ctx.href) && this.getActivityId(ctx);
    },

    getActivityId : function (ctx) {
      var box = $X(
        './ancestor-or-self::div[starts-with(@id, "update-")]', ctx.target)[0];
      return box && box.id.substr(7);
    },

    extract : function (ctx) {
      var self = this;
      var url  = this.HOME_URL + '/_/stream/getactivity/';
      var id   = this.getActivityId(ctx);
      return request(url + '?' + queryString({
        updateId : id,
        hl       : 'en',
        rt       : 'j'
      })).addCallback(function (res) {
        var data, item;

        data = res.responseText.substr(5).replace(/(\\n|\n)/g, '');
        data = self.parseJSON(data);
        data = self.getDataByKey(data[0], 'os.u');
        if (!data) {
          return null;
        }

        item = data[1];

        ctx.title = item[3] + ' - Google+';
        ctx.href = self.getAbsoluteURL(item[21]);

        var desc = '';
        var desc1 = item[77] ? item[47] : item[4];
        var desc2 = '';
        if (desc1) {
          desc1 = '<p><a href="' + self.getAbsoluteURL(item[21]) + '">' + item[3] + '</a>:<br />\n' + desc1 + '</p>';
        } else {
          desc1 = '<p><a href="' + self.getAbsoluteURL(item[21]) + '">' + item[3] + '</a>:</p>';
        }

        if (item[77]) {
          if (item[4]) {
            desc2 = '<p>' + (item[44][1] && ('<a href="' + self.getAbsoluteURL(item[77]) + '">' + item[44][0] + '</a>:<br />\n')) + item[4] + '</p>';
          } else if (item[44][1]) {
            desc2 = '<p><a href="' + self.getAbsoluteURL(item[77]) + '">' + item[44][0] + '</a>:</p>';
          }
        }

        if (desc1 && desc2) {
          desc = joinText([
            desc1,
            '<blockquote>' + desc2 + '</blockquote>'
          ], '\n\n');
        } else {
          desc = desc1 || desc2;
        }

        if (desc) {
          desc = '<blockquote>' + desc + '</blockquote>';
        }

        var result = {
          type        : 'link',
          item        : ctx.title,
          itemUrl     : ctx.href,
          body        : desc,
          description : '',
          favorite    : {
            name      : 'Google\\+',
            id        : id
          }
        };

        if (item[11].length) {
          var attachment = item[11][0];
          if (attachment[24][4] === 'video') {
            result = update(result, {
              type        : 'video',
              item        : attachment[3],
              itemUrl     : ctx.href = attachment[24][1],
              body        : attachment[5] && attachment[5][1]
            });
          } else if ((attachment[24][4] === 'image') || (attachment[24][4] === 'photo')) {
            result = update(result, {
              type        : 'photo',
              itemUrl     : (attachment[5] && attachment[5][1]) ||
                              (attachment[41] && attachment[41][0] && attachment[41][0][1]),
              body        : joinText([
                attachment[3] && ('<p><a href="' + attachment[24][1] + '">' + attachment[3] + '</a></p>'),
                attachment[21] && ('<p><em>' + attachment[21] + '</em></p>'),
                desc
              ], '\n\n')
            });
          } else if ((attachment[24][4] === 'document') || (attachment[24][3] === 'text/html')) {
            var attachment2 = item[11][1];
            if (attachment2 && ((attachment2[24][4] === 'image') || (attachment2[24][4] === 'photo'))) {
              result = update(result, {
                type        : 'photo',
                itemUrl     : (attachment2[5] && attachment2[5][1]) ||
                              (attachment2[41] && attachment2[41][0] && attachment2[41][0][1]),
                body        : joinText([
                  attachment[3] && ('<p><a href="' + attachment[24][1] + '">' + attachment[3] + '</a></p>'),
                  attachment[21] && ('<p><em>' + attachment[21] + '</em></p>'),
                  desc
                ], '\n\n')
              });
            } else if (attachment[21]) {
              result = update(result, {
                type        : 'link',
                item        : attachment[3],
                itemUrl     : ctx.href = attachment[24][1],
                body        : joinText([
                  attachment[21] && ('<p><em>' + attachment[21] + '</em></p>'),
                  desc
                ], '\n\n')
              });
            } else {
              result = update(result, {
                type        : 'link',
                item        : attachment[3],
                itemUrl     : ctx.href = attachment[24][1],
                body        : desc
              });
            }
          }
        }
        else if (item[97] && item[97].length) {
          var attachment = item[97][7] || item[97][4] ||  item[97][3] || item[97][2] || item[97][1];
          for (var key in attachment) {
            switch (key) {
            case '39748951':
            case '40154698':
            case '42861421':
              if (attachment[key][1]) {
                result = update(result, {
                  type    : 'photo',
                  itemUrl : (attachment[key][1].substr(0, 2) === '//' ? 'https:' : '') + attachment[key][1],
                  body    : joinText([
                    attachment[key][2] && ('<p><a href="' + attachment[key][0] + '">' + attachment[key][2] + '</a></p>'),
                    attachment[key][3] && ('<p><em>' + attachment[key][3] + '</em></p>'),
                    desc
                  ], '\n\n')
                });
              }
              else {
                result = update(result, {
                  type    : 'link',
                  item    : attachment[key][2],
                  itemUrl : ctx.href = attachment[key][0],
                  body    : joinText([
                    attachment[key][3] && ('<p><em>' + attachment[key][3] + '</em></p>'),
                    desc
                  ], '\n\n')
                });
              }
              break;
            case '40655821':
              result = update(result, {
                type    : 'photo',
                itemUrl : (attachment[key][1].substr(0, 2) === '//' ? 'https:' : '') + attachment[key][1],
                body    : joinText([
                  attachment[key][3] && ('<p><em>' + attachment[key][3] + '</em></p>'),
                  desc
                ], '\n\n')
              });
              break;
            case '41186541':
              result = update(result, {
                type    : 'video',
                item    : attachment[key][2],
                itemUrl : ctx.href = attachment[key][12],
                body    : attachment[key][3]
              });
              break;
            case '40842909':
              var attachment2 = attachment[key][41][0][2];
              for (var key2 in attachment2) {
                switch (key2) {
                case '40655821':
                  result = update(result, {
                    type    : 'photo',
                    itemUrl : (attachment2[key2][1].substr(0, 2) === '//' ? 'https:' : '') + attachment2[key2][1],
                    body    : joinText([
                      attachment2[key2][3] && ('<p><em>' + attachment2[key2][3] + '</em></p>'),
                      desc
                    ], '\n\n')
                  });
                  break;
                }
              }
            }
          }
        }
        return result;
      });
    },
    /**
     * Originally made with Open Source software JSAPI by +Mohamed Mansour
     * https://github.com/mohamedmansour/google-plus-extension-jsapi
     */
    parseJSON : function (str) {
      var cleaned = str.replace(/\[,/g, '[null,');
      cleaned = cleaned.replace(/,\]/g, ',null]');
      cleaned = cleaned.replace(/,,/g, ',null,');
      cleaned = cleaned.replace(/,,/g, ',null,');
      cleaned = cleaned.replace(/\{(\d+):/g, '{"$1":');
      return JSON.parse(cleaned);
    },
    getDataByKey : function (arr, key) {
      for (var i = 0, len = arr.length ; i < len ; i++) {
        var data = arr[i];
        if (data[0] === key) {
          return data;
        }
      }
      return null;
    },
    getAbsoluteURL : function (url) {
      if (url.substr(0, 2) === './') {
        return this.HOME_URL + url.substr(1);
      }
      else if (url.substr(0, 1) !== '/') {
        return this.HOME_URL + '/' + url;
      }
      else {
        return this.HOME_URL + url;
      }
    }
  }, 'ReBlog - Tumblr link', true);
})();
