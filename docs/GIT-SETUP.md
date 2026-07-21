# Git — configuração única (Windows)

Se o commit falhar com *Author identity unknown*, configure **só neste repositório**:

```powershell
git config user.name "viniciusisliker"
git config user.email "228526077+viniciusisliker@users.noreply.github.com"
```

Ou use seu e-mail real do GitHub em `user.email`.

Verifique:

```powershell
git config user.name
git config user.email
```

Depois siga o fluxo normal:

```powershell
git pull --rebase origin main
git add .
git commit -m "sua mensagem"
git push origin main
```
