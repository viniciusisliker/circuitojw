(function () {
  const STORAGE_KEY = "circuitojw-version";
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
    try {
      const latest = pendingVersion || (await fetchLatestVersion()) || getPageVersion();
      storeVersion(latest);
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

  async function checkForUpdate() {
    const latest = await fetchLatestVersion();
    if (!latest) return false;

    const stored = getStoredVersion();
    const pageVersion = getPageVersion();

    if (!stored) {
      storeVersion(latest);
      return false;
    }

    if (latest !== stored || (pageVersion && pageVersion !== stored)) {
      showBanner(latest);
      return true;
    }

    storeVersion(latest);
    return false;
  }

  function cleanRefreshParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_refresh")) return;
    url.searchParams.delete("_refresh");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function init() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-update-apply]") || event.target.closest("[data-hard-refresh]")) {
        event.preventDefault();
        hardRefresh();
        return;
      }

      if (event.target.closest("[data-update-later]")) {
        dismissBanner();
      }
    });

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
