import React, { useState } from 'react';
import { X, Share2, Copy, Check, Calendar, FileText, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

interface ShareModalProps {
  tripId: string;
  shareToken: string;
  tripTitle: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  tripId,
  shareToken,
  tripTitle,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/trip/share/${shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const icsDownloadUrl = api.getExportIcsUrl(tripId);
  const pdfPrintUrl = api.getExportPdfUrl(tripId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Share & Export Trip
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{tripTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Share URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Public Read-Only Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="mt-2 text-right">
            <a
              href={`/trip/share/${shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Preview Public View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Export Options */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Export Options
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* ICS Calendar Export */}
            <a
              href={icsDownloadUrl}
              download
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Add to Calendar
                </div>
                <div className="text-[10px] text-slate-500">
                  Standard .ICS file
                </div>
              </div>
            </a>

            {/* Printable PDF Export */}
            <a
              href={pdfPrintUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Print / PDF View
                </div>
                <div className="text-[10px] text-slate-500">
                  Printable summary
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
