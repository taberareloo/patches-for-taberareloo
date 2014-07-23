// ==Taberareloo==
// {
//   "name"        : "Upload a full size image to Google+"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Upload a full size image to Google+ always"
// , "include"     : ["background"]
// , "version"     : "1.3.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.post.fullimage.tbrl.js"
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
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/patches/patch.model.googleplus.post.fullimage.tbrl.js', true);
    return;
  }

  var timer = setInterval(function () {
    if (Models['Google+']) {
      clearInterval(timer);
      do_patch();
    }
  }, 500);

  function do_patch() {
    update(Models['Google+'], {
      queue : new CommandQueue(500),

      download : function(ps) {
        var self = this;
        return (
          ps.file ? succeed(ps.file) :
            download(ps.itemUrl, getFileExtension(ps.itemUrl)).addCallback(function(entry) {
              return getFileFromEntry(entry);
            }).addErrback(function(e) {
              throw new Error('Could not get an image file.');
            })
        );
      }
    });

    addAround(Models['Google+'], 'post', function(proceed, args, target, methodName) {
      return target.queue.push(function () {
        var ps = args[0];
        return (
          ((ps.type === 'photo') && !ps.file) ? target.download(ps) : succeed(ps.file)
        ).addCallback(function(file) {
          ps.file = file;
          return proceed([ps]);
        });
      });
    });
  }
})();
