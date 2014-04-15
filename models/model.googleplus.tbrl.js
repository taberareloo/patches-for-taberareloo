// ==Taberareloo==
// {
//   "name"        : "Google+ model"
// , "description" : "Post to Google+"
// , "include"     : ["background", "content", "popup"]
// , "match"       : ["https://plus.google.com/*"]
// , "version"     : "1.0.8"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.googleplus.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    if (Models['Google+']) {
      if (Models['Google+'].timer) {
        clearTimeout(Models['Google+'].timer);
      }
      Models.remove('Google+');
    }

    Models.register({
      name       : 'Google+',
      ICON       : 'https://ssl.gstatic.com/s2/oz/images/faviconr3.ico',
      LINK       : 'https://plus.google.com/',
      LOGIN_URL  : 'https://plus.google.com/up/start/',

      HOME_URL   : 'https://plus.google.com/',
      BASE_URL   : 'u/0/',
      INIT_URL   : '_/initialdata',
      POST_URL   : '_/sharebox/post/',
      UPLOAD_URL : '_/upload/photos/resumable',
      SNIPPET_URL: '_/sharebox/linkpreview/',

      is_pages : false,

      sequence : 0,

      YOUTUBE_REGEX : /http(?:s)?:\/\/(?:.*\.)?youtube.com\/watch\?v=([a-zA-Z0-9_-]+)[-_.!~*'()a-zA-Z0-9;\/?:@&=+\$,%#]*/g,

      timer : null,

      initialize : function() {
        var self = this;

        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }

        if (this.is_pages) {
          return;
        }

        var enable = false;
        ['regular', 'photo', 'quote', 'link', 'video', 'favorite'].forEach(function(type) {
          var config = Models.getConfig({ type: type }, self);
          if ((config === 'default') || (config === 'enabled')) {
            enable = true;
          }
        });

        if (!enable) {
          return;
        }

        return getCookies('.google.com', 'SSID').addCallback(function(cookies) {
          if (cookies.length) {
            try {
              self._getStreams();
            }
            catch (e) {}
          }
          else {
            self.streams = null;
          }
          self.timer = setTimeout(function() {
            self.initialize();
          }, 60000);
        });
      },

      check: function(ps) {
        return /regular|photo|quote|link|video/.test(ps.type);
      },

      getAuthCookie: function() {
        var that = this;
        return getCookies('.google.com', 'SSID').addCallback(function(cookies) {
          if (cookies.length) {
            return cookies[cookies.length-1].value;
          } else {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', that.name));
          }
        });
      },

      getOZData : function() {
        var self = this;
        return this.getInitialData(1).addCallback(function(oz1) {
          return self.getInitialData(2).addCallback(function(oz2) {
            return {'1': oz1, '2': oz2};
          });
       });
      },

      getInitialData : function(key) {
        var self = this;
        var url = this.HOME_URL + this.BASE_URL + this.INIT_URL;
        return request(url + '?' + queryString({
          hl     : 'en',
          _reqid : this.getReqid(),
          rt     : 'j'
        }), {
          sendContent : {
            key : key
          }
        }).addCallback(function(res) {
          var initialData = res.responseText.substr(4).replace(/(\\n|\n)/g, '');
          return Sandbox.evalJSON(initialData).addCallback(function(json) {
            var data = self.getDataByKey(json[0], 'idr');
            if (!data) {
              throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
            }
            return Sandbox.evalJSON(data[1]).addCallback(function(json) {
              return json[key];
            });
          });
        });
      },

      getDataByKey : function(arr, key) {
        for (var i = 0, len = arr.length ; i < len ; i++) {
          var data = arr[i];
          if (data[0] === key) {
            return data;
          }
        }
        return null;
      },

      getDefaultScope : function() {
        var self = this;
        return this.getInitialData(11).addCallback(function(data) {
          if (!data) return JSON.stringify([]);

          data = data[15][2];

          var aclEntries = [];


          for (var i = 0, len = data.length ; i < len ; i++) {
            var scope = data[i];
            switch (scope[0][2]) {
            case 1:
              aclEntries.push({
                scopeType   : 'presets',
                name        : scope[1],
                id          : scope[0][2],
                me          : true,
                requiresKey : false
              });
              break;
            case 3:
              aclEntries.push({
                scopeType   : 'presets',
                name        : scope[1],
                id          : scope[0][2],
                me          : false,
                requiresKey : false,
                groupType   : 'a'
              });
              break;
            case 4:
              aclEntries.push({
                scopeType   : 'presets',
                name        : scope[1],
                id          : scope[0][2],
                me          : false,
                requiresKey : false,
                groupType   : 'e'
              });
              break;
            default:
              aclEntries.push({
                scopeType   : 'focusGroup',
                name        : scope[1],
                id          : scope[0][1],
                me          : false,
                requiresKey : false,
                groupType   : 'p'
              });
              break;
            }
          }

          return JSON.stringify(aclEntries);
        });
      },

      post : function(ps) {
        var self = this;
        ps = update({}, ps);
        return this.getAuthCookie().addCallback(function(cookie) {
          return self.getOZData().addCallback(function(oz) {
            return (ps.file ? self.upload(ps.file, oz) : succeed(null))
              .addCallback(function(upload) {
              ps.upload = upload;
              return ((!self.is_pages && ps.scope)
                ? succeed(ps.scope) : self.getDefaultScope(oz))
                .addCallback(function(scope) {
                ps.scope = scope;
                return self._post(ps, oz);
              });
            });
          });
        });
      },

      favor : function(ps) {
        return this.post(update({reshare : true}, ps));
      },

      getReqid : function() {
        var sequence = this.sequence++;
        var now = new Date;
        var seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        return seconds + sequence * 1E5;
      },

      getToken : function(oz) {
        return 'oz:' + oz[2][0] + '.' + Date.now().toString(16) + '.' + this.sequence.toString(16);
      },

      getSnippetFromURL : function(url, oz) {
        var self = this;
        var data = [];
        data.push(url);
        data.push(false, false);
        data.push(null, null, null, null, null, null, null, null, null);
        data.push(true);
        return request(this.HOME_URL + this.SNIPPET_URL + '?' + queryString({
          hl     : 'en',
          _reqid : this.getReqid(),
          rt     : 'j'
        }), {
          sendContent : {
            'f.req' : JSON.stringify(data),
            at      : oz[1][15]
          }
        }).addCallback(function(res) {
          var initialData = res.responseText.substr(4).replace(/(\\n|\n)/g, '');
          return Sandbox.evalJSON(initialData).addCallback(function(json) {
            var data = self.getDataByKey(json[0], 'lpd');
            return data;
          });
        });
      },

      makeSnippetPostable : function(snippet) {
        for (var i = 0, len = snippet.length ; i < len ; i++) {
          var item = snippet[i];
          if (Array.isArray(item)) {
            snippet[i] = this.makeSnippetPostable(item);
          }
          else if ((item !== null) && (typeof item === 'object')) {
            for(var key in item) {
              snippet[i][key] = this.makeSnippetPostable(item[key]);
            }
            for (var j = i ; j < 5 ; j++) {
              snippet.splice(i, 0, null);
            }
            break;
          }
        }
        return snippet;
      },

      createPhotoInfo : function (ps, oz) {
        var info = [];
        info.push(
          [344,339,338,336,335],
          null, null, null,
          [{"39387941":[true,false]}],
          null, null
        );
        info.push({
          "40655821": [
            ps.upload.pageUrl,
            ps.upload.url,
            ps.upload.mimeType,
            "",
            null, null, null,
            [], null, null,
            [], null, null,
            null, null, null, null, null,
            '' + ps.upload.width, '' + ps.upload.height,
            null, null, null, null, null,
            null,
            oz[2][0],
            null, null, null, null, null,
            null, null, null, null, null,
            ps.upload.albumid, ps.upload.photoid,
            queryString({
              albumid : ps.upload.albumid,
              photoid : ps.upload.photoid
            }),
            1,
            [],
            null, null, null, null, [],
            null, null, null, null, null,
            null, null, null, null, null,
            null, null, null, null, null,
            null, null, null, null, null,
            null, null, null, null, null,
            null, null, null, null, null,
            null, null, null, null, null,
            []
          ]
        });
        return info;
      },

      createScopeSpar : function(ps) {
        var aclEntries = [];

        var scopes = JSON.parse(ps.scope);

        if (scopes[0].scopeType === 'community') {
          return [[[null, null, null, [scopes[0].id]]]];
        }

        for (var i = 0, len = scopes.length ; i < len ; i++) {
          var scope = scopes[i];
          if (scope.scopeType == 'presets') {
            aclEntries.push([
              null, null, scope.id
            ]);
          }
          else {
            aclEntries.push([
              null, scope.id
            ]);
          }
        }

        return [aclEntries, null];
      },

      decodeHTMLEntities : function(str) {
        var div = $N('div');
        div.innerHTML = str;
        return div.innerText;
      },

      _post : function(ps, oz) {
        var self = this;
        return (
          (!ps.upload && !ps.reshare && (ps.type !== 'regular') && ps.pageUrl) ?
           this.getSnippetFromURL(ps.pageUrl, oz) :
           succeed()
        ).addCallback(function(snippet) {
          var description = ps.description || '';
          if (ps.type === 'regular') {
            description = joinText([ps.item, ps.description], "\n");
          }
          var body = ps.body || '';
          ps.body = null;
          if (body) {
            body = body.replace(/\r\n/g, "\n");
            body = body.replace(/\n<br(\s*\/)?>/ig, "\n");
            body = body.replace(/<br(\s*\/)?>\n/ig, "\n");
            body = body.replace(/<br(\s*\/)?>/ig, "\n");
            body = body.trimTag().trim();
            body = self.decodeHTMLEntities(body);
            description = joinText([description, '“' + body + '”'], "\n\n");
          }
          if (ps.upload) {
            body = joinText([
              (ps.item || ps.page) ? '*' + (ps.item || ps.page) + '*' : '', ps.pageUrl,
              body ? '“' + body + '”' : ''], "\n");
            description = joinText([ps.description, body], "\n\n");
          }
          if (ps.tags && ps.tags.length) {
            var tags = ps.tags.map(function (tag) {
              return '#' + tag;
            }).join(' ');
            description = joinText([description, tags], "\n\n");
          }

          var data = [];
          if (ps.reshare) {
            data.push(
              ps.description || '',
              self.getToken(oz),
              ps.favorite.id,
              null, null, null,
              JSON.stringify([])
            );
          }
          else {
            data.push(
              description,
              self.getToken(oz),
              null,
              null, null, null,
              JSON.stringify([])
            );
          }

          data.push(null, null);
          var scopes = JSON.parse(ps.scope);
          data.push((scopes[0].scopeType !== 'community'));
          data.push([], false, null, null, [], null, false);
          data.push(null, null);
          data.push(null);
          data.push(null, null);
          data.push(null, null, null, null, null);
          data.push(false, false, false);
          data.push(null, null, null, null);
          if (ps.upload) {
            snippet = self.createPhotoInfo(ps, oz);
            data.push(snippet);
          }
          else {
            if (snippet) {
              var media_type;
              switch (snippet[4][0][0]) {
              case 1:
                media_type = 'link';
                break;
              case 2:
                media_type = 'video';
                break;
              default:
                media_type = 'link';
              }
              snippet = self.makeSnippetPostable(snippet[5][0]);
              if ((media_type !== 'video')) {
                var obj = snippet[5] || snippet[7];
                for (var key in obj) {
                  if (ps.type === 'photo') {
                    obj[key][1] = ps.itemUrl;
                    if (!obj[key][5]) {
                      obj[key][5] = [];
                      obj[key][5][1] = 150;
                      obj[key][5][2] = 150;
                    }
                    obj[key][5][0] = ps.itemUrl;
                    if (!obj[key][184]) {
                      obj[key][184] = [];
                      obj[key][184][0] = [339, 338, 336, 335, 0];
                      obj[key][184][5] = {40265033 : []};
                    }

                    function setImageToSnippet184(snippet184, image) {
                      snippet184[1] = image;
                      if (snippet184[5] && (typeof snippet184[5] === 'object')) {
                        for (var key in snippet184[5]) {
                          snippet184[5][key][0] = image;
                          snippet184[5][key][1] = image;

                          if (Array.isArray(snippet184[5][key][184])) {
                            setImageToSnippet184(snippet184[5][key][184], image);
                          }
                        }
                      }
                    }
                    setImageToSnippet184(obj[key][184], ps.itemUrl);
                  }
                  if (ps.type === 'quote') {
                    obj[key][1] = null;
                    obj[key][5] = null;
                    obj[key][7] = null;
                    obj[key][10] = null;
                    obj[key][184] = null;
                  }
                  obj[key][2] = ps.item || ps.page;
                  if (ps.type !== 'link') {
                    obj[key][3] = ps.body ? ps.body.trimTag().trim() : null;
                  }
                }
              }
              data.push(snippet);
            }
            else {
              data.push(null);
            }
          }
          data.push(null);

          if (scopes[0].scopeType === 'community') {
            data.push([[scopes[0].id, scopes[0].category]]);
          }
          else {
            data.push([]);
          }

          data.push(self.createScopeSpar(ps));

          data.push(null, null, null, null, null, null);

          var url = self.HOME_URL + self.BASE_URL + self.POST_URL;
          return request(url + '?' + queryString({
            hl     : 'en',
            _reqid : self.getReqid(),
            rt     : 'j'
          }), {
            sendContent : {
              'f.req' : JSON.stringify(data),
              at      : oz[1][15]
            }
          });
        });
      },

      openUploadSession : function(fileName, fileSize, oz) {
        var self = this;

        var data = {
          protocolVersion      : '0.8',
          createSessionRequest : {
            fields : [
              {
                external : {
                  name     : 'file',
                  filename : fileName,
                  put      : {},
                  size     : fileSize
                }
              },
              {
                inlined : {
                  name        : 'batchid',
                  content     : String(Date.now()),
                  contentType : 'text/plain'
                }
              },
              {
                inlined : {
                  name        : 'client',
                  content     : 'sharebox',
                  contentType : 'text/plain'
                }
              },
              {
                inlined : {
                  name        : 'disable_asbe_notification',
                  content     : 'true',
                  contentType : 'text/plain'
                }
              },
              {
                inlined : {
                  name        : 'streamid',
                  content     : 'updates',
                  contentType : 'text/plain'
                }
              },
              {
                inlined : {
                  name        : 'use_upload_size_pref',
                  content     : 'true',
                  contentType : 'text/plain'
                }
              },
              {
                inlined : {
                  name        : 'album_abs_position',
                  content     : '0',
                  contentType : 'text/plain'
                }
              }
            ]
          }
        };

        if (this.is_pages) {
          data.createSessionRequest.fields.push({
            inlined : {
              name        : 'effective_id',
              content     : oz[2][0],
              contentType : 'text/plain'
            }
          });
          data.createSessionRequest.fields.push({
            inlined : {
              name        : 'owner_name',
              content     : oz[2][0],
              contentType : 'text/plain'
            }
          });
        }

        var url = this.HOME_URL + this.UPLOAD_URL;
        return request(url + '?authuser=0', {
          sendContent : JSON.stringify(data)
        }).addCallback(function(res) {
          var session = JSON.parse(res.responseText);
          if (session.sessionStatus) {
            return session;
          }
          return null;
        });
      },

      upload : function(file, oz) {
        return this.openUploadSession(file.name, file.size, oz).addCallback(function(session) {
          if (!session) {
            throw new Error("Couldn't upload an image properly");
            return null;
          }
          return request(session.sessionStatus.externalFieldTransfers[0].putInfo.url, {
            mode        : 'raw',
            sendContent : file
          }).addCallback(function(res) {
            var session = JSON.parse(res.responseText);
            if (session.sessionStatus) {
              var completionInfo = session.sessionStatus
                .additionalInfo['uploader_service.GoogleRupioAdditionalInfo'].completionInfo;
              if (completionInfo && (completionInfo.status === 'SUCCESS')) {
                var pageUrl = 'https://plus.google.com/photos/' +
                  oz[2][0] + '/albums/' +
                  completionInfo.customerSpecificInfo.albumid + '/' +
                  completionInfo.customerSpecificInfo.photoid;
                completionInfo.customerSpecificInfo.pageUrl = pageUrl;
                return completionInfo.customerSpecificInfo;
              }
            }
            throw new Error("Couldn't upload an image properly");
            return null;
          });
        });
      },

      streams : null,

      getStreams : function() {
        return this.streams;
      },

      _getStreams : function() {
        var self = this;
        this.getInitialData(12).addCallback(function(data) {
          var circles = [];
          if (data) {
            data[0].forEach(function(circle) {
              var code, id, name, has;
              id   = circle[0][0];
              name = circle[1][0];
              if (id && name) {
                has = false;
                circles.forEach(function(c) {
                  if (!has && c[0].id === id) {
                    has = true;
                  }
                });
                if (!has) {
                  circles.push([{
                    scopeType   : 'focusGroup',
                    name        : name,
                    id          : id,
                    me          : false,
                    requiresKey : false,
                    groupType   : 'p'
                  }]);
                }
              }
            });
          }

          var presets = [
            [{
              scopeType   : 'presets',
              name        : 'Your circles',
              id          : 3,
              me          : false,
              requiresKey : false,
              groupType   : 'a'
            }],
            [{
              scopeType   : 'presets',
              name        : 'Extended circles',
              id          : 4,
              me          : false,
              requiresKey : false,
              groupType   : 'e'
            }],
            [{
              scopeType   : 'presets',
              name        : 'Anyone',
              id          : 1,
              me          : true,
              requiresKey : false
            }]
          ];

          self.streams = {
            presets : presets,
            circles : circles
          };
        });
      },

      getPages : function() {
        var self = this;
        return this.getInitialData(104).addCallback(function(data) {
          var pages = [];
          if (data && data[1] && data[1][1] && data[1][1][0]) {
            data[1][1][0].forEach(function(page) {
              if (page[0]) {
                pages.push({
                  id   : page[0][30],
                  name : page[0][4][3],
                  icon : page[0][3]
                });
              }
            });
          }
          return pages;
        });
      },

      getCommunities : function() {
        var communities = localStorage.getItem('google_plus_communities');
        if (communities) {
          communities = JSON.parse(communities);
        }
        else {
          communities = [];
        }
        return communities;
      },

      setCommunities : function(communities) {
        communities.sort(function(a, b) {
          if (b[0].name > a[0].name) return -1;
          if (b[0].name < a[0].name) return 1;
          return 0;
        });
        localStorage.setItem('google_plus_communities', JSON.stringify(communities));
      },

      getCommunityCategories : function(community_id) {
        var self = this;
        return this.getOZData().addCallback(function(oz) {
          var url = self.HOME_URL + self.BASE_URL + '_/communities/readmembers';
          return request(url + '?' + queryString({
            hl     : 'en',
            _reqid : self.getReqid(),
            rt     : 'j'
          }), {
            sendContent : {
              'f.req' : JSON.stringify([community_id, [[4],[3]]]),
              at      : oz[1][15]
            }
          }).addCallback(function(res) {
            var initialData = res.responseText.substr(4).replace(/(\\n|\n)/g, '');
            return Sandbox.evalJSON(initialData).addCallback(function(json) {
              var data = self.getDataByKey(json[0], 'sq.rsmr');
              var categories = [];
              if (data && data[2] && data[2][2] && data[2][2][0]) {
                data[2][2][0].forEach(function(category) {
                  categories.push({
                    id   : category[0],
                    name : category[1]
                  });
                });
              }
              return categories;
            });
          });
        });
      },

      addCommunityCategory : function(url, title) {
        var self = this;

        var regex = url.match(/\/\/plus\.google\.com\/(?:u\/0\/)?communities\/(\d+)\/stream\/([^?]+)/);
        if (regex) {
          this.removeCommunityCategory(url, title, true);
          var communities = this.getCommunities();
          var name = title.replace(/ - Google\+$/, '');
          communities.push([{
            scopeType : 'community',
            name      : name,
            id        : regex[1],
            category  : regex[2]
          }]);
          TBRL.Notification.notify({
            title   : name,
            message : 'Added',
            timeout : 3
          });
          this.setCommunities(communities);
          return true;
        }

        regex = url.match(/\/\/plus\.google\.com\/(?:u\/0\/)?communities\/(\d+)$/);
        if (regex) {
          this.getCommunityCategories(regex[1]).addCallback(function(categories) {
            self.removeCommunityCategory(url, title, true);
            var communities = self.getCommunities();
            var name = title.replace(/ - Google\+$/, '');
            categories.forEach(function(category) {
              communities.push([{
                scopeType : 'community',
                name      : name + ' - ' + category.name,
                id        : regex[1],
                category  : category.id
              }]);
            });
            TBRL.Notification.notify({
              title   : name,
              message : 'Added all categories',
              timeout : 3
            });
            self.setCommunities(communities);
          });
          return true;
        }

        return false;
      },

      removeCommunityCategoryById : function(id, category) {
        var communities = this.getCommunities();
        var _communities = [];

        var found = false;
        communities.forEach(function(community) {
          if (community[0].id == id) {
            if (category) {
              if (community[0].category == category) {
                found = true;
              }
              else {
                _communities.push(community);
              }
            }
            else {
              found = true;
            }
          }
          else {
            _communities.push(community);
          }
        });
        this.setCommunities(_communities);
        return found;
      },

      removeCommunityCategory : function(url, title, no_nitify) {
        var regex = url.match(/\/\/plus\.google\.com\/(?:u\/0\/)?communities\/(\d+)\/stream\/([^?]+)/);
        if (regex) {
          var found = this.removeCommunityCategoryById(regex[1], regex[2]);
          if (found && !no_nitify) {
            TBRL.Notification.notify({
              title   : title.replace(/ - Google\+$/, ''),
              message : 'Removed',
              timeout : 3
            });
          }
          return found;
        }

        regex = url.match(/\/\/plus\.google\.com\/(?:u\/0\/)?communities\/(\d+)$/);
        if (regex) {
          var found = this.removeCommunityCategoryById(regex[1]);
          if (found && !no_nitify) {
            TBRL.Notification.notify({
              title   : title.replace(/ - Google\+$/, ''),
              message : 'Removed all categories',
              timeout : 3
            });
          }
          return found;
        }

        return false;
      }
    }, 'Diigo', true);

    Models.googlePlusPages = [];
    Models.getGooglePlusPages = function() {
      Models.removeGooglePlusPages();
      return Models['Google+'].getPages().addCallback(function(pages) {
        return pages.reverse().map(function(page) {
          var model = update({}, Models['Google+']);
          model.name     = 'Google+ Page - ' + page.name;
          model.ICON     = 'http:' + page.icon;
          model.typeName = 'Google+';
          model.BASE_URL = 'b/' + page.id + '/';
          model.is_pages = true;
          Models.register(model, 'Google+', true);
          Models.googlePlusPages.unshift(model);
          return model;
        }).reverse();
      }).addErrback(function(e) {
        alert('Google+ Pages'+ ': ' +
          (e.message.hasOwnProperty('status') ? '\n' + ('HTTP Status Code ' + e.message.status).indent(4) : '\n' + e.message.indent(4)));
      });
    };
    Models.removeGooglePlusPages = function() {
      Models.googlePlusPages.forEach(function(model) {
        Models.remove(model);
      });
      Models.googlePlusPages = [];
    };

    setTimeout(function() {
      Models['Google+'].initialize();
      Models.getGooglePlusPages();
    }, 1000);

    var googlePlusCommunitiesURLs = [
      'https://plus.google.com/communities/*',
      'https://plus.google.com/u/0/communities/*'
    ];
    Menus._register({
      type: 'separator',
      contexts: ['all'],
      documentUrlPatterns: googlePlusCommunitiesURLs
    });
    Menus._register({
      title: 'Google+ Community ...',
      contexts: ['all'],
      documentUrlPatterns: googlePlusCommunitiesURLs
    });
    Menus._register({
      title: 'Add to destinations',
      contexts: ['all'],
      documentUrlPatterns: googlePlusCommunitiesURLs,
      onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusAddGooglePlusCommunityCategory',
          content: info
        });
      }
    }, 'Google+ Community ...');
    Menus._register({
      title: 'Remove from destinations',
      contexts: ['all'],
      documentUrlPatterns: googlePlusCommunitiesURLs,
      onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusRemoveGooglePlusCommunityCategory',
          content: info
        });
      }
    }, 'Google+ Community ...');
    Menus.create();

    TBRL.setRequestHandler('addGooglePlusCommunityCategory', function (req) {
      var ps = req.content;
      Models['Google+'].addCommunityCategory(ps.pageUrl, ps.page);
    });
    TBRL.setRequestHandler('removeGooglePlusCommunityCategory', function (req) {
      var ps = req.content;
      Models['Google+'].removeCommunityCategory(ps.pageUrl, ps.page);
    });
    return;
  }

  if (inContext('content')) {
    TBRL.setRequestHandler('contextMenusAddGooglePlusCommunityCategory', function (req, sender, func) {
      func({});
      var ctx = update({
        contextMenu: true
      }, TBRL.createContext(TBRL.getContextMenuTarget()));
      chrome.runtime.sendMessage(TBRL.id, {
        request: 'addGooglePlusCommunityCategory',
        show   : false,
        content: {
          page    : ctx.title,
          pageUrl : ctx.href
        }
      }, function () { });
    });
    TBRL.setRequestHandler('contextMenusRemoveGooglePlusCommunityCategory', function (req, sender, func) {
      func({});
      var ctx = update({
        contextMenu: true
      }, TBRL.createContext(TBRL.getContextMenuTarget()));
      chrome.runtime.sendMessage(TBRL.id, {
        request: 'removeGooglePlusCommunityCategory',
        show   : false,
        content: {
          page    : ctx.title,
          pageUrl : ctx.href
        }
      }, function () { });
    });
    return;
  }

  if (inContext('popup')) {
    var background = chrome.extension.getBackgroundPage();

    function Streams(posters, scope) {
      this.posters = posters;
      var container = this.container = $N('div', {id : 'streams'});
      var selectBox = this.selectBox = $N('select', {
        id: 'scope',
        name: 'scope',
        style: 'font-size:1em; width:100%; margin-bottom: 1em;',
        disabled: 'true'
      }, $N('option', {value : ''}, 'Not seem to log in Google+ (will check 1m later)'));
      container.appendChild(selectBox);
      $('widgets').appendChild(container);

      var streams = background.Models['Google+'].getStreams();
      var communities = background.Models['Google+'].getCommunities();
      if (streams) {
        $D(selectBox);
        selectBox.appendChild(
          $N('option', {value : '', selected : 'selected'}, 'Select Google+ Stream (or same as last one)')
        );
        if (streams && streams.presets.length) {
          for (var i = 0, len = streams.presets.length; i < len; i++) {
            var preset = streams.presets[i];
            selectBox.appendChild($N('option', {value : JSON.stringify(preset)}, preset[0].name));
          }
        }
        if (streams && streams.circles.length) {
          var optGroup = $N('optgroup', {label : 'Stream'});
          for (var i = 0, len = streams.circles.length; i < len; i++) {
            var circle = streams.circles[i];
            optGroup.appendChild($N('option', {value : JSON.stringify(circle)}, circle[0].name));
          }
          selectBox.appendChild(optGroup);
        }
        if (communities.length) {
          var optGroup = $N('optgroup', {label : 'Community Category'});
          for (var i = 0, len = communities.length; i < len; i++) {
            var category = communities[i];
            optGroup.appendChild($N('option', {value : JSON.stringify(category)}, category[0].name));
          }
          selectBox.appendChild(optGroup);
        }
        posters.hooks.push(function () {
          if (this.body().some(function (poster) { return poster.name === 'Google+'; })) {
            selectBox.removeAttribute('disabled');
            if (scope) {
              var savedScope = selectBox.querySelector('[value="' + scope.replace(/"/g, '\\"') + '"]');
              if (savedScope) {
                savedScope.selected = true;
              }
            }
          } else {
            selectBox.setAttribute('disabled', 'true');
          }
        });
        posters.postCheck();
      }
    }

    Streams.prototype = {
      constructor : Streams,
      body : function () {
        return this.selectBox.options[this.selectBox.selectedIndex].value;
      }
    };

    document.addEventListener('popupReady', function (ev) {
      var form = ev.detail;
      if (!form.streams) {
        form.savers.scope = form.streams = new Streams(form.posters, form.ps.scope);
      }
    }, false);
    return;
  }
})();
