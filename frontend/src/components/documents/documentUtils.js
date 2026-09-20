import React from 'react';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileVideo,
  FileAudio,
  FileCheck,
  File,
  Link as LinkIcon,
  Palette,
  Shield,
  Layers,
} from 'lucide-react';

export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getCategoryBadge = (category) => {
  switch (category) {
    case 'deliverable':
      return {
        label: 'Deliverable',
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    case 'contract':
      return {
        label: 'Contract',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      };
    case 'design':
      return {
        label: 'Design Asset',
        color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      };
    case 'invoice':
      return {
        label: 'Billing / Invoice',
        color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    case 'brief':
      return {
        label: 'Project Brief',
        color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      };
    case 'asset':
      return {
        label: 'Resource Pack',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    default:
      return {
        label: 'General File',
        color: 'bg-neutral-800 text-neutral-300 border-neutral-700',
      };
  }
};

export const getFileIcon = (fileName = '', mimeType = '') => {
  const name = fileName.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.includes('image/') || /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(name)) {
    return { icon: FileImage, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
  }
  if (mime.includes('pdf') || /\.pdf$/i.test(name)) {
    return { icon: FileText, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  }
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv') ||
    /\.(xlsx|xls|csv)$/i.test(name)
  ) {
    return { icon: FileSpreadsheet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  }
  if (
    mime.includes('javascript') ||
    mime.includes('json') ||
    mime.includes('html') ||
    mime.includes('css') ||
    /\.(js|jsx|ts|tsx|json|html|css|py|java|go|sql)$/i.test(name)
  ) {
    return { icon: FileCode, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
  }
  if (mime.includes('video') || /\.(mp4|mov|avi|mkv|webm)$/i.test(name)) {
    return { icon: FileVideo, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
  }
  if (mime.includes('audio') || /\.(mp3|wav|ogg|m4a)$/i.test(name)) {
    return { icon: FileAudio, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  }
  if (mime.includes('zip') || mime.includes('tar') || /\.(zip|tar|gz|rar|7z)$/i.test(name)) {
    return { icon: FileArchive, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  }
  if (/\.(fig|sketch|xd|ai|psd)$/i.test(name)) {
    return { icon: Palette, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
  }
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return { icon: LinkIcon, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
  }

  return { icon: File, color: 'text-neutral-400 bg-neutral-800 border-neutral-700' };
};
