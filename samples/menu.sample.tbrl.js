// ==Taberareloo==
// {
//   "name"        : "Sample Patch for Context Menu"
// , "description" : "Sample patch for context menu"
// , "include"     : ["background"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/samples/menu.sample.tbrl.js"

// }
// ==/Taberareloo==

(function() {
  Menus._register({
    title: '(ﾟ∀ﾟ)ｷﾀｺﾚ!!',
    contexts: ['all'],
    onclick: function(info, tab) {
      alert('(ﾟ∀ﾟ)ｷﾀｺﾚ!!');
    }
  }, null, 'Taberareloo', true);

  Menus.create({
    title: 'Taberareloo Share ...',
    contexts: ['all']
  });
})();