// Applies the saved theme and language before first paint to avoid a flash.
// Only these two preferences are ever stored; nothing about your documents is.
// The language logic mirrors detectLang() in src/lib/i18n/lang.ts.
(function () {
  var root = document.documentElement;
  var saved = null;
  try {
    var t = localStorage.getItem('sequrid-theme');
    if (t === 'light' || t === 'dark') root.dataset.theme = t;
    saved = localStorage.getItem('sequrid-language');
  } catch (e) {}
  var supported = ['en', 'es', 'fr', 'it'];
  var lang = supported.indexOf(saved) >= 0 ? saved : null;
  var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; !lang && i < prefs.length; i++) {
    var primary = String(prefs[i]).trim().toLowerCase().split(/[-_]/)[0];
    if (supported.indexOf(primary) >= 0) lang = primary;
  }
  root.lang = lang || 'en';
})();
