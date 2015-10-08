// Imports
var pageMod = require('sdk/page-mod');
 
// Create a page mod that injects our content script into every page
pageMod.PageMod({
    include: '*',
    contentScriptFile: [
        './js/libs/jquery-2.1.1.min.js', 
        './js/contentscript.js'
    ]
});