# Admin online — OAuth GitHub

Para editar em **https://viniciusisliker.github.io/circuitojw/admin/** é necessário um proxy OAuth (GitHub Pages não hospeda login sozinho).

## 1. Criar OAuth App no GitHub

1. Abra [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. **New OAuth App**
3. Preencha:
   - **Application name:** `Circuito JW CMS`
   - **Homepage URL:** `https://viniciusisliker.github.io/circuitojw/`
   - **Authorization callback URL:** `https://circuitojw-oauth.onrender.com/callback`  
     (substitua pelo URL real após o deploy no passo 2)
4. Salve e anote **Client ID** e gere um **Client Secret**

## 2. Deploy do proxy OAuth (Render — gratuito)

1. Crie conta em [render.com](https://render.com)
2. **New → Blueprint** e conecte o repositório `viniciusisliker/circuitojw`
3. O arquivo `render.yaml` na raiz cria o serviço `circuitojw-oauth`
4. Em **Environment** do serviço, configure:

| Variável | Valor |
|---|---|
| `OAUTH_CLIENT_ID` | Client ID do passo 1 |
| `OAUTH_CLIENT_SECRET` | Client Secret do passo 1 |
| `REDIRECT_URL` | `https://SEU-SERVICO.onrender.com/callback` |
| `ORIGINS` | `https://viniciusisliker.github.io` |

5. Aguarde o deploy e copie a URL pública (ex.: `https://circuitojw-oauth.onrender.com`)

## 3. Ativar no Decap CMS

Edite `admin/config.yml` — descomente e ajuste:

```yaml
backend:
  name: github
  repo: viniciusisliker/circuitojw
  branch: main
  base_url: https://circuitojw-oauth.onrender.com
  auth_endpoint: auth
```

Faça commit e push. O admin online passará a abrir login GitHub.

## 4. Testar

1. Acesse `/circuitojw/admin/`
2. **Login with GitHub**
3. Autorize o app (conta com acesso ao repositório)
4. Edite conteúdo e publique — o CI regenera os HTML

## Edição local (sem OAuth)

Continua funcionando sem deploy:

```bash
npm run cms          # terminal 1
npx serve .          # terminal 2
# http://localhost:3000/admin/
```

Com `local_backend: true` no config, o proxy local é usado automaticamente.

## Solução de problemas

- **Popup bloqueado:** permita pop-ups para o site
- **401 / not authorized:** a conta GitHub precisa ter permissão de escrita no repo
- **Callback mismatch:** `REDIRECT_URL` deve ser idêntica à URL cadastrada no OAuth App
- **Render dormindo (free):** primeiro acesso pode demorar ~30s
