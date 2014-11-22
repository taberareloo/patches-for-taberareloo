// ==Taberareloo==
// {
//   "name"        : "Wedata"
// , "description" : "Get items in a database of Wedata"
// , "include"     : ["background"]
// , "version"     : "2.0.1"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/utils/util.wedata.tbrl.js"
// }
// ==/Taberareloo==

/*
Usage:
  var database = new Wedata.Database('iview-for-taberareloo', 'http://wedata.github.io/iview/items.json');
  database.get().then(function (items) {
  });
*/

(function (exports) {
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
      }).then(function (res) {
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
        return self.getFromRemote(self.url).then(function (data) {
          self.cache.set(data);
          return data.items;
        });
      }

      return this.cache.get().then(function (cache) {
        return self.getFromRemote(self.url, cache.last_modified).then(function (data) {
          self.debug && console.info('Got data from the remote server');
          self.cache.set(data);
          return data.items;
        }).catch(function (res) {
          self.debug && console.info(res);
          if (res.status && (res.status === 304)) {
            self.debug && console.info('Not Modified! Use data from a cache');
          }
          else {
            console.warn('Something wrong with the remote server');
          }
          return cache.items;
        });
      }).catch(function (e) {
        self.debug && console.info('Get data from the remote server');
        return self.getFromRemote(self.url).then(function (data) {
          self.cache.set(data);
          return data.items;
        });
      });
    }
  });

  update(Wedata.Cache.prototype, {
    getDirectory : function (name) {
      return new Promise(function (resolve, reject) {
        var rfs = window.requestFileSystem || window.webkitRequestFileSystem;
        rfs(window.PERSISTENT, 1024 * 1024, function (fs) {
            fs.root.getDirectory(name, { create : true },
              function (dirEntry) {
                resolve(dirEntry);
              },
              function (e) {
                reject(e);
              }
            );
          },
          function (e) {
            reject(e);
          }
        );
      });
    },

    set : function (data) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.getDirectory(self.dir).then(function (dirEntry) {
          dirEntry.getFile(self.file, { create: true },
            function (fileEntry) {
              fileEntry.createWriter(
                function (fileWriter) {
                  fileWriter.onwriteend = function () {
                    this.onwriteend = null;
                    this.truncate(this.position);
                    resolve(fileEntry);
                  };
                  fileWriter.onerror = function (e) {
                    reject(e);
                  };
                  var blob = new Blob(
                    [ JSON.stringify(data) ],
                    { type : 'text/plain' }
                  );
                  fileWriter.write(blob);
                },
                function (e) {
                  reject(e);
                }
              );
            },
            function (e) {
              reject(e);
            }
          );
        });
      });
    },

    get : function () {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.getDirectory(self.dir).then(function (dirEntry) {
          dirEntry.getFile(self.file, {},
            function (fileEntry) {
              fileEntry.file(
                function (file) {
                  var reader = new FileReader();
                  reader.onloadend = function (evt) {
                    if (evt.target.readyState === FileReader.DONE) {
                      resolve(JSON.parse(evt.target.result));
                    }
                  };
                  reader.onerror = function () {
                    reject();
                  };
                  reader.readAsText(file);
                },
                function (e) {
                  reject(e);
                }
              );
            },
            function (e) {
              reject(e);
            }
          );
        });
      });
    }
  });
})(this);
