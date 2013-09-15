// ==Taberareloo==
// {
//   "name"        : "NicoVideo Embedder for Google+"
// , "description" : "Convert a nicovideo link to an embedded video"
// , "include"     : ["background", "content"]
// , "match"       : ["https://plus.google.com/*"]
// , "version"     : "1.2.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/samples/userscript.googleplus.nicovideo.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
   TBRL.setRequestHandler('executeNicoVideoScript', function (req, sender, func) {
      var script = 'window.nicovideo_callback_$1 = function(player){player.write("nicovideo_$1");}';
      script = script.replace(/\$1/g, req.sequence);
      chrome.tabs.executeScript(sender.tab.id, {
        code : script
      }, function(res) {});

      request(req.url).addCallback(function(res) {
        chrome.tabs.executeScript(sender.tab.id, {
          code : res.responseText
        }, function(res) {});
      });
    });
    return;
  }

  var sequence = 0;

  var converter = {
    regex : /http:\/\/(?:www\.)?nicovideo\.jp\/watch\/([0-9a-zA-Z]+)/g,
    replacement : function(text, id) {
      var seq = sequence++;
      var url = 'http://ext.nicovideo.jp/thumb_watch/$1?w=400&h=300&cb=nicovideo_callback_$2';
      url = url.replace(/\$1/g, id);
      url = url.replace(/\$2/g, seq);

      setTimeout(function() {
        chrome.runtime.sendMessage(TBRL.id, {
          request  : "executeNicoVideoScript",
          sequence : seq,
          url      : url
        }, function(res) {});
      }, 0);

      var str = '<div style="background-color: rgba(0,0,0,0.9); margin: 0 -17px; padding: 0 17px; width:100%; text-align: center;"><div id="nicovideo_$1"></div></div>';
      str = str.replace(/\$1/g, seq);
      return str;
    }
  };

  function hasClass(el, name) {
    return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
  }

  function addClass(el, name) {
    if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
  }

  function convert() {
    var links = document.querySelectorAll('a.a-n.ot-anchor:not(.nveg_parsed)');
    for (var i = 0, len = links.length ; i < len ; i++) {
      var link = links[i];

      addClass(link, 'nveg_parsed');

      if (link.href.match(converter.regex)) {
        var box  = link.parentNode.parentNode;
        var div  = $N('div');
        div.innerHTML = link.href.replace(converter.regex, converter.replacement);
        if (box.nextSibling) {
          box.parentNode.insertBefore(div.firstChild, box.nextSibling);
        }
        else {
          box.parentNode.appendChild(div.firstChild);
        }
      }
    }
    setTimeout(convert, 500);
  }

  convert();
})();