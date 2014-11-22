// ==Taberareloo==
// {
//   "name"        : "paiza.IO Executor"
// , "description" : "Execute code by paiza.IO"
// , "include"     : ["background", "content", "popup"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.github.com/taberareloo/patches-for-taberareloo/master/others/menu.paiza.io.tbrl.js"
// }
// ==/Taberareloo==

(function (exports) {
  if (inContext('background')) {
    exports.modelPaizaIO = modelPaizaIO = {
      name      : 'paiza.IO Executor',
      ICON      : 'https://paiza.jp/favicon.ico',
      LINK      : 'https://paiza.io/',
      LOGIN_URL : 'https://paiza.io/',

      API_KEY   : "guest",

      URL_API_CREATE      : "http://api.paiza.io:80/runners/create",
      URL_API_GET_STATUS  : "http://api.paiza.io:80/runners/get_status",
      URL_API_GET_DETAILS : "http://api.paiza.io:80/runners/get_details",

      check : function (ps) {
        return (/quote/).test(ps.type);
      },

      post : function (ps) {
        var self = this;
        return this.execute(ps.page, ps.body, ps.description).then(function (res) {
          return self.get_details(res.id);
        });
      },

      execute : function (language, code, input) {
        return request(this.URL_API_CREATE, {
          method       : 'POST',
          responseType : 'json',
          queryString  : {
            api_key          : this.API_KEY,
            language         : language,
            source_code      : code,
            input            : input,
            longpoll         : true,
            longpoll_timeout : 10
          }
        }).then(function (res) {
          var json = res.response;
          if (json.error) {
            throw new Error(json.error);
          }
          return json;
        });
      },

      get_status : function (id) {
        return request(this.URL_API_GET_STATUS, {
          responseType : 'json',
          queryString  : {
            api_key : this.API_KEY,
            id      : id
          }
        }).then(function (res) {
          var json = res.response;
          return json.status;
        });
      },

      get_details : function (id) {
        return request(this.URL_API_GET_DETAILS, {
          responseType : 'json',
          queryString  : {
            api_key : this.API_KEY,
            id      : id
          }
        }).then(function (res) {
          var json = res.response;
          if (json.build_exit_code || (json.build_result && (json.build_result !== 'success'))) {
            throw new Error(json.build_stderr);
          }
          if (json.exit_code || (json.result !== 'success')) {
            throw new Error(json.stderr);
          }
          fileToDataURL(new Blob([json.stdout], {type:"text/plain"})).then(function (url) {
            url = url.replace('plain;base64', 'plain;charset=utf-8;base64');
            chrome.tabs.create({
              url    : url,
              active : true
            });
          });
        });
      }
    };

    var LANGUAGES = [
      { name : "C",            language : "c" },
      { name : "C++",          language : "cpp" },
      { name : "Objective-C",  language : "objective-c" },
      { name : "Java",         language : "java" },
      { name : "Scala",        language : "scala" },
      { name : "C#",           language : "csharp" },
      { name : "Go",           language : "go" },
      { name : "Haskell",      language : "haskell" },
      { name : "Erlang",       language : "erlanguage" },
      { name : "Perl",         language : "perl" },
      { name : "Python",       language : "python" },
      { name : "Python3",      language : "python3" },
      { name : "Ruby",         language : "ruby" },
      { name : "PHP",          language : "php" },
      { name : "Bash",         language : "bash" },
      { name : "R",            language : "r" },
      { name : "JavaScript",   language : "javascript" },
      { name : "CoffeeScript", language : "coffeescript" },
      { name : "VB",           language : "vb" },
      { name : "Cobol",        language : "cobol" },
      { name : "F#",           language : "fsharp" },
      { name : "D",            language : "d" },
      { name : "Clojure",      language : "clojure" },
      { name : "MySQL",        language : "mysql" }
    ];

    Menus._register({
      type     : 'separator',
      contexts : ['all']
    });
    Menus._register({
      title    : modelPaizaIO.name,
      contexts : ['all']
    });

    LANGUAGES.forEach(function (language) {
      Menus._register({
        title    : language.name,
        contexts : ['all'],
        onclick  : function (info, tab) {
          chrome.tabs.sendMessage(tab.id, {
            request  : 'paizaIOContextGetSelection'
          }, function (res) {
            TBRL.Popup.open(tab, {
              type    : 'quote',
              page    : language.language,
              pageUrl : info.pageUrl,
              item    : language.name,
              itemUrl : info.pageUrl,
              body    : res.selection.raw || '',
              https   : {
                pageUrl : [false, info.pageUrl],
                itemUrl : [false, info.pageUrl]
              },
              enabledPosters : [modelPaizaIO.name]
            });
          });
        }
      }, modelPaizaIO.name);
    });
    return;
  }

  if (inContext('content')) {
    TBRL.setRequestHandler('paizaIOContextGetSelection', function (req, sender, func) {
      func({
        selection : createFlavoredString(window.getSelection())
      });
    });
    return;
  }

  if (inContext('popup')) {
    var background = chrome.extension.getBackgroundPage();

    document.addEventListener('popupReady', function(ev) {
      var form = ev.detail;
      var poster = background.modelPaizaIO;

      if (!form.ps.enabledPosters || (form.ps.enabledPosters[0] !== poster.name)) {
        return;
      }

      var posters = form.posters;

      var nodes = posters.elmPanel.childNodes;
      for (var i = 0, len = nodes.length ; i < len ; i++) {
        var node = nodes[0];
        node.parentNode.removeChild(node);
      }

      var df = $DF();
      var img = $N('img', { 'src': poster.ICON, 'title': poster.name, 'class': 'poster' });
      df.appendChild(img);
      posters.elmPanel.appendChild(df);

      posters.enables[poster.name] = poster;
    });
    return;
  }
})(this);
