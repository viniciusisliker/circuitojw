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

  /** Usa o caminho do próprio script (ex: ../js/nav.js → ../) como base confiável. */
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
      return !SECTIONS.some((section) => path.includes("/" + section + "/"));
    }

    const section = itemPath.replace("/index.html", "").toLowerCase();
    return path.includes("/" + section + "/");
  }

  function renderNav(container) {
    const prefix = getRootPrefix();
    const brandPath = prefix + "index.html";
    const brandLabel = container.dataset.brand || "Circuito SP-111";

    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.innerHTML = `
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="${brandPath}">${brandLabel}</a>
        <ul class="site-nav__links"></ul>
      </div>
    `;

    const list = nav.querySelector(".site-nav__links");
    NAV_ITEMS.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = prefix + item.path;
      a.textContent = item.label;
      if (isActive(item.path)) a.classList.add("active");
      li.appendChild(a);
      list.appendChild(li);
    });

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
