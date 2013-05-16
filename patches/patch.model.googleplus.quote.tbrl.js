// ==Taberareloo==
// {
//   "name"        : "Optimize Quote Post to Google+"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Move a selection from body to description"
// , "include"     : ["background"]
// , "version"     : "1.2.4"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.quote.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  addAround(Models['Google+'], 'post', function(proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if (!ps.reshare && ps.body) {
      var body = ps.body.replace(/\r\n/g, "\n");
      body = body.replace(/\n<br(\s*\/)?>/ig, "\n");
      body = body.replace(/<br(\s*\/)?>\n/ig, "\n");
      body = body.replace(/<br(\s*\/)?>/ig, "\n");
      body = body.trimTag().trim();
      ps.description = joinText([ps.description, '“' + body + '”'], "\n\n");
      ps.body = null;
    }
    return proceed([ps]);
  });
})();
