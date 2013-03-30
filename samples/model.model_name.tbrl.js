// ==Taberareloo==
// {
//   "name"        : "Sample Patch"
// , "description" : "Sample patch for new model with minimal metadata"
// , "version"     : "1.0.0"
// , "include"     : ["background"]
// }
// ==/Taberareloo==

(function() {
  Models.register({
    name       : 'Sample Model',
    ICON       : 'http://yungsang.com/favicon.ico',
    LINK       : 'http://yungsang.com/',
    LOGIN_URL  : 'http://yungsang.com/',

    check : function(ps) {
      return /regular|photo|quote|link|video/.test(ps.type);
    },

    post : function(ps) {
      return true;
    }
  });
})();