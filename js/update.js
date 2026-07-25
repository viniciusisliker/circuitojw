(function () {
  const STORAGE_KEY = "circuitojw-version";

  function getAssetPrefix() {
    const script = document.querySelector('script[src*="update.js"]');
    if (!script) return "./";

    const src = script.getAttribute("src") || "js/update.js";
    const prefix = src.replace(/js\/update\.js(\?.*)?$/, "");
    return prefix || "./";
  }

  function getPageVersion() {
    return document.querySelector('meta[name="site-version"]')?.content || null;
  }

  async function fetchLatestVersion() {
    const prefix = getAssetPrefix();
    const response = await fetch(`${prefix}version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;

    const data = await response.json();
    return typeof data.version === "string" ? data.version : null;
  }

  function storeVersion(version) {
    if (!version) return;
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch (_) {
      /* ignore */
    }
  }

  function hideBannerSlot() {
    const slot = document.getElementById("site-update-slot");
    if (!slot) return;
    slot.innerHTML = "";
    slot.hidden = true;
  }

  async function hardRefresh() {
    try {
      const latest = (await fetchLatestVersion()) || getPageVersion();
      storeVersion(latest);
      localStorage.setItem("circuitojw-reload-all", String(Date.now()));
    } catch (_) {
      storeVersion(getPageVersion());
    }

    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (_) {
        /* ignore */
      }
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("_refresh");
    url.searchParams.set("_refresh", String(Date.now()));
    window.location.replace(url.toString());
  }

  function cleanRefreshParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_refresh")) return;
    url.searchParams.delete("_refresh");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function syncVersionQuietly() {
    const pageVersion = getPageVersion();
    if (pageVersion) storeVersion(pageVersion);
  }

  function watchOtherTabs() {
    window.addEventListener("storage", (event) => {
      if (event.key === "circuitojw-reload-all" && event.newValue) {
        window.location.reload();
      }
    });
  }

  function init() {
    hideBannerSlot();

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-hard-refresh]")) {
        event.preventDefault();
        hardRefresh();
      }
    });

    watchOtherTabs();
    cleanRefreshParam();
    syncVersionQuietly();
  }

  window.CircuitUpdate = { hardRefresh };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
