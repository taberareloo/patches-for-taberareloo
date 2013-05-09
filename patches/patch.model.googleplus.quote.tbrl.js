// ==Taberareloo==
// {
//   "name"        : "Optimize Quote Post to Google+"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Move a long selection from body to description"
// , "include"     : ["background"]
// , "version"     : "1.2.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.quote.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  addAround(Models['Google+'], 'post', function(proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if (!ps.reshare && ps.body) {
      var body = ps.body.trimTag();
      if (body.length > 200) {
        ps.description = joinText([ps.description, '“' + body + '”'], "\n\n");
        ps.body = null;
      }
    }
    return proceed([ps]);
  });
})();
