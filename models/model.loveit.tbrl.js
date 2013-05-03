// ==Taberareloo==
// {
//   "name"        : "LoveIt Model"
// , "description" : "Post to loveit.com"
// , "include"     : ["background"]
// , "version"     : "1.0.3"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.loveit.tbrl.js"
// }
// ==/Taberareloo==

(function() {

  Models.register({
    name      : 'LoveIt',
    ICON      : 'http://assets.loveit.com/assets/favicon.ico',
    LINK      : 'http://loveit.com/',
    LOGIN_URL : 'http://loveit.com/me/login',

    FORM_URL      : 'http://loveit.com/loves/upload/collection_interface',
    URL2IMAGE_URL : 'http://loveit.com/loves/upload/url_to_image',
    UPLOAD_URL    : 'http://loveit.com/loves/upload/image',
    POST_URL      : 'http://loveit.com/loves',

    check : function(ps) {
      return (/photo/).test(ps.type);
    },

    getCSRFToken : function() {
      var self = this;
      return getCookies('loveit.com', 'au').addCallback(function(cookies) {
        if (cookies.length) {
          return request(self.LINK, { responseType: 'document' }).addCallback(function(res) {
            return $X('//meta[@name="csrf-token"]/@content', res.response)[0];
          });
        } else {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
      });
    },

    getCollections : function() {
      var self = this;
      return request(this.FORM_URL, { responseType : 'document' }).addCallback(function(res) {
        var collections = [];
        $X('id("fancy_board_id")/option', res.response).forEach(function(option) {
          if ($X('./@value', option)[0] !== 'create_new') {
            collections.push({
              id   : $X('./@value', option)[0],
              name : $X('./text()', option)[0]
            });
          }
        });
        return collections;
      });
    },

    getMostRecentCollectionId : function() {
      var self = this;
      return getCookies('loveit.com', 'most_recent_board_id').addCallback(function(cookies) {
        if (cookies.length) {
          return cookies[cookies.length-1].value;
        } else {
          return self.getCollections().addCallback(function(collections) {
            return collections && collections[0] && collections[0].id;
          });
        }
      });
    },

    post : function(ps) {
      var self = this;

      var description = '';
      if (ps.description || ps.body) {
        description = joinText([
          ps.description,
          (ps.body) ? '“' + ps.body + '”' : ''
        ], "\n\n", true);
      }

      var sendContent = {
        pinning_method : 'bookmarklet2',
        link_url       : ps.pageUrl,
        link_title     : ps.page
      };

      return this.getCSRFToken().addCallback(function(csrftoken) {
        return (
          ps.file ? self.uploadImage(ps, csrftoken) : self.uploadImagefromURL(ps, csrftoken)
        ).addCallback(function(image) {
          return self.getMostRecentCollectionId().addCallback(function(collection_id) {
            return request(self.POST_URL, {
              sendContent : update(sendContent, {
                'images[0][image_id]'      : image.id,
                'images[0][caption]'       : description,
                'images[0][refer]'         : ps.pageUrl,
                'images[0][collection_id]' : collection_id
              }),
              headers : {
                'X-CSRF-Token'     : csrftoken,
                'X-Requested-With' : 'XMLHttpRequest'
              }
            }).addCallback(function(res) {
              var json = JSON.parse(res.responseText);
              if (!json.success_html) {
                throw new Error("Could not post it");
              }
            });
          });
        });
      });
    },

    uploadImagefromURL : function(ps, csrftoken) {
      return request(this.URL2IMAGE_URL, {
        sendContent : {
          url : ps.itemUrl,
          ref : ps.pageUrl,
          idx : 0
        },
        headers : {
          'X-CSRF-Token'     : csrftoken,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      }).addCallback(function(res) {
        try {
          var json = JSON.parse(res.responseText);
          if (json && json.image) {
            return json.image;
          }
          else {
            throw new Error("Could not get an image properly");
          }
        }
        catch(e) {
          throw new Error("Could not get an image properly");
        }
      });
    },

    uploadImage : function(ps, csrftoken) {
      return request(this.UPLOAD_URL, {
        sendContent : {
          utf8               : '✓',
          authenticity_token : csrftoken,
          the_image          : ps.file
        },
        headers : {
          'X-CSRF-Token'     : csrftoken,
          'X-Requested-With' : 'XMLHttpRequest'
        }
      }).addCallback(function(res) {
        try {
          var json = JSON.parse(res.responseText);
          if (json && json.image) {
            return json.image;
          }
          else {
            throw new Error("Could not upload an image properly");
          }
        }
        catch(e) {
          throw new Error("Could not upload an image properly");
        }
      });
    }
  });

})();