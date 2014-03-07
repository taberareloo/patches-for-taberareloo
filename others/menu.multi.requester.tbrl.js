// ==Taberareloo==
// {
//   "name"        : "Multi Requester"
// , "description" : "Multi Requester for taberareloo"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.multi.requester.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var DATABASE_URL = 'http://wedata.github.io/MultiRequester/items.json';

  var WEDATA_LIB = 'https://raw.github.com/YungSang/patches-for-taberareloo/master/utils/util.wedata.tbrl.js';

  var database = null;

  Patches.require = Patches.require || function (url) {
    var deferred;
    var name = window.url.parse(url).path.split(/[\/\\]/).pop();
    var patch = this[name];
    if (patch) {
      var preference = this.getPreferences(patch.name) || {};
      if (preference.disabled) {
        this.setPreferences(patch.name, MochiKit.Base.update(preference, {
          disabled : false
        }));
        deferred = this.loadAndRegister(patch.fileEntry, patch.metadata);
      } else {
        return succeed(true);
      }
    } else {
      deferred = this.install(url, true);
    }
    return deferred.addCallback(function (patch) {
      return !!patch;
    });
  };

  Patches.require(WEDATA_LIB).addCallback(function (installed) {
    database = new Wedata.Database('multi_requester', DATABASE_URL);
    database.get().addCallback(function (data) {
      initialize(JSON.parse(data));
    });
  });

  function initialize(items) {
    if (!items || !items.length) {
      return;
    }

    items.sort(function (a, b) {
      if (a.name === b.name) {
        return 0;
      }
      return (a.name < b.name) ? -1 : 1;
    });

    var PARENT_MENU = 'Multi Requester';

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    });
    Menus._register({
      title    : PARENT_MENU,
      contexts : ['all']
    });

    items.forEach(function (item) {
      if (item.data.urlEncode) {
        return;
      }
      Menus._register({
        title    : item.name,
        contexts : ['all'],
        onclick  : function (info, tab) {
          var keyword = info.selectionText;
          if (!keyword) {
            keyword = prompt('Keyword for [' + item.name + ']: ');
          }
          if (keyword) {
            chrome.tabs.create({
              url    : item.data.url.replace("%s", encodeURIComponent(keyword)),
              active : false
            });
          }
        }
      }, PARENT_MENU);
    });

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    }, PARENT_MENU);
    Menus._register({
      title    : 'Refresh SITEINFOs\' cache',
      contexts : ['all'],
      onclick: function (info, tab) {
        database.get(true).addCallback(function (data) {
          initialize(JSON.parse(data));
        });
      }
    }, PARENT_MENU);
    Menus.create();
  }
})();
