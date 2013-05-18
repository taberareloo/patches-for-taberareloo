// ==Taberareloo==
// {
//   "name"        : "Backup/Restore Configurations"
// , "description" : "Backup/Restore Configurations using data URI"
// , "include"     : ["background"]
// , "version"     : "0.3.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.backup.config.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Patches, {
    install : function (file, no_alert) {
      var self = this;

      function save(fileName, file, url) {
        switch (file.type) {
        case 'text/plain':
        case 'text/javascript':
        case 'application/javascript':
        case 'application/x-javascript':
          break;
        default:
          return succeed();
        }

        if (!file.size) {
          return succeed();
        }

        var deferred = new Deferred();

        self.getMetadata(file).addCallback(function (metadata) {
          if (metadata) {
            self.dirEntry.getFile(fileName, { create: true },
              function (fileEntry) {
                fileEntry.createWriter(
                  function (fileWriter) {
                    fileWriter.onwriteend = function () {
                      this.onwriteend = null;
                      this.truncate(this.position);
                      self.loadAndRegister(fileEntry, metadata, url).addCallback(function (patch) {
                        console.log('Install patch: ' + fileEntry.fullPath);
                        if (!no_alert) {
                          alert(chrome.i18n.getMessage('message_installed', fileName));
                        }
                        deferred.callback(patch);
                      });
                    };
                    fileWriter.onerror = function (e) {
                      deferred.errback(e);
                    };
                    fileWriter.write(file);
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
          } else {
            deferred.errback();
          }
        });

        return deferred;
      }

      if (typeof file === 'string') {
        var url      = file;
        var fileName = url.replace(/\\/g, '/').replace(/.*\//, '');
        return request(url + '?_=' + (new Date()).getTime(), {
          responseType: 'blob'
        }).addCallback(function (res) {
          return save(fileName, res.response, url).addCallback(function (patch) {
            return !!patch;
          });
        });
      } else {
        return save(file.name, file).addCallback(function (patch) {
          return !!patch;
        });
      }
    }
  });

  var DATA_TYPE = 'text/plain;charset=utf-8;name=taberareloo.json';

  Menus._register({
    type     : 'separator',
    contexts : ['page']
  });
  Menus._register({
    title    : 'Config - Backup',
    contexts : ['page'],
    onclick  : function(info, tab) {
      var configurations = {};
      for (var key in window.localStorage) {
        var value = window.localStorage.getItem(key);
        try {
          configurations[key] = JSON.parse(value);
        }
        catch(e) {
          configurations[key] = value;
        }
      }
      var data = JSON.stringify(configurations, undefined, 2);
      var blob = new Blob([data], {type : DATA_TYPE});
      fileToDataURL(blob).addCallback(function(url) {
        chrome.tabs.create({
          url : url
        });
      });
    }
  });
  Menus._register({
    title    : 'Config - Restore',
    contexts : ['page'],
    documentUrlPatterns : ['data:' + DATA_TYPE + ';base64,*'],
    onclick  : function(info, tab) {
      var blob = base64ToBlob(info.pageUrl, DATA_TYPE);
      var reader = new FileReader();
      reader.onload = function (ev) {
        restore(ev.target.result);
      };
      reader.readAsText(blob);
    }
  });
  Menus.create();

  function restore(data) {
    var json = JSON.parse(data);
    for (var key in json) {
      var value = json[key];
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      window.localStorage.setItem(key, value);
    }
    if (typeof json.patches_preferences === 'object') {
      var patches = {};
      for (var patch in json.patches_preferences) {
        var preference = json.patches_preferences[patch];
        if (preference.origin) {
          patches[patch] = Patches.install(preference.origin, true);
        }
      }
      new DeferredHash(patches).addCallback(function(ress) {
        alert('Configurations has been restored!');
        window.location.reload();
      });
      return;
    }
    alert('Configurations has been restored!');
    window.location.reload();
  }
})();
