// ==Taberareloo==
// {
//   "name"        : "Repin at Pinterest"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Repin at Pinterest"
// , "include"     : ["background", "content"]
// , "match"       : ["http://pinterest.com/*", "http://www.pinterest.com/*"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.pinterest.repin.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    var app_version = "46ab";

    update(Models['Pinterest'], {
      favor : function(ps) {
        var REPIN_URL = 'http://www.pinterest.com/resource/RepinResource/create/';
        var self = this;
        var pin_id = ps.favorite.id;
        return (
          ps.pinboard ? Promise.resolve([{id : ps.pinboard}]) : self._getBoards(true)
        ).then(function (boards) {
          return self.getCSRFToken().then(function (csrftoken) {
            return request(REPIN_URL, {
              sendContent : {
                data : JSON.stringify({
                  options : {
                    board_id    : boards[0].id,
                    description : ps.description || '',
                    link        : ps.favorite.source,
                    is_video    : false,
                    pin_id      : pin_id
                  },
                  context : {
                    app_version : app_version
                  }
                }),
                source_url  : '/pin/' + pin_id + '/',
                module_path : 'App()>Closeup(resource=PinResource(id=' + pin_id + ', view_type=detailed))>PinActionBar(resource=PinResource(id=' + pin_id + ', view_type=detailed))>ShowModalButton(color=primary, submodule=[object Object], tagName=button, class_name=repin leftRounded, has_icon=true, show_text=false, ga_category=repin_create_closeup, require_auth=true, size=medium)#Modal(module=PinCreate(resource=PinResource(id=' + pin_id + ')))'
              },
              headers : {
                'X-CSRFToken'      : csrftoken,
                'X-NEW-APP'        : 1,
                'X-Requested-With' : 'XMLHttpRequest'
              },
              responseType : 'json'
            }).then(function (res) {
              app_version = res.response.client_context.app_version;
            });
          });
        });
      }
    });
    return;
  }

  Extractors.register({
    name : 'ReBlog - Pinterest',

    check : function(ctx) {
      return (/pinterest\.com/).test(ctx.href) && !!this.getPinId(ctx);
    },

    extract : function(ctx) {
      var pin_id = this.getPinId(ctx);

      return request('http://pinterest.com/pin/' + pin_id, {
        responseType: 'document'
      }).then(function (res) {
        var doc = res.response;

        ctx.title = $X('//title/text()', doc)[0];
        ctx.href  = $X('//meta[@property="og:url" or @name="og:url"]/@content', doc)[0];

        return {
          type     : 'photo',
          item     : ctx.title,
          itemUrl  : $X('//meta[@property="og:image"]/@content', doc)[0] ||
            $X('//div[@class="imageContainer"]/img/@src', doc)[0],
          body     : $X('//meta[@property="og:description" or @name="og:description"]/@content', doc)[0],
          favorite : {
            name   : 'Pinterest',
            id     : pin_id,
            source : $X('//meta[@property="pinterestapp:source" or @name="pinterestapp:source"]/@content', doc)[0]
          }
        };
      });
    },

    getPinId : function(ctx) {
      var pattern = /^http:\/\/(?:www\.)?pinterest\.com\/pin\/(\d+)\//;
      var result = ctx.href.match(pattern);
      if (result) {
        return result[1];
      }
      else {
        var link = $X('./ancestor-or-self::div[starts-with(@class, "item") or starts-with(@class, "pin")]//a[starts-with(@href, "/pin/")]', ctx.target)[0];
        if (link) {
          result = link.href.match(pattern);
          return result && result[1];
        }
      }
      return false;
    }

  }, 'ReBlog');
})();
