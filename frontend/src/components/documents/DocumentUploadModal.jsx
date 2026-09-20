import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  HardDrive,
} from 'lucide-react';
import { formatBytes } from './documentUtils';

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadFile,
  onCreateUrlDocument,
  clients = [],
  projects = [],
}) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'link'

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileCategory, setFileCategory] = useState('deliverable');
  const [fileClientId, setFileClientId] = useState('');
  const [fileProjectId, setFileProjectId] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // External URL State
  const [urlTitle, setUrlTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [urlCategory, setUrlCategory] = useState('design');
  const [urlClientId, setUrlClientId] = useState('');
  const [urlProjectId, setUrlProjectId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (!fileTitle) {
      // Clean up base name for title
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setFileTitle(cleanTitle);
    }
    setError('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'file') {
        if (!selectedFile) {
          setError('Please select or drop a file to upload');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', fileTitle.trim() || selectedFile.name);
        formData.append('category', fileCategory);
        if (fileClientId) formData.append('clientId', fileClientId);
        if (fileProjectId) formData.append('projectId', fileProjectId);

        await onUploadFile(formData);
      } else {
        // External link validation
        if (!urlLink.trim()) {
          setError('Please provide a valid cloud asset URL');
          setIsSubmitting(false);
          return;
        }
        if (!urlTitle.trim()) {
          setError('Please enter a descriptive document title');
          setIsSubmitting(false);
          return;
        }

        const payload = {
          title: urlTitle.trim(),
          fileName: urlTitle.trim().toLowerCase().replace(/\s+/g, '-') + '.url',
          fileUrl: urlLink.trim(),
          fileSize: 0,
          mimeType: 'text/uri-list',
          category: urlCategory,
          clientId: urlClientId || undefined,
          projectId: urlProjectId || undefined,
        };

        await onCreateUrlDocument(payload);
      }

      onClose();
      // Reset form
      setSelectedFile(null);
      setFileTitle('');
      setUrlTitle('');
      setUrlLink('');
    } catch (err) {
      setError(err.message || 'Failed to complete document operation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter projects by selected client if any
  const availableProjects = (activeTab === 'file' ? fileClientId : urlClientId)
    ? projects.filter(
        (p) =>
          (p.clientId?._id || p.clientId) ===
          (activeTab === 'file' ? fileClientId : urlClientId)
      )
    : projects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Add Workspace Document / Asset
              </h3>
              <p className="text-xs text-neutral-400">
                Upload deliverable files or link external design/cloud resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40">
          <button
            type="button"
            onClick={() => {
              setActiveTab('file');
              setError('');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Upload File Asset</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('link');
              setError('');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Cloud Resource Link</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            /* TAB 1: File Upload */
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-neutral-200">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {formatBytes(selectedFile.size)} • Click or drop to replace
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-medium text-neutral-200">
                      <span className="text-indigo-400 font-semibold">Click to browse</span> or drag and drop files
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      PDF, Images, ZIP archives, Office docs, code bundles (up to 25 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Document Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="e.g. Master Service Agreement v2.1"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Document Category
                </label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="deliverable">Deliverable (Final Work Product)</option>
                  <option value="contract">Contract & Legal Agreement</option>
                  <option value="design">Design Asset & Mockup</option>
                  <option value="invoice">Invoice / Billing Documentation</option>
                  <option value="brief">Project Brief & Requirements</option>
                  <option value="asset">Resource Pack / Media Asset</option>
                  <option value="other">Other Attachment</option>
                </select>
              </div>

              {/* Client & Project Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Assign to Client
                  </label>
                  <select
                    value={fileClientId}
                    onChange={(e) => {
                      setFileClientId(e.target.value);
                      setFileProjectId('');
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">General / Internal Asset</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Linked Project
                  </label>
                  <select
                    value={fileProjectId}
                    onChange={(e) => setFileProjectId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">No Project Linked</option>
                    {availableProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: External Cloud Link */
            <div className="space-y-4">
              {/* Asset URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Cloud Asset URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={urlLink}
                    onChange={(e) => setUrlLink(e.target.value)}
                    placeholder="https://figma.com/file/... or https://drive.google.com/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Works with Figma, Google Drive, Dropbox, Loom, GitHub, Notion, etc.
                </p>
              </div>

              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Resource Name / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="e.g. Figma Design System & Wireframes"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Resource Category
                </label>
                <select
                  value={urlCategory}
                  onChange={(e) => setUrlCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="design">Design Asset (Figma / Adobe XD / Sketch)</option>
                  <option value="deliverable">Deliverable / Prototype</option>
                  <option value="brief">Project Brief & Documentation</option>
                  <option value="contract">Legal Agreement / NDA</option>
                  <option value="asset">Resource Pack</option>
                  <option value="other">Other External Link</option>
                </select>
              </div>

              {/* Client & Project Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Assign to Client
                  </label>
                  <select
                    value={urlClientId}
                    onChange={(e) => {
                      setUrlClientId(e.target.value);
                      setUrlProjectId('');
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">General / Internal Asset</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Linked Project
                  </label>
                  <select
                    value={urlProjectId}
                    onChange={(e) => setUrlProjectId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">No Project Linked</option>
                    {availableProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving Asset...'
                  : activeTab === 'file'
                  ? 'Upload & Save'
                  : 'Register Link'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
