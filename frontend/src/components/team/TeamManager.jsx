import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUI } from '../../context/UIContext';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle2,
  Copy,
  Search,
  MoreVertical,
  UserCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

const ROLE_BADGES = {
  owner: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  admin: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  member: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  client: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  viewer: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export function TeamManager() {
  const { currentWorkspace, members, fetchMembers, inviteMember } = useWorkspace();
  const { addToast } = useUI();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let randPassword = 'Veyora#';
    for (let i = 0; i < 6; i++) {
      randPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: randPassword }));
    setShowPassword(true);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const assignedPassword = formData.password.trim() || 'Password@123';

    setIsSubmitting(true);
    try {
      const res = await inviteMember({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: assignedPassword,
      });

      const userCredentials = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        password: assignedPassword,
        role: formData.role,
      };

      setCreatedCredentials(userCredentials);
      addToast({
        type: 'success',
        title: 'Member Account Created',
        message: `Account created for ${formData.email} as ${formData.role.toUpperCase()}`,
      });

      setFormData({ name: '', email: '', password: '', role: 'member' });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.response?.data?.message || err.message || 'Failed to add member to workspace',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Veyora Workspace Member Login Credentials:\nWorkspace: ${currentWorkspace?.name || 'Workspace'}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nRole: ${createdCredentials.role.toUpperCase()}\nLogin URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
    addToast({
      type: 'info',
      title: 'Credentials Copied',
      message: 'Login credentials copied to clipboard.',
    });
  };

  const closeModal = () => {
    setShowInviteModal(false);
    setCreatedCredentials(null);
    setFormData({ name: '', email: '', password: '', role: 'member' });
  };

  const copyInviteLink = (email) => {
    navigator.clipboard.writeText(`${window.location.origin}/login?email=${encodeURIComponent(email)}`);
    addToast({
      type: 'info',
      title: 'Copied Link',
      message: 'Workspace login link copied to clipboard.',
    });
  };

  const filteredMembers = (members || []).filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="section-team-management" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Workspace Roster</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">Team Members & Access Control</h2>
          <p className="text-xs text-neutral-400">
            Manage teammates, send workspace invitations, and assign role-based access levels for{' '}
            <span className="text-neutral-200 font-medium">{currentWorkspace?.name || 'Active Workspace'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMembers()}
            className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition"
            title="Refresh Member Roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add / Invite Member</span>
          </button>
        </div>
      </div>

      {/* Roster Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search teammates by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Showing {filteredMembers.length} of {members.length} member(s)
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Work Email</th>
                <th className="py-3 px-4">Workspace Role</th>
                <th className="py-3 px-4">Joined / Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                    No team members found. Click "Add / Invite Member" to enroll teammates into this workspace.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => {
                  const roleClass = ROLE_BADGES[member.role] || ROLE_BADGES.member;
                  return (
                    <tr key={member._id || member.id || idx} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-100 block">{member.name || 'Team Member'}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">ID: {member._id || 'local'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {member.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${roleClass}`}>
                          <Shield className="w-3 h-3" />
                          {member.role || 'member'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Active Member</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => copyInviteLink(member.email)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-indigo-300 transition text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Workspace Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  {createdCredentials ? 'Teammate Created Successfully' : 'Add Workspace Teammate'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-neutral-500 hover:text-neutral-300 text-xs font-bold p-1 rounded-lg hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {createdCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Teammate User Account Ready for Login</span>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Name:</span>
                      <span className="text-neutral-200">{createdCredentials.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Email:</span>
                      <span className="text-indigo-300">{createdCredentials.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Password:</span>
                      <span className="text-emerald-400 font-bold">{createdCredentials.password}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Role:</span>
                      <span className="text-purple-300 uppercase">{createdCredentials.role}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    The user can now sign into this application directly using these credentials.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? 'Copied to Clipboard' : 'Copy Credentials'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Alex Rivera"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Work Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-300">Login Password</label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Assign login password (min 6 chars)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Set the initial password for this user to log into the application.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Assign RBAC Workspace Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Admin — Full management permissions</option>
                    <option value="member">Member — Standard workspace contributor</option>
                    <option value="viewer">Viewer — Read-only observation access</option>
                    <option value="client">Client — External portal access</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Creating User...' : 'Create Teammate Account'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
