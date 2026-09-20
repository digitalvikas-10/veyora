import React from 'react';
import {
  ExternalLink,
  Download,
  Trash2,
  Edit2,
  Eye,
  Building2,
  Briefcase,
  User,
} from 'lucide-react';
import { formatBytes, getCategoryBadge, getFileIcon } from './documentUtils';

export default function DocumentTable({
  documents = [],
  onPreview,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <th className="py-3.5 px-4">Document / File</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Client / Project</th>
            <th className="py-3.5 px-4">Size</th>
            <th className="py-3.5 px-4">Uploaded</th>
            <th className="py-3.5 px-4">By</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80 text-xs text-neutral-300">
          {documents.map((doc) => {
            const categoryBadge = getCategoryBadge(doc.category);
            const fileIconMeta = getFileIcon(doc.fileName, doc.mimeType);
            const IconComponent = fileIconMeta.icon;
            const isExternalUrl =
              doc.fileUrl?.startsWith('http://') ||
              doc.fileUrl?.startsWith('https://');

            const formattedDate = doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—';

            return (
              <tr
                key={doc._id}
                className="hover:bg-neutral-800/40 transition-colors group"
              >
                {/* File Title & Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${fileIconMeta.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 max-w-xs">
                      <div
                        onClick={() => onPreview(doc)}
                        className="font-bold text-neutral-100 hover:text-indigo-400 cursor-pointer truncate"
                      >
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate font-mono mt-0.5">
                        {doc.fileName}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${categoryBadge.color} uppercase tracking-wider`}
                  >
                    {categoryBadge.label}
                  </span>
                </td>

                {/* Client / Project */}
                <td className="py-3 px-4">
                  <div className="space-y-0.5 max-w-xs truncate">
                    <div className="text-neutral-200 truncate flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span>{doc.clientId?.name || 'Workspace Asset'}</span>
                    </div>
                    {doc.projectId && (
                      <div className="text-[11px] text-indigo-400 truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{doc.projectId?.name}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Size */}
                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                  {formatBytes(doc.fileSize)}
                </td>

                {/* Uploaded Date */}
                <td className="py-3 px-4 whitespace-nowrap text-neutral-400 text-[11px]">
                  {formattedDate}
                </td>

                {/* Uploader */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-300">
                      {doc.uploadedBy?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-neutral-400 text-xs truncate max-w-[90px]">
                      {doc.uploadedBy?.name || 'Staff'}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPreview(doc)}
                      className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Inspect Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={doc.fileName}
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
                      onClick={() => onEdit(doc)}
                      className="p-1.5 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Document"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(doc._id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
