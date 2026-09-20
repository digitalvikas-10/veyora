import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Building2,
  Briefcase,
  Calendar,
  User,
  HardDrive,
  FileText,
  Shield,
  Trash2,
  Edit2,
  FileCheck2,
} from 'lucide-react';
import { formatBytes, getCategoryBadge, getFileIcon } from './documentUtils';

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onEdit,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const categoryBadge = getCategoryBadge(document.category);
  const fileIconMeta = getFileIcon(document.fileName, document.mimeType);
  const IconComponent = fileIconMeta.icon;

  const isImage =
    document.mimeType?.startsWith('image/') ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(document.fileName || '');

  const isExternalUrl =
    document.fileUrl?.startsWith('http://') ||
    document.fileUrl?.startsWith('https://');

  const formattedDate = document.createdAt
    ? new Date(document.createdAt).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const handleCopyLink = () => {
    if (document.fileUrl) {
      const fullUrl = isExternalUrl
        ? document.fileUrl
        : `${window.location.origin}${document.fileUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${fileIconMeta.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-100 truncate max-w-md">
                  {document.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${categoryBadge.color} uppercase tracking-wider`}
                >
                  {categoryBadge.label}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {document.fileName}
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

        {/* Content Body (2-Column Grid) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Asset Preview */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 min-h-[320px] relative overflow-hidden">
            {isImage && document.fileUrl && !isExternalUrl ? (
              <div className="w-full h-full max-h-[420px] flex items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={document.fileUrl}
                  alt={document.title}
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-lg border border-neutral-800"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : isExternalUrl ? (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-200">
                    External Cloud Resource
                  </h4>
                  <p className="text-xs text-neutral-400 break-all font-mono">
                    {document.fileUrl}
                  </p>
                </div>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Resource in New Tab</span>
                </a>
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-sm">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto ${fileIconMeta.color}`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-200">
                    Binary Document Asset
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {formatBytes(document.fileSize)} • {document.mimeType || 'Standard Payload'}
                  </p>
                </div>
                {document.fileUrl && (
                  <a
                    href={document.fileUrl}
                    download={document.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File ({formatBytes(document.fileSize)})</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Metadata Details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Asset Metadata
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-start pb-2 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Category:</span>
                  <span className="font-semibold text-neutral-200 capitalize">
                    {document.category}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-2 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Size:</span>
                  <span className="font-mono text-neutral-200">
                    {formatBytes(document.fileSize)} ({document.fileSize || 0} bytes)
                  </span>
                </div>

                <div className="flex justify-between items-start pb-2 border-b border-neutral-800/80">
                  <span className="text-neutral-400">MIME Type:</span>
                  <span className="font-mono text-neutral-300 truncate max-w-[150px]">
                    {document.mimeType || 'unknown'}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-2 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Uploaded Date:</span>
                  <span className="text-neutral-300 text-right">
                    {formattedDate}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-neutral-400">Uploaded By:</span>
                  <span className="font-semibold text-neutral-200">
                    {document.uploadedBy?.name || 'Staff Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Client & Project Relations */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Associations
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Client:</span>
                  </span>
                  <span className="font-semibold text-neutral-200">
                    {document.clientId?.name || 'Workspace Internal'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Project:</span>
                  </span>
                  <span className="font-semibold text-indigo-400">
                    {document.projectId?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Link Copy */}
            {document.fileUrl && (
              <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-400 font-mono truncate">
                  {document.fileUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(document._id);
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-medium cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Document</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(document);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Metadata</span>
            </button>

            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={document.fileName}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isExternalUrl ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Open External Resource</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
