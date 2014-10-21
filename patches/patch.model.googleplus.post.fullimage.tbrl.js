// ==Taberareloo==
// {
//   "name"        : "Upload a full size image to Google+"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Upload a full size image to Google+ always"
// , "include"     : ["background"]
// , "version"     : "2.0.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.post.fullimage.tbrl.js"
// }
// ==/Taberareloo==

(function() {
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
          ps.file ? Promise.resolve(ps.file) :
            download(ps.itemUrl, getFileExtension(ps.itemUrl)).then(function (entry) {
              return getFileFromEntry(entry);
            }).catch(function (e) {
              throw new Error('Could not get an image file.');
            })
        );
      }
    });

    addAround(Models['Google+'], 'post', function(proceed, args, target, methodName) {
      return target.queue.push(function () {
        var ps = update({}, args[0]);
        return (
          ((ps.type === 'photo') && !ps.file) ? target.download(ps) : Promise.resolve(ps.file)
        ).then(function (file) {
          ps.file = file;
          return proceed([ps]);
        });
      });
    });
  }
})();
