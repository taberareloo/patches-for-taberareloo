// ==Taberareloo==
//{
//  "name"        : "Optimize Quote Post to Google+"
//, "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
//, "description" : "Move a long selection from body to description on quote"
//, "include"     : ["background"]
//, "version"     : "1.0"
//, "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/model.googleplus.quote.tbrl.js"
//}
// ==/Taberareloo==

(function() {
  addAround(Models['Google+'], 'post', function(proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if ((ps.type === 'quote') && (ps.body && (ps.body.length > 200))) {
      ps.description = joinText([ps.description, (ps.body ? '“' + ps.body + '”' : '')], "\n\n");
      ps.body = null;
    }
    return proceed([ps]);
  });
})();
