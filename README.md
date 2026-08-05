# Mecânica Frontend

SPA em React + Vite para o CRUD de Gestão de Mecânica (login, Mecânicos, Serviços).

## Rodando localmente (dev)

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Por padrão aponta para a API em `http://localhost:8080` (ver `.env.local` / `VITE_API_URL`).

## Build de produção

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.

## Build da imagem Docker (Nginx)

A imagem já inclui um Nginx que serve o SPA e faz proxy de `/api/` para `http://backend:8080/api/` (ver `nginx.conf`). Por padrão, o build **não** embute nenhuma URL de API — o bundle chama caminhos relativos (`/api/...`) e deixa o Nginx resolver para o backend, então frontend e backend precisam estar na mesma rede Docker (ex.: mesmo `docker-compose.yml`, com o serviço do backend chamado `backend`):

```bash
docker build -t mecanica-frontend .
docker run -d --name mecanica-frontend -p 80:80 mecanica-frontend
```

Se preferir apontar o frontend direto para um backend em outro host (bypassando o proxy do Nginx), ainda é possível embutir uma URL absoluta no build — nesse caso o backend precisa liberar CORS para a origin do frontend (`CORS_ALLOWED_ORIGINS`) e expor a porta publicamente:

```bash
docker build -t mecanica-frontend --build-arg VITE_API_URL=http://<host-do-backend>:8080 .
```

A env var é lida **no momento do build** (Vite), não em runtime — mudou o endereço, precisa rebuildar.

## Variáveis de ambiente

| Variável | Descrição | Default |
|---|---|---|
| `VITE_API_URL` | URL base da API do backend. Vazio = caminhos relativos via proxy do Nginx (recomendado) | `` (vazio, proxy via Nginx) |

## Login

Use as credenciais do admin seedado pelo backend (`admin` / `admin123` por padrão). O frontend envia usuário/senha em cada requisição via HTTP Basic Auth.
