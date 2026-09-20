# VEYORA Enterprise SaaS — Production Deployment & Operations Guide

## 1. Container Architecture & Cloud Run Deployment

VEYORA is packaged as a unified production container serving compiled static frontend assets and the Express.js API gateway from a single Node.js runtime.

```dockerfile
# Production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

---

## 2. Production Environment Variables Checklist

| Variable | Requirement | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables optimized caching, disables verbose error stack traces |
| `PORT` | `3000` | Ingress binding port |
| `MONGODB_URI` | Required | High-availability MongoDB Atlas replica set URI (`mongodb+srv://...`) |
| `JWT_ACCESS_SECRET` | Required | High-entropy 256-bit random cryptographic key |
| `JWT_REFRESH_SECRET` | Required | High-entropy 256-bit key for refresh rotation |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Lifetime of access tokens |
| `JWT_REFRESH_EXPIRES_IN`| `7d` | Lifetime of refresh tokens |
| `CORS_ORIGIN` | Required | Allowed domains e.g., `https://app.veyora.com` |

---

## 3. MongoDB Atlas Configuration & High Availability

1. **Cluster Tier**: M10+ recommended for production with automated backups enabled.
2. **Connection Pooling**: Defaults to max 10 concurrent connections per container instance (`maxPoolSize=10`).
3. **Compound Indexes**:
   - `db.clients.createIndex({ workspaceId: 1, email: 1 }, { unique: true })`
   - `db.projects.createIndex({ workspaceId: 1, status: 1, createdAt: -1 })`
   - `db.invoices.createIndex({ workspaceId: 1, invoiceNumber: 1 }, { unique: true })`
   - `db.auditlogs.createIndex({ workspaceId: 1, timestamp: -1 })`

---

## 4. CI/CD Pipeline & Health Check Probes

1. **Liveness Probe**: `GET /api/v1/health/ping` (Checks if HTTP listener is responding)
2. **Readiness Probe**: `GET /api/v1/health` (Checks database connection and memory constraints)
3. **Automated Verification**: Run `npm test` during CI build stage to ensure 0 regression failures.
