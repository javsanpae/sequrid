// Applies the saved theme before first paint to avoid a flash. Only the theme
// preference is ever stored; nothing about your documents is.
(function () {
  try {
    var t = localStorage.getItem('sequrid-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
