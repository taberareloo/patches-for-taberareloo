// ==Taberareloo==
// {
//   "name"        : "Fix login check for Delicious"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Fix login check for Delicious"
// , "include"     : ["background", "content"]
// , "match"       : ["https://delicious.com/"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.delicious.getinfo.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (TBRL.ID) { // Is it in the background context?
    addAround(Models['Delicious'], 'getInfo', function(proceed, args, target, methodName) {
      var deferred = new Deferred();

      getCookies('.delicious.com', 'avid').addCallback(function(cookies) {
        if (!cookies.length) {
          chrome.tabs.create({
            url    : 'https://delicious.com/',
            active : false
          },
          function(tab) {
            function getLocalStorageItem(tab_id, info, _tab) {
              if ((tab_id === tab.id) && (info.status === 'complete')) {
                chrome.tabs.onUpdated.removeListener(getLocalStorageItem);
                chrome.tabs.sendMessage(tab_id, {
                  request : 'getLocalStorageItem',
                  key     : 'user'
                }, function(res) {
                  if (!res || !res.value) {
                    deferred.callback({
                      is_logged_in : false
                    });
                  }
                  else {
                    var json = JSON.parse(res.value);
                    deferred.callback({
                      is_logged_in       : json.isLoggedIn,
                      logged_in_username : json.username
                    });
                  }
                  chrome.tabs.remove(tab_id);
                });
              }
            }
            chrome.tabs.onUpdated.addListener(getLocalStorageItem);
          });
        }
        else {
          proceed(args).addCallback(function(info) {
            deferred.callback(info);
          });
        }
      });

      return deferred;
    });
    return;
  }

  onRequestHandlers.getLocalStorageItem = function(req, sender, func) {
    func({
      key   : req.key,
      value : window.localStorage.getItem(req.key)
    });
  };
})();
