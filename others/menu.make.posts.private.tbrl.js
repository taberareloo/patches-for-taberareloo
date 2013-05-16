// ==Taberareloo==
// {
//   "name"        : "Make Posts Private Checkbox"
// , "description" : "Make posts private"
// , "include"     : ["background"]
// , "version"     : "1.0.2"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.make.posts.private.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var private = (localStorage.getItem('private') === 'true') || false;

  Menus._register({
    type     : 'separator',
    contexts : ['all']
  });
  Menus._register({
    type     : 'checkbox',
    title    : 'Option - Make Posts Private',
    checked  : private,
    contexts : ['all'],
    onclick  : function(info, tab) {
      private = info.checked;
      localStorage.setItem('private', private);
    }
  });

  Menus.create();

  addAround(TBRL.Service, 'post', function(proceed, args, target, methodName) {
    args[0].private = private;
    return proceed(args);
  });
})();