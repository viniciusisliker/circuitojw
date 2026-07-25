(function () {
  const STORAGE_KEY = "circuitojw-version";
  const DISMISS_KEY = "circuitojw-update-dismissed";
  const RELOAD_ALL_KEY = "circuitojw-reload-all";
  let pendingVersion = null;
  let bannerVisible = false;

  function getAssetPrefix() {
    const script = document.querySelector('script[src*="update.js"]');
    if (!script) return "./";

    const src = script.getAttribute("src") || "js/update.js";
    const prefix = src.replace(/js\/update\.js(\?.*)?$/, "");
    return prefix || "./";
  }

  function getStoredVersion() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function storeVersion(version) {
    if (!version) return;
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch (_) {
      /* ignore */
    }
  }

  function getDismissedVersion() {
    try {
      return localStorage.getItem(DISMISS_KEY);
    } catch (_) {
      return null;
    }
  }

  function dismissForVersion(version) {
    if (!version) {
      dismissBanner();
      return;
    }
    try {
      localStorage.setItem(DISMISS_KEY, version);
    } catch (_) {
      /* ignore */
    }
    dismissBanner();
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

  function mountSlot() {
    let slot = document.getElementById("site-update-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.id = "site-update-slot";
      slot.className = "site-update-slot";
      const nav = document.querySelector(".site-nav");
      if (nav?.parentNode) {
        nav.parentNode.insertBefore(slot, nav.nextSibling);
      } else {
        document.body.insertBefore(slot, document.body.firstChild);
      }
    }
    return slot;
  }

  function renderBanner() {
    const slot = mountSlot();
    if (!bannerVisible) {
      slot.innerHTML = "";
      slot.hidden = true;
      return;
    }

    slot.hidden = false;
    slot.innerHTML = `
      <div class="site-update" role="status" aria-live="polite">
        <div class="site-update__card">
          <div class="site-update__text">
            <strong>Atualização disponível</strong>
            <span>Recarregue para usar a versão mais nova do site.</span>
          </div>
          <div class="site-update__actions">
            <button type="button" class="site-update__primary" data-update-apply>Atualizar agora</button>
            <button type="button" class="site-update__ghost" data-update-later>Depois</button>
          </div>
        </div>
      </div>`;
  }

  function showBanner(version) {
    pendingVersion = version;
    bannerVisible = true;
    renderBanner();
  }

  function dismissBanner() {
    bannerVisible = false;
    renderBanner();
  }

  async function hardRefresh() {
    const latest = pendingVersion || (await fetchLatestVersion()) || getPageVersion();
    if (latest) {
      storeVersion(latest);
      try {
        localStorage.removeItem(DISMISS_KEY);
        localStorage.setItem(RELOAD_ALL_KEY, String(Date.now()));
      } catch (_) {
        /* ignore */
      }
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

  async function checkForUpdate() {
    const latest = await fetchLatestVersion();
    if (!latest) return false;

    const stored = getStoredVersion();
    const pageVersion = getPageVersion();

    if (!stored) {
      storeVersion(latest);
      return false;
    }

    if (pageVersion === latest) {
      storeVersion(latest);
      dismissBanner();
      return false;
    }

    if (latest === stored && pageVersion && pageVersion !== latest) {
      window.location.reload();
      return false;
    }

    if (latest !== stored) {
      if (getDismissedVersion() === latest) return false;
      showBanner(latest);
      return true;
    }

    return false;
  }

  function cleanRefreshParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_refresh")) return;
    url.searchParams.delete("_refresh");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function watchOtherTabs() {
    window.addEventListener("storage", (event) => {
      if (event.key === RELOAD_ALL_KEY && event.newValue) {
        window.location.reload();
        return;
      }

      if (event.key === STORAGE_KEY && event.newValue) {
        const pageVersion = getPageVersion();
        if (pageVersion && pageVersion !== event.newValue) {
          window.location.reload();
          return;
        }
        dismissBanner();
      }

      if (event.key === DISMISS_KEY) {
        dismissBanner();
      }
    });
  }

  function init() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-update-apply]") || event.target.closest("[data-hard-refresh]")) {
        event.preventDefault();
        hardRefresh();
        return;
      }

      if (event.target.closest("[data-update-later]")) {
        dismissForVersion(pendingVersion || getStoredVersion());
      }
    });

    watchOtherTabs();
    cleanRefreshParam();
    checkForUpdate().catch(() => {});
  }

  window.CircuitUpdate = {
    checkForUpdate,
    hardRefresh,
    dismissBanner,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
