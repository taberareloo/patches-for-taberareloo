// ==Taberareloo==
// {
//   "name"        : "Backup/Restore Configurations"
// , "description" : "Backup/Restore Configurations using data URI"
// , "include"     : ["background"]
// , "version"     : "0.2.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.backup.config.tbrl.js"
// }
// ==/Taberareloo==

(function() {
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
