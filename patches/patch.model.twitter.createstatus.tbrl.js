// ==Taberareloo==
// {
//   "name"        : "Post to Twitter surely"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Post to Twitter surely"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.twitter.createstatus.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  addAround(Models['Twitter'], 'createStatus', function (proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if (ps.body) {
      ps.body = ps.body.trimTag().replace(/\s+/g, ' ');
    }
    return proceed([ps]).then(function (status) {
      return status;
    }).catch(function (errmsg) {
console.log(errmsg);
      var over = '';
      if (typeof errmsg === 'string') {
        over = errmsg.extract(/post \((\d+) over\)/);
      }
      if (!over) {
        throw errmsg;
      }
      var len;
      if (ps.body) {
        len = ps.body.length;
        ps.body = ps.body.slice(0, -1 * over);
        over -= len;
      }
      if ((over > 0) && ps.item) {
        len = ps.item.length;
        ps.item = ps.item.slice(0, -1 * over);
        over -= len;
      }
      if ((over > 0) && ps.description) {
        len = ps.description.length;
        ps.description = ps.description.slice(0, -1 * over);
        over -= len;
      }
      if (over > 0) {
        throw errmsg;
      }
      return target[methodName](ps).then(function (status) {
        return status;
      });
    });
  });
})();
