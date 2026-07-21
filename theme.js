// Runs blocking in <head> so the stored theme applies before first paint.
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {
    /* localStorage unavailable → keep dark default */
  }
})();
