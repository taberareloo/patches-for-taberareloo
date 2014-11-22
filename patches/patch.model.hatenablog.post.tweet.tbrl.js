// ==Taberareloo==
// {
//   "name"        : "Add Twitter Widgets to HatenaBlog"
// , "description" : "Add Twitter Widgets to HatenaBlog on sharing a tweet"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/patches/patch.model.hatenablog.post.tweet.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Models['HatenaBlog'], {
    post : function(ps){
      var self = this;

      var template;
      if (ps.type === 'regular') {
        template = '<p>%body%</p>';
      } else if (ps.type === 'quote') {
        if (ps.pageUrl.match(/\/\/twitter\.com\/.*?\/(?:status|statuses)\/\d+/)) {
          template = '<blockquote class="twitter-tweet">' +
                       '%body%' +
                       '<p><cite><a href="%pageUrl%">%page%</a></cite></p>' +
                     '</blockquote>' +
                     '<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';
        } else {
          template = '<blockquote>' +
                       '%body%' +
                       '<p><cite><a href="%pageUrl%">%page%</a></cite></p>' +
                     '</blockquote>';
        }
      } else if (ps.type === 'photo') {
        template = '<p><a href="%pageUrl%"><img src="%itemUrl%"></a></p>' +
                   '<p><cite><a href="%pageUrl%">%page%</a></cite></p>';
      } else if (ps.type === 'link') {
        template = '<p><a href="%itemUrl%">%item%</a></p>';
      } else if (ps.type === 'video') {
        template = '<p>%itemUrl%:embed</p>' +
                   '<p><a href="%itemUrl%">%item%</a></p>';
      }

      if (ps.description) {
        template += '<p>%description%</p>';
      }

      var data = {
        body        : self.paragraph(ps.body),
        description : self.paragraph(ps.description),
        item        : escapeHTML(ps.item || ''),
        itemUrl     : escapeHTML(ps.itemUrl || ''),
        page        : escapeHTML(ps.page || ''),
        pageUrl     : escapeHTML(ps.pageUrl || '')
      };

      var body = templateExtract(template, data);

      // regularのときはユーザーがタイトルを入力できる．
      // pageとitemが一致しないとき，ユーザーが何か入力しているので，タイトルに設定する．
      var title = '';
      if (ps.type === 'regular' || ps.page !== ps.item) {
        title = ps.item;
      }

      return self.getUserName().then(function (userName) {
        self.getApiKey().then(function (apiKey){
          var xml = self.generateXML({
            userName   : escapeHTML(userName),
            title      : escapeHTML(title),
            body       : escapeHTML(body),
            isDraft    : escapeHTML('false'),
            categories : ps.tags
          });

          return request(self.postEndpoint(), {
            method      : 'post',
            mode        : 'raw',
            sendContent : xml,
            username    : userName,
            password    : apiKey
          });
        });
      });
    }
  });
})();
