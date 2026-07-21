import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, rel), "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    if (typeof value.line === "string") return value.line;
    if (typeof value.item === "string") return value.item;
    if (typeof value.paragrafo === "string") return value.paragrafo;
    if (typeof value.prazo === "string") return value.prazo;
    if (typeof value.data === "string") return value.data;
    if (typeof value.obs === "string") return value.obs;
    if (value.type === "theme" && typeof value.text === "string") {
      return { type: "theme", text: value.text };
    }
  }
  return String(value);
}

function normalizeList(values) {
  return (values || []).map(normalizeText);
}

function writeHtml(relPath, html) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
  console.log("  ✓", relPath);
}

function prefixFor(depth) {
  return depth === 0 ? "" : "../".repeat(depth);
}

function renderCircuitBrand(variant = "hero") {
  if (variant === "hero") {
    return `<h1 class="circuit-brand circuit-brand--hero">
      <span class="circuit-brand__ornament" aria-hidden="true"></span>
      <span class="circuit-brand__word">Circuito</span>
      <span class="circuit-brand__code">SP-111</span>
    </h1>`;
  }
  return `<span class="circuit-brand circuit-brand--nav">
    <span class="circuit-brand__word">Circuito</span>
    <span class="circuit-brand__sep" aria-hidden="true"></span>
    <span class="circuit-brand__code">SP-111</span>
  </span>`;
}

function pageShell({ depth, title, brand, body, scripts = ["nav.js"], description = "" }) {
  const site = readJson("site.json");
  const p = prefixFor(depth);
  const scriptTags = scripts.map((s) => `  <script src="${p}js/${s}"></script>`).join("\n");
  const safeTitle = escapeHtml(title);
  const safeBrand = escapeHtml(brand);
  const metaDescription = escapeHtml(description || site.metaDescription || site.titleSuffix);
  const fontsLink = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
  return `<!DOCTYPE html>
<!-- Gerado automaticamente por npm run build — edite content/ ou use /admin/ -->
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${metaDescription}">
  <title>${safeTitle} — ${escapeHtml(site.titleSuffix)}</title>
  <link rel="icon" href="${p}assets/favicon.svg" type="image/svg+xml">
${fontsLink}
  <link rel="stylesheet" href="${p}css/style.css">
</head>
<body>
  <div id="site-nav" data-brand="${safeBrand}"></div>
${body}
  <footer class="site-footer">
    <p>${site.footerText}</p>
  </footer>
${scriptTags}
</body>
</html>
`;
}

function renderInformacoesImportantes() {
  const info = readJson("shared/informacoes-importantes.json");
  const d = info.discursoEspecial;
  const c = info.celebracao;
  const prazos = normalizeList(c.prazos).map((item) => {
    const text = String(item);
    const idx = text.indexOf(":");
    if (idx === -1) return `          <li>${text}</li>`;
    return `          <li><strong>${text.slice(0, idx)}:</strong>${text.slice(idx)}</li>`;
  }).join("\n");
  const datas = normalizeList(c.proximasDatas).map((item) => {
    const text = String(item);
    const idx = text.indexOf(":");
    if (idx === -1) return `          <li>${text}</li>`;
    return `          <li><strong>${text.slice(0, idx)}:</strong>${text.slice(idx)}</li>`;
  }).join("\n");

  return `    <section class="section" id="informacoes-importantes">
      <h2>${info.title}</h2>
      <div class="info-box info-box--highlight">
        <h3>${d.title}</h3>
        <p><strong>${d.temaLabel}</strong></p>
        <p>${d.paragrafo1.replace(/___/g, "<strong>___</strong>")}</p>
        <p>${d.paragrafo2.replace(/___/g, "<strong>___</strong>")}</p>
        <p>${d.paragrafo3}</p>
        <p class="text-muted mb-0">${d.referencia}</p>
      </div>
      <div class="info-box">
        <h2>${c.title}</h2>
        <h3>${c.data}</h3>
${normalizeList(c.paragrafos).map((p) => `        <p>${String(p).replace(/Como Alugar Locais para Eventos da Congregação/g, "<em>Como Alugar Locais para Eventos da Congregação</em>")}</p>`).join("\n")}
        <ul>
${prazos}
        </ul>
        <p>${c.paragrafoFinal.replace(/dignidade da ocasião/g, "dignidade da ocasião")}</p>
        <p><strong>${c.proximasDatasTitulo}</strong></p>
        <ul>
${datas}
        </ul>
        <p>${c.referencia}</p>
      </div>
    </section>`;
}

