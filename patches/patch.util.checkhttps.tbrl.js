// ==Taberareloo==
// {
//   "name"        : "No Check HTTPS"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Omit to check HTTPS"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.5.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.util.checkhttps.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  addAround(window, 'checkHttps', function(proceed, args, target, methodName) {
    var ps = proceed(args);
    ps.pageUrl = ps.https.pageUrl[1];
    ps.itemUrl = ps.https.itemUrl[1];
    ps.https.pageUrl[0] = false;
    ps.https.itemUrl[0] = false;
    return ps;
  });
})();