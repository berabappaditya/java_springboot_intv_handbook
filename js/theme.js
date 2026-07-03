// =============================================================
// theme.js — Shared theme handling for ALL pages.
// Include early (in <head> or top of <body>) to avoid a flash
// of the wrong theme. Default theme is "dark".
// Any page with a #theme-toggle button gets toggling for free.
// =============================================================

(function () {
  const KEY = "theme";
  const root = document.documentElement;

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  }

  // Apply immediately at parse time (before first paint).
  // A ?theme=light|dark URL param overrides (and persists) the choice.
  const urlTheme = new URLSearchParams(location.search).get(KEY);
  apply(urlTheme === "light" || urlTheme === "dark"
    ? urlTheme
    : localStorage.getItem(KEY) || "dark");

  document.addEventListener("DOMContentLoaded", function () {
    // Re-apply so the toggle button (now in the DOM) gets its label.
    apply(localStorage.getItem(KEY) || "dark");
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    }
  });
})();
