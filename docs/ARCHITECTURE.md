# VEYORA Enterprise SaaS — Architecture & System Design Manual

## 1. System Overview & Core Tenets

**VEYORA** is a multi-tenant client operations and billing SaaS engineered for software agencies, high-volume consultancies, and modern professional service providers.

```
+-----------------------------------------------------------------------------+
|                               VEYORA ARCHITECTURE                           |
+-----------------------------------------------------------------------------+
|  [ Client Tier ]                                                            |
|  React 18 SPA + Tailwind CSS + Lucide Icons + Recharts Analytics            |
|  Reactive Context Store + Axios Interceptor Pipeline (Auto Token Refresh)   |
+-----------------------------------------------------------------------------+
                                      |
                     HTTP/1.1 REST (JSON / Multipart)
                     Bearer JWT + X-Workspace-Id
                                      v
+-----------------------------------------------------------------------------+
|  [ API Gateway & Ingress Middleware Layer ]                                 |
|  - Rate Limiting (Multi-tier anti-brute-force)                              |
|  - IP Perimeter Firewall & CIDR Allowlisting                                |
|  - Deep NoSQL Sanitization (Strips $gt, $ne, $where operators)              |
|  - Prototype Pollution Defense (Blocks __proto__, constructor)              |
|  - CORS & Helmet Security Headers (CSP, HSTS, X-Frame-Options)              |
+-----------------------------------------------------------------------------+
                                      |
+-----------------------------------------------------------------------------+
|  [ Authentication & Multi-Tenant Scoping Engine ]                           |
|  1. JWT Verification: Checks signature, expiration & revokes blacklist     |
|  2. Tenant Resolver: Validates user workspace membership from DB             |
|  3. RBAC Gate: Enforces 5-Tier Role Matrix (SUPER_ADMIN -> CLIENT)          |
|  4. Scope Injector: Binds `req.workspaceId` & `req.user` to request context  |
+-----------------------------------------------------------------------------+
                                      |
+-----------------------------------------------------------------------------+
|  [ Controller & Service Domain Logic ]                                      |
|  Clients | Projects | Tasks | Proposals | Invoices | Documents | Audit Logs |
|  Notifications | Security Shield | Automated Testing Engine                 |
+-----------------------------------------------------------------------------+
                                      |
                               Mongoose ORM
                        (Strict Workspace Scoping)
                                      v
+-----------------------------------------------------------------------------+
|  [ Data Persistence Layer ]                                                 |
|  MongoDB Atlas Cluster / Multi-Tenant Collections with Compound Indexes     |
|  { workspaceId: 1, createdAt: -1 } / { workspaceId: 1, status: 1 }          |
+-----------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant Partitioning Model

VEYORA utilizes a **Discriminator-Partitioned Multi-Tenant Architecture**:

1. **Shared Database, Scoped Collections**: All data resides in high-performance shared collections with mandatory `workspaceId` foreign keys indexed as leading fields.
2. **Deterministic Middleware Guarding**:
   - Every protected API endpoint passes through `requireTenant` middleware.
   - The user's active workspace membership is checked in real-time.
   - Mongoose queries strictly inject `{ workspaceId: req.workspaceId }` into all CRUD operations.
3. **Cross-Tenant Zero-Leakage Guarantee**:
   - Access attempts to resources with non-matching `workspaceId` fail-safe to `404 Not Found` or `403 Forbidden`.
   - Verified by automated regression test vector in `testing.service.js`.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Permission Domain | Super Admin | Admin | Member | Viewer | Client |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Workspace Settings & Billing** | Full | Full | Read-Only | Denied | Denied |
| **User & Team Management** | Full | Full | Read-Only | Denied | Denied |
| **Client Management** | Full | Full | Full | Read-Only | Own Profile |
| **Project & Task Delivery** | Full | Full | Full | Read-Only | Assigned |
| **Proposals & SOW Sizing** | Full | Full | Create/Edit | Read-Only | Accept/Sign |
| **Invoicing & Payments** | Full | Full | Create/Edit | Read-Only | Pay / View |
| **Document Vault** | Full | Full | Upload/Read | Read-Only | Shared Docs |
| **Audit Logs & Security Shield** | Full | Full | Denied | Denied | Denied |
| **Automated Testing Suite** | Full | Full | Denied | Denied | Denied |

---

## 4. Cryptographic Authentication & Token Lifecycle

1. **Access Tokens**: Short-lived (15m default), HMAC-SHA256 signed JWTs containing user ID, role, and authorized workspace IDs.
2. **Refresh Tokens**: Long-lived (7d default), stored in secure HTTP-only cookie, enabling seamless token rotation without user disruption.
3. **Password Security**: Salted bcrypt hashing (12 rounds) with complexity enforcement (minimum 8 chars, uppercase, lowercase, numbers, special characters).
