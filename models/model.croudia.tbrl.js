// ==Taberareloo==
// {
//   "name"        : "Croudia Model"
// , "description" : "Post to croudia.com"
// , "include"     : ["background"]
// , "version"     : "0.1.6"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/models/model.croudia.tbrl.js"
// }
// ==/Taberareloo==

(function () {
  var version = chrome.runtime.getManifest().version;
  version = version.split('.');
  if (version.length > 3) {
    version.pop();
  }
  version = version.join('.');
  if (semver.gte(version, '3.0.12')) {
    Patches.install('https://raw.githubusercontent.com/YungSang/patches-for-taberareloo/ready-for-v4.0.0/models/model.croudia.tbrl.js', true);
    return;
  }

  Models.register({
    name      : 'Croudia',
    ICON      : 'https://croudia.com/favicon.ico',
    LINK      : 'https://croudia.com/',
    LOGIN_URL : 'https://croudia.com/',

    FORM_URL  : 'https://croudia.com/voices/written_ajax',
    POST_URL  : 'https://croudia.com/voices/write',

    check : function (ps) {
      return (/(regular|photo|quote|link|video)/).test(ps.type);
    },

    is_initialized : false,

    getForm : function () {
      var self = this;
      return (
        this.is_initialized ? succeed() : request(this.LOGIN_URL)
      ).addCallback(function () {
        return request(self.FORM_URL, {responseType: 'document'}).addCallback(function (res) {
          var doc = res.response;
          var form = formContents(doc);
          if (!form.utf8) {
            throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
          }
          self.is_initialized = true;
          return form;
        });
      });
    },

    createVoice : function (ps) {
      var maxlen = 372;

      var info = [ps.description, ps.description ? "\n" : ''];
      var body = ps.body ? ps.body.trimTag().trim() : '';
      info.push(body ? '"' + body + '"' : '');
      if (ps.type === 'photo') {
        info.push('(via ' + ps.item + ' ' + ps.pageUrl + ' )');
      }
      else if (ps.type !== 'regular') {
        info.push('(via ' + ps.item + ' ' + ps.itemUrl + ' )');
      }
      var tags = joinText(ps.tags, ' #');
      if (tags) {
        info.push('#' + tags);
      }
      var voice = joinText(info, "\n", true).replace(/(\n){2,}/gm, "\n\n");

      if (voice.length > maxlen) {
        throw new Error('too many characters to post (' + (voice.length - maxlen) + ' over)');
      }
      return voice;
    },

    post : function (ps) {
      return this.update(ps, this.createVoice(ps));
    },

    update : function (ps, voice) {
      var self = this;

      return self.getForm().addCallback(function(form) {
        delete form.commit;
        delete form['image_file[file]'];
        form.utf8 = '✓';
        form['voice[tweet]'] = voice;
        return ((ps.type === 'photo') ? self.download(ps) : succeed(null)).addCallback(function(file) {
          if (file) {
            form['image_file[file]'] = file;
          }
          return request(self.POST_URL, {
            sendContent : form,
            multipart   : true
          }).addCallback(function(res) {
            var error = res.responseText.extract(/window.parent.error_popup\('(.+)'\);/);
            if (error) {
              throw new Error(error);
            }
          });
        });
      });
    },

    download : function (ps) {
      return (
        ps.file ? succeed(ps.file)
          : download(ps.itemUrl).addCallback(function(entry) {
            return getFileFromEntry(entry);
          })
      );
    }
  });

  addAround(Models['Croudia'], 'createVoice', function(proceed, args, target, methodName) {
    var ps = update({}, args[0]);
    if (ps.body) {
      ps.body = ps.body.trimTag().replace(/\s+/g, ' ').trim();
    }
    try {
      return proceed([ps]);
    }
    catch (e) {
console.log(e.message);
      var over = e.message.extract(/post \((\d+) over\)/);
      if (!over) {
        throw e;
      }
      var len;
      if (ps.body) {
        len = ps.body.length;
        ps.body = ps.body.slice(0, -1 * over);
        over -= len;
      }
      if ((over > 0) && ps.description) {
        len = ps.description.length;
        ps.description = ps.description.slice(0, -1 * over);
        over -= len;
      }
      if (over > 0) {
        len = 0;
        if ((ps.type === 'photo') && ps.page) {
          len = ps.page.length;
          ps.page = ps.page.slice(0, -1 * over);
        }
        else if (ps.item) {
          len = ps.item.length;
          ps.item = ps.item.slice(0, -1 * over);
        }
        over -= len;
      }
      if (over > 0) {
        throw e;
      }
      return target[methodName](ps);
    }
  });
})();
