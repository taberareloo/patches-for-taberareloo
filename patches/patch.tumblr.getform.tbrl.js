// ==Taberareloo==
// {
//   "name"        : "Send to Twitter/Facebook from Tumblr"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Set 'Send to Twitter/Facebook' automatically"
// , "include"     : ["background", "content"]
// , "match"       : ["*://*/*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.tumblr.getform.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  function getShareOptions() {
    return request('http://www.tumblr.com/dashboard').addCallback(function(res) {
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
      var self = Models['Tumblr'];
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
    return;
  }

  addAround(Extractors['ReBlog'], 'getForm', function(proceed, args, target, methodName) {
    var self = Extractors['ReBlog'];
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
})();
