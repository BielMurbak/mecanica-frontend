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

## Kubernetes com Minikube (Mensal 2)

A aplicação roda no Minikube junto com o backend e o PostgreSQL. Os manifestos (`k8s/`) e o passo a passo completo estão no repositório [mecanica-backend](https://github.com/BielMurbak/mecanica-backend) (seção "Kubernetes com Minikube").

O que este repositório contribui:

- `Dockerfile`: build do React (Vite) e imagem final `nginx:alpine`.
- `default.conf.template`: configuração do nginx como template. `BACKEND_UPSTREAM` define o backend (padrão `backend:8080`; no cluster, `backend.mecanica.svc.cluster.local:8080`). O DNS é detectado do ambiente, o `Host` é repassado com a porta e o header `X-Served-By` mostra qual Pod respondeu (balanceamento).

Imagem usada no cluster:

```bash
docker build -t mecanica-frontend:v1 .
minikube image load mecanica-frontend:v1
```
