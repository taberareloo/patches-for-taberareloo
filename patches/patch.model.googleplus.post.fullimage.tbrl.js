// ==Taberareloo==
// {
//   "name"        : "Upload a full size image to Google+"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Upload a full size image to Google+ always"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.googleplus.post.fullimage.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Models['Google+'], {
    post : function(ps) {
      var self = this;
      ps = update({}, ps);
      return this.getAuthCookie().addCallback(function(cookie) {
        return self.getOZData().addCallback(function(oz) {
          return (
            ((ps.type === 'photo') && !ps.file) ? self.download(ps) : succeed(ps.file)
          ).addCallback(function(file) {
            return (file ? self.upload(file, oz) : succeed(null))
              .addCallback(function(upload) {
              ps.upload = upload;
              return (
                (!self.is_pages && ps.scope) ? succeed(ps.scope) : self.getDefaultScope(oz)
              ).addCallback(function(scope) {
                ps.scope = scope;
                return self._post(ps, oz);
              });
            });
          });
        });
      });
    },

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
})();
