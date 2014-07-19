// ==Taberareloo==
// {
//   "name"        : "Check Tumblr Daily Post Limit"
// , "description" : "Display the current number of Today's posts in Tumblr"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
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
      timestamp = getResetTimestamp();
      posts  = 0;
      photos = 0;
      var promises = [];

      chrome.contextMenus.update(menu.id, {
        enabled : false
      });

      Promise.resolve(TBRL.Notification.notify({
        title   : title,
        message : 'Counting...'
      })).then(function (n) {
        notification = n;

        (Tumblr.blogs ? Promise.resolve() : Tumblr.getTumblelogs()).then(function (blogs) {
          Tumblr.blogs.forEach(function (id) {
            promises.push(getPosts(id, 0));
          });
          promiseAllHash(promises).then(function (ress) {
            if (notification) {
              setTimeout(function () {
                TBRL.Notification.notify({
                  id      : notification.tag,
                  title   : title,
                  message : 'Counting... Done. Post: ' + posts + ', Photo: ' + photos,
                  onclick : function () {
                    this.close();
                  }
                });
              }, 100);
            }
            chrome.contextMenus.update(menu.id, {
              title   : 'Check again (Post: ' + posts + '/250, Photo: ' + photos + '/150)',
              enabled : true
            }, function() {});
          });
        }).catch(function (e) {
          if (notification) {
            notification.close();
          }
          chrome.contextMenus.update(menu.id, {
            enabled : true
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
    }).then(function (res) {
      var data = JSON.parse(res.responseText);
      data.response.posts.forEach(function (post) {
        if (post.timestamp > timestamp) {
          posts++;
          if (!post.reblogged_from_id && (post.type === 'photo')) {
            photos++;
          }
        }
      });
      if (notification) {
        TBRL.Notification.notify({
          id      : notification.tag,
          title   : title,
          message : 'Counting... Post: ' + posts + ', Photo: ' + photos
        });
      }
      if (data.response.posts[data.response.posts.length - 1].timestamp > timestamp) {
        return getPosts(id, offset + data.response.posts.length);
      }
    }).catch(function (e) {
      return Promise.resolve();
    });
  }

  var oneday = 24 * 60 * 60 * 1000;

  function getEDTStart() { // the second Sunday of March, 2:00 EST => 3:00 EDT
    var now = new Date();
    var utc = Date.UTC(now.getUTCFullYear(), 3 - 1, 1, 2 + 5, 0, 0);
    var ret = new Date(utc);
    return utc + ((ret.getUTCDay() ? (14 - ret.getUTCDay()) : 7) * oneday);
  }

  function getEDTEnd() { // the first Sunday of November, 2:00 EDT => 1:00 EST
    var now = new Date();
    var utc = Date.UTC(now.getUTCFullYear(), 11 - 1, 1, 2 + 4, 0, 0);
    var ret = new Date(utc);
    return utc + ((ret.getUTCDay() ? (7 - ret.getUTCDay()) : 0) * oneday);
  }

  function isEDT(date) {
    date = date || new Date();
    if ((date.getTime() >= getEDTStart()) && (date.getTime() < getEDTEnd())) {
      return true;
    }
    else {
      return false;
    }
  }

  function getResetTimestamp() {
    var now = new Date();
    var offset = isEDT(now) ? 4 : 5;
    var timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), offset, 0, 0);
    if (timestamp > now.getTime()) {
      timestamp -= oneday;
    }
    return Math.floor(timestamp / 1000);
  }
})();
