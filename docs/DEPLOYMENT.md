# Deployment Guide (Coolify + Docker Compose + Cloudflare)

This guide documents the infrastructure, containerization, reverse proxy routing, and automated CI/CD pipeline setups for the **Lashes & MGlamour Platform** deploying on a self-hosted **Coolify** instance proxied by **Cloudflare**.

---

## 🏗️ Deployment Topology

We utilize a modern self-hosted Docker architecture:
- **Server Instance (VPS)**: Running Ubuntu with **Coolify** installed to orchestrate and manage applications.
- **Frontend Client & Backend API**: Deployed together on the VPS using a unified `docker-compose.yml` multi-container structure.
- **CDN / DNS Gateway**: Managed by **Cloudflare** for DDOS protection, SSL edge termination, caching, and secure proxying.

---

## 📦 Containerization (Docker Compose)

The multi-container application stack is defined in the root `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - PUBLIC_API_URL=${PUBLIC_API_URL}
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://admin:luxe_secure_pass@db:5432/lashes_db
      - REDIS_URL=redis://cache:6379/0
      - SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
      - SQUARE_APPLICATION_ID=${SQUARE_APPLICATION_ID}
      - SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID}
      - SQUARE_ENVIRONMENT=${SQUARE_ENVIRONMENT}
      - SQUARE_WEBHOOK_SIGNATURE=${SQUARE_WEBHOOK_SIGNATURE}
    ports:
      - "8000:8000"
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=luxe_secure_pass
      - POSTGRES_DB=lashes_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  cache:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"

volumes:
  pgdata:
  redisdata:
```

---

## ⚙️ Coolify Service Configuration

To deploy this setup using Coolify:

1. **Create a New Project** inside your Coolify dashboard.
2. **Add a Resource**: Select **Docker Compose** as the resource type.
3. **Repository Sync**: Connect your GitHub repository (`lashesmglamour`) and select the `main` branch.
4. **Define Service Domains**:
   - In Coolify, you configure domains directly on individual services of your Docker Compose project.
   - Set the domain for the `frontend` container to: `https://lashesmglamour.com` (pointing to exposed port `80` inside the container, or port `3000` on the host).
   - Set the domain for the `backend` container to: `https://api.lashesmglamour.com` (pointing to exposed port `8000`).
5. **Environment Variables**: Set the following variables in the Coolify project settings:
   - `PUBLIC_API_URL` (e.g. `https://api.lashesmglamour.com/api/v1`)
   - `SQUARE_ACCESS_TOKEN`
   - `SQUARE_APPLICATION_ID`
   - `SQUARE_LOCATION_ID`
   - `SQUARE_ENVIRONMENT`
   - `SQUARE_WEBHOOK_SIGNATURE`

---

## 🔒 Cloudflare Integration & SSL Settings

Cloudflare handles DNS routing and provides DDoS mitigation and performance optimization.

### 1. DNS Records Setup
In your Cloudflare Dashboard, configure the following `A` or `CNAME` records pointing to your Coolify VPS IP address:
- `A` record for `lashesmglamour.com` -> `[VPS_IP_ADDRESS]` (Proxy Status: **Proxied / Orange Cloud**)
- `A` record for `api.lashesmglamour.com` -> `[VPS_IP_ADDRESS]` (Proxy Status: **Proxied / Orange Cloud**)
- `CNAME` record for `www` -> `lashesmglamour.com` (Proxy Status: **Proxied / Orange Cloud**)

### 2. SSL/TLS Encryption Level
- Go to the **SSL/TLS** tab in Cloudflare.
- Set the encryption mode to **Full** or **Full (Strict)**. This ensures traffic between Cloudflare and Coolify's reverse proxy (Traefik/Caddy) is fully encrypted. Coolify automatically negotiates Let's Encrypt certificates locally on the VPS, which satisfies this encryption handshake.

---

## 🚀 CI/CD Pipeline (GitHub Actions)

On every git push, GitHub Actions automatically runs compilation audits and code verification checks. 

To automate the redeployment in Coolify:
1. Navigate to your Coolify application, go to **Deployments** or **Settings**, and locate the **Webhook Trigger URL**.
2. Copy this URL.
3. In your GitHub Repository, go to **Settings > Secrets and variables > Actions** and create a new Repository Secret named `COOLIFY_WEBHOOK_URL` containing the deployment webhook URL.
4. Pushing to `main` will now trigger the workflow `.github/workflows/deploy.yml` which tests your code and triggers Coolify to automatically fetch and rebuild the latest code.

```yaml
name: CI/CD Deployment

on:
  push:
    branches: [ main, develop ]

jobs:
  audit-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Verify compilation and syntax checks
        run: |
          cd backend
          python -m py_compile app/main.py app/core/*.py app/database/*.py app/models/*.py app/schemas/*.py app/services/*.py app/scheduler/*.py app/api/v1/*.py app/api/v1/endpoints/*.py

  deploy:
    needs: audit-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deployment Webhook
        env:
          COOLIFY_WEBHOOK: ${{ secrets.COOLIFY_WEBHOOK_URL }}
        run: |
          if [ -z "$COOLIFY_WEBHOOK" ]; then
            echo "Notice: COOLIFY_WEBHOOK_URL secret is not set. Skipping webhook trigger."
            echo "Coolify will redeploy automatically if configured via its native GitHub App / Webhook integration."
          else
            echo "Triggering deployment in Coolify..."
            curl -s -S -X GET "$COOLIFY_WEBHOOK"
            echo "Deployment webhook triggered successfully."
          fi
```