function renderProgramBlock(block) {
  let inner = "";
  const lines = normalizeList(block.lines);
  if (lines.length) {
    inner = lines
      .map((line) => {
        if (typeof line === "string" && line.startsWith("theme:")) {
          return `          <p class="theme">${escapeHtml(line.slice(6).trim())}</p>`;
        }
        if (typeof line === "object" && line.type === "theme") {
          return `          <p class="theme">${escapeHtml(line.text)}</p>`;
        }
        const withStrong = String(line)
          .replace(/Cântico final: (\d+)/, "Cântico final: <strong>$1</strong>")
          .replace(/Cântico inicial: (\d+)/, "Cântico inicial: <strong>$1</strong>")
          .replace(/^(ESTUDO DA REVISTA A SENTINELA)$/, "<strong>$1</strong>");
        return `          <p>${withStrong}</p>`;
      })
      .join("\n");
  }
  const list = normalizeList(block.list);
  if (list.length) {
    inner += `\n          <ul>\n${list.map((i) => `            <li>${i}</li>`).join("\n")}\n          </ul>`;
  }
  return `        <div class="program-block">
          <h3>${block.title}</h3>
${inner}
        </div>`;
}

function renderSchedule(months) {
  return months
    .map(
      (month) => `    <div class="schedule-month">
      <h3>${month.title}</h3>
      <table class="schedule-table">
${month.rows.map((row) => `        <tr><td class="dates">${row.dates}</td><td>${row.label}</td></tr>`).join("\n")}
      </table>
    </div>`
    )
    .join("\n\n");
}

function buildHome() {
  const page = readJson("pages/home.json");
  const h = page.hero;
  const semesterOptions = (h.semesterOptions || [])
    .map((o) => `            <option value="${escapeHtml(o.href)}">${escapeHtml(o.label)}</option>`)
    .join("\n");

  const linkCards = page.linkGroups
    .map(
      (group) => `      <div class="link-grid link-grid--2">
${group.links.map((l) => `        <a class="link-card" href="${l.href}"><span class="link-card__icon">→</span>${escapeHtml(l.label.replace(/^👉\s*/, ""))}</a>`).join("\n")}
      </div>`
    )
    .join("\n");

  const body = `
  <section class="home-hero" style="--hero-bg: url('${h.bgImage}')">
    <div class="home-hero__bg" aria-hidden="true"></div>
    <div class="home-hero__decor" aria-hidden="true"></div>
    <div class="home-hero__inner">
      <div class="hero-content">
        ${h.eyebrow ? `<p class="hero-content__eyebrow">${escapeHtml(h.eyebrow)}</p>` : ""}
        ${renderCircuitBrand("hero")}
        <p class="hero-content__desc">${escapeHtml(h.description || h.subtitle || "")}</p>
        <form class="semester-selector" id="semester-form" action="#">
          <label class="semester-selector__label" for="semester-select">Semestre</label>
          <select id="semester-select" class="semester-selector__select" required>
            <option value="" disabled selected>Selecione o semestre</option>
${semesterOptions}
          </select>
          <button type="submit" class="btn-primary">${escapeHtml(h.ctaLabel || "Continuar")}</button>
        </form>
      </div>
      <div class="hero-visual">
        <div class="layered-image-card">
          <span class="layered-image-card__frame layered-image-card__frame--back"></span>
          <span class="layered-image-card__frame layered-image-card__frame--mid"></span>
          <img class="layered-image-card__image" src="${h.image}" alt="${escapeHtml(h.imageAlt)}">
        </div>
      </div>
    </div>
  </section>

  <main class="main main--wide">
    <div class="quick-links">
${linkCards}
    </div>
${page.showInformacoesImportantes ? "\n" + renderInformacoesImportantes() : ""}
  </main>`;

  writeHtml("index.html", pageShell({
    depth: 0,
    title: page.pageTitle,
    brand: page.brand,
    body,
    scripts: ["nav.js", "home-hero.js"],
  }));
}

