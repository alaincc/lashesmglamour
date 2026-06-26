# Deployment Guide (Docker + Vercel + VPS)

This guide documents the infrastructure, containerization, reverse proxy routing, and automated CI/CD pipeline setups for the **Lashes & MGlamour Platform**.

---

## 🏗️ Deployment Topology

We utilize a hybrid architecture:
- **Frontend client**: Built with Astro 7, hosted on **Vercel** for optimal global speed and CDN caching.
- **Backend API engine**: Hosted on a **VPS Ubuntu** instance running **Docker Compose** containing FastAPI, Redis, PostgreSQL, and Nginx.
- **CDN / DNS Gateway**: Managed by **Cloudflare** for DDOS protection, SSL generation, and edge optimizations.

---

## 📦 Containerization (Docker Compose)

The backend microservice stack is orchestrated locally and in staging/production using `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql+psycopg2://admin:luxe_secure_pass@db:5432/lashes_db
      - REDIS_URL=redis://cache:6379/0
      - SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
      - SQUARE_APPLICATION_ID=${SQUARE_APPLICATION_ID}
      - SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID}
      - SQUARE_ENVIRONMENT=${SQUARE_ENVIRONMENT}
    ports:
      - "8000:8000"
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
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
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
```

---

## 🔒 Nginx Reverse Proxy Configuration

Nginx routes incoming client requests, manages SSL certifications, and restricts backend gateway exposure.

```nginx
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;

    upstream fastapi_app {
        server backend:8000;
    }

    server {
        listen 80;
        server_name api.lashesmglamour.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.lashesmglamour.com;

        ssl_certificate /etc/letsencrypt/live/api.lashesmglamour.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.lashesmglamour.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        location / {
            proxy_pass http://fastapi_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 🚀 GitHub Actions CI/CD Pipeline

We set up automatic pipelines at `.github/workflows/deploy.yml` triggered on changes in `main`.

```yaml
name: Staging & Production Deployment

on:
  push:
    branches: [ main ]

jobs:
  audit-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies & Lint
        run: |
          cd backend
          pip install -r requirements.txt
          pip install ruff
          ruff check .

  deploy-backend:
    needs: audit-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/lashesmglamour
            git pull origin main
            docker-compose up -d --build backend
            docker-compose exec -T backend alembic upgrade head
```
