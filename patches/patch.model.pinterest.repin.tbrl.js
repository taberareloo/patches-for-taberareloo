// ==Taberareloo==
// {
//   "name"        : "Repin at Pinterest"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Repin at Pinterest"
// , "include"     : ["background", "content"]
// , "match"       : ["http://pinterest.com/*"]
// , "version"     : "0.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.pinterest.repin.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (TBRL.ID) { // Is it in the background context?
    update(Models['Pinterest'], {
      favor : function(ps) {
        var REPIN_URL = 'http://pinterest.com/resource/RepinResource/create/';
        var self = this;
        var pin_id = ps.favorite.id;
        return (ps.pinboard
          ? succeed([{id : ps.pinboard}])
          : self._getBoards(true))
        .addCallback(function(boards) {
          return self.getCSRFToken().addCallback(function(csrftoken) {
            return request(REPIN_URL, {
              sendContent : {
                data : JSON.stringify({
                  options : {
                    board_id    : boards[0].id,
                    description : ps.description,
                    link        : ps.pageUrl,
                    is_video    : false,
                    pin_id      : pin_id
                  },
                  context : {
                    app_version : "8f81"
                  },
                  source_url : '/pin/' + pin_id + '/',
                  module_path : 'App()>Closeup(resource=PinResource(id=' + pin_id + ', view_type=detailed))>PinActionBar(resource=PinResource(id=' + pin_id + ', view_type=detailed))>ShowModalButton(color=primary, submodule=[object Object], tagName=button, class_name=repin leftRounded, has_icon=true, show_text=false, ga_category=repin_create_closeup, require_auth=true, size=medium)#Modal(module=PinCreate(resource=PinResource(id=' + pin_id + ')))'
                })
              },
              headers : {
                'X-CSRFToken'      : csrftoken,
                'X-NEW-APP'        : 1,
                'X-Requested-With' : 'XMLHttpRequest'
              }
            }).addCallback(function(res) {
            });
          });
        });
      }
    });
    return;
  }

  Extractors.register({
    name : 'ReBlog - Pinterest',

    GET_PIN_URL : 'http://pinterest.com/resource/PinResource/get/',

    check : function(ctx) {
      return (/pinterest\.com/).test(ctx.href) && !!this.getPinId(ctx);
    },

    extract : function(ctx) {
      var pin_id = this.getPinId(ctx);

      var csrftoken = this.getLocalCookie('csrftoken');

      return request(this.GET_PIN_URL, {
        queryString : {
          data        : JSON.stringify({
            options : {
              id        : pin_id,
              view_type : "closeup_content"
            },
            module : {
              name    :"CloseupContent",
              options : {
                id       : "content",
                resource : {
                  name : "PinResource",
                  options : {
                    id        : pin_id,
                    view_type : "closeup_content"
                  }
                }
              },
              append : false
            },
            context:{
              app_version : "8f81"
            }
          }),
          module_path : 'App()>FeedPage()>Grid(resource=CategoryFeedResource(feed=everything))>Pin(show_pinner=true, show_pinned_from=false, show_board=true, show_via=false, pin_id=' + pin_id + ', resource=PinResource(id=' + pin_id + '))',
          '_' : new Date().getTime()
        },
        headers : {
          'X-CSRFToken'      : csrftoken,
          'X-NEW-APP'        : 1,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      }).addCallback(function(res) {
        var json = JSON.parse(res.responseText);

        ctx.title = json.page.title;
        ctx.href  = json.page.meta['pinterestapp:source'];

        return {
          type        : 'photo',
          item        : ctx.title,
          itemUrl     : json.page.meta['og:image'],
          body        : json.page.meta['og:description'],
          favorite    : {
            name      : 'Pinterest',
            id        : pin_id
          }
        };
      });
    },

    getPinId : function(ctx) {
      var result = ctx.href.match(/^http:\/\/pinterest\.com\/pin\/(\d+)\//);
      if (result) {
        return result[1];
      }
      else {
        var link = $X('./ancestor-or-self::div[starts-with(@class, "item")]//a[starts-with(@href, "/pin/")]', ctx.target)[0];
        if (link) {
          result = link.href.match(/^http:\/\/pinterest\.com\/pin\/(\d+)\//);
          return result && result[1];
        }
      }
      return false;
    },

    getLocalCookie : function(key) {
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + unescape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    }

  }, 'ReBlog');
})();
