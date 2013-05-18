// ==Taberareloo==
// {
//   "name"        : "Backup/Restore Configurations"
// , "description" : "Backup/Restore Configurations using data URI"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.backup.config.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var taberareloo_data_schema = 'data:text/plain;charset=utf-8,taberareloo_config=';

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
      chrome.tabs.create({
        url : taberareloo_data_schema +
          encodeURIComponent(JSON.stringify(configurations, undefined, 2))
      });
    }
  });
  Menus._register({
    title    : 'Config - Restore',
    contexts : ['page'],
    documentUrlPatterns : [taberareloo_data_schema + '*'],
    onclick  : function(info, tab) {
      var data = info.pageUrl.replace(taberareloo_data_schema, '');
      data = decodeURIComponent(data);
      var json = JSON.parse(data);
      for (var key in json) {
        var value = json[key];
        if (typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        window.localStorage.setItem(key, value);
      }
      if (typeof json.patches_preferences === 'object') {
        var patches = [];
        for (var patch in json.patches_preferences) {
          var preference = json.patches_preferences[patch];
          if (preference.origin) {
            patches.push(Patches.install(preference.origin));
          }
        }
        new DeferredList(patches).addCallback(function(resses) {
          alert('Configurations has been restored!');
          window.location.reload();
        });
        return;
      }
      alert('Configurations has been restored!');
      window.location.reload();
    }
  });

  Menus.create();
})();
