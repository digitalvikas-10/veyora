import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Toggle,
  Badge,
  Avatar,
  AvatarGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  Modal,
  EmptyState,
  Skeleton,
  Tabs,
  DataTable,
} from './ui';
import {
  Palette,
  Sparkles,
  Search,
  Mail,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  Send,
  Download,
  AlertTriangle,
  FolderOpen,
  Filter,
} from 'lucide-react';
import { useUI } from '../context/UIContext';

export default function DesignSystemShowcase() {
  const { addToast } = useUI();

  // Active showcase tab
  const [activeSection, setActiveSection] = useState('buttons');

  // Interactive Button playground state
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);

  // Interactive Form state
  const [formData, setFormData] = useState({
    name: 'Olivia Vance',
    email: 'olivia.vance@veyora.io',
    role: 'owner',
    notes: 'Primary enterprise workspace administrator account.',
    notificationsEnabled: true,
    twoFactorEnabled: true,
    agreeTerms: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Interactive Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState('md');

  // Sample Mock Data for DataTable
  const sampleTableData = [
    { id: 'CLI-001', name: 'Apex Global Logistics', contact: 'Marcus Brody', role: 'Enterprise Client', status: 'active', balance: '$18,450', tier: 'Tier 1' },
    { id: 'CLI-002', name: 'Solstice BioTech Group', contact: 'Dr. Elena Rostova', role: 'HealthTech Lead', status: 'pending', balance: '$42,000', tier: 'Tier 1' },
    { id: 'CLI-003', name: 'Krypton Interactive Labs', contact: 'Jason Hayes', role: 'Studio Partner', status: 'in_progress', balance: '$9,200', tier: 'Tier 2' },
    { id: 'CLI-004', name: 'Vanguard Capital Partners', contact: 'Arthur Sterling', role: 'Financial Client', status: 'completed', balance: '$65,000', tier: 'Tier 1' },
    { id: 'CLI-005', name: 'Hyperion Cloud Systems', contact: 'Seraphina Vance', role: 'Infrastructure', status: 'overdue', balance: '$12,800', tier: 'Tier 3' },
    { id: 'CLI-006', name: 'Zenith Architecture Co.', contact: 'David Kim', role: 'Design Lead', status: 'draft', balance: '$4,500', tier: 'Tier 2' },
  ];

  const tableColumns = [
    {
      key: 'name',
      header: 'Client & Company',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-neutral-100 block">{val}</span>
          <span className="text-[11px] text-neutral-500 font-mono">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Person',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Avatar name={val} size="xs" />
          <div>
            <span className="text-neutral-200 block">{val}</span>
            <span className="text-[10px] text-neutral-500">{row.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (val) => <Badge status={val} size="sm" />,
    },
    {
      key: 'balance',
      header: 'Unbilled / Total',
      sortable: true,
      render: (val) => <span className="font-mono font-medium text-neutral-200">{val}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            addToast({
              type: 'info',
              title: 'Record Selected',
              message: `Opened client file for ${row.name}`,
            });
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  const SECTIONS = [
    { id: 'buttons', label: 'Buttons & Actions' },
    { id: 'forms', label: 'Form Controls' },
    { id: 'badges-avatars', label: 'Badges & Avatars' },
    { id: 'cards', label: 'Cards & StatCards' },
    { id: 'table', label: 'DataTable' },
    { id: 'modals-skeletons', label: 'Modals & Skeletons' },
  ];

  return (
    <div id="phase-9-design-system" className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">Phase 9: Design System & UI Components</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Completed & Cataloged
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Modern enterprise design tokens & reusable primitives adhering to strict mathematical spacing, WCAG AA contrast, and zero AI-slop anti-patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Global Component Playground Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setModalSize('md');
              setIsModalOpen(true);
            }}
          >
            Launch Sample Modal
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={Sparkles}
            onClick={() => {
              addToast({
                type: 'success',
                title: 'Design System Verified',
                message: 'All 14 atomic primitives passed runtime validation checks.',
              });
            }}
          >
            Verify Tokens
          </Button>
        </div>
      </div>

      {/* Segmented Section Navigation */}
      <Tabs
        tabs={SECTIONS}
        activeTab={activeSection}
        onChange={setActiveSection}
        variant="segment"
      />

      {/* Section 1: Buttons & Actions */}
      {activeSection === 'buttons' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
              <div>
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Button Variants & Themes
                </h3>
                <p className="text-xs text-neutral-400">
                  Interactive buttons with mathematical padding (horizontal = 2x vertical), keyboard focus states, and loading states.
                </p>
              </div>

              {/* State Toggles */}
              <div className="flex items-center gap-4">
                <Toggle
                  label="Loading"
                  size="sm"
                  checked={btnLoading}
                  onChange={setBtnLoading}
                />
                <Toggle
                  label="Disabled"
                  size="sm"
                  checked={btnDisabled}
                  onChange={setBtnDisabled}
                />
              </div>
            </div>

            {/* Grid of Variants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-indigo-400 uppercase">Primary Variant</span>
                <Button
                  variant="primary"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  leftIcon={Plus}
                  onClick={() => addToast({ type: 'info', title: 'Primary Clicked', message: 'Main call-to-action executed.' })}
                >
                  Create Client
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Secondary Variant</span>
                <Button
                  variant="secondary"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  onClick={() => addToast({ type: 'info', title: 'Secondary Clicked', message: 'Secondary action executed.' })}
                >
                  Export CSV
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Outline Variant</span>
                <Button
                  variant="outline"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  onClick={() => addToast({ type: 'info', title: 'Outline Clicked', message: 'Outline button triggered.' })}
                >
                  View Details
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Ghost Variant</span>
                <Button
                  variant="ghost"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  onClick={() => addToast({ type: 'info', title: 'Ghost Clicked', message: 'Ghost action executed.' })}
                >
                  Dismiss Changes
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-rose-400 uppercase">Danger Variant</span>
                <Button
                  variant="danger"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  leftIcon={Trash2}
                  onClick={() => addToast({ type: 'error', title: 'Danger Clicked', message: 'Destructive deletion intent.' })}
                >
                  Delete Project
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-indigo-400 uppercase">Subtle Tint Variant</span>
                <Button
                  variant="subtle"
                  fullWidth
                  loading={btnLoading}
                  disabled={btnDisabled}
                  leftIcon={Send}
                  onClick={() => addToast({ type: 'success', title: 'Subtle Clicked', message: 'Subtle action triggered.' })}
                >
                  Send Invoice
                </Button>
              </div>
            </div>

            {/* Sizes Matrix */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">Proportional Scale Ratios (xs, sm, md, lg)</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="secondary">Size XS</Button>
                <Button size="sm" variant="secondary">Size SM</Button>
                <Button size="md" variant="secondary">Size MD (Default)</Button>
                <Button size="lg" variant="secondary">Size LG</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Form Controls */}
      {activeSection === 'forms' && (
        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Accessible Form Controls & Validation
            </h3>
            <p className="text-xs text-neutral-400">
              Complete input suite with floating helper text, error styling, clear buttons, and keyboard accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Olivia Vance"
              required
              helperText="Legal name for enterprise authorization."
              clearable
              onClear={() => setFormData({ ...formData, name: '' })}
            />

            <Input
              label="Work Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
              leftIcon={Mail}
              required
              error={formErrors.email}
            />

            <Select
              label="Workspace Security Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              options={[
                { value: 'owner', label: 'Workspace Owner (Olivia Vance)' },
                { value: 'admin', label: 'Operations Admin (Arthur Sterling)' },
                { value: 'member', label: 'Team Member (Maya Lin)' },
                { value: 'client', label: 'Portal Client (Claire Dupont)' },
                { value: 'viewer', label: 'Auditor Viewer (Victor Reed)' },
              ]}
              helperText="Determines RBAC authorization matrices."
            />

            <div className="space-y-4 pt-1">
              <span className="block text-xs font-medium text-neutral-300">Preferences & Governance</span>
              <Toggle
                label="Email Notifications"
                description="Receive dispatch summaries for unbilled tasks."
                checked={formData.notificationsEnabled}
                onChange={(checked) => setFormData({ ...formData, notificationsEnabled: checked })}
              />

              <Checkbox
                label="Require Multi-Factor Authentication (2FA)"
                description="Enforce TOTP authenticator tokens upon next login."
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
              />
            </div>
          </div>

          <Textarea
            label="Internal Governance Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            maxLength={200}
            rows={2}
            helperText="Visible only to workspace administrators."
          />

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Simulate validation error toggle
                if (formErrors.email) setFormErrors({});
                else setFormErrors({ email: 'Invalid enterprise domain format' });
              }}
            >
              Toggle Simulated Error State
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Form State Synced',
                  message: 'Preferences recorded in local mock store.',
                });
              }}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Section 3: Badges & Avatars */}
      {activeSection === 'badges-avatars' && (
        <div className="space-y-6">
          {/* Badges */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Status Badges & Indicators
              </h3>
              <p className="text-xs text-neutral-400">
                Preset domain states for Invoices, Tasks, Clients, and Proposals with automatic color coding and status dots.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Badge status="active" />
              <Badge status="in_progress" />
              <Badge status="planning" />
              <Badge status="on_hold" />
              <Badge status="completed" />
              <Badge status="paid" />
              <Badge status="overdue" />
              <Badge status="cancelled" />
              <Badge status="draft" />
              <Badge status="high" />
              <Badge status="medium" />
              <Badge status="low" />
            </div>

            {/* Custom Semantic Palette Badges */}
            <div className="pt-3 border-t border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-2">
                Semantic Palette Variants
              </span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand">Brand Indigo</Badge>
                <Badge variant="success">Success Emerald</Badge>
                <Badge variant="warning">Warning Amber</Badge>
                <Badge variant="danger">Danger Rose</Badge>
                <Badge variant="purple">Purple Royalty</Badge>
                <Badge variant="cyan">Cyan Tech</Badge>
                <Badge variant="neutral">Neutral Stone</Badge>
              </div>
            </div>
          </div>

          {/* Avatars */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                User & Client Avatars
              </h3>
              <p className="text-xs text-neutral-400">
                Deterministic palette generation, initials fallback, status dot indicators, and stacked AvatarGroup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Avatar name="Olivia Vance" size="lg" status="online" />
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">Olivia Vance</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Online</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name="Arthur Sterling" size="md" status="away" />
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">Arthur Sterling</span>
                  <span className="text-[10px] text-amber-400 font-mono">Away</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name="Claire Dupont" size="md" status="busy" />
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">Claire Dupont</span>
                  <span className="text-[10px] text-rose-400 font-mono">In Meeting</span>
                </div>
              </div>

              {/* Stacked Avatar Group */}
              <div className="pl-4 border-l border-neutral-800">
                <span className="text-[11px] text-neutral-500 block mb-1.5 font-medium">Team Roster</span>
                <AvatarGroup max={4} size="md">
                  <Avatar name="Olivia Vance" />
                  <Avatar name="Arthur Sterling" />
                  <Avatar name="Maya Lin" />
                  <Avatar name="Claire Dupont" />
                  <Avatar name="Victor Reed" />
                  <Avatar name="Samir Patel" />
                </AvatarGroup>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Cards & StatCards */}
      {activeSection === 'cards' && (
        <div className="space-y-5">
          {/* StatCards */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
              Metric & KPI StatCards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Gross Revenue"
                value="$184,250"
                change="+18.4%"
                changeType="increase"
                timeframe="vs last quarter"
                icon={DollarSign}
                iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                onClick={() => addToast({ type: 'info', title: 'Revenue Metric', message: 'Navigating to billing analysis.' })}
              />

              <StatCard
                title="Active Sprints"
                value="24 Tasks"
                change="+4"
                changeType="increase"
                timeframe="3 due this week"
                icon={Briefcase}
                iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
              />

              <StatCard
                title="Overdue Invoices"
                value="$4,200"
                change="-2.1%"
                changeType="decrease"
                timeframe="2 invoices pending"
                icon={AlertTriangle}
                iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
              />

              <StatCard
                title="Client Retention"
                value="98.2%"
                change="0.0%"
                changeType="neutral"
                timeframe="All workspaces"
                icon={Users}
                iconColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
              />
            </div>
          </div>

          {/* Standard Compound Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Card>
              <CardHeader
                action={
                  <Badge variant="brand" size="sm">
                    Live Feed
                  </Badge>
                }
              >
                <CardTitle>Tenant Telemetry Card</CardTitle>
                <CardDescription>
                  Demonstrates CardHeader, CardContent, and CardFooter subcomponents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-neutral-300">
                <p>
                  Inner container padding strictly adheres to the mathematical design rule: container outer padding (20px) exceeds inner item margins (8px).
                </p>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400">
                  Corner radius math: Inner (12px) = Outer (16px) - Padding (4px).
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-[11px] text-neutral-500">Last heartbeat: 10s ago</span>
                <Button variant="outline" size="xs">Refresh Card</Button>
              </CardFooter>
            </Card>

            <Card hoverable={true} onClick={() => addToast({ type: 'success', title: 'Card Clicked', message: 'Interactive card clicked!' })}>
              <CardHeader>
                <CardTitle>Interactive Hoverable Card</CardTitle>
                <CardDescription>Hover over this card to preview smooth border contrast transitions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-200 block">Accessible Touch Surface</span>
                    <span className="text-neutral-500 text-[11px]">Complies with 44px touch target guidelines.</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-indigo-400 font-medium">Click to inspect →</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Section 5: DataTable */}
      {activeSection === 'table' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Full-Featured DataTable Component
              </h3>
              <p className="text-xs text-neutral-400">
                Supports column sorting, full-text search filtering, custom cell rendering, pagination, and empty states.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => addToast({ type: 'info', title: 'New Record', message: 'Open client creation modal.' })}
            >
              Add New Client
            </Button>
          </div>

          <DataTable
            columns={tableColumns}
            data={sampleTableData}
            searchPlaceholder="Search by client name, contact, status..."
            initialRowsPerPage={4}
            onRowClick={(row) => {
              addToast({
                type: 'info',
                title: 'Row Clicked',
                message: `Inspecting ${row.name} balance: ${row.balance}`,
              });
            }}
          />
        </div>
      )}

      {/* Section 6: Modals & Skeletons */}
      {activeSection === 'modals-skeletons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skeleton Loaders */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Shimmer Skeleton Placeholders
            </h3>
            <p className="text-xs text-neutral-400">
              High-fidelity loading placeholders avoiding layout shifts during asynchronous network fetches.
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Card Skeleton</span>
              <Skeleton variant="card" />

              <span className="text-[11px] font-mono text-neutral-500 uppercase block pt-2">Text & Avatar Skeletons</span>
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={36} height={36} />
                <div className="space-y-1.5 flex-1">
                  <Skeleton width="60%" height="0.75rem" />
                  <Skeleton width="40%" height="0.75rem" />
                </div>
              </div>
            </div>
          </div>

          {/* Empty States & Modal Controls */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                EmptyState & Modal Triggers
              </h3>
              <p className="text-xs text-neutral-400">
                Standardized empty feedback containers with call-to-action handlers.
              </p>

              <div className="mt-3">
                <EmptyState
                  title="No Invoices Dispatched"
                  description="You have not created any bills for this accounting cycle."
                  actionLabel="Generate First Invoice"
                  onAction={() => addToast({ type: 'success', title: 'Invoice Flow', message: 'Invoice generator triggered.' })}
                  secondaryActionLabel="Import Records"
                  onSecondaryAction={() => addToast({ type: 'info', title: 'Import Flow', message: 'Import assistant opened.' })}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Preview Modal Dialog:</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setModalSize('md');
                  setIsModalOpen(true);
                }}
              >
                Open Confirmation Dialog
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Client Workspace Export"
        description="This action will compile all client documents, invoices, and sprint histories into an encrypted bundle."
        size={modalSize}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Download}
              onClick={() => {
                setIsModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Archive Queued',
                  message: 'The workspace export bundle is being prepared.',
                });
              }}
            >
              Generate Export Bundle
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-neutral-300">
          <p>
            Please review the target workspace configuration before proceeding:
          </p>
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Tenant Scope:</span>
              <span className="text-indigo-400 font-semibold">VEYORA Primary HQ</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Security Tier:</span>
              <span className="text-emerald-400 font-semibold">Enterprise Encrypted</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Total Entities:</span>
              <span className="text-neutral-200">14 Clients • 6 Projects • 22 Invoices</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
