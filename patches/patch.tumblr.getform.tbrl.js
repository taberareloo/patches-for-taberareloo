// ==Taberareloo==
// {
//   "name"        : "Send to Twitter/Facebook from Tumblr"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Set 'Send to Twitter/Facebook' automatically"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.tumblr.getform.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  function getShareOptions(template) {
    return (
      template ? succeed({responseText : template}) : request('http://www.tumblr.com/dashboard')
    ).addCallback(function(res) {
      var html = res.responseText.replace(/\s+/g, ' ');
      var selectbox = html.extract(/\{\{else\}\} (<div id="tumblelog_choices".*<\/ul> <\/div> <\/div> <\/div>) \{\{\/if\}\}/);
      var doc = createHTML(selectbox);
      var options = {};
      $X('//li/div', doc).forEach(function(div) {
        var id          = div.getAttribute('data-option-value');
        var twitter     = div.getAttribute('data-twitter') === 'true';
        var twitter_on  = div.getAttribute('data-twitter-on') === 'true';
        var facebook    = div.getAttribute('data-facebook') === 'true';
        var facebook_on = div.getAttribute('data-facebook-on') === 'true';
        options[id] = {
          twitter  : twitter && twitter_on,
          facebook : facebook && facebook_on
        };
      });
      return options;
    });
  }

  if (TBRL.ID) { // Is it in the background context?
    addAround(Models['Tumblr'], 'getForm', function(proceed, args, target, methodName) {
      return proceed(args).addCallback(function(form) {
        return getShareOptions().addCallback(function(options) {
          form = update(form, {
            send_to_twitter : options[form.channel_id].twitter ? 'on' : '',
            send_to_fbog    : options[form.channel_id].facebook ? 'on' : ''
          });
          return form;
        });
      });
    });
    addAround(Models['Tumblr'], 'favor', function(proceed, args, target, methodName) {
      return getShareOptions().addCallback(function(options) {
        var ps   = args[0];
        var form = ps.favorite.form;
        var that = target;

        that.trimReblogInfo(form);

        return Tumblr[ps.type.capitalize()].convertToForm({
          description : ps.description
        }).addCallback(function(res) {
          items(res).forEach(function(item) {
            var name = item[0], value = item[1];
            if (!value) {
              return;
            }
            if (form[name]) {
              form[name] += '\n\n' + value;
            }
            else {
              form[name] = value;
            }
          });
          that.appendTags(form, ps);

          form = update(form, {
            send_to_twitter : options[form.channel_id].twitter ? 'on' : '',
            send_to_fbog    : options[form.channel_id].facebook ? 'on' : ''
          });

          return that.postForm(function(){
            return request(Tumblr.TUMBLR_URL + 'svc/post/update', {
              headers: {'Content-Type': 'application/json'},
              sendContent: JSON.stringify(form)
            });
          });
        });
      });
    });
    return;
  }

  addAround(Extractors['ReBlog'], 'getForm', function(proceed, args, target, methodName) {
    var ctx = args[0];
    var template = $X('id("base_template")')[0];
    if (template) {
      template = template.textContent;
    }
    return proceed(args).addCallback(function(form) {
      return getShareOptions(template).addCallback(function(options) {
        form = update(form, {
          send_to_twitter : options[form.channel_id].twitter ? 'on' : '',
          send_to_fbog    : options[form.channel_id].facebook ? 'on' : ''
        });
        return form;
      });
    });
  });

  update(Extractors['ReBlog - Dashboard'], {
    extract : function(ctx) {
      var li = $X('./ancestor-or-self::li[starts-with(normalize-space(@class), "post")]', ctx.target)[0];

      ctx.title      = $X('.//a[@class="post_avatar"]/@title', li)[0];
      ctx.href       = $X('.//a[@class="permalink"]/@href', li)[0];
      ctx.form_key   = $X('.//input[@name="form_key"]/@value', li)[0];
      ctx.reblog_id  = li.getAttribute('data-post-id');
      ctx.reblog_key = li.getAttribute('data-reblog-key');
      ctx.post_type  = li.getAttribute('data-type');

      var that = Extractors['ReBlog'];
      return that.getFormKeyAndChannelId(ctx).addCallback(function() {
        return that.extractByEndpoint(ctx, that.TUMBLR_URL + 'reblog/' + ctx.reblog_id + '/' + ctx.reblog_key);
      });
    }
  });
})();
