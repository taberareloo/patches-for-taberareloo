// ==Taberareloo==
// {
//   "name"        : "iview for Taberareloo"
// , "description" : "iview for Taberareloo"
// , "include"     : ["background", "content"]
// , "match"       : ["http://yungsang.github.io/patches-for-taberareloo/iview.html"]
// , "version"     : "0.2.3"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/iview.for.taberareloo.tbrl.js"
// }
// ==/Taberareloo==

// Forked from https://github.com/ku/iview-for-tombloo
//
// Copyright (c) KUMAGAI Kentaro ku0522a*gmail.com
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

(function() {
  var IVIEW_URL    = 'http://yungsang.github.io/patches-for-taberareloo/iview.html';
  var SITEINFO_URL = 'https://raw.github.com/YungSang/wedata/master/databases/iview/items_all.json';

  if (inContext('background')) {
    Menus._register({
      type     : 'separator',
      contexts : ['all']
    });
    Menus._register({
      title    : 'iview',
      contexts : ['all'],
      onclick: function(info, tab) {
        chrome.windows.create({
          url : IVIEW_URL
        }, function (win) {
        });
      }
    });
    Menus.create();

    TBRL.setRequestHandler('loadSiteInfo', function (req, sender, func) {
      request(req.url).addCallback( function(res) {
        Sandbox.evalJSON(res.responseText).addCallback(function (json) {
          func(json);
        });
      });
    });
    return;
  }

  var requestopts = {
    //charset: 'utf-8'
    responseType: 'document'
  };

  var requestBroker = {
    queue: [],
    init: function () {
      this.queue = [];
      var self = this;
      var brokertimer = window.setInterval( function () {
        if ( iviewLoader.shouldPrefetch() ) {
          var args = self.queue.shift();

          if ( args ) {
            var u = args[0];
            var opts = args[1];
            var f = args[2];
            request(u, opts).addCallback( f ).addErrback( function (e) {
console.log(e);
            } );
          }
        }
      }, 500 );
      return brokertimer;
    },
    add: function (u, opts, callback) {
      this.queue.push(arguments);
    }
  };

  var iviewLoader = {
    siteinfo: null,

    PREFETCHSIZE: 20,

    images: [],
    currentPage: null,
    eventListener: null,
    lastPageDoc: null,
    lastPageURI: null,
    run: function (siteinfo, eventListener) {
      this.siteinfo = siteinfo;
      this.currentPage = null;
      this.lastPageURI = null;
      this.lastPageDoc = null;
      this.images = [];
      
      this.requestNextPage();
      this.eventListener = eventListener;
    },

    requestingNextPage: false,
    largestRequestedImageIndex: -1,
    shouldPrefetch: function () {
      var b = ( this.images.length - this.largestRequestedImageIndex <= this.PREFETCHSIZE ) ;
      return b;
    },
    getAt: function (n) {
      if ( n > this.largestRequestedImageIndex ) {
        this.largestRequestedImageIndex = n;
      }
      if ( this.shouldPrefetch() ) {
        if ( !this.requestingNextPage ) {
          this.requestNextPage();
        }
      }

      return this.images[n];
    },
    requestNextPage: function () {

      if ( this.currentPage ) {
        if ( !this.siteinfo.nextLink ) {
          return;
        }
        var link = $X(this.siteinfo.nextLink, this.lastPageDoc).shift();
        var nextLink = valueOfNode(link);
        this.currentPage = url.resolve(this.lastPageURI, nextLink);
      } else {
        this.currentPage = this.siteinfo.url;
      }

      var nextPage = this.currentPage;

      this.requestingNextPage = true;
      var self = this;
      var d = requestBroker.add(nextPage, requestopts, function(res) {
        self.requestingNextPage = false;
        self.lastPageURI = nextPage;
        self.onPageLoad.apply(self, arguments);
      } );
    },
    onSubrequestLoad: function (res) {
      var siteinfo = this.siteinfo.subRequest;
      var doc = res.response;
      var base = doc.URL;
      this.parseResponse(doc, siteinfo, base, {permalink: base});
    },
    onPageLoad: function (res) {
      var siteinfo = this.siteinfo;

      var doc = this.lastPageDoc = res.response;

      var base = this.lastPageURI;
      this.parseResponse(doc, siteinfo, base);
    },
    parseResponse: function (doc, siteinfo, baseURI, hashTemplate) {
      var paragraphes = $X( siteinfo.paragraph, doc );
      var self = this;
      paragraphes.map ( function (paragraph, index) {
        if ( siteinfo.subRequest && siteinfo.subRequest.paragraph ) {
          var img = self.parseParagraph(paragraph, siteinfo, baseURI);

          var subpage = img.permalink;

          var d = requestBroker.add(subpage, requestopts, function(res) {
            self.onSubrequestLoad.apply(self, arguments);
          } );

        } else {
          if ( siteinfo.subParagraph && siteinfo.subParagraph.paragraph ) {
            var d = self.parseParagraph(paragraph, siteinfo, baseURI);

            if ( siteinfo.subParagraph.cdata ) {
              try {
                var cdata = $X( siteinfo.subParagraph.cdata, paragraph ).shift().textContent;
                cdata = '<html><body>' + cdata + '</body></html>';
                paragraph = createHTML(cdata);
              }catch(e){
                console.log(e);
              }
            }

            var subparagraphes = $X(siteinfo.subParagraph.paragraph, paragraph);
            subparagraphes.map ( function ( subparagraph ) {
              var img = self.parseParagraph(subparagraph, siteinfo.subParagraph, baseURI);
              img = update(img, d);
              img = update(img, hashTemplate);
              self.addToImageList(img);
            } );
          } else {
            var img = self.parseParagraph(paragraph, siteinfo, baseURI);
            img = update(img, hashTemplate);
            self.addToImageList(img);
          }
        }
      } );
      
      var obs = this.eventListener;
      obs && obs.onPageLoad.apply(obs);
    },
    addToImageList: function (img) {
      if ( img.imageSource && img.permalink ) {
        (new window.Image()).src = img.src();
        this.images.push(img);
      }
    },
    parseParagraph: function (paragraph, siteinfo, baseURI) {
      var image = {
        src: function () {
          return this.imageSourceForReblog || this.imageSource;
        }
      };
      
      for ( var k in siteinfo ) {
        var xpath = siteinfo[k];

        if ( k.match(/^url|paragraph|nextLink|cdata$/) )
          continue;

        if ( !xpath || typeof xpath == 'object' ) {
          continue;
        }

        var v;
        var rs = $X(xpath, paragraph);
        if (typeof rs == 'string') {
          v = rs;
          if ( k == 'caption' ) {
            v =  v.textContent.replace(/(^\s*)|(\s*$)/g, '');
          } else {
            v = url.resolve(baseURI, v);
          }
        } else {
          var node = rs.shift();
          if ( k == 'caption' ) {
            v =  node.textContent.replace(/(^\s*)|(\s*$)/g, '');
          } else {
            if ( node === null )
              console.log(k, "null!");
            v = valueOfNode(node);
            v = url.resolve(baseURI, v);
          }
        }

        image[k] = v;
      }
      return image;
    }
  };

  var iview = { 
    position: 0,
    doc: null,
    iviewSiteinfoURL: SITEINFO_URL,
    siteinfo: null,
    init: function (doc) {
      this.doc = doc;

      this.siteinfo = null;
      this.position = 0;

      doc.addEventListener("onIviewFxNext", function () {
        //iviewLoader.onImageSourceSelected.apply(iview, arguments);
      }, false );
      doc.addEventListener("onJSONPLoad", function () {
        iview.onImageSourceSelected.apply(iview, arguments);
      }, false );
      
      doc.addEventListener("keypress", function (ev) {
        var c = String.fromCharCode(ev.charCode).toLowerCase();

        if ( ev.currentTarget != doc )
          return;

        if ( ev.ctrlKey || ev.altKey || ev.shiftKey || ev.metaKey )
          return;

        if ( c == 't' ) {
          iview.share();
        } else if ( c == 'j' ) {
          iview.goRelative(1);
        } else if ( c == 'k' ) {
          iview.goRelative(-1);
//        } else if ( c == 'p' ) {
//          iview.launchPicLens();
        }

      }, false );
    },
    share: function () {
      var self = this;

      var i = iviewLoader.getAt(this.position);

      var title = i.caption || i.permalink;

      var ps = {
        type:   'photo',
        page:   title,
        pageUrl:  i.permalink,
        item:   title,
        itemUrl:  i.src()
      };

      chrome.runtime.sendMessage(TBRL.id, {
        request : 'share',
        show    : false,
        content : checkHttps(ps)
      }, function () { });

    },
    showRebloggingBox: function (i) {
      var r = this.doc.getElementById('reblogging');
      if ( i.reblogging ) {
        var img = this.doc.getElementById('imageElement');
        var box = this.doc.getElementById('imagebox');

        var margin = 10;
        r.style.display = 'block';
        r.style.top  = (img.offsetHeight - img.height + r.clientHeight + margin ) + "px"; 
        r.style.left = img.offsetLeft + margin + "px"; 
        r.style.opacity = 0.75;

      } else {
        var n = 0;
        var timerid = window.setInterval( function () {
          if ( n++ < 10 ) {
            r.style.opacity = 1 - (0.1 * n);
          } else {
            window.clearInterval(timerid);
            r.style.opacity = 1;
            r.style.display = 'none';
          }
        }, 50);
      }
    },
    goRelative: function (diff) {
      var imageInfo = iviewLoader.getAt(this.position + diff );
      if ( imageInfo ) {
        var i = iviewLoader.getAt(this.position);
        if ( i.reblogging ) {
          var r = this.doc.getElementById('reblogging');
          r.style.display = 'none';
        }

        this.position += diff;

        this.show();
      }
    },
    constructTree: function (flatSiteinfo) {
      var siteinfo = {};

      for ( var k in flatSiteinfo ) {
        var pathes = k.split(/\./);
        var leaf = pathes.pop();
        var hash = pathes.reduce( function(stash, name) {
          return (stash[name] || (stash[name] = {}));
        }, siteinfo);
        hash[leaf] = flatSiteinfo[k];
      };
      return siteinfo;
    },

    pageShowing: -1,
    show: function () {
      if ( this.pageShowing == this.position )
        return;

      var imageInfo = iviewLoader.getAt(this.position);
      if ( !imageInfo ) {
        return;
      }

      this.doc.getElementById('imageno').innerHTML = (this.position + 1) + "/" + iviewLoader.images.length;
      this.showRebloggingBox(imageInfo);

      //this.removeAllChildren();
      var box = this.doc.getElementById('imagebox');
      box.style.display = 'block';

      // we need to assign null value once
      // to avoid that old image is shown until new image is loaded.
      var img = this.doc.getElementById('imageElement');
      img.setAttribute('src', null);

      window.setTimeout( function () {
        img.setAttribute('src', imageInfo.src());
      }, 20);

      var a = this.doc.getElementById('caption');
      a.setAttribute('href', imageInfo.permalink);
      a.innerHTML = imageInfo.caption;
    },
    removeAllChildren: function (e) {
      while ( e.firstChild ) {
        e.removeChild( e.firstChild);
      }
    },
    onImageSourceSelected: function (ev) {
  /*
      this.glasscaseDiv.style.opacity = 1;
      this.glasscaseDiv.style.position = 'fixed';
      this.glasscaseDiv.style.top = 0;
      this.glasscaseDiv.style.bottom = 0;
  */

      this.doc.getElementById('footer').style.display = 'block';

      var key = (ev.detail);
      var siteinfo = this.constructTree(this.siteinfo[key].data);

      this.doc.getElementById('sourcename').innerHTML =
        '<a href="' + siteinfo.url + '">' + this.siteinfo[key].name + '</a>';

      //this.removeAllChildren();
      //
      this.doc.getElementById('imagesources').style.display = 'none';

      iviewLoader.run(siteinfo, this);
    },
    launchPicLens : function() {
      var items = [];
      iviewLoader.images.forEach(function(photo){
        var imegeUri = photo.src();
        items.push('<item>' +
            '<title>' + photo.caption + '</title>' +
            '<link>' + photo.permalink + '</link>' + 
            '<media:thumbnail url="' + imegeUri + '" />' +
            '<media:content url="' + imegeUri + '" />' +
          '</item>'
        );
      });
        
      var file = getTempDir('photos.rss');
      putContents(file, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss"><channel>' +
          items.join('') +
         '</channel></rss>');
        
      this.doc.location = 'javascript:piclens = new PicLensContext();piclens.launch("' + createURI(file).asciiSpec + '", "", "")';
    },
    /*
    setStyle: function (doc) {
      var css = doc.createElement('style');
      css.innerHTML =
        ' a {' + 
        '   background-color: black !important;' +
        '   color: white !important;' +
        '   font-size: small !important;' +
        ' }' ;

      doc.body.appendChild(css);
    },
    */
    showLoading: function (doc, show) {
      if (show) {
        var d = doc.createElement("div");

        d.style.position = "absolute";
        d.style.fontSize = "30px";
        d.style.background = "black";
        d.style.color = "white";
        d.style.MozBorderRadius = "0.2em";
        d.style.padding = "0.2em";
        d.style.opacity = 0.85;
        d.style.marginLeft = "auto";
        d.style.marginRight = "auto";
        d.style.margin =   "0px auto";
        d.style.right = d.style.top = "0.2em";
        d.style.textAlign = "center"
        d.innerHTML = "Loading Image Sources...";

        doc.body.appendChild(d);

        this.loadingDiv = d;
      } else {
        this.loadingDiv.parentNode.removeChild( this.loadingDiv );
        this.loadingDiv = null;
      }
    },
    glasscaseDiv: null,
    glasscase: function () {
      doc = this.doc;
      var outerbox = this.outerbox = doc.createElement("div");

      outerbox.style.position = "absolute";
      outerbox.style.left = 0;
      outerbox.style.top = 0;
      outerbox.style.right = 0;
      outerbox.style.height = 0;

      var d = this.innerbox = doc.createElement("div");

      d.style.left = 0;
      d.style.right = 0;

      //d.style.position = "absolute";
      d.style.fontSize = "30px";
      d.style.background = "black";
      d.style.color = "white";
      //d.style.MozBorderRadius = "0.2em";
      d.style.padding = "0.2em";
      d.style.opacity = 0.95;
      d.style.marginLeft = "auto";
      d.style.marginRight = "auto";
      d.style.margin =   "0px auto";
      //d.style.right = d.style.top = "0";
      d.style.zIndex = 0x7ffffff;

      outerbox.appendChild(d);
      doc.body.appendChild(outerbox);

      return this.glasscaseDiv = d;
    },

    onPageLoad: function () {
      this.show();
    },
    loadJson: function () {
      var self = this;
      //this.setStyle(this.doc);
      this.showLoading(this.doc, true);

      chrome.runtime.sendMessage(TBRL.id, {
        request : "loadSiteInfo",
        url     : this.iviewSiteinfoURL
      }, function(json) {
        self.siteinfo = json;

        self.showLoading(self.doc, false);
        //var glasscase = self.glasscase();
        
        //
        // MochiKit.keys not found in command script scope.
        //
        self.doc.getElementById('imagesources').style.display = 'block';
        var ul = self.doc.getElementById('imagesourcelist');

        var li = [];
        for ( var k in json ) {
          var definitions = json[k];

          // I dont know why but last one is a function not siteinfo.
          // need to check it.
          if ( ! definitions.data )
            continue;
          
          // not supported yet.
          //if ( definitions.data['subRequest.paragraph'] ) {
          //  continue; 
          //}

          //if ( definitions.data.paragraph.match(/x:/) ) {
          //  continue;
          //}

          var jscode = "javascript:void((function(){" +
            "e=new CustomEvent('onJSONPLoad',{detail:"+k+"});" +
            "document.dispatchEvent(e);" +
          "})());";

          li.push( '<li><a href="' + jscode + '">' + definitions.name + '</a></li>' );
        }
        ul.innerHTML = li.join("\n");
      });
    }
  };

  var brokerTimer = requestBroker.init();
  document.addEventListener( 'unload', function () {
    window.clearInterval(brokerTimer);
  }, false);
  iview.init(document);
  iview.loadJson();

  function valueOfNode (node) {
    var doc = node.ownerDocument;
    {
      if ( node.nodeType == node.ELEMENT_NODE ) {
        if ( node.tagName.match( /^(a|link)$/i ) ) {
          var u = node.getAttribute('href');
          return u;
        } else if ( node.tagName.match( /img/i ) ) {
          var u = node.getAttribute('src');
          return u;
        } else {
          return node.textContent.replace(/(^\s*)|(\s*$)/g, '');
        }
      } else if ( node.nodeType == node.ATTRIBUTE_NODE ) {
        var u = node.nodeValue;
        return u;
      } else if (node.nodeType == node.TEXT_NODE ) {
        return node.nodeValue;
      }
    }
  }

})();
