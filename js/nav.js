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

  function getRootPrefix() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    const file = parts[parts.length - 1] || "";
    const isFile = file.includes(".");
    const depth = isFile ? parts.length - 1 : parts.length;
    return depth > 0 ? "../".repeat(depth) : "./";
  }

  function resolve(path, prefix) {
    const anchor = document.createElement("a");
    anchor.href = prefix + path;
    return anchor.pathname.split("/").pop() === path.split("/").pop()
      ? anchor.href
      : prefix + path;
  }

  function isActive(itemPath) {
    const current = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const section = itemPath.replace("/index.html", "").replace("index.html", "").toLowerCase();
    if (section === "" || section === ".") {
      return current.endsWith("/") || /\/index\.html$/i.test(current) && !current.includes("/", current.lastIndexOf("/") - 1);
    }
    return current.includes("/" + section + "/") || current.includes("/" + section + ".");
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

  document.addEventListener("DOMContentLoaded", () => {
    const placeholder = document.getElementById("site-nav");
    if (placeholder) renderNav(placeholder);
  });
})();
