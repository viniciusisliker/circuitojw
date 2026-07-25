(function () {
  const STORAGE_KEY = "circuitojw-theme";

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function setTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {
      /* ignore */
    }
    updateToggles();
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  }

  function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  function updateToggles() {
    const theme = getTheme();
    const label = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
      btn.setAttribute("data-current-theme", theme);
    });
  }

  function refresh() {
    updateToggles();
  }

  function bindToggle(button) {
    if (!button || button.dataset.themeBound === "true") return;
    button.dataset.themeBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      toggleTheme();
    });
  }

  function init() {
    refresh();
  }

  window.CircuitTheme = { getTheme, setTheme, toggleTheme, refresh, bindToggle };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
