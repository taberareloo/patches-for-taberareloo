// ==Taberareloo==
// {
//   "name"        : "Repin at Pinterest"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Repin at Pinterest"
// , "include"     : ["background", "content"]
// , "match"       : ["http://pinterest.com/*"]
// , "version"     : "0.5.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.pinterest.repin.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var app_version = "46ab";

  if (TBRL.ID) { // Is it in the background context?
    update(Models['Pinterest'], {
      favor : function(ps) {
        var REPIN_URL = 'http://pinterest.com/resource/RepinResource/create/';
        var self = this;
        var pin_id = ps.favorite.id;
        return (
          ps.pinboard ? succeed([{id : ps.pinboard}]) : self._getBoards(true)
        ).addCallback(function(boards) {
          return self.getCSRFToken().addCallback(function(csrftoken) {
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
              }
            }).addCallback(function(res) {
              var json = JSON.parse(res.responseText);
              app_version = json.context.app_version;
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
          data : JSON.stringify({
            options : {
              id        : pin_id,
              view_type : "closeup_content"
            },
            module : {
              name    :"CloseupContent",
              options : {
                id       : "content",
                resource : {
                  name    : "PinResource",
                  options : {
                    id        : pin_id,
                    view_type : "closeup_content"
                  }
                }
              },
              append : false
            },
            context : {
              app_version : app_version
            }
          }),
          source_url  : '/pin/' + pin_id + '/',
          module_path : 'App()>FeedPage()>Grid(resource=CategoryFeedResource(feed=everything))>GridItems(resource=CategoryFeedResource(feed=everything))>Pin(show_pinner=true, show_pinned_from=false, show_board=true, show_via=false, pin_id=' + pin_id + ', resource=PinResource(id=' + pin_id + '))',
          '_' : new Date().getTime()
        },
        headers : {
          'X-CSRFToken'      : csrftoken,
          'X-NEW-APP'        : 1,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      }).addCallback(function(res) {
        var json = JSON.parse(res.responseText);
        app_version = json.context.app_version;

        ctx.title = json.page.title;
        ctx.href  = json.page.meta['og:url'];

        return {
          type     : 'photo',
          item     : ctx.title,
          itemUrl  : json.module.tree.children[0].children[0].children[0].options.src,
          body     : json.page.meta['og:description'],
          favorite : {
            name   : 'Pinterest',
            id     : pin_id,
            source : json.page.meta['pinterestapp:source']
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

    getLocalCookie : function(c_name) {
      var c_value = document.cookie;
      var c_start = c_value.indexOf(" " + c_name + "=");
      if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
      }
      if (c_start == -1) {
        c_value = null;
      }
      else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
         c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
      }
      return c_value;
    }

  }, 'ReBlog');
})();
