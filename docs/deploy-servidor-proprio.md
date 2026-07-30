# Deploy: backend no seu servidor Windows + frontend no Vercel

Guia para o cenário deste projeto: backend (API + Postgres + Redis) rodando via
Docker no seu servidor Windows 10, exposto na internet através de um Cloudflare
Tunnel; frontend hospedado no Vercel.

## Aviso importante sobre o Cloudflare Tunnel e domínio

Ao sugerir Cloudflare Tunnel, eu disse que dava pra fazer sem domínio próprio — isso
só é totalmente verdade para teste rápido. Na prática existem dois modos:

- **Quick Tunnel** (`cloudflared tunnel --url ...`, sem precisar de conta): gera uma
  URL aleatória tipo `https://palavras-aleatorias.trycloudflare.com`, **que muda toda
  vez que o container reinicia**. Serve para testar rapidamente, mas não é estável o
  suficiente para configurar como URL fixa no Vercel e no app Android.
- **Tunnel nomeado com hostname público estável** (o que este guia usa, via
  `docker-compose.yml` com `TUNNEL_TOKEN`): dá uma URL fixa, mas o Cloudflare exige
  que você tenha **pelo menos um domínio adicionado à sua conta Cloudflare** (nem
  precisa ter comprado nela — dá pra usar um domínio que você já tenha em qualquer
  registrador e apenas apontar os nameservers pra Cloudflare, de graça). Se não tiver
  nenhum domínio, o caminho mais barato é registrar um pela própria Cloudflare
  (~US$9/ano, sem markup) ou por Porkbun/Namecheap.

Se por enquanto você não quiser gastar com domínio, comece com o Quick Tunnel só para
validar que tudo funciona (passo 5b abaixo) e evolua para o tunnel nomeado quando
quiser estabilidade — a troca é só de configuração, não muda nada no código.

## 1. Preparar o servidor Windows

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) com o
   backend WSL2 (o instalador já sugere isso por padrão).
2. Em Configurações do Docker Desktop, ative **"Start Docker Desktop when you sign
   in"** — assim os containers (com `restart: unless-stopped`) voltam sozinhos depois
   de reiniciar o servidor.

## 2. Colocar o código no servidor

Recomendo subir o projeto pro GitHub primeiro (você vai precisar de um repositório de
qualquer forma para o Vercel e o CI já configurado em `.github/workflows/`), e depois
clonar no servidor:

```bash
git clone <url-do-seu-repositorio>
cd <pasta-do-projeto>
```

Se preferir não usar Git agora, copie a pasta inteira do projeto para o servidor por
qualquer outro meio (rede local, pendrive, etc.) — o Vercel e o CI ficam para depois.

## 3. Configurar variáveis de ambiente

```bash
copy .env.example .env
```

Edite o `.env` e preencha pelo menos: `DB_PASSWORD`, `JWT_SECRET` (uma string
aleatória longa), `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Deixe `CLOUDFLARE_TUNNEL_TOKEN` e
`CORS_ALLOWED_ORIGINS` para os próximos passos.

## 4. Subir backend + banco + cache (ainda sem o túnel)

```bash
docker compose up -d postgres redis backend
docker compose logs -f backend
```

Espere aparecer `Started MdmApplication`. Teste localmente no próprio servidor:
`http://localhost:8080/swagger-ui.html`.

## 5. Expor o backend na internet

### 5a. Tunnel nomeado (URL estável — recomendado para uso contínuo)

1. Crie uma conta gratuita em <https://dash.cloudflare.com>.
2. Se ainda não tiver um domínio na conta, adicione um (Websites > Add a domain) —
   pode ser um domínio que você já possua em outro registrador, só mudando os
   nameservers para os que a Cloudflare indicar.
3. Vá em **Zero Trust > Networks > Tunnels > Create a tunnel**, escolha
   **Cloudflared**, dê um nome (ex: `argus-mdm`).
4. Na tela seguinte ("Install and run a connector"), escolha a aba **Docker** e copie
   o token que aparece no comando sugerido (é a parte depois de `--token`).
5. Cole esse valor em `CLOUDFLARE_TUNNEL_TOKEN` no `.env`.
6. Ainda na configuração do tunnel, na aba **Public Hostname**, aponte um subdomínio
   (ex: `api.seudominio.com`) para o serviço `http://backend:8080` (esse é o nome do
   serviço dentro da rede Docker criada pelo `docker-compose.yml` — não use
   `localhost`).
7. Suba o tunnel:
   ```bash
   docker compose up -d cloudflared
   ```
8. Teste de fora da rede local: `https://api.seudominio.com/swagger-ui.html`.

### 5b. Quick Tunnel (teste rápido, sem domínio, URL muda a cada restart)

```bash
docker run --rm cloudflare/cloudflared:latest tunnel --url http://host.docker.internal:8080
```

A URL aparece no log do próprio comando. Use-a temporariamente nos próximos passos.

## 6. Deploy do frontend no Vercel

1. Em <https://vercel.com>, importe o repositório do GitHub.
2. Em **Root Directory**, selecione `frontend` (o Vercel detecta o Vite
   automaticamente).
3. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://api.seudominio.com` (ou a URL do quick tunnel)
   - `VITE_WS_URL` = `https://api.seudominio.com/ws`
4. Deploy. O Vercel te dá uma URL tipo `https://seu-projeto.vercel.app`.

## 7. Liberar o frontend no CORS do backend

Edite `CORS_ALLOWED_ORIGINS` no `.env` do servidor incluindo a URL real do Vercel:

```
CORS_ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

```bash
docker compose up -d backend
```

## 8. Testar de ponta a ponta

Abra a URL do Vercel, faça login com o `ADMIN_EMAIL`/`ADMIN_PASSWORD` definidos no
`.env`, confirme que o dashboard carrega sem erros no console do navegador.

## 9. (Opcional) Ativar push com Firebase

1. Crie um projeto em <https://console.firebase.google.com>.
2. Em Configurações do projeto > Contas de serviço, gere uma nova chave privada
   (baixa um `.json`).
3. Salve esse arquivo como `backend/firebase-service-account.json`.
4. No `docker-compose.yml`, descomente as duas linhas de `volumes:` do serviço
   `backend`.
5. No `.env`, defina `FIREBASE_ENABLED=true`.
6. `docker compose up -d --build backend`.

## Atualizando depois de mudanças no código

```bash
git pull
docker compose up -d --build backend
```

O frontend no Vercel atualiza sozinho a cada push no repositório (deploy automático).
