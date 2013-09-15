// ==Taberareloo==
// {
//   "name"        : "Post to preset models"
// , "description" : "Post to preset models"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.8.0"
// }
// ==/Taberareloo==

(function() {
  var PRESET_MODELS = {
    1 : ['Tumblr', 'Google+'],
    2 : ['Tumblr - Another Blog', 'GimmeBar']
  };

  var PRESET_EVENTS  = {};
  var PRESET_ACTIONS = [];
  Object.keys(PRESET_MODELS).forEach(function(i) {
    PRESET_EVENTS[i] = {
      name  : 'Taberareloo.preset_' + i,
      title : 'Preset ' + i + ' (' + PRESET_MODELS[i].join(', ') + ')',
      func  : function(ev) {
        postToPresetModels(i);
      }
    };
    PRESET_ACTIONS.push({
      name: PRESET_EVENTS[i].name
    });
  });

  if (inContext('background')) {
    Object.keys(PRESET_MODELS).forEach(function(i) {
      Menus._register({
        title    : PRESET_EVENTS[i].title,
        contexts : ['all'],
        onclick: function(info, tab) {
          chrome.tabs.sendMessage(tab.id, {
            request : 'contextMenusPreset',
            content : info,
            preset  : i
          });
        }
      }, null, 'Taberareloo');
    });

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    }, null, 'Taberareloo');

    Menus.create();

    TBRL.setRequestHandler('postToPresetModels', function (req, sender, func) {
      var ps = req.content;
      var models = PRESET_MODELS[req.preset].filter(function(name) {
        return Models.values.some(function(model) {
          return model.name === name;
        });
      });
      var posters = models.map(function(name) {
        return Models[name];
      });
      posters = posters.filter(function(m) {
        return (ps.favorite && ps.favorite.name === (m.typeName || m.name)) || (m.check && m.check(ps));
      });
      if (!posters.length) {
        alert(chrome.i18n.getMessage('error_noPoster', ps.type.capitalize()));
      } else {
        TBRL.Service.post(ps, posters);
      }
    });

    var CHROME_GESTURES  = 'jpkfjicglakibpenojifdiepckckakgk';
    var CHROME_KEYCONFIG = 'okneonigbfnolfkmfgjmaeniipdjkgkl';
    var action = {
      group   : 'Taberareloo',
      actions : PRESET_ACTIONS
    };
    chrome.runtime.sendMessage(CHROME_GESTURES, action, function(res) {});
    chrome.runtime.sendMessage(CHROME_KEYCONFIG, action, function(res) {});
    return;
  }

  TBRL.setRequestHandler('contextMenusPreset', function (req, sender, func) {
    var content = req.content;
    var ctx = {};
    var query = null;
    switch (content.mediaType) {
      case 'video':
        ctx.onVideo = true;
        ctx.target = $N('video', {
          src: content.srcUrl
        });
        query = 'video[src="'+content.srcUrl+'"]';
        break;
      case 'audio':
        ctx.onVideo = true;
        ctx.target = $N('audio', {
          src: content.srcUrl
        });
        query = 'audio[src="'+content.srcUrl+'"]';
        break;
      case 'image':
        ctx.onImage = true;
        ctx.target = $N('img', {
          src: content.srcUrl
        });
        query = 'img[src="'+content.srcUrl+'"]';
        break;
      default:
        if (content.linkUrl) {
          // case link
          ctx.onLink = true;
          ctx.link = ctx.target = $N('a', {
            href: content.linkUrl
          });
          ctx.title = content.linkUrl;
          query = 'a[href="'+content.linkUrl+'"]';
        }
        break;
    }
    update(ctx, TBRL.createContext((query && document.querySelector(query)) || TBRL.getContextMenuTarget()));

    TBRL.extract(ctx, Extractors.check(ctx)[0]).addCallback(function(ps) {
      chrome.runtime.sendMessage(TBRL.id, {
        request : "postToPresetModels",
        content : checkHttps(update({
          page    : ctx.title,
          pageUrl : ctx.href
        }, ps)),
        preset : req.preset
      });
    });
  });

  function postToPresetModels(preset) {
    var ctx = TBRL.createContext();
    TBRL.extract(ctx, Extractors.check(ctx)[0]).addCallback(function(ps) {
      chrome.runtime.sendMessage(TBRL.id, {
        request : "postToPresetModels",
        content : checkHttps(update({
          page    : ctx.title,
          pageUrl : ctx.href
        }, ps)),
        preset : preset
      });
    });
  }

  Object.keys(PRESET_EVENTS).forEach(function(i) {
    window.addEventListener(PRESET_EVENTS[i].name, PRESET_EVENTS[i].func, false);
  });

  document.addEventListener('unload', function() {
    Object.keys(PRESET_EVENTS).forEach(function(i) {
      window.removeEventListener(PRESET_EVENTS[i].name, PRESET_EVENTS[i].func, false);
    });
  }, false);
})();
