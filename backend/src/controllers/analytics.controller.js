import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Client, Project, Task, Invoice, AuditLog } from '../models/index.js';

/**
 * @desc Get aggregated Executive Dashboard Analytics
 * @route GET /api/v1/analytics/dashboard
 * @access Protected (WORKSPACE_READ)
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { timeframe = '6m' } = req.query;

  // 1. Fetch live workspace data in parallel
  const [clients, projects, tasks, invoices, auditLogs] = await Promise.all([
    Client.find({ workspaceId: wsId }),
    Project.find({ workspaceId: wsId }).populate('clientId', 'name company'),
    Task.find({ workspaceId: wsId }),
    Invoice.find({ workspaceId: wsId }).populate('clientId', 'name company'),
    AuditLog.find({ workspaceId: wsId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('userId', 'name email role avatarUrl'),
  ]);

  // 2. Financial Metrics Calculation
  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  const now = new Date();

  // AR Aging Buckets
  const aging = {
    current: { label: '0-30 Days', amount: 0, count: 0 },
    days31to60: { label: '31-60 Days', amount: 0, count: 0 },
    days61to90: { label: '61-90 Days', amount: 0, count: 0 },
    days90Plus: { label: '90+ Days Overdue', amount: 0, count: 0 },
  };

  invoices.forEach((inv) => {
    const invTotal = inv.totalAmount || 0;
    const invPaid = inv.amountPaid || 0;
    const invBalance = inv.balanceDue !== undefined ? inv.balanceDue : (invTotal - invPaid);

    totalInvoiced += invTotal;
    totalCollected += invPaid;
    totalOutstanding += invBalance;

    const dueDate = new Date(inv.dueDate || inv.createdAt);
    const diffDays = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

    if (invBalance > 0) {
      if (inv.status === 'overdue' || diffDays > 0) {
        overdueAmount += invBalance;
        overdueCount++;
      }

      if (diffDays <= 30) {
        aging.current.amount += invBalance;
        aging.current.count++;
      } else if (diffDays <= 60) {
        aging.days31to60.amount += invBalance;
        aging.days31to60.count++;
      } else if (diffDays <= 90) {
        aging.days61to90.amount += invBalance;
        aging.days61to90.count++;
      } else {
        aging.days90Plus.amount += invBalance;
        aging.days90Plus.count++;
      }
    }
  });

  // Fallback defaults for empty newly-provisioned demo workspace
  const baselineInvoiced = totalInvoiced;
  const baselineCollected = totalCollected;
  const baselineOutstanding = totalOutstanding;
  const baselineOverdue = overdueAmount;

  // 3. Project Status Breakdown
  const projectStats = {
    total: projects.length,
    planning: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    on_hold: 0,
  };

  projects.forEach((p) => {
    if (projectStats[p.status] !== undefined) {
      projectStats[p.status]++;
    } else {
      projectStats.in_progress++;
    }
  });

  // 4. Task & Sprint Velocity Breakdown
  const taskStats = {
    total: tasks.length,
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    byPriority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    totalLoggedHours: 0,
    estimatedHours: 0,
  };

  tasks.forEach((t) => {
    if (taskStats[t.status] !== undefined) taskStats[t.status]++;
    if (taskStats.byPriority[t.priority] !== undefined) taskStats.byPriority[t.priority]++;
    taskStats.totalLoggedHours += (t.loggedHours || 0);
    taskStats.estimatedHours += (t.estimatedHours || 0);
  });

  // 5. Client Status Breakdown
  const clientStats = {
    total: clients.length,
    active: 0,
    lead: 0,
    churned: 0,
    inactive: 0,
  };

  clients.forEach((c) => {
    if (clientStats[c.status] !== undefined) clientStats[c.status]++;
    else clientStats.active++;
  });

  // 6. Revenue Trend Timeline
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = now.getMonth();
  const monthsCount = timeframe === '30d' ? 4 : timeframe === '90d' ? 3 : timeframe === '1y' ? 12 : 6;

  const revenueTrend = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

    // Calculate actual invoices in this month if available
    let monthInvoiced = 0;
    let monthCollected = 0;

    invoices.forEach((inv) => {
      const invDate = new Date(inv.issueDate || inv.createdAt);
      if (invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear()) {
        monthInvoiced += (inv.totalAmount || 0);
        monthCollected += (inv.amountPaid || 0);
      }
    });

    revenueTrend.push({
      month: monthLabel,
      invoiced: monthInvoiced,
      collected: monthCollected,
      projectedTarget: Math.round(monthInvoiced * 1.15),
      profitMargin: Math.round(monthCollected * 0.42),
    });
  }

  // 7. Top Clients Ranking
  const topClients = clients.slice(0, 5).map((c) => {
    const clientInvoices = invoices.filter((inv) => String(inv.clientId?._id || inv.clientId) === String(c._id));
    const billed = clientInvoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const clientProjects = projects.filter((p) => String(p.clientId?._id || p.clientId) === String(c._id));

    return {
      id: c._id,
      name: c.name,
      company: c.company || c.name,
      tier: c.billingInfo?.tier || 'Tier 1',
      status: c.status,
      totalBilled: billed,
      activeProjectsCount: clientProjects.length,
      healthScore: 100,
    };
  });

  // 8. Construct Unified Analytics Payload
  const analyticsData = {
    timeframe,
    lastUpdated: now.toISOString(),
    kpis: {
      totalInvoiced: baselineInvoiced,
      invoicedChange: '0%',
      totalCollected: baselineCollected,
      collectedChange: '0%',
      totalOutstanding: baselineOutstanding,
      outstandingChange: '0%',
      overdueAmount: baselineOverdue,
      overdueCount,
      activeClients: clientStats.active,
      totalClients: clientStats.total,
      activeProjects: projectStats.in_progress + projectStats.planning,
      totalProjects: projectStats.total,
      openTasks: taskStats.todo + taskStats.in_progress,
      totalTasks: taskStats.total,
      billableHours: taskStats.totalLoggedHours,
      completionRate: taskStats.total > 0 ? Math.round(((taskStats.completed || 0) / taskStats.total) * 100) : 0,
    },
    revenueTrend,
    arAging: [
      { bucket: '0-30 Days', amount: aging.current.amount, count: aging.current.count, color: '#6366f1' },
      { bucket: '31-60 Days', amount: aging.days31to60.amount, count: aging.days31to60.count, color: '#38bdf8' },
      { bucket: '61-90 Days', amount: aging.days61to90.amount, count: aging.days61to90.count, color: '#fbbf24' },
      { bucket: '90+ Days', amount: aging.days90Plus.amount, count: aging.days90Plus.count, color: '#f43f5e' },
    ],
    projectDistribution: [
      { name: 'In Progress', count: projectStats.in_progress, color: '#6366f1' },
      { name: 'Review', count: projectStats.review, color: '#38bdf8' },
      { name: 'Planning', count: projectStats.planning, color: '#a855f7' },
      { name: 'Completed', count: projectStats.completed, color: '#10b981' },
      { name: 'On Hold', count: projectStats.on_hold, color: '#f59e0b' },
    ],
    taskPriorityDistribution: [
      { priority: 'Urgent', count: taskStats.byPriority.urgent, color: '#f43f5e' },
      { priority: 'High', count: taskStats.byPriority.high, color: '#f97316' },
      { priority: 'Medium', count: taskStats.byPriority.medium, color: '#fbbf24' },
      { priority: 'Low', count: taskStats.byPriority.low, color: '#94a3b8' },
    ],
    topClients,
    recentAuditLogs: auditLogs.map((log) => ({
      _id: log._id,
      action: log.action,
      entityType: log.entityType,
      details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}),
      createdAt: log.createdAt,
      userId: log.userId ? { name: log.userId.name, role: log.userId.role } : { name: log.actorName || 'System', role: 'admin' },
    })),
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Dashboard analytics retrieved successfully', analyticsData)
  );
});
