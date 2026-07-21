(function () {
  const NAV_ITEMS = [
    { label: "Tela Inicial", path: "index.html" },
    { label: "Visita do Viajante", path: "visita-do-viajante/index.html" },
    { label: "Programação da Reunião", path: "programacao-reuniao/index.html" },
    { label: "Itinerário", path: "itinerario/index.html" },
    { label: "Aviso de Visita", path: "aviso-visita/index.html" },
    { label: "Assembleias", path: "assembleias/index.html" },
    { label: "Reunião Pioneiros", path: "reuniao-pioneiros/index.html" },
    { label: "Escola de Pioneiros", path: "escola-pioneiros/index.html" },
    { label: "Desastres Naturais", path: "desastres-naturais/index.html" },
  ];

  const SECTIONS = NAV_ITEMS.filter((item) => item.path !== "index.html").map((item) =>
    item.path.replace("/index.html", "").toLowerCase()
  );

  function getRootPrefix() {
    const script = document.querySelector('script[src*="nav.js"]');
    if (!script) return "./";

    const src = script.getAttribute("src") || "js/nav.js";
    const prefix = src.replace(/js\/nav\.js(\?.*)?$/, "");
    return prefix || "./";
  }

  function isActive(itemPath) {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();

    if (itemPath === "index.html") {
      const onSection = SECTIONS.some((section) => {
        return path.includes("/" + section + "/") || path.endsWith("/" + section);
      });
      return !onSection;
    }

    const section = itemPath.replace("/index.html", "").toLowerCase();
    return path.includes("/" + section + "/") || path.endsWith("/" + section);
  }

  function closeMenu(nav) {
    nav.classList.remove("site-nav--open");
    const toggle = nav.querySelector(".site-nav__toggle");
    const backdrop = nav.querySelector(".site-nav__backdrop");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu de navegação");
    }
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("nav-open");
  }

  function openMenu(nav) {
    nav.classList.add("site-nav--open");
    const toggle = nav.querySelector(".site-nav__toggle");
    const backdrop = nav.querySelector(".site-nav__backdrop");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu de navegação");
    }
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("nav-open");
  }

  function setupMenu(nav) {
    const toggle = nav.querySelector(".site-nav__toggle");
    const backdrop = nav.querySelector(".site-nav__backdrop");
    const links = nav.querySelectorAll(".site-nav__links a");

    if (!toggle) return;

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("site-nav--open")) {
        closeMenu(nav);
      } else {
        openMenu(nav);
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => closeMenu(nav));
    }

    links.forEach((link) => {
      link.addEventListener("click", () => closeMenu(nav));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu(nav);
    });

    window.matchMedia("(min-width: 960px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu(nav);
    });
  }

  function renderNav(container) {
    const prefix = getRootPrefix();
    const brandPath = prefix + "index.html";
    const brandLabel = container.dataset.brand || "Circuito SP-111";

    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Navegação principal");
    nav.innerHTML = `
      <div class="site-nav__inner">
        <div class="site-nav__bar">
          <a class="site-nav__brand" href="${brandPath}">
            <span class="site-nav__brand-mark">SP-111</span>
            <span class="site-nav__brand-text">${brandLabel}</span>
          </a>
          <button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav-menu" aria-label="Abrir menu de navegação">
            <span class="site-nav__toggle-bar"></span>
            <span class="site-nav__toggle-bar"></span>
            <span class="site-nav__toggle-bar"></span>
          </button>
        </div>
        <div class="site-nav__panel" id="site-nav-menu">
          <ul class="site-nav__links"></ul>
        </div>
      </div>
      <div class="site-nav__backdrop" hidden></div>
    `;

    const list = nav.querySelector(".site-nav__links");
    NAV_ITEMS.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = prefix + item.path;
      a.textContent = item.label;
      if (isActive(item.path)) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    setupMenu(nav);
    container.replaceWith(nav);
  }

  function init() {
    const placeholder = document.getElementById("site-nav");
    if (placeholder) renderNav(placeholder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