function buildVisita() {
  const page = readJson("pages/visita.json");
  const p = prefixFor(1);
  const rows = page.sections
    .map(
      (s) => `    <div class="media-row${s.reverse ? " media-row--reverse" : ""}">
      <div class="media-row__image">
        <img src="${p}${s.image}" alt="${s.imageAlt}">
      </div>
      <div class="media-row__text">
        ${s.html}
      </div>
    </div>`
    )
    .join("\n\n");

  const body = `
  <header class="page-intro">
    <h1>${page.intro.title}</h1>
    <p class="page-intro__subtitle">${page.intro.subtitle}</p>
  </header>

  <main class="section-content--plain">
${rows}
  </main>`;

  writeHtml("visita-do-viajante/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function buildProgramacaoIndex() {
  const page = readJson("pages/programacao-index.json");
  const p = prefixFor(1);
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <div id="section-subnav" data-section="${page.subnav}"></div>

  <div class="section-layout">
    <div class="section-content">
      ${page.introHtml}
      <div class="semester-links">
${page.semesterLinks.map((l) => `        <a href="${l.href}">${l.label}</a>`).join("\n")}
      </div>
      <section class="section">
        <h2>${page.section.title}</h2>
        ${page.section.html}
      </section>
    </div>
  </div>`;

  writeHtml(
    "programacao-reuniao/index.html",
    pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body, scripts: ["nav.js", "subnav.js"] })
  );
}

function buildProgramacaoSemester(file, out) {
  const page = readJson(`pages/${file}.json`);
  const p = prefixFor(1);
  const blocks = page.blocks.map(renderProgramBlock).join("\n\n");
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <div id="section-subnav" data-section="${page.subnav}"></div>

  <div class="section-layout">
    <div class="section-content">
      <section class="section">
${blocks}
      </section>
    </div>
  </div>`;

  writeHtml(
    `programacao-reuniao/${out}`,
    pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body, scripts: ["nav.js", "subnav.js"] })
  );
}

function buildItinerarioIndex() {
  const page = readJson("pages/itinerario-index.json");
  const p = prefixFor(1);
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <div id="section-subnav" data-section="${page.subnav}"></div>

  <div class="section-layout">
    <div class="section-content">
      <div class="semester-links">
${page.semesterLinks.map((l) => `        <a href="${l.href}">${l.label}</a>`).join("\n")}
      </div>
${page.showInformacoesImportantes ? "\n" + renderInformacoesImportantes() : ""}
    </div>
  </div>`;

  writeHtml(
    "itinerario/index.html",
    pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body, scripts: ["nav.js", "subnav.js"] })
  );
}

function buildItinerarioSemester(file, out) {
  const page = readJson(`pages/${file}.json`);
  const p = prefixFor(1);
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <div id="section-subnav" data-section="${page.subnav}"></div>

  <div class="section-layout">
    <div class="section-content">
${renderSchedule(page.months)}
    </div>
  </div>`;

  writeHtml(
    `itinerario/${out}`,
    pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body, scripts: ["nav.js", "subnav.js"] })
  );
}

