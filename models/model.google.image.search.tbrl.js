// ==Taberareloo==
// {
//   "name"        : "Google Image Search Model"
// , "description" : "Search similar images by Google"
// , "include"     : ["background"]
// , "version"     : "0.1.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.google.image.search.tbrl.js"
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
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/models/model.google.image.search.tbrl.js', true);
    return;
  }

  Models.register({
    name : 'Google Image Search',
    ICON : 'http://www.google.com/images/icons/product/images-32.gif',
    LINK : 'https://www.google.com/imghp',

    SEARCH_URL : 'https://www.google.com/searchbyimage',
    UPLOAD_URL : 'https://www.google.com/searchbyimage/upload',

    check : function (ps) {
      return ps.type === 'photo';
    },

    redirectUrl : null,

    post : function (ps) {
      if (ps.file) {
        var self = this;
        this.redirectUrl = null;
        this.addListener();
        return request(this.UPLOAD_URL, {
          sendContent  : {
            encoded_image : ps.file
          }
        }).addCallback(function (res) {
          self.removeListener();
          if (self.redirectUrl) {
            chrome.tabs.create({
              url    : self.redirectUrl,
              active : false
            });
          }
        });
      } else {
        chrome.tabs.create({
          url    : this.SEARCH_URL + queryString({
            image_url : ps.itemUrl
          }, true),
          active : false
        });
        return succeed();
      }
    },

    checkRedirectHeader : function (details) {
      Models['Google Image Search'].redirectUrl = details.redirectUrl;
    },

    addListener : function () {
      chrome.webRequest.onBeforeRedirect.addListener(this.checkRedirectHeader, {
        urls  : [this.UPLOAD_URL],
        types : ['xmlhttprequest']
      }, ['responseHeaders']);
    },
    removeListener : function () {
      chrome.webRequest.onBeforeRedirect.removeListener(this.checkRedirectHeader, {
        urls  : [this.UPLOAD_URL],
        types : ['xmlhttprequest']
      }, ['responseHeaders']);
    }
  });
})();
