// ==Taberareloo==
// {
//   "name"        : "New Delicious Model"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "New Delicious Model for new design/API"
// , "include"     : ["background"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.delicious.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  update(Models['Delicious'], {
    LOGIN_URL : 'https://delicious.com/',

    getUserTags : function () {
      return request('https://avosapi.delicious.com/api/v1/posts/you/tags', {
        queryString :  {
          tags     : '',
          keywords : '',
          limit    : 10,
          anchor   : -1,
          index    : 0,
          '_' : (new Date()).getTime()
        },
        responseType : 'json'
      }).then(function (res) {
        var json = res.response;
        if (json.error) {
          return [];
        }
        return Object.keys(json.pkg.tags).reduce(function (memo, tag) {
          if (tag) {
            memo.push({
              name      : tag,
              frequency : json.pkg.tags[tag]
            });
          }
          return memo;
        }, []);
      });
    },

    getRecommendedTags : function(url) {
      return request('https://avosapi.delicious.com/api/v1/posts/compose', {
        queryString :  {
          url : url,
          '_' : (new Date()).getTime()
        },
        responseType : 'json'
      }).then(function (res) {
        var json = res.response;
        if (json.error) {
          return {
            recommended : [],
            duplicated  : false
          };
        }
        return {
          recommended : json.pkg.suggested_tags || [],
          duplicated  : false
        };
      });
    },

    post : function (ps) {
      var self = this;
      return request('https://avosapi.delicious.com/api/v1/posts/compose', {
        queryString :  {
          url : ps.itemUrl,
          '_' : (new Date()).getTime()
        },
        responseType : 'json'
      }).then(function (res){
        var json = res.response;
        if (json.error) {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return request('https://avosapi.delicious.com/api/v1/posts/addoredit', {
          queryString : {
            description : ps.item,
            url         : ps.itemUrl,
            note        : joinText([ps.body, ps.description], ' ', true),
            tags        : joinText(ps.tags, ','),
            private     : !!ps.private ? 'on' : '',
            replace     : json.pkg.previously_saved,
            '_'         : (new Date()).getTime()
          }
        });
      });
    }
  });
})();
