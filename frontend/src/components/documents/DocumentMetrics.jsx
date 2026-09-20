import React from 'react';
import {
  FolderArchive,
  HardDrive,
  FileCheck2,
  FileCode2,
  FileText,
  Palette,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function DocumentMetrics({ documents = [], stats = null }) {
  const totalCount = stats?.totalCount ?? documents.length;
  const totalBytes = stats?.totalBytes ?? documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  // Category counts
  const breakdown = stats?.breakdown || {};
  const deliverableCount =
    breakdown.deliverable?.count ??
    documents.filter((d) => d.category === 'deliverable').length;
  const contractCount =
    breakdown.contract?.count ??
    documents.filter((d) => d.category === 'contract').length;
  const designCount =
    breakdown.design?.count ??
    documents.filter((d) => d.category === 'design').length;
  const assetCount =
    breakdown.asset?.count ??
    documents.filter((d) => d.category === 'asset').length;

  // Storage limit simulation (e.g. 500 MB workspace tier limit)
  const maxTierStorage = 500 * 1024 * 1024; // 500 MB
  const storagePercentage = Math.min(100, Math.round((totalBytes / maxTierStorage) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Files Card */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Total Workspace Assets</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FolderArchive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-neutral-100">{totalCount}</div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span className="text-indigo-400 font-medium">Scattered across</span> {documents.length} records
          </p>
        </div>
      </div>

      {/* Storage Consumed */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Storage Consumption</span>
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-neutral-100">{formatBytes(totalBytes)}</span>
            <span className="text-xs text-neutral-500">/ 500 MB</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, storagePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deliverables & Assets */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Deliverables & Assets</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400">
            {deliverableCount + assetCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            <span className="text-emerald-400 font-medium">{deliverableCount}</span> releases,{' '}
            <span className="text-emerald-400 font-medium">{assetCount}</span> resource packs
          </p>
        </div>
      </div>

      {/* Legal Contracts & Designs */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Contracts & Designs</span>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Palette className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-400">
            {contractCount + designCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            <span className="text-amber-400 font-medium">{contractCount}</span> signed agreements,{' '}
            <span className="text-amber-400 font-medium">{designCount}</span> UI mockups
          </p>
        </div>
      </div>
    </div>
  );
}
