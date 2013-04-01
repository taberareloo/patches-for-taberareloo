// ==Taberareloo==
// {
//   "name"        : "App.Net Model"
// , "description" : "Post to alpha.app.net"
// , "include"     : ["background"]
// , "version"     : "1.1.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.appdotnet.tbrl.js"
// }
// ==/Taberareloo==

(function() {

  Models.register({
    name       : 'App.Net',
    ICON       : 'https://d2c01jv13s9if1.cloudfront.net/i/V/_/K/V_KkNIUhgyiwXSIeh1j0kP9LXWA.ico',
    LINK       : 'https://alpha.app.net/',
    LOGIN_URL  : 'https://account.app.net/login/',

    POST_URL   : 'https://alpha.app.net/omo-api-proxy/0/posts',
    UPLOAD_URL : 'https://alpha.app.net/omo-api-proxy/0/files',

    check : function(ps) {
      return /regular|photo|quote|link|video/.test(ps.type);
    },

    is_initialized : false,

    getCSRFToken : function() {
      var self = this;
      return (
        this.is_initialized ? succeed() : request(this.LINK)
      ).addCallback(function() {
        return getCookies('alpha.app.net', 'csrftoken').addCallback(function(cookies) {
          if (cookies.length) {
            self.is_initialized = true;
            return cookies[cookies.length-1].value;
          } else {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
        });
      });
    },

    post : function(ps) {
      var self = this;
      ps = update({}, ps);
      if (ps.type === 'photo') {
        return Models['Gmail'].download(ps).addCallback(function(file) {
          ps.file = file;
          return self.upload(ps);
        });
      } else {
        return this._post(ps);
      }
    },

    _post : function(ps, fileInfo) {
      var self = this;

      var maxLength = 256;

      var sendContent = {};

      var text = '';
      if (ps.type === 'regular') {
        text = joinText([ps.item, ps.description], "\n");
      }
      else {
        var title = (ps.item || ps.page || '');
        if (ps.pageUrl && title && !title.match(/(#|(^|\s)@)/)) {
          sendContent.entities = {
            links : [{
              url : ps.pageUrl,
              pos : (ps.description ? ps.description.length + 2 : 0),
              len : title.length
            }]
          };
          text = title;
        }
        else {
          text = joinText([title, ps.pageUrl], "\n");
        }
        text = joinText([
          text,
          (ps.body) ? '“' + ps.body + '”' : ''], "\n", true);
        text = joinText([ps.description, text], "\n\n");
      }

      if (text.length > maxLength) {
        text = text.substring(0, maxLength - 3) + '...';
      }
      sendContent.text = text;

      if (fileInfo) {
        sendContent.annotations = [{
          type  : 'net.app.core.oembed',
          value : {
            '+net.app.core.file' : {
              file_token : fileInfo.file_token,
              format     : 'oembed',
              file_id    : fileInfo.id
            }
          }
        }];
      }

      this.addBeforeSendHeader();

      return this.getCSRFToken().addCallback(function(csrftoken) {
        return request(self.POST_URL + '?' + queryString({
          include_post_annotations : 1
        }), {
          sendContent : JSON.stringify(sendContent),
          headers : {
            'Content-Type'              : 'application/json',
            'X-ADN-Migration-Overrides' : queryString({
              disable_min_max_id : 1,
              response_envelope  : 1,
              follow_pagination  : 1,
              pagination_ids     : 1
            }),
            'X-CSRFToken'      : csrftoken,
            'X-Requested-With' : 'XMLHttpRequest'
          }
        }).addCallback(function(res) {
          self.removeBeforeSendHeader();
        }).addErrback(function(e) {
          self.removeBeforeSendHeader();
          var res  = e.message;
          var data = JSON.parse(res.responseText);
          self.is_initialized = false;
          if (data.meta.code === 403) {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
          if (data.meta.error_message) {
            throw new Error(data.meta.error_message);
          }
          else {
            throw new Error('Could not post a content');
          }
        });
      });
    },

    upload : function(ps) {
      var self = this;

      this.addBeforeSendHeader();

      return this.getCSRFToken().addCallback(function(csrftoken) {
        return request(self.UPLOAD_URL, {
          sendContent : {
            content : ps.file,
            type    : 'net.app.alpha.attachment'
          },
          headers : {
            'X-ADN-Migration-Overrides' : queryString({
              disable_min_max_id : 1,
              response_envelope  : 1,
              follow_pagination  : 1,
              pagination_ids     : 1
            }),
            'X-CSRFToken'      : csrftoken,
            'X-Requested-With' : 'XMLHttpRequest'
          }
        }).addCallback(function(res) {
          self.removeBeforeSendHeader();
          var data = JSON.parse(res.responseText);
          return self._post(ps, data.data);
        }).addErrback(function(e) {
          self.removeBeforeSendHeader();
          var res  = e.message;
          var data = JSON.parse(res.responseText);
          self.is_initialized = false;
          if (data.meta.code === 403) {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
          if (data.meta.error_message) {
            throw new Error(data.meta.error_message);
          }
          else {
            throw new Error('Could not upload an image');
          }
        });
      });
    },

    addBeforeSendHeader : function() {
      chrome.webRequest.onBeforeSendHeaders.addListener(
        this.setRefererHeader,
        { urls: [this.LINK + '*'] },
        [ "blocking", "requestHeaders" ]
      );
    },

    removeBeforeSendHeader : function() {
      chrome.webRequest.onBeforeSendHeaders.removeListener(
        this.setRefererHeader,
        { urls: [this.LINK + '*'] },
        [ "blocking", "requestHeaders" ]
      );
    },

    setHTTPHeader : function(headers, name, value) {
      var found = false;
      for (var i = 0; i < headers.length; ++i) {
        if (headers.name === name) {
          headers.value = value;
          found = true;
          break;
        }
      }
      if (!found) {
        headers.push({
          name  : name,
          value : value
        });
      }
      return headers;
    },

    setRefererHeader : function(details) {
      var headers = details.requestHeaders;
      headers = Models['App.Net'].setHTTPHeader(headers, 'Referer', 'https://alpha.app.net/');
  //    headers = Models['App.Net'].setHTTPHeader(headers, 'Origin',  'https://alpha.app.net');
      return {requestHeaders: headers};
     }
  });
})();