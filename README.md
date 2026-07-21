# Circuito SP-111

Site de informações do Circuito SP-111 — Superintendente de Circuito Carol e Wagner Monteiro.

Réplica do site original em Google Sites: [circuitojw](https://sites.google.com/view/circuitojw/p%C3%A1gina-inicial)

## Estrutura

| Pasta | Descrição |
|---|---|
| `content/` | **Conteúdo editável** (JSON) — fonte da verdade |
| `admin/` | Painel administrativo (Decap CMS) |
| `scripts/build.mjs` | Gera os HTML a partir de `content/` |
| `css/`, `js/`, `assets/` | Estilos, navegação e imagens |

## Editar o site (painel admin)

### Local (recomendado para começar)

```bash
npm install
npm run build
npm run cms          # terminal 1 — proxy local do CMS
npx serve .          # terminal 2 — site em http://localhost:3000
```

Abra **http://localhost:3000/admin/** — login local sem GitHub.

Ao salvar no admin, os arquivos JSON em `content/` são atualizados. Depois rode:

```bash
npm run build
git add content/ *.html **/*.html
git commit -m "conteudo: atualizar site"
git pull --rebase origin main
git push origin main
```

### Online (GitHub — produção)

1. Acesse **https://viniciusisliker.github.io/circuitojw/admin/**
2. Faça login com **conta GitHub** autorizada no repositório
3. Edite e publique — o CMS commita no GitHub
4. O workflow **Build site** regenera os HTML automaticamente

> **Login online exige OAuth.** Siga o guia **[docs/ADMIN-OAUTH.md](docs/ADMIN-OAUTH.md)** — inclui proxy OAuth pronto em `oauth/` + deploy no Render (gratuito).

## Desenvolvimento

```bash
npm install
npm run build    # gera HTML a partir de content/
npm run dev      # build + servidor local
```

**Não edite os `.html` manualmente** — eles são gerados. Edite `content/` ou use `/admin/`.

## Publicar no GitHub Pages

1. `git pull --rebase origin main`
2. Commit e push para `main`
3. **Settings → Pages** → branch `main`, pasta `/ (root)`
4. URL: `https://viniciusisliker.github.io/circuitojw/`

## CI

O workflow `.github/workflows/build-site.yml` roda `npm run build` quando `content/` ou `scripts/` mudam e commita os HTML atualizados.

## Notas do editor

- **Temas de discurso** na programação: prefixe com `theme:` (ex.: `theme: Tenha a mais alta consideração...`)
- **Imagens novas**: envie pelo admin (vão para `assets/uploads/`) ou coloque manualmente em `assets/`
- **Escola de Pioneiros**: conteúdo restrito no original — aviso de acesso mantido
- **404**: página `404.html` gerada automaticamente pelo build

## Checklist do que está implementado

- [x] Site estático com todas as páginas do original
- [x] Navbar escura (mesmo estilo da hero) + subnav escura
- [x] Conteúdo em JSON + build automático
- [x] Painel admin Decap CMS (`/admin/`)
- [x] GitHub Action para rebuild após edições no CMS
- [x] Meta description e favicon
- [x] Escola de Pioneiros — página pública com datas e links
- [x] Proxy OAuth pronto (`oauth/` + `render.yaml`) — ver [docs/ADMIN-OAUTH.md](docs/ADMIN-OAUTH.md)
- [x] Git — ver [docs/GIT-SETUP.md](docs/GIT-SETUP.md) se commit falhar por autor
- [ ] Ativar admin online — deploy OAuth no Render + descomentar `base_url` em `admin/config.yml`
