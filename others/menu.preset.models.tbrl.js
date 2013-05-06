// ==Taberareloo==
// {
//   "name"        : "Post to preset models"
// , "description" : "Post to preset models"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.0"
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
          content : info
        }, function(res) {
          postToPresetModels(res, 0);
        });
      }
    }, null, 'Taberareloo');
    Menus._register({
      title    : 'Preset 2 (' + PRESET_MODELS[1].join(', ') + ')',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request : 'contextMenusPreset',
          content : info
        }, function(res) {
          postToPresetModels(res, 1);
        });
      }
    }, null, 'Taberareloo');

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    }, null, 'Taberareloo');

    Menus.create();

    function postToPresetModels(res, index) {
      constructPsInBackground(res.content).addCallback(function(ps) {
        var models = PRESET_MODELS[index].filter(function(name) {
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
    }
    return;
  }

  onRequestHandlers.contextMenusPreset = function(req, sender, func) {
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
      func({
        content : checkHttps(update({
          page    : ctx.title,
          pageUrl : ctx.href
        }, ps))
      });
    });
  };
})();