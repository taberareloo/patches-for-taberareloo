// ==Taberareloo==
// {
//   "name"        : "Post to Twitter surely"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Post to Twitter surely"
// , "include"     : ["background"]
// , "version"     : "1.2.3"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.twitter.createstatus.tbrl.js"
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
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/patches/patch.model.twitter.createstatus.tbrl.js', true);
    return;
  }

  addAround(Models['Twitter'], 'createStatus', function(proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if (ps.body) {
      ps.body = ps.body.trimTag().replace(/\s+/g, ' ');
    }
    return proceed([ps]).addCallback(function(status) {
      return status;
    }).addErrback(function(e) {
console.log(e.message);
      var over = '';
      if (typeof e.message === 'string') {
        over = e.message.extract(/post \((\d+) over\)/);
      }
      if (!over) {
        throw e;
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
        throw e;
      }
      return target[methodName](ps).addCallback(function(status) {
        return status;
      });
    });
  });

  update(Models['Twitter'], {
    getActualLength : function(status) {
      var ret = status.split('\n').map(function (s) {
        s = s.replace(/(https:\/\/[^ ]+)/g, '12345678901234567890123');
        s = s.replace(/(http:\/\/[^ ]+)/g, '1234567890123456789012');
        return s;
      }).join('\n');
      return ret.length;
    }
  });
})();
