# VEYORA Enterprise SaaS — REST API Reference Manual

Base API Endpoint: `http://localhost:3000/api/v1` (or production domain)

### Required Headers
- `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- `X-Workspace-Id: <WORKSPACE_OBJECT_ID>` (Optional if user has primary workspace set)
- `Content-Type: application/json`

---

## 1. System Health & Diagnostics

### `GET /health`
Returns system status, database connectivity state, uptime, and memory usage.
- **Auth Required:** No
- **Response 200:**
```json
{
  "success": true,
  "service": "VEYORA Enterprise API",
  "status": "healthy",
  "uptime": 1420.5,
  "database": {
    "status": "connected",
    "host": "ac-cluster-0.mongodb.net",
    "name": "veyora_prod"
  },
  "memory": {
    "heapUsedMB": 68,
    "heapTotalMB": 124,
    "rssMB": 156
  }
}
```

---

## 2. Authentication & Identity

### `POST /auth/register`
Create a new user account and default enterprise workspace.
- **Body:** `{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password123!", "companyName": "Acme Inc" }`
- **Response 201:** Returns created user, default workspace, and JWT tokens.

### `POST /auth/login`
Authenticate existing user and retrieve session tokens.
- **Body:** `{ "email": "sec.admin@veyora.internal", "password": "VeyoraSec2026!" }`
- **Response 200:** `{ "success": true, "data": { "user": {...}, "workspace": {...}, "accessToken": "..." } }`

### `POST /auth/refresh`
Rotate refresh token and retrieve a fresh short-lived access token.
- **Auth Required:** Refresh token cookie or body payload.

---

## 3. Workspaces & Tenant Scoping

### `GET /workspaces/current`
Get metadata and subscription details for active workspace.

### `GET /workspaces/members`
List all team members, role assignments, and status in workspace.

---

## 4. Client CRM Operations

### `GET /clients`
List all clients in workspace with filtering, search, and pagination.
- **Query Params:** `?page=1&limit=20&search=Acme&status=active`

### `POST /clients`
Create a new client entity.
- **Body:** `{ "name": "Acme Corp", "company": "Acme Global", "email": "contact@acme.com", "phone": "+1 555 0100", "status": "active" }`

### `GET /clients/:id` | `PUT /clients/:id` | `DELETE /clients/:id`
Retrieve, update, or soft-delete specific client.

---

## 5. Projects & Workflow Delivery

### `GET /projects`
Retrieve all projects with client relationships and progress stats.

### `POST /projects`
Provision a new project.
- **Body:** `{ "clientId": "...", "name": "Cloud Migration", "budget": 35000, "status": "active", "targetDate": "2026-12-31" }`

---

## 6. Task Matrix & Time Tracking

### `GET /tasks` | `POST /tasks` | `PUT /tasks/:id` | `DELETE /tasks/:id`
Full Kanban sprint task tracking with checklist items, assignees, and time logs.

---

## 7. Proposals & Digital E-Signatures

### `GET /proposals` | `POST /proposals`
Manage SOWs, milestone estimates, pricing line-items, and digital signatures.

### `POST /proposals/:id/sign`
Apply client e-signature with timestamp, signer name, and IP address.

---

## 8. Invoicing & Payment Reconciliation

### `GET /invoices` | `POST /invoices`
Create tax-adjusted multi-item invoices with automated status tracking.

### `POST /invoices/:id/payments`
Record partial or full payment settlement with Stripe or wire transaction ID.

---

## 9. Document Vault & Storage

### `GET /documents` | `POST /documents/upload`
Upload and retrieve secure documents with MIME type and quota enforcement.

---

## 10. In-App Notifications

### `GET /notifications` | `PUT /notifications/:id/read` | `PUT /notifications/read-all`
Real-time user notification feed with instant read receipts.

---

## 11. Immutable Audit Ledger

### `GET /audit`
Query immutable actor activity logs with IP addresses, user agents, and entity tracking.

---

## 12. Security & Threat Shield

### `GET /security/posture`
Retrieve live 10-vector security posture score and policy breakdown.

### `POST /security/scan`
Run live automated vulnerability and dependency scanner.

---

## 13. Automated Integration Testing & Verification

### `POST /testing/run`
Execute full 14-vector automated integration test suite across all modules.

### `POST /testing/scenario`
Run synthetic end-to-end scenario simulation (`client_billing_lifecycle`, `tenant_security_breach_prevention`, `compliance_audit_integrity`).

### `GET /testing/benchmarks`
Measure database query latencies (Min, Avg, P50, P90, P99, Max) and throughput.

### `GET /testing/report/export?format=markdown|json`
Generate cryptographically signed compliance certification document.

---

## 14. Outbound Webhooks & Event Automation (Phase 22)

### `GET /webhooks`
List all webhook endpoint subscriptions for the active workspace with delivery statistics.

### `POST /webhooks`
Create a new webhook subscription with an auto-generated HMAC-SHA256 signing secret (`whsec_...`).
- **Body:**
```json
{
  "name": "Production Event Subscriber",
  "url": "https://api.yourdomain.com/webhooks",
  "events": ["invoice.paid", "client.created", "proposal.signed"],
  "headers": {
    "Authorization": "Bearer token_xyz"
  },
  "retryPolicy": {
    "maxRetries": 3,
    "backoffSeconds": 10
  }
}
```

### `POST /webhooks/:id/test`
Dispatch a synthetic event payload to the target webhook URL with cryptographic signature headers.

### `POST /webhooks/:id/rotate-secret`
Rotate the HMAC signing secret for a subscription with audit ledger logging.

### `GET /webhooks/:id/deliveries`
Query paginated delivery logs, including HTTP status codes, latency in milliseconds, signed payloads, and server response bodies.

### `POST /webhooks/deliveries/:deliveryId/redeliver`
Re-dispatch a previous webhook delivery event payload to the endpoint.

---

## 15. Trigger-Action Workflow Rule Engine (Phase 23)

### `GET /workflows`
List all workflow automation rules for the active workspace with trigger events, conditions, and execution counters.
- **Query Params:** `status=active|inactive`, `event=client.created|invoice.paid|...`, `search=keywords`

### `POST /workflows`
Create a new trigger-action automation rule with condition filters and action chains.
- **Body:**
```json
{
  "name": "VIP Client Auto-Onboarding & Task Dispatch",
  "description": "Auto-creates onboarding checklist and alerts team when high-value client registers",
  "trigger": {
    "event": "client.created",
    "conditions": [
      { "field": "status", "operator": "equals", "value": "active" }
    ]
  },
  "actions": [
    {
      "type": "create_task",
      "params": {
        "title": "Onboard {{name}} & configure workspace",
        "priority": "high",
        "dueInDays": 3
      }
    },
    {
      "type": "send_notification",
      "params": {
        "title": "New VIP Client: {{name}}",
        "message": "Client profile created with active SLA status.",
        "type": "client"
      }
    },
    {
      "type": "dispatch_webhook",
      "params": {
        "customEvent": "client.vip_onboarding"
      }
    }
  ]
}
```

### `GET /workflows/:id`
Retrieve full definition and metrics of a single workflow rule.

### `PUT /workflows/:id`
Update a workflow rule's trigger, condition filters, action chain, or active/paused state.

### `DELETE /workflows/:id`
Delete a workflow rule and cascade cleanup of execution history logs.

### `POST /workflows/:id/test`
Simulate execution of a workflow rule with sample test JSON payload and step-by-step trace output.
- **Body:**
```json
{
  "testPayload": {
    "name": "Acme Global",
    "status": "active",
    "amount": 15000
  }
}
```

### `GET /workflows/executions`
Query historical execution trace audit logs across the workspace, with action latencies and output payloads.

### `GET /workflows/metrics`
Retrieve aggregated workspace workflow statistics: total rules, active rules, total executions, success rate, and average latency.


