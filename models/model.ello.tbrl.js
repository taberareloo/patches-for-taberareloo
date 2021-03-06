// ==Taberareloo==
// {
//   "name"        : "Ello Model"
// , "description" : "Post to ello.co"
// , "include"     : ["background"]
// , "version"     : "0.2.2"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/models/model.ello.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name      : 'Ello',
    ICON      : 'https://ello.co/favicon.ico',
    LINK      : 'https://ello.co/',
    LOGIN_URL : 'https://ello.co/enter',

    HOME_URL : 'https://ello.co/settings',
    POST_URL : 'https://ello.co/api/v1/posts.json',
    META_URL : 'https://ello.co/api/v1/direct_upload_metadata',

    check : function (ps) {
      return (/(regular|photo|quote|link)/).test(ps.type);
    },

    getToken : function () {
      var self = this;
      return request(this.HOME_URL, {
        responseType: 'document'
      }).then(function (res) {
        var doc = res.response;
        var token = $X('//meta[@name="csrf-token"]/@content', doc)[0];
        var url = $X('//meta[@property="og:url"]/@content', doc)[0];
        if (url !== 'https://ello.co/settings') {
          throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
        }
        return token;
      });
    },

    post : function (ps) {
      var self = this;
      return this.getToken().then(function (token) {
        if (ps.type === 'photo' && ps.file) {
          return self.upload(ps, token).then(function (imageUrl) {
            return self.update(ps, token, imageUrl);
          });
        }
        else {
          return self.update(ps, token);
        }
      });
    },

    update : function (ps, token, imageUrl) {
      var data = [];

      if (ps.type === 'regular' && ps.item) {
        data.push({
          kind : 'text',
          data : '**' + ps.item + '**'
        });
      }
      if (ps.description) {
        data.push({
          kind : 'text',
          data : ps.description
        });
      }
      if (imageUrl) {
        data.push({
          kind : 'image',
          data : {
            url : imageUrl,
            via : ps.pageUrl,
            alt : ps.item || ps.page
          }
        });
        data.push({
          kind : 'text',
          data : joinText([
            ps.page ? '**' + ps.page + '**' : '',
            ps.pageUrl
          ], "\n")
        });
      }
      else if (ps.type === 'photo') {
        data.push({
          kind : 'text',
          data : '![](' + ps.itemUrl + ')'
        });
        data.push({
          kind : 'text',
          data : joinText([
            ps.page ? '**' + ps.page + '**' : '',
            ps.pageUrl
          ], "\n")
        });
      }
      else if (ps.type !== 'regular') {
        data.push({
          kind : 'text',
          data : joinText([
            (ps.item || ps.page) ? '**' + (ps.item || ps.page) + '**' : '',
            ps.itemUrl || ps.pageUrl
          ], "\n")
        });
      }
      if (ps.body) {
        data.push({
          kind : 'text',
          data : ps.body
        });
      }

      return request(this.POST_URL, {
        multipart : true,
        sendContent : {
          unsanitized_body : JSON.stringify(data)
        },
        headers : {
          'x-csrf-token'     : token,
          'x-requested-with' : 'XMLHttpRequest'
        }
      });
    },

    getUploadMetadata : function (token) {
      return request(this.META_URL, {
        responseType: 'json'
      }).then(function (res) {
        return res.response;
      });
    },

    upload : function (ps, token) {
      return this.getUploadMetadata(token).then(function (metadata) {
        return request(metadata.endpoint, {
          sendContent : {
            key                   : metadata.prefix + '/' + ps.file.name,
            AWSAccessKeyId        : metadata.access_key,
            acl                   : 'public-read',
            success_action_status : '201',
            policy                : metadata.policy,
            signature             : metadata.signature,
            'Content-Type'        : ps.file.type,
            file                  : ps.file
          }
        }).then(function (res) {
          var xml = res.responseXML;
          var url= xml.getElementsByTagName('Location')[0];
          return url.childNodes[0].nodeValue;
        });
      });
    }
  });
})();
