// ==Taberareloo==
// {
//   "name"        : "Post to Twitter surely"
// , "namespace"   : "https://github.com/taberareloo/patches-for-taberareloo"
// , "description" : "Post to Twitter surely"
// , "include"     : ["background"]
// , "version"     : "2.1.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/patches/patch.model.twitter.createstatus.tbrl.js"
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
    }).catch(function (e) {
console.log(e);
      var over = '';
      if (typeof e === 'string') {
        over = e.extract(/post \((\d+) over\)/);
      }
      if (typeof e.message === 'string') {
        over = e.message.extract(/post \((\d+) over\)/);
      }
      if (!over) {
        throw e;
      }
      var len;
      if (ps.item) {
        len = ps.item.length;
        ps.item = ps.item.slice(0, -1 * over);
        over -= len;
      }
      if ((over > 0) && ps.body) {
        len = ps.body.length;
        ps.body = ps.body.slice(0, -1 * over);
        over -= len;
      }
      if ((over > 0) && ps.description) {
        len = ps.description.length;
        ps.description = ps.description.slice(0, -1 * over);
        over -= len;
      }
      if (over > 0) {
        throw e;
      }
      return target[methodName](ps).then(function (status) {
        return status;
      });
    });
  });
})();
