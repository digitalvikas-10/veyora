import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  FileText,
  DollarSign,
  Briefcase,
  FolderOpen,
  Send,
  PenTool,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  Eye,
  Lock,
  Sparkles,
  Users,
} from 'lucide-react';

export function ClientPortalManager() {
  const { clients, fetchInitialData } = useData();
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useUI();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState('overview'); // 'overview' | 'proposals' | 'invoices' | 'projects' | 'documents' | 'feedback'

  // Signing Modal State
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerTitle, setSignerTitle] = useState('Chief Executive Officer');
  const [isSigning, setIsSigning] = useState(false);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [isPaying, setIsPaying] = useState(false);

  // Share Link State
  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Feedback State
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Auto-select first client
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0]._id);
    }
  }, [clients, selectedClientId]);

  // Fetch Portal Data
  const loadPortalData = useCallback(async (clientId) => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await api.get(`/portal/preview/${clientId}`);
      const data = res?.data?.data || res?.data || null;
      setPortalData(data);
    } catch (err) {
      console.warn('Error loading portal data:', err);
      addToast({
        type: 'error',
        title: 'Portal Preview Note',
        message: err.response?.data?.message || 'Could not fetch client portal preview',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedClientId) {
      loadPortalData(selectedClientId);
    }
  }, [selectedClientId, loadPortalData]);

  // Handle Generate Share Link
  const handleGenerateShareLink = async () => {
    if (!selectedClientId) return;
    setIsGeneratingLink(true);
    try {
      const res = await api.post(`/portal/generate-link/${selectedClientId}`, { expiresInDays: 30 });
      const data = res?.data?.data || res?.data;
      setGeneratedLinkData(data);
      setShareLinkModalOpen(true);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Link Generation Failed',
        message: err.message || 'Could not generate secure portal link',
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLinkData?.token) return;
    const fullUrl = `${window.location.origin}/portal/${selectedClientId}?token=${generatedLinkData.token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'Portal link copied with secure HMAC token verification.',
    });
  };

  // Handle Sign Proposal
  const handleSignProposal = async (e) => {
    e.preventDefault();
    if (!selectedProposal?._id || !signerName || !signerEmail) return;
    setIsSigning(true);
    try {
      await api.post(`/portal/proposals/${selectedProposal._id}/sign`, {
        signerName,
        signerEmail,
        signerTitle,
        signatureDataUrl: `SIG-${signerName.toUpperCase().replace(/\s+/g, '_')}-${Date.now()}`,
      });
      addToast({
        type: 'success',
        title: 'Proposal Signed!',
        message: `Proposal ${selectedProposal.proposalNumber} has been accepted and legally signed.`,
      });
      setSigningModalOpen(false);
      loadPortalData(selectedClientId);
      fetchInitialData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Signing Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSigning(false);
    }
  };

  // Handle Pay Invoice
  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!selectedInvoice?._id) return;
    setIsPaying(true);
    try {
      const res = await api.post(`/portal/invoices/${selectedInvoice._id}/pay`, {
        paymentMethod,
        paymentReference: `SIM-TXN-${Date.now().toString(36).toUpperCase()}`,
        amountPaid: selectedInvoice.total,
      });
      const data = res?.data?.data || res?.data;
      addToast({
        type: 'success',
        title: 'Payment Confirmed!',
        message: `Invoice ${selectedInvoice.invoiceNumber} paid successfully. Receipt: ${data?.receiptNumber || 'N/A'}`,
      });
      setPaymentModalOpen(false);
      loadPortalData(selectedClientId);
      fetchInitialData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Payment Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setIsPaying(false);
    }
  };

  // Handle Send Feedback
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage) return;
    setIsSendingFeedback(true);
    try {
      await api.post('/portal/feedback', {
        clientId: selectedClientId,
        workspaceId: currentWorkspace?._id,
        subject: feedbackSubject || 'Client Portal Inquiry',
        message: feedbackMessage,
        senderName: portalData?.client?.name,
        senderEmail: portalData?.client?.email,
      });
      addToast({
        type: 'success',
        title: 'Message Delivered',
        message: 'Your message was sent to the operations team dashboard.',
      });
      setFeedbackSubject('');
      setFeedbackMessage('');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delivery Failed',
        message: err.message,
      });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <div id="phase-24-client-portal" className="space-y-6">
      {/* Module Title Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            Client Self-Service & Public Portal
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Client Portal & Digital Contract Hub
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Token-secured client-facing experience. External clients can review deliverable milestones, digitally sign proposals, settle invoices with instant receipts, download brand assets, and dispatch direct feedback.
          </p>
        </div>

        {/* Portal Client Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-400">Client View:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-medium text-neutral-200 focus:outline-none cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id} className="bg-neutral-900 text-neutral-200">
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateShareLink}
            disabled={isGeneratingLink || !selectedClientId}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Share Public Link
          </button>

          <button
            onClick={() => loadPortalData(selectedClientId)}
            disabled={loading}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
            title="Refresh Portal State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulated Client Portal Frame */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Browser Mock Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <div className="ml-3 bg-neutral-950 px-3 py-1 rounded-md border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>https://veyora.app/portal/{selectedClientId ? selectedClientId.substring(0, 10) + '...' : 'demo'}</span>
              <span className="text-emerald-400 font-bold ml-1">● VERIFIED CLIENT</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-neutral-400 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              {portalData?.workspace?.name || 'VEYORA Workspace'}
            </span>
          </div>
        </div>

        {/* Portal Body */}
        <div className="p-6 md:p-8 space-y-8 bg-neutral-950/60">
          {/* Client Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-neutral-800/80">
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Client Self-Service Dashboard
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-100 tracking-tight">
                Welcome, {portalData?.client?.name || 'Valued Client'}
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                {portalData?.client?.company ? `${portalData.client.company} • ` : ''}
                {portalData?.client?.email || 'client@example.com'} • Primary Currency: {portalData?.client?.currency || 'USD'}
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Active Projects</div>
                <div className="text-lg font-bold text-neutral-100 mt-0.5">
                  {portalData?.stats?.activeProjects || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Pending Proposals</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  {portalData?.stats?.pendingProposals || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Due Invoices</div>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">
                  {portalData?.stats?.outstandingInvoices || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Balance Due</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  ${(portalData?.stats?.outstandingBalance || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Portal Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'proposals', label: `Proposals (${portalData?.proposals?.length || 0})`, icon: FileText },
              { id: 'invoices', label: `Invoices & Billing (${portalData?.invoices?.length || 0})`, icon: DollarSign },
              { id: 'projects', label: `Projects & Milestones (${portalData?.projects?.length || 0})`, icon: Briefcase },
              { id: 'documents', label: `Document Vault (${portalData?.documents?.length || 0})`, icon: FolderOpen },
              { id: 'feedback', label: 'Direct Support', icon: Send },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activePortalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePortalTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    active
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-neutral-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activePortalTab === 'overview' && (
            <div className="space-y-6">
              {/* Alert for Pending Actions */}
              {(portalData?.stats?.pendingProposals > 0 || portalData?.stats?.outstandingInvoices > 0) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-neutral-100">
                      Action Items Require Your Attention
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                      You have {portalData?.stats?.pendingProposals || 0} pending proposal awaiting signature and {portalData?.stats?.outstandingInvoices || 0} invoice ready for review and payment.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {portalData?.stats?.pendingProposals > 0 && (
                      <button
                        onClick={() => setActivePortalTab('proposals')}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer"
                      >
                        Review Proposals
                      </button>
                    )}
                    {portalData?.stats?.outstandingInvoices > 0 && (
                      <button
                        onClick={() => setActivePortalTab('invoices')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer"
                      >
                        Pay Invoices
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Active Deliverables & Milestones Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Proposals */}
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Proposals & Contracts
                    </h3>
                    <button
                      onClick={() => setActivePortalTab('proposals')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {portalData?.proposals?.slice(0, 3).map((p) => (
                      <div
                        key={p._id}
                        className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-200">{p.title}</div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {p.proposalNumber} • ${(p.totalAmount || 0).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            p.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                    {(!portalData?.proposals || portalData.proposals.length === 0) && (
                      <div className="text-center py-4 text-xs text-neutral-400">No proposals available.</div>
                    )}
                  </div>
                </div>

                {/* Recent Invoices */}
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Invoices & Statements
                    </h3>
                    <button
                      onClick={() => setActivePortalTab('invoices')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {portalData?.invoices?.slice(0, 3).map((inv) => (
                      <div
                        key={inv._id}
                        className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-200">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Total: ${(inv.total || 0).toLocaleString()} • Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    ))}
                    {(!portalData?.invoices || portalData.invoices.length === 0) && (
                      <div className="text-center py-4 text-xs text-neutral-400">No invoices issued.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSALS & SIGNING */}
          {activePortalTab === 'proposals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-100">Client Proposals & Scope of Work</h3>
                <span className="text-xs text-neutral-400">Click any document to inspect or digitally execute</span>
              </div>

              <div className="space-y-3">
                {portalData?.proposals?.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-100">{prop.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              prop.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 font-mono mt-1">
                          Ref: {prop.proposalNumber} • Valid Until: {new Date(prop.validUntil).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-neutral-400 font-medium">Contract Value</div>
                          <div className="text-base font-extrabold text-neutral-100">
                            ${(prop.totalAmount || 0).toLocaleString()} {prop.currency || 'USD'}
                          </div>
                        </div>

                        {prop.status !== 'accepted' ? (
                          <button
                            onClick={() => {
                              setSelectedProposal(prop);
                              setSignerName(portalData?.client?.name || '');
                              setSignerEmail(portalData?.client?.email || '');
                              setSigningModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            Review & Sign
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <ShieldCheck className="w-4 h-4" />
                            Signed by {prop.signedBy?.name || 'Client'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scope Items */}
                    {prop.items && prop.items.length > 0 && (
                      <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80">
                        <div className="text-[11px] font-semibold text-neutral-400 uppercase mb-2">Scope Deliverables</div>
                        <div className="space-y-1.5">
                          {prop.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-neutral-300">
                              <span>• {it.description || `Deliverable Phase ${idx + 1}`}</span>
                              <span className="font-mono text-neutral-400">${(it.amount || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!portalData?.proposals || portalData.proposals.length === 0) && (
                  <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                    No proposals currently associated with your account.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INVOICES & PAYMENTS */}
          {activePortalTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-100">Invoices & Financial Statements</h3>
                <span className="text-xs text-neutral-400">Secure 256-bit encrypted checkout simulator</span>
              </div>

              <div className="space-y-3">
                {portalData?.invoices?.map((inv) => (
                  <div
                    key={inv._id}
                    className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-neutral-100">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Issued: {new Date(inv.issueDate).toLocaleDateString()} • Due: {new Date(inv.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <div className="text-[11px] text-neutral-400">Total Amount</div>
                        <div className="text-base font-extrabold text-neutral-100">
                          ${(inv.total || 0).toLocaleString()} {inv.currency || 'USD'}
                        </div>
                      </div>

                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Online Now
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Settled & Paid
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!portalData?.invoices || portalData.invoices.length === 0) && (
                  <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                    No invoices generated yet for this client.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS & MILESTONES */}
          {activePortalTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-100">Active Projects & Delivery Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalData?.projects?.map((proj) => (
                  <div key={proj._id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-neutral-100">{proj.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{proj.description || 'Deliverables and scope tracking.'}</p>
                    
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Sprint Completion</span>
                        <span className="font-semibold text-neutral-200">{proj.progress || 65}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${proj.progress || 65}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!portalData?.projects || portalData.projects.length === 0) && (
                  <div className="col-span-2 p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                    No active projects found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENT VAULT */}
          {activePortalTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-100">Shared Project Assets & Deliverables</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {portalData?.documents?.map((doc) => (
                  <div key={doc._id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-neutral-200 truncate">{doc.name}</div>
                        <div className="text-[10px] text-neutral-400">{doc.category || 'Asset'} • {Math.round((doc.size || 24000) / 1024)} KB</div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToast({ type: 'info', title: 'Asset Download', message: `Downloading ${doc.name}...` })}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {(!portalData?.documents || portalData.documents.length === 0) && (
                  <div className="col-span-3 p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                    No shared documents in client repository.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FEEDBACK & SUPPORT */}
          {activePortalTab === 'feedback' && (
            <div className="max-w-xl mx-auto p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-100">Send Direct Message to Operations Team</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Submit questions, milestone revisions, or project inquiries directly into the team dashboard.</p>
              </div>

              <form onSubmit={handleSendFeedback} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    placeholder="e.g. Scope adjustment for Sprint 2"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Write your note or question here..."
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingFeedback || !feedbackMessage}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingFeedback ? 'Dispatching Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* SIGNING MODAL */}
      {signingModalOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-100">Sign Contract & Proposal</h3>
              </div>
              <button
                onClick={() => setSigningModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 space-y-1">
              <div><span className="font-semibold text-neutral-400">Proposal:</span> {selectedProposal.title} ({selectedProposal.proposalNumber})</div>
              <div><span className="font-semibold text-neutral-400">Total Value:</span> ${(selectedProposal.totalAmount || 0).toLocaleString()} {selectedProposal.currency || 'USD'}</div>
            </div>

            <form onSubmit={handleSignProposal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Signer Title / Role</label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Signature Visual Preview */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-indigo-500/30 text-center">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-mono">Digital Signature Signature Style</div>
                <div className="font-serif italic text-2xl text-indigo-300 tracking-wider">
                  {signerName || 'Signature Preview'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-2">
                  Timestamp: {new Date().toISOString()} • IP: Authenticated
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSigningModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigning}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {isSigning ? 'Authorizing & Signing...' : 'Legally Execute Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">Pay Invoice Online</h3>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-100">{selectedInvoice.invoiceNumber}</div>
                <div className="text-[11px] text-neutral-400">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400 font-medium">Payable Amount</div>
                <div className="text-base font-extrabold text-emerald-400">
                  ${(selectedInvoice.total || 0).toLocaleString()} {selectedInvoice.currency || 'USD'}
                </div>
              </div>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'credit_card', label: 'Credit Card' },
                    { id: 'bank_transfer', label: 'ACH / Wire' },
                    { id: 'stripe', label: 'Stripe Pay' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Card / Account Reference</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">CVC / CVI</label>
                  <input
                    type="text"
                    defaultValue="888"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {isPaying ? 'Processing Settlement...' : `Confirm Payment of $${(selectedInvoice.total || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE LINK MODAL */}
      {shareLinkModalOpen && generatedLinkData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-100">Client Portal Share Link</h3>
              </div>
              <button
                onClick={() => setShareLinkModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This tokenized URL grants <span className="text-neutral-100 font-bold">{generatedLinkData.clientName}</span> direct, secure access to view active projects, digitally execute contracts, and settle invoices.
            </p>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-400 truncate">
                {window.location.origin}/portal/{selectedClientId}?token={generatedLinkData.token?.substring(0, 16)}...
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Token validity: 30 days • Revocable by workspace admin
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
