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

A URL da API é embutida no bundle **no momento do build** (Vite), então é preciso saber o endereço do backend antes de gerar a imagem:

```bash
docker build -t mecanica-frontend --build-arg VITE_API_URL=http://<host-do-backend>:8080 .
docker run -d --name mecanica-frontend -p 80:80 mecanica-frontend
```

Use esse comando na VM do frontend, apontando `VITE_API_URL` para o IP/DNS da VM do backend. Se o IP/DNS mudar depois, é necessário rebuildar a imagem (a env var não é lida em runtime).

## Variáveis de ambiente

| Variável | Descrição | Default |
|---|---|---|
| `VITE_API_URL` | URL base da API do backend | `http://localhost:8080` |

## Login

Use as credenciais do admin seedado pelo backend (`admin` / `admin123` por padrão). O frontend envia usuário/senha em cada requisição via HTTP Basic Auth.
