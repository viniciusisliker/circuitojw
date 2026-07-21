import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 3001);
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const ORIGINS = (process.env.ORIGINS || "https://viniciusisliker.github.io")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", ...headers });
  res.end(body);
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ORIGINS.some((allowed) => origin === allowed || origin.startsWith(`${allowed}/`));
}

async function exchangeCode(code) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URL,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data.access_token;
}

function authPage() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scope: "repo",
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Login GitHub</title></head><body>
<script>window.location.href = "https://github.com/login/oauth/authorize?${params}";</script>
<p>Redirecionando para o GitHub…</p></body></html>`;
}

function callbackPage(token) {
  const payload = JSON.stringify({ token, provider: "github" });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Autorizado</title></head><body>
<script>
(function () {
  var payload = ${JSON.stringify(payload)};
  function receiveMessage(e) {
    window.opener.postMessage("authorization:github:success:" + payload, e.origin);
    window.removeEventListener("message", receiveMessage, false);
    window.close();
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>Login concluído. Esta janela pode fechar.</p></body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URL) {
    send(res, 500, "<h1>OAuth não configurado</h1><p>Defina OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET e REDIRECT_URL.</p>");
    return;
  }

  if (url.pathname === "/" || url.pathname === "/health") {
    send(res, 200, "OK — Circuito JW OAuth");
    return;
  }

  if (url.pathname === "/auth") {
    send(res, 200, authPage());
    return;
  }

  if (url.pathname === "/callback") {
    const code = url.searchParams.get("code");
    if (!code) {
      send(res, 400, "<h1>Erro</h1><p>Código de autorização ausente.</p>");
      return;
    }
    try {
      const token = await exchangeCode(code);
      send(res, 200, callbackPage(token));
    } catch (error) {
      send(res, 500, `<h1>Erro OAuth</h1><pre>${error.message}</pre>`);
    }
    return;
  }

  send(res, 404, "<h1>404</h1>");
});

server.listen(PORT, () => {
  console.log(`OAuth proxy em http://localhost:${PORT}`);
});
