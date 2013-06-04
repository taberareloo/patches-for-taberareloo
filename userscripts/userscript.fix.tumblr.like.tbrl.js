// ==Taberareloo==
// {
//   "name"        : "Fix Tumblr like actions on AutoPagerizing"
// , "description" : "Fix Tumblr like actions on AutoPagerizing"
// , "include"     : ["content"]
// , "match"       : ["http://www.tumblr.com/dashboard*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/userscripts/userscript.fix.tumblr.like.tbrl.js"
// }
// ==/Taberareloo==

(function() {

  function doAction(action, data) {
    return request('http://www.tumblr.com/svc/' + action, {
      sendContent : data
    });
  }

  document.body.addEventListener('AutoPagerize_DOMNodeInserted', function(event) {
    var post = event.target;
    var like = $X('.//div[contains(concat(" ",@class," ")," like ")]', post)[0];
    like.addEventListener('click', function(ev) {
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
    });
  });

})();