function buildAvisoVisita() {
  const page = readJson("pages/aviso-visita.json");
  const grid = page.congregations
    .map(
      (c) => `        <a class="congregation-link" href="${c.url}" target="_blank" rel="noopener">
          🌐 ${c.name} <span>(${c.code})</span>
        </a>`
    )
    .join("\n");

  const body = `
  <header class="page-header">
    <h1>${page.header.title}</h1>
    <div class="page-header__divider"></div>
  </header>

  <main class="main main--wide">
    <section class="section">
      <p class="text-muted">${page.intro}</p>
      <div class="congregation-grid">
${grid}
      </div>
    </section>
  </main>`;

  writeHtml("aviso-visita/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function buildAssembleias() {
  const page = readJson("pages/assembleias.json");
  const p = prefixFor(1);
  const events = page.events
    .map(
      (e) => `      <div class="program-block">
        <h3>${e.date}</h3>
        <p><strong>${e.subtitle}</strong></p>
        <p class="inline-link">${e.carta}</p>
      </div>`
    )
    .join("\n\n");

  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <main class="main">
    <section class="section">
${events}
    </section>
    <section class="section">
      <h2>${page.preparacao.title}</h2>
      <p>${page.preparacao.intro}</p>
      <ol>
${page.preparacao.items.map((i) => `        <li>${i}</li>`).join("\n")}
      </ol>
    </section>
  </main>`;

  writeHtml("assembleias/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function buildPioneiros() {
  const page = readJson("pages/pioneiros.json");
  const p = prefixFor(1);
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <main class="main">
    <section class="section">
      ${page.introHtml}
    </section>
    <section class="section">
      <div class="info-box">
        <h3>${page.local.title}</h3>
        <p>${page.local.endereco.replace(/\n/g, "<br>\n        ")}</p>
      </div>
    </section>
    <section class="section">
      <h2>Tema</h2>
      <p class="theme text-center">${page.tema}</p>
    </section>
    <section class="section">
      <h2>Orientações</h2>
      <ul>
${page.orientacoes.map((o) => `        <li>${o.replace(/ninguém estará autorizado a gravar/g, "<strong>ninguém estará autorizado a gravar</strong>").replace(/3 horas/g, "<strong>3 horas</strong>")}</li>`).join("\n")}
      </ul>
      <p>${page.encerramento}</p>
    </section>
    <section class="section">
      <div class="info-box info-box--highlight">
        <h3>Observações importantes</h3>
${page.observacoes.map((o) => `        <p>${o.replace(/^OBS:/, "<strong>OBS:</strong>")}</p>`).join("\n")}
      </div>
    </section>
  </main>`;

  writeHtml("reuniao-pioneiros/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function buildEscola() {
  const page = readJson("pages/escola.json");
  const p = prefixFor(1);
  const links = (page.links || [])
    .map((l) => `        <a class="semester-tab" href="${l.href}">${l.label}</a>`)
    .join("\n");
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <main class="main">
    <section class="section">
      ${page.introHtml}
    </section>
    <section class="section">
      <h2>${page.linksTitulo || "Links úteis"}</h2>
      <div class="semester-tabs">
${links}
      </div>
    </section>
    <section class="section">
      <h2>${page.referenciaTitulo}</h2>
      <p>${page.referenciaIntro}</p>
      <ul>
${normalizeList(page.referenciaItens).map((i) => `        <li>${String(i)}</li>`).join("\n")}
      </ul>
    </section>
    <section class="section">
      <div class="info-box">
        ${page.contatoHtml}
      </div>
    </section>
  </main>`;

  writeHtml("escola-pioneiros/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function buildDesastres() {
  const page = readJson("pages/desastres.json");
  const p = prefixFor(1);
  const body = `
  <header class="page-banner" style="background-image: url('${p}${page.banner.image}');">
    <h1>${page.banner.title}</h1>
  </header>

  <main class="main">
    <section class="section">
      <p><a class="inline-link" href="${page.formulario.url}" target="_blank" rel="noopener">${page.formulario.label}</a></p>
    </section>
    <section class="section">
      <h2>${page.preparacao.title}</h2>
      <p>${page.preparacao.intro}</p>
      <ol>
${page.preparacao.items.map((i) => `        <li>${i}</li>`).join("\n")}
      </ol>
    </section>
  </main>`;

  writeHtml("desastres-naturais/index.html", pageShell({ depth: 1, title: page.pageTitle, brand: page.brand, body }));
}

function build404() {
  const site = readJson("site.json");
  const body = `
  <header class="page-header">
    <h1>Página não encontrada</h1>
    <div class="page-header__divider"></div>
  </header>

  <main class="main">
    <section class="section text-center">
      <p class="text-muted">O endereço que você acessou não existe neste site.</p>
      <p><a href="index.html">Voltar para a tela inicial</a></p>
    </section>
  </main>`;

  writeHtml(
    "404.html",
    pageShell({
      depth: 0,
      title: "Página não encontrada",
      brand: site.circuitName,
      body,
      description: "Página não encontrada no site do Circuito SP-111.",
    })
  );
}

console.log("Gerando site a partir de content/...\n");
buildHome();
buildVisita();
buildProgramacaoIndex();
buildProgramacaoSemester("programacao-set-fev", "setembro-fevereiro.html");
buildProgramacaoSemester("programacao-mar-ago", "marco-agosto.html");
buildItinerarioIndex();
buildItinerarioSemester("itinerario-set-fev", "setembro-fevereiro.html");
buildItinerarioSemester("itinerario-mar-ago", "marco-agosto.html");
buildAvisoVisita();
buildAssembleias();
buildPioneiros();
buildEscola();
buildDesastres();
build404();
console.log("\nBuild concluído.");
