// ==Taberareloo==
// {
//   "name"        : "Gunosy RSS"
// , "description" : "URL Generator for Gunosy RSS"
// , "include"     : ["background"]
// , "version"     : "0.1.3"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.gunosy.rss.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var version = chrome.runtime.getManifest().version;
  version = version.split('.');
  if (version.length > 3) {
    version.pop();
  }
  version = version.join('.');
  if (semver.gte(version, '3.0.12')) {
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/others/menu.gunosy.rss.tbrl.js', true);
    return;
  }

  var NAME      = 'Gunosy';
  var BASE_URL  = 'http://gunosy-rss.herokuapp.com/';

  Menus._register({
    type     : 'separator',
    contexts : ['all']
  });
  Menus._register({
    title    : 'Generate URL for Gunosy RSS',
    contexts : ['all'],
    onclick  : function(info, tab) {
      request('http://gunosy.com/edit/profile', { responseType: 'document' }).addCallback(function(res) {
        var doc = res.response;

        var user_name = $X('//input[@name="user[name]"]/@value', doc)[0];
        if (!user_name) {
          return alert(chrome.i18n.getMessage('error_notLoggedin', NAME));
        }

        var user_id = $X('//form[@class="edit_user"]/@id', doc)[0];
        user_id = user_id.substring(10);

        getCookies('gunosy.com', '_gunosy_session').addCallback(function(cookies) {
          if (!cookies.length) return alert(chrome.i18n.getMessage('error_notLoggedin', NAME));

          var url = BASE_URL + user_name + '.rss' + queryString({
            u              : user_id,
            gunosy_session : _gunosy_session = cookies[0].value
          }, true);

          var textarea = $N('textarea');
          document.body.appendChild(textarea);
          textarea.value = url;
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);

          alert(url + "\nをクリップボードにコピーしました");
        });
      });
    }
  });

  Menus.create();
})();
