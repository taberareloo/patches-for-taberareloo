// ==Taberareloo==
// {
//   "name"        : "Fix Tumblr like actions on AutoPagerizing"
// , "description" : "Fix Tumblr like actions on AutoPagerizing"
// , "include"     : ["background", "content"]
// , "match"       : [
//     "*://www.tumblr.com/dashboard*",
//     "*://www.tumblr.com/likes*",
//     "*://www.tumblr.com/blog/*",
//     "*://www.tumblr.com/tagged/*"
//   ]
// , "version"     : "0.3.4"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/userscripts/userscript.fix.tumblr.like.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    var version = chrome.runtime.getManifest().version;
    version = version.split('.');
    if (version.length > 3) {
      version.pop();
    }
    version = version.join('.');
    if (semver.gte(version, '3.0.12')) {
      Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/userscripts/userscript.fix.tumblr.like.tbrl.js', true);
      return;
    }
    return;
  }

  function doAction(action, data) {
    return request('http://www.tumblr.com/svc/' + action, {
      sendContent : data
    });
  }

  function toggleLike (post) {
    var like = $X('.//div[contains(concat(" ",@class," ")," like ")]', post)[0];
    if (like.classList.contains('liked')) {
      doAction('unlike', {
        form_key    : $X('id("tumblr_form_key")/@content')[0],
        'data[id]'  : $X('./div/@data-post-id', post)[0],
        'data[key]' : $X('./div/@data-reblog-key', post)[0]
      }).addCallback(function() {
        like.classList.remove('liked');
      });
    }
    else {
      doAction('like', {
        form_key    : $X('id("tumblr_form_key")/@content')[0],
        'data[id]'  : $X('./div/@data-post-id', post)[0],
        'data[key]' : $X('./div/@data-reblog-key', post)[0]
      }).addCallback(function() {
        like.classList.add('liked');
      });
    }
  }

  document.body.addEventListener('AutoPagerize_DOMNodeInserted', function(event) {
    var post = event.target;
    post.classList.add('AutoPagerized');
    var like = $X('.//div[contains(concat(" ",@class," ")," like ")]', post)[0];
    like.addEventListener('click', function (ev) {
      toggleLike(post);
    });
  });

  document.body.addEventListener('keydown', function (ev) {
    var current = UserScripts['Dashboard + Taberareloo'].getCurrentItem();
    if (!current || !current.classList.contains('AutoPagerized')) {
      return;
    }
    var key = keyString(ev);
    if (key === 'L') {
      toggleLike(current);
    }
  });

})();
