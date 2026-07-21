(function () {
  const SECTIONS = {
    "programacao-reuniao": {
      items: [
        { label: "Página inicial", path: "index.html" },
        { label: "Setembro à Fevereiro", path: "setembro-fevereiro.html" },
        { label: "Março à Agosto", path: "marco-agosto.html" },
      ],
    },
    itinerario: {
      items: [
        { label: "Página inicial", path: "index.html" },
        { label: "1º Semestre (set/fev)", path: "setembro-fevereiro.html" },
        { label: "2º Semestre (mar/ago)", path: "marco-agosto.html" },
      ],
    },
  };

  function getPrefix() {
    const script = document.querySelector('script[src*="subnav.js"]');
    if (!script) return "./";

    const src = script.getAttribute("src") || "js/subnav.js";
    const prefix = src.replace(/js\/subnav\.js(\?.*)?$/, "");
    return prefix || "./";
  }

  function currentFile() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const file = path.split("/").pop() || "index.html";
    return file.toLowerCase();
  }

  function render(container) {
    const section = container.dataset.section;
    const config = SECTIONS[section];
    if (!config) return;

    const prefix = getPrefix();
    const active = currentFile();

    const nav = document.createElement("nav");
    nav.className = "section-subnav";
    nav.setAttribute("aria-label", "Navegação da seção");
    nav.innerHTML = `<div class="section-subnav__inner"><ul></ul></div>`;

    const list = nav.querySelector("ul");
    config.items.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = prefix + item.path;
      a.textContent = item.label;
      if (item.path.toLowerCase() === active) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    container.replaceWith(nav);

    const activeLink = nav.querySelector("a.active");
    const inner = nav.querySelector(".section-subnav__inner");
    if (activeLink && inner) {
      requestAnimationFrame(() => {
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.offsetWidth;
        const innerWidth = inner.clientWidth;
        inner.scrollLeft = linkLeft - innerWidth / 2 + linkWidth / 2;
      });
    }
  }

  function init() {
    const placeholder = document.getElementById("section-subnav");
    if (placeholder) render(placeholder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
