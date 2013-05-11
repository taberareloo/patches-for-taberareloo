// ==Taberareloo==
// {
//   "name"        : "Post to preset models"
// , "description" : "Post to preset models"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.3.0"
// }
// ==/Taberareloo==

(function() {
  if (TBRL.ID) { // Is it in the background context?
    var PRESET_MODELS = [
      ['Tumblr', 'Google+'],
      ['Tumblr - Another Blog', 'GimmeBar']
    ];

    Menus._register({
      title    : 'Preset 1 (' + PRESET_MODELS[0].join(', ') + ')',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request : 'contextMenusPreset',
          content : info,
          preset  : 0
        });
      }
    }, null, 'Taberareloo');
    Menus._register({
      title    : 'Preset 2 (' + PRESET_MODELS[1].join(', ') + ')',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request : 'contextMenusPreset',
          content : info,
          preset  : 1
        });
      }
    }, null, 'Taberareloo');

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    }, null, 'Taberareloo');

    Menus.create();

    chrome.extension.onMessage.addListener(function (req, sender, func) {
      if (req.request !== 'postToPresetModels') return;

      constructPsInBackground(req.content).addCallback(function(ps) {
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
    });

    var CHROME_GESTURES = 'jpkfjicglakibpenojifdiepckckakgk';
    var CHROME_KEYCONFIG = 'okneonigbfnolfkmfgjmaeniipdjkgkl';
    var action = {
      group: 'Taberareloo',
      actions: [
        {name: 'Taberareloo.preset_1'},
        {name: 'Taberareloo.preset_2'}
      ]
    };
    chrome.extension.sendMessage(CHROME_GESTURES, action, function(res) {});
    chrome.extension.sendMessage(CHROME_KEYCONFIG, action, function(res) {});
    return;
  }

  chrome.extension.onMessage.addListener(function (req, sender, func) {
    if (req.request !== 'contextMenusPreset') return;

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
      chrome.extension.sendMessage(TBRL.id, {
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
      chrome.extension.sendMessage(TBRL.id, {
        request : "postToPresetModels",
        content : checkHttps(update({
          page    : ctx.title,
          pageUrl : ctx.href
        }, ps)),
        preset : preset
      });
    });
  }

  function preset_1() {
    postToPresetModels(0);
  }
  function preset_2() {
    postToPresetModels(1);
  }
  document.addEventListener('unload', function() {
    window.removeEventListener('Taberareloo.preset_1', preset_1, false);
    window.removeEventListener('Taberareloo.preset_2', preset_2, false);
  }, false);
  window.addEventListener('Taberareloo.preset_1', preset_1, false);
  window.addEventListener('Taberareloo.preset_2', preset_2, false);
})();