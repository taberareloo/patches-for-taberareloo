// ==Taberareloo==
// {
//   "name"        : "二次元画像詳細検索 Model"
// , "description" : "Search similar images by 二次元画像詳細検索"
// , "include"     : ["background"]
// , "version"     : "0.1.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.ascii2d.image.search.tbrl.js"
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
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/models/model.ascii2d.image.search.tbrl.js', true);
    return;
  }

  Models.register({
    name : '二次元画像詳細検索',
    ICON : 'http://www.ascii2d.net/favicon.ico',
    LINK : 'http://www.ascii2d.net',

    SEARCH_URL : 'http://www.ascii2d.net/imagesearch/search',

    check : function (ps) {
      return ps.type === 'photo';
    },

    redirectUrl : null,

    post : function (ps) {
      var self = this;

      var sendContent = null;
      if (ps.file) {
        sendContent = {
          'upload[file]' : ps.file
        };
      } else {
        sendContent = {
          uri : ps.itemUrl
        };
      }

      this.redirectUrl = null;
      this.addListener();
      return request(this.SEARCH_URL, {
        sendContent : sendContent,
        multipart   : true
      }).addCallback(function (res) {
        self.removeListener();
        if (self.redirectUrl) {
          chrome.tabs.create({
            url    : self.redirectUrl,
            active : false
          });
        }
      });
    },

    checkRedirectHeader : function (details) {
      Models['二次元画像詳細検索'].redirectUrl = details.redirectUrl;
    },

    addListener : function () {
      chrome.webRequest.onBeforeRedirect.addListener(this.checkRedirectHeader, {
        urls  : [this.SEARCH_URL],
        types : ['xmlhttprequest']
      }, ['responseHeaders']);
    },
    removeListener : function () {
      chrome.webRequest.onBeforeRedirect.removeListener(this.checkRedirectHeader, {
        urls  : [this.SEARCH_URL],
        types : ['xmlhttprequest']
      }, ['responseHeaders']);
    }
  });
})();
