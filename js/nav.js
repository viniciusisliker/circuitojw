(function () {
  const NAV_STRUCTURE = [
    { type: "link", label: "Início", path: "index.html" },
    {
      type: "group",
      label: "Visita",
      children: [
        { label: "Visita do Viajante", path: "visita-do-viajante/index.html" },
        { label: "Programação da Reunião", path: "programacao-reuniao/index.html" },
        { label: "Itinerário", path: "itinerario/index.html" },
        { label: "Aviso de Visita", path: "aviso-visita/index.html" },
      ],
    },
    { type: "link", label: "Assembleias", path: "assembleias/index.html" },
    {
      type: "group",
      label: "Pioneiros",
      children: [
        { label: "Reunião Anual", path: "reuniao-pioneiros/index.html" },
        { label: "Escola de Pioneiros", path: "escola-pioneiros/index.html" },
      ],
    },
    { type: "link", label: "Desastres", path: "desastres-naturais/index.html" },
  ];

  const SECTIONS = NAV_STRUCTURE.flatMap((item) => {
    if (item.type === "link" && item.path !== "index.html") {
      return [item.path.replace("/index.html", "").toLowerCase()];
    }
    if (item.type === "group") {
      return item.children.map((child) => child.path.replace("/index.html", "").toLowerCase());
    }
    return [];
  });

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

  function isGroupActive(children) {
    return children.some((child) => isActive(child.path));
  }

  function closeAllDropdowns(nav, except) {
    nav.querySelectorAll(".site-nav__item--group.is-open").forEach((item) => {
      if (item !== except) {
        item.classList.remove("is-open");
        const btn = item.querySelector(".site-nav__group-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
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
    closeAllDropdowns(nav);
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

    if (window.matchMedia("(max-width: 959px)").matches) {
      nav.querySelectorAll(".site-nav__item--group.has-active").forEach((item) => {
        item.classList.add("is-open");
        const btn = item.querySelector(".site-nav__group-btn");
        if (btn) btn.setAttribute("aria-expanded", "true");
      });
    }
  }

  function createLink(prefix, item) {
    const a = document.createElement("a");
    a.href = prefix + item.path;
    a.textContent = item.label;
    a.className = "site-nav__link";
    if (isActive(item.path)) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
    return a;
  }

  function createGroup(prefix, group, index) {
    const li = document.createElement("li");
    li.className = "site-nav__item site-nav__item--group";
    if (isGroupActive(group.children)) li.classList.add("has-active");

    const menuId = "site-nav-menu-" + index;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-nav__group-btn";
    btn.textContent = group.label;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-controls", menuId);

    const dropdown = document.createElement("ul");
    dropdown.className = "site-nav__dropdown";
    dropdown.id = menuId;

    group.children.forEach((child) => {
      const subLi = document.createElement("li");
      const a = createLink(prefix, child);
      a.classList.add("site-nav__sublink");
      subLi.appendChild(a);
      dropdown.appendChild(subLi);
    });

    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = li.classList.contains("is-open");
      closeAllDropdowns(li.closest(".site-nav"), isOpen ? null : li);
      li.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });

    li.appendChild(btn);
    li.appendChild(dropdown);
    return li;
  }

  function setupMenu(nav) {
    const toggle = nav.querySelector(".site-nav__toggle");
    const backdrop = nav.querySelector(".site-nav__backdrop");

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (nav.classList.contains("site-nav--open")) {
          closeMenu(nav);
        } else {
          openMenu(nav);
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => closeMenu(nav));
    }

    nav.querySelectorAll(".site-nav__link, .site-nav__sublink").forEach((link) => {
      link.addEventListener("click", () => closeMenu(nav));
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) closeAllDropdowns(nav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllDropdowns(nav);
        closeMenu(nav);
      }
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

    NAV_STRUCTURE.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "site-nav__item";

      if (item.type === "link") {
        li.appendChild(createLink(prefix, item));
      } else {
        list.appendChild(createGroup(prefix, item, index));
        return;
      }

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
