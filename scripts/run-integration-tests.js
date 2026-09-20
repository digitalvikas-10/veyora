/**
 * VEYORA Enterprise SaaS — Automated CLI Integration Test Runner
 * Validates all 20 architectural phases and endpoints in-process and via API
 */

import { createApp } from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { testingService } from '../backend/src/services/testing.service.js';
import { User, Workspace } from '../backend/src/models/index.js';
import http from 'http';

async function runCliIntegrationTests() {
  console.log('\n============================================================');
  console.log('🚀 VEYORA Enterprise SaaS — Phase 20 Integration Test Runner');
  console.log('============================================================\n');

  // Initialize DB and in-process server if not running
  await connectDB();
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const BASE_URL = `http://127.0.0.1:${port}/api/v1`;

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    process.stdout.write(`• Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  };

  try {
    // 1. System Health Check
    await test('System Health & DB Connection', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.data?.service && !data.service) throw new Error('Health check missing service info');
    });

    // 2. Authentication Login
    let token = '';
    let workspaceId = '';
    await test('Authentication & Token Provisioning', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sec.admin@veyora.internal',
          password: 'VeyoraSec2026!',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      token = data.data?.accessToken;
      workspaceId = data.data?.workspace?._id;
      if (!token) throw new Error('Missing access token');
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Workspace-Id': workspaceId,
      'Content-Type': 'application/json',
    };

    // 3. Multi-Tenant Workspace Verification
    await test('Tenant Scoping & Workspace Query', async () => {
      const res = await fetch(`${BASE_URL}/workspaces/current`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    // 4. Client REST Operations
    let clientId = '';
    await test('Client Record Creation & Verification', async () => {
      const res = await fetch(`${BASE_URL}/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `CLI Test Client ${Date.now()}`,
          company: 'Automated CLI Systems',
          email: `cli-${Date.now()}@test.internal`,
          status: 'active',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      clientId = data.data?.client?._id;
    });

    // 5. Security Posture Check
    await test('Security Hardening & Posture Matrix Score', async () => {
      const res = await fetch(`${BASE_URL}/security/posture`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.data?.overallScore < 80) throw new Error('Security score below threshold');
    });

    // 6. Full Integration Test Suite Execution via API
    await test('Automated Backend Integration Test Suite (All 14 Vectors)', async () => {
      const res = await fetch(`${BASE_URL}/testing/run`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const failedCases = data.data?.testCases?.filter((t) => t.status === 'failed') || [];
      if (failedCases.length > 0) {
        failedCases.forEach((fc) => console.log(`\n    -> Failed Vector: [${fc.category}] ${fc.name}: ${fc.error}`));
        throw new Error(`${failedCases.length} assertions failed in test runner`);
      }
    });

    // 7. Scenario Simulation Execution
    await test('End-to-End Scenario Simulation (Billing Lifecycle)', async () => {
      const res = await fetch(`${BASE_URL}/testing/scenario`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ scenarioType: 'client_billing_lifecycle' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.data?.status !== 'success') throw new Error('Scenario did not succeed');
    });

    // 8. Performance & Latency Benchmarking
    await test('Performance & Query Latency Benchmark', async () => {
      const res = await fetch(`${BASE_URL}/testing/benchmarks`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.data?.latencyMs?.p50 > 250) throw new Error('P50 query latency above 250ms threshold');
    });

    // 9. Webhooks & Event Automation Engine (Phase 22)
    let webhookSubId = '';
    await test('Outbound Webhook Subscriptions & HMAC Signing (Phase 22)', async () => {
      const createRes = await fetch(`${BASE_URL}/webhooks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'CLI Test Webhook Subscription',
          url: 'https://webhook.internal.veyora/cli-test',
          events: ['invoice.paid', 'client.created'],
        }),
      });
      if (!createRes.ok) throw new Error(`Create Webhook HTTP ${createRes.status}`);
      const createData = await createRes.json();
      webhookSubId = createData.data?.subscription?._id;
      if (!createData.data?.subscription?.secret?.startsWith('whsec_')) {
        throw new Error('Webhook missing HMAC signing secret');
      }

      // Check metrics
      const metricsRes = await fetch(`${BASE_URL}/webhooks/metrics`, { headers });
      if (!metricsRes.ok) throw new Error(`Metrics HTTP ${metricsRes.status}`);

      // Cleanup webhook
      if (webhookSubId) {
        await fetch(`${BASE_URL}/webhooks/${webhookSubId}`, {
          method: 'DELETE',
          headers,
        });
      }
    });

    // 10. Workflow Automation Engine (Phase 23)
    let workflowRuleId = '';
    await test('Workflow Automation Engine & Trigger-Action Execution (Phase 23)', async () => {
      const createRes = await fetch(`${BASE_URL}/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'CLI E2E Auto-Onboard Test Rule',
          description: 'Automated test rule for integration suite verification',
          trigger: {
            event: 'client.created',
            conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
          },
          actions: [
            {
              type: 'create_task',
              params: {
                title: 'Onboarding Sprint for {{name}}',
                priority: 'urgent',
                dueInDays: 3,
              },
            },
            {
              type: 'send_notification',
              params: {
                title: 'New Client Alert',
                message: 'Profile created for {{name}}',
                type: 'client',
              },
            },
          ],
        }),
      });
      if (!createRes.ok) throw new Error(`Create Workflow Rule HTTP ${createRes.status}`);
      const createData = await createRes.json();
      workflowRuleId = createData.data?.rule?._id;

      // Run simulation test
      const simRes = await fetch(`${BASE_URL}/workflows/${workflowRuleId}/test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          testPayload: { name: 'Acme CLI Test Corp', status: 'active' },
        }),
      });
      if (!simRes.ok) throw new Error(`Workflow Simulation HTTP ${simRes.status}`);
      const simData = await simRes.json();
      if (simData.data?.result?.status !== 'success') {
        console.log('\n    -> SIMULATION DEBUG RESULT:', JSON.stringify(simData.data?.result, null, 2));
        throw new Error(`Simulation status was ${simData.data?.result?.status}`);
      }

      // Check workflow metrics
      const metricsRes = await fetch(`${BASE_URL}/workflows/metrics`, { headers });
      if (!metricsRes.ok) throw new Error(`Workflow Metrics HTTP ${metricsRes.status}`);

      // Cleanup workflow rule
      if (workflowRuleId) {
        await fetch(`${BASE_URL}/workflows/${workflowRuleId}`, {
          method: 'DELETE',
          headers,
        });
      }
    });

    // Cleanup Client
    if (clientId) {
      await fetch(`${BASE_URL}/clients/${clientId}`, {
        method: 'DELETE',
        headers,
      });
    }

    server.close();

    console.log('\n------------------------------------------------------------');
    console.log(`📊 Test Execution Summary: ${passed} Passed | ${failed} Failed`);
    console.log(`✨ Status: ${failed === 0 ? 'ALL INTEGRATION SUITES GREEN' : 'VERIFICATION FAILURES DETECTED'}`);
    console.log('------------------------------------------------------------\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('\n💥 Critical Test Suite Exception:', err);
    server.close();
    process.exit(1);
  }
}

runCliIntegrationTests();
