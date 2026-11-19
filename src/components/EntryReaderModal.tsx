import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { getTier } from '../data/defaults';
import type { ArchiveEntry } from '../types';

interface EntryReaderModalProps {
  entry: ArchiveEntry | null;
  entryIndex: number;
  totalEntries: number;
  siteTitle: string;
  author: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function EntryReaderModal({
  entry,
  entryIndex,
  totalEntries,
  siteTitle,
  author,
  onClose,
  onPrev,
  onNext,
}: EntryReaderModalProps) {
  if (!entry) return null;

  const tier = getTier(entry.heat);

  return (
    <div
      className="fixed inset-0 z-[100] bg-obsidian/88 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${entry.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-darkroom border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Heat-Calibrated Hairline */}
        <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: tier.color }} />

        {/* Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 font-mono text-xs min-w-0">
            <span className="font-medium tabular-nums whitespace-nowrap" style={{ color: tier.color }}>
              {tier.code} · {tier.name}
            </span>
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            <span className="text-stone-muted whitespace-nowrap">{entry.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader"
            className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 font-mono text-xs text-alabaster transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Literary Prose Content */}
        <div className="custom-scroll px-6 sm:px-8 py-6 sm:py-8 overflow-y-auto flex-1 space-y-5">
          <p className="font-mono text-xs tracking-[0.18em] text-stone-muted tabular-nums">
            Entry {entry.num} · {siteTitle}
          </p>
          <h3 className="font-serif text-3xl sm:text-5xl text-alabaster leading-[1.06] text-balance">
            {entry.title}
          </h3>
          <p className="font-serif italic text-xl sm:text-2xl text-alabaster/75 leading-snug pt-1 pb-2 border-b border-white/[0.08]">
            {entry.excerpt}
          </p>
          <div className="space-y-4 font-sans text-[15px] sm:text-base text-alabaster/88 leading-relaxed pt-1">
            {entry.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <p className="pt-4 font-mono text-xs text-stone-muted">— {author.toLowerCase()}</p>
        </div>

        {/* Prev / Next Navigation Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/10 bg-obsidian/55 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            disabled={totalEntries <= 1}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/10 font-mono text-xs text-alabaster transition-colors disabled:opacity-40 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev Entry</span>
          </button>

          <span className="font-mono text-xs text-stone-muted tabular-nums">
            {entryIndex + 1} / {totalEntries}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={totalEntries <= 1}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/10 font-mono text-xs text-alabaster transition-colors disabled:opacity-40 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <span>Next Entry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
