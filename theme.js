// Runs blocking in <head> so the stored theme applies before first paint.
(function () {
  document.documentElement.classList.replace("no-js", "js");

  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.dataset.theme = "light";
    }
  } catch (e) {
    /* localStorage unavailable → keep the safe document default */
  }
})();
