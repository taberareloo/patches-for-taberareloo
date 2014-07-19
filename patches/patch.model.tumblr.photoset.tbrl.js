// ==Taberareloo==
// {
//   "name"        : "Post Tumblr Photo Set"
// , "description" : "Post Tumblr Photo Set"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "2.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.model.tumblr.photoset.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    Menus._register({
      title    : 'Photo - Set',
      contexts : ['all'],
      onclick  : function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
          request: 'contextMenusPhotoSet',
          content: info
        });
      }
    }, null, 'Photo', true);
    Menus.create();

    addAround(Models['Tumblr'], 'post', function (proceed, args, target, methodName) {
      var ps   = args[0];
      var self = target;

      if (TBRL.Config.post['tumblr_default_quote']) {
        ps = update({}, ps);
        ps.flavors = update({}, ps.flavors);
        delete ps['flavors']['html'];
      }
      var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
      return self.postForm(function () {
        return self.getForm(endpoint).then(function postUpdate (form) {
          var type;
          type = ps.type.capitalize();
          return Tumblr[type].convertToForm(ps).then(function (form2) {
            // merging forms
            update(form, form2);
            self.appendTags(form, ps);

            if (TBRL.Config.post.multi_tumblelogs && !Tumblr.blogs.some(function (id) { return id === form.channel_id; })) {
              throw new Error(chrome.i18n.getMessage('error_notLoggedin', form.channel_id));
            }

            return (function () {
              if (type === 'Photo') {
                if (ps.photos) {
                  delete form['photo[]'];
                  delete form['photo_src[]'];
                  return Tumblr.PhotoSet.post(form, ps);
                }

                if (form['photo[]']) {
                  return request(Tumblr.TUMBLR_URL + 'svc/post/upload_photo', {
                    sendContent: form
                  }).then(function (res){
                    var response = JSON.parse(res.response);

                    if (response.meta && response.meta.msg === 'OK' && response.meta.status === 200) {
                      delete form['photo[]'];
                      form['images[o1]'] = response.response[0].url;
                      form['post[photoset_layout]'] = '1';
                      form['post[photoset_order]'] = 'o1';

                      return self._post(form);
                    }

                    return res;
                  });
                } else {
                  form['images[o1]'] = form['photo_src[]'];
                  form['post[photoset_layout]'] = '1';
                  form['post[photoset_order]'] = 'o1';
                }
              }

              return self._post(form);
            }()).catch(function (err) {
              if (self.retry) {
                throw err;
              }

              Tumblr.form_key = Tumblr.channel_id = null;
              self.retry = true;

              return self.getForm(endpoint).then(postUpdate);
            });
          });
        });
      });
    });

    addAround(Models['Tumblr'].Photo, 'convertToForm', function (proceed, args, target, methodName) {
      var ps = args[0];
      if (ps.photos) {
        return Models['Tumblr'].PhotoSet.convertToForm(ps);
      } else {
        return proceed(args);
      }
    });

    update(Models['Tumblr'], {
      PhotoSet : {
        convertToForm : function (ps) {
          var photos = [];
          var promiseList = [];
          ps.photos.forEach(function (photo) {
            if (photo.match(/^https?/)) {
              promiseList.push(new Promise(function (resolve) {
                (photo ? getFinalUrl(photo) : Promise.resolve(null)).then(function (finalUrl) {
                  resolve(finalUrl);
                });
              }));
            } else {
              promiseList.push(Promise.resolve(photo));
            }
          });
          return Promise.all(promiseList).then(function (results) {
            ps.photos = results.filter(function (result) { return result; });
            var form = {
              'post[type]'  : ps.type,
              'post[two]'   : joinText([
                (ps.item? ps.item.link(ps.pageUrl) : '') + (ps.author? ' (via ' + ps.author.link(ps.authorUrl) + ')' : ''),
                ps.description], '\n\n'),
              'post[three]' : ps.pageUrl,
              MAX_FILE_SIZE: '10485760'
            };
            return form;
          });
        },
        post : function (form, ps) {
          var orders = [];
          var len = ps.photos.length;
          if (len > 10) {
            len = 10;
          }
          for (var i = 0 ; i < len ; i++) {
            var order = 'o' + (i + 1);
            form['images[' + order + ']'] = ps.photos[i];
            orders.push(order);
          }
          form['post[photoset_layout]'] =
              '1' + Array(Math.floor((len - 1) / 2) + 1).join('2') + (((len - 1) % 2) ? '1' : '');
          form['post[photoset_order]'] = orders.join(',');
          return Tumblr._post(form);
        }
      }
    });
    return;
  }

  if (inContext('content')) {
    TBRL.setRequestHandler('contextMenusPhotoSet', function (req, sender, func) {
      func({});
      var ctx = TBRL.createContext(TBRL.getContextMenuTarget());
      TBRL.share(ctx, Extractors['Photo - Set'], true);
    });

    Extractors.register([{
      name           : 'Photo - Set',
      ICON           : Extractors['Photo'].ICON,
      TARGET_OPACITY : 0.3,
      IMAGE_XPATH    : './ancestor-or-self::img',

      check : function (ctx) {
        return true;
      },
      extract : function (ctx) {
        return this.select(ctx).then(function (nodes) {
          var photos = nodes.map(function (node) {
            return node.src;
          });
          return {
            type    : 'photo',
            item    : ctx.title,
            itemUrl : photos[0],
            photos  : photos
          };
        });
      },
      select : function (ctx) {
        var self = this;
        return new Promise(function (resolve, reject) {
          var doc = ctx.document || document;

          var list = [];
          var nodes = [];
          var now_target = null;
          function getImageElement(e) {
            return $X(self.IMAGE_XPATH, e.target)[0];
          }
          function onMouseOver(e) {
            var target = getImageElement(e);
            if (target && !target.captureSelected) {
              now_target = target;
              target.originalOpacity = target.style.opacity;
              target.style.opacity = self.TARGET_OPACITY;
            }
          }
          function onMouseOut(e) {
            var target = getImageElement(e);
            if (target && !target.captureSelected) {
              now_target = null;
              unpoint(target);
            }
          }
          function onClick(e) {
            cancel(e);
            var target = getImageElement(e);
            if (target) {
              target.captureSelected = !target.captureSelected;
              if (target.captureSelected) {
                list.push(target);
                nodes.push(target);
              }
              else {
                var index = list.indexOf(target);
                if (index !== -1) {
                  list.splice(index, 1);
                }
                index = nodes.indexOf(target);
                if (index !== -1) {
                  nodes.splice(index, 1);
                }
              }
            }
          }
          function onKeyDown(e) {
            cancel(e);

            switch (keyString(e)) {
            case 'ESCAPE':
              finalize();
              reject();
              return;
            case 'RETURN':
              finalize();
              if (nodes.length) {
                resolve(nodes);
              }
              else {
                reject();
              }
              return;
            }
          }
          function unpoint(elm) {
            if (elm.originalOpacity !== null) {
              elm.style.opacity = elm.originalOpacity;
              elm.originalOpacity = null;
            }
          }
          function finalize() {
            doc.removeEventListener('mouseover', onMouseOver, true);
            doc.removeEventListener('mouseout', onMouseOut, true);
            doc.removeEventListener('click', onClick, true);
            doc.removeEventListener('keydown', onKeyDown, true);

            list.forEach(function (elm) {
              elm.captureSelected = null;
              unpoint(elm);
            });
            if (now_target) {
              now_target.captureSelected = null;
              unpoint(now_target);
            }
          }

          doc.addEventListener('mouseover', onMouseOver, true);
          doc.addEventListener('mouseout', onMouseOut, true);
          doc.addEventListener('click', onClick, true);
          doc.addEventListener('keydown', onKeyDown, true);
        });
      }
    }]);
    return;
  }
})();
