// ==Taberareloo==
// {
//   "name"        : "Image Operation with ImgOps.com"
// , "description" : "Operate an image with online image utilities at ImgOps.com"
// , "include"     : ["background"]
// , "version"     : "1.0.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.photo.operate.imgops.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title    : 'Photo - Operate - ImgOps',
    contexts : ['image'],
    onclick  : function(info, tab) {
      if ((info.mediaType !== 'image') || (!info.srcUrl)) return;

      chrome.tabs.create({
        url    : 'http://imgops.com/' + info.srcUrl,
        active : false
      }, function(tab) {
      });
    }
  }, null, 'Photo - Capture', true);

  Menus.create();
})();
