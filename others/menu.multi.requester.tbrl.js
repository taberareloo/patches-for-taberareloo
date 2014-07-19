// ==Taberareloo==
// {
//   "name"        : "Multi Requester"
// , "description" : "Multi Requester for taberareloo"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.multi.requester.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var DATABASE_URL = 'http://wedata.github.io/MultiRequester/items.json';

  var WEDATA_LIB = 'https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/utils/util.wedata.tbrl.js';

  var database = null;

  Patches.require = Patches.require || function (url) {
    var promise;
    var name = window.url.parse(url).path.split(/[\/\\]/).pop();
    var patch = this[name];
    if (patch) {
      var preference = this.getPreferences(patch.name) || {};
      if (preference.disabled) {
        this.setPreferences(patch.name, MochiKit.Base.update(preference, {
          disabled : false
        }));
        promise = this.loadAndRegister(patch.fileEntry, patch.metadata);
      } else {
        return Promise.resolve(true);
      }
    } else {
      promise = this.install(url, true);
    }
    return promise.then(function (patch) {
      return !!patch;
    });
  };

  Patches.require(WEDATA_LIB).then(function (installed) {
    database = new Wedata.Database('multi_requester', DATABASE_URL);
    database.get().then(function (data) {
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
      var urlEncodeFunc = getURLEncodeFunc(item.data.urlEncode);
      if (typeof urlEncodeFunc === 'undefined') {
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
              url    : item.data.url.replace("%s", urlEncodeFunc(keyword)),
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

  function str2array(str) {
    var array = [], i, il = str.length;
    for (i = 0 ; i < il ; i++) {
      array.push(str.charCodeAt(i));
    }
    return array;
  }

  function getURLEncodeFunc(urlEncode) {
    urlEncode = (urlEncode || 'UTF-8').toLocaleLowerCase();
    switch (urlEncode) {
    case 'utf-8':
      return encodeURIComponent;
    case 'euc-jp':
      if (typeof Encoding === 'undefined') {
        return;
      }
      return function (str) {
        var array = str2array(str);
        var converted_array = Encoding.convert(array, 'EUCJP', 'AUTO');
        return Encoding.urlEncode(converted_array);
      };
    case 'shift_jis':
      if (typeof Encoding === 'undefined') {
        return;
      }
      return function (str) {
        var array = str2array(str);
        var converted_array = Encoding.convert(array, 'SJIS', 'AUTO');
        return Encoding.urlEncode(converted_array);
      };
    default:
      return;
    }
  }
})();
