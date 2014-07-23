// ==Taberareloo==
// {
//   "name"        : "Wedata"
// , "description" : "Get items in a database of Wedata"
// , "include"     : ["background"]
// , "version"     : "0.1.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/utils/util.wedata.tbrl.js"
// }
// ==/Taberareloo==

/*
Usage:
  var database = new Wedata.Database('iview-for-taberareloo', 'http://wedata.github.io/iview/items.json');
  database.get().addCallback(function (items) {
  });
*/

(function (exports) {
  var version = chrome.runtime.getManifest().version;
  version = version.split('.');
  if (version.length > 3) {
    version.pop();
  }
  version = version.join('.');
  if (semver.gte(version, '3.0.12')) {
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/utils/util.wedata.tbrl.js', true);
    return;
  }

  var Wedata = exports.Wedata = {};

  Wedata.Database = function (name, url, debug) {
    this.name  = name;
    this.url   = url;
    this.debug = debug || false;
    this.cache = new Wedata.Cache(name);
  };

  Wedata.Cache = function (name) {
    this.dir  = name;
    this.file = 'items.json';
  };

  update(Wedata.Database.prototype, {
    getFromRemote : function (url, last_modified) {
      var headers = {};
      if (last_modified) {
        headers['If-Modified-Since'] = last_modified;
      }
      return request(url, {
        queryString : {
          t : (new Date()).getTime()
        },
        headers : headers
      }).addCallback(function (res) {
        return {
          resource_url  : url,
          last_modified : res.getResponseHeader('Last-Modified'),
          items         : res.responseText
        };
      });
    },

    get : function (refresh) {
      var self = this;

      if (refresh) {
        self.debug && console.info('Refresh! Get data from the remote server');
        return self.getFromRemote(self.url).addCallback(function (data) {
          self.cache.set(data);
          return data.items;
        });
      }

      return this.cache.get().addCallback(function (cache) {
        return self.getFromRemote(self.url, cache.last_modified).addCallback(function (data) {
          self.debug && console.info('Got data from the remote server');
          self.cache.set(data);
          return data.items;
        }).addErrback(function (e) {
          self.debug && console.info(e.message);
          var res = e.message;
          if (res.status && (res.status === 304)) {
            self.debug && console.info('Not Modified! Use data from a cache');
          }
          else {
            console.warn('Something wrong with the remote server');
          }
          return cache.items;
        });
      }).addErrback(function (e) {
        self.debug && console.info('Get data from the remote server');
        return self.getFromRemote(self.url).addCallback(function (data) {
          self.cache.set(data);
          return data.items;
        });
      });
    }
  });

  update(Wedata.Cache.prototype, {
    getDirectory : function (name) {
      var deferred = new Deferred();
      var rfs = window.requestFileSystem || window.webkitRequestFileSystem;
      rfs(window.PERSISTENT, 1024 * 1024, function (fs) {
          fs.root.getDirectory(name, { create : true },
            function (dirEntry) {
              deferred.callback(dirEntry);
            },
            function (e) {
              deferred.errback(e);
            }
          );
        },
        function (e) {
          deferred.errback(e);
        }
      );
      return deferred;
    },

    set : function (data) {
      var self = this;
      var deferred = new Deferred();
      this.getDirectory(self.dir).addCallback(function (dirEntry) {
        dirEntry.getFile(self.file, { create: true },
          function (fileEntry) {
            fileEntry.createWriter(
              function (fileWriter) {
                fileWriter.onwriteend = function () {
                  this.onwriteend = null;
                  this.truncate(this.position);
                  deferred.callback(fileEntry);
                };
                fileWriter.onerror = function (e) {
                  deferred.errback(e);
                };
                var blob = new Blob(
                  [ JSON.stringify(data) ],
                  { type : 'text/plain' }
                );
                fileWriter.write(blob);
              },
              function (e) {
                deferred.errback(e);
              }
            );
          },
          function (e) {
            deferred.errback(e);
          }
        );
      });
      return deferred;
    },

    get : function () {
      var self = this;
      var deferred = new Deferred();
      this.getDirectory(self.dir).addCallback(function (dirEntry) {
        dirEntry.getFile(self.file, {},
          function (fileEntry) {
            fileEntry.file(
              function (file) {
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                  if (evt.target.readyState === FileReader.DONE) {
                    deferred.callback(JSON.parse(evt.target.result));
                  }
                };
                reader.onerror = function () {
                  deferred.errback();
                };
                reader.readAsText(file);
              },
              function (e) {
                deferred.errback(e);
              }
            );
          },
          function (e) {
            deferred.errback(e);
          }
        );
      });
      return deferred;
    }
  });
})(this);
