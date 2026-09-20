import React from 'react';
import {
  ExternalLink,
  Download,
  Trash2,
  Edit2,
  Building2,
  Briefcase,
  Calendar,
  Eye,
  User,
  HardDrive,
} from 'lucide-react';
import { formatBytes, getCategoryBadge, getFileIcon } from './documentUtils';

export default function DocumentCard({
  document,
  onPreview,
  onEdit,
  onDelete,
}) {
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
    ? new Date(document.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="group rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md">
      {/* Top Banner & Category */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          {/* Category Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${categoryBadge.color} uppercase tracking-wider`}
          >
            {categoryBadge.label}
          </span>

          {/* Action Icons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onPreview(document)}
              className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Preview / Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={document.fileName}
                className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title={isExternalUrl ? 'Open Link' : 'Download File'}
              >
                {isExternalUrl ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </a>
            )}

            <button
              onClick={() => onEdit(document)}
              className="p-1.5 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Edit Metadata"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(document._id)}
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* File Visual Icon / Image Thumbnail */}
        <div
          onClick={() => onPreview(document)}
          className="mt-3 flex items-start gap-3 cursor-pointer group-hover:translate-x-0.5 transition-transform"
        >
          {isImage && document.fileUrl && !isExternalUrl ? (
            <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={document.fileUrl}
                alt={document.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div
              className={`p-3 rounded-xl border shrink-0 ${fileIconMeta.color}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-neutral-100 truncate group-hover:text-indigo-300 transition-colors">
              {document.title}
            </h4>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
              {document.fileName}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-500">
              <span>{formatBytes(document.fileSize)}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Metadata Tags */}
      <div className="px-4 py-2.5 bg-neutral-950/40 border-t border-neutral-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            <Building2 className="w-3 h-3 text-neutral-500 shrink-0" />
            <span className="truncate">
              {document.clientId?.name || 'Workspace Asset'}
            </span>
          </div>
          {document.projectId && (
            <div className="flex items-center gap-1 text-indigo-400 font-medium truncate max-w-[120px]">
              <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{document.projectId?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Uploader info */}
      <div className="px-4 py-2 bg-neutral-950/70 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[9px] text-neutral-300 font-bold">
            {document.uploadedBy?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-neutral-400">{document.uploadedBy?.name || 'Staff'}</span>
        </div>
        <button
          onClick={() => onPreview(document)}
          className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
