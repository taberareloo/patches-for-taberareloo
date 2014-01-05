// ==Taberareloo==
// {
//   "name"        : "Check Tumblr Daily Post Limit"
// , "description" : "Display the current number of Today's posts in Tumblr"
// , "include"     : ["background"]
// , "version"     : "0.1.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.tumblr.check.daily-post-limit.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var API_URL = 'http://api.tumblr.com/v2/';
  var API_KEY = 'c1TjhCQ860vZlq2gK2EsU21iA7t0Tz4XxYHuJ6oJj6mf3tVDlJ';

  var title = 'Check Tumblr Daily Post Limit';

  var notification = null;
  var timestamp = 0;
  var posts  = 0;
  var photos = 0;

  Menus._register({
    type     : 'separator',
    contexts : ['all']
  });
  var menu = Menus._register({
    title    : title,
    contexts : ['all'],
    onclick  : function(info, tab) {
      timestamp = getResetDateTime();
      posts  = 0;
      photos = 0;
      var deferreds = [];

      maybeDeferred(TBRL.Notification.notify({
        title   : title,
        message : 'Counting...'
      })).addCallback(function (n) {
        notification = n;

        Tumblr.getTumblelogs().addCallback(function(blogs) {
          Tumblr.blogs.forEach(function (id) {
            deferreds.push(getPosts(id, 0));
          });
          new DeferredHash(deferreds).addCallback(function (ress) {
            TBRL.Notification.notify({
              id      : notification.tag,
              title   : title,
              message : 'Done. Post: ' + posts + ', Photo: ' + photos,
              timeout : 3
            });
            chrome.contextMenus.update(menu.id, {
              title : 'Check again (Post: ' + posts + '/250, Photo: ' + photos + '/150)'
            }, function() {});
          });
        });
      });
    }
  });
  Menus.create();

  function getPosts(id, offset) {
    return request(API_URL + 'blog/' + id + '.tumblr.com/posts', {
      queryString : {
        api_key     : API_KEY,
        offset      : offset,
        reblog_info : true
      }
    }).addCallback(function (res) {
      var data = JSON.parse(res.responseText);
      data.response.posts.forEach(function (post) {
        if (post.timestamp > timestamp) {
          posts++;
          if (!post.reblogged_from_id && (post.type === 'photo')) {
            photos++;
          }
        }
      });
      TBRL.Notification.notify({
        id      : notification.tag,
        title   : title,
        message : 'Counting... Post: ' + posts + ', Photo: ' + photos
      });
      if (data.response.posts[data.response.posts.length - 1].timestamp > timestamp) {
        return getPosts(id, offset + data.response.posts.length);
      }
    }).addErrback(function (e) {
      return succeed();
    });
  }

  function getResetDateTime() {
    var now = new Date();
    var utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0);
    if (utc > now.getTime()) {
      utc -= 24 * 60 * 60 * 1000;
    }
    return Math.floor(utc / 1000);
  }
})();
