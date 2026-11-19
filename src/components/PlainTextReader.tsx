import { ArrowLeft, Copy, Download } from 'lucide-react';
import { HEAT_TIERS, getFilename, getTier } from '../data/defaults';
import type { AppState } from '../types';

interface PlainTextReaderProps {
  isOpen: boolean;
  state: AppState;
  onClose: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
}

export function PlainTextReader({
  isOpen,
  state,
  onClose,
  onCopyMarkdown,
  onDownloadMarkdown,
}: PlainTextReaderProps) {
  if (!isOpen) return null;

  const filename = getFilename(state.title);

  return (
    <div
      className="fixed inset-0 z-[85] bg-obsidian text-alabaster overflow-y-auto custom-scroll"
      role="dialog"
      aria-modal="true"
      aria-label="Plain-Text Markdown Reader"
    >
      {/* Sticky Reader Toolbar */}
      <div className="sticky top-0 z-10 bg-obsidian/92 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs font-medium tracking-wide text-alabaster truncate">
            {filename}
          </span>
          <span className="hidden sm:inline text-white/25" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline font-mono text-xs text-stone-muted whitespace-nowrap">
            Plain-text monograph
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCopyMarkdown}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 font-mono text-xs text-alabaster transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy MD</span>
          </button>
          <button
            type="button"
            onClick={onDownloadMarkdown}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 font-mono text-xs text-alabaster transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 inline-flex items-center gap-1.5 px-4 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Film</span>
          </button>
        </div>
      </div>

      {/* Semantic Editorial Article */}
      <article id="read" className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-10 font-sans leading-relaxed" lang="en">
        <header className="space-y-5 border-b border-white/10 pb-8">
          <p className="font-mono text-xs tracking-[0.18em] text-stone-muted">
            {state.author} · Edition 01 · Prism
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-alabaster tracking-tight leading-[0.98] text-balance">
            {state.title}
          </h1>
          <blockquote className="pt-2 space-y-1.5 font-mono text-xs sm:text-sm text-alabaster/75">
            {state.quotes.map((quote, idx) => (
              <p key={idx} className="leading-relaxed">
                <span className="text-stone-muted mr-2" aria-hidden="true">
                  &gt;
                </span>
                {quote}
              </p>
            ))}
          </blockquote>
        </header>

        <section className="space-y-3">
          <h2 className="font-mono text-xs tracking-[0.16em] text-prism-violet">
            01. The Prism Engine
          </h2>
          <p className="font-serif text-2xl sm:text-3xl text-alabaster leading-snug">
            Surface is a mask. Every truth splits under light.
          </p>
          <p className="text-alabaster/80 text-[15px] leading-relaxed">
            Everyone edits themselves for daylight. Pass a polite sentence through optical glass and you see the pulse hidden inside it. Raw. Sharp. Private.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-xs tracking-[0.16em] text-prism-cyan">
            02. The Heat Scale
          </h2>
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {HEAT_TIERS.map((tier) => (
              <li
                key={tier.level}
                className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-sm"
              >
                <span
                  className="font-mono text-xs font-medium shrink-0 w-36 tabular-nums"
                  style={{ color: tier.color }}
                >
                  {tier.code} · {tier.name}
                </span>
                <span className="text-alabaster/80">{tier.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-10 pt-2">
          <h2 className="font-mono text-xs tracking-[0.16em] text-prism-rose">
            03. The Private Archive
          </h2>
          {state.entries.map((entry) => {
            const tier = getTier(entry.heat);
            return (
              <div key={entry.id} className="space-y-3.5 pb-8 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span style={{ color: tier.color }} className="tabular-nums">
                    {tier.code} {tier.name}
                  </span>
                  <span className="text-white/25" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-stone-muted">{entry.readTime}</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl text-alabaster leading-tight">
                  {entry.num}. {entry.title}
                </h3>
                <p className="font-serif italic text-xl text-alabaster/70 leading-snug">
                  {entry.excerpt}
                </p>
                <div className="space-y-4 pt-1">
                  {entry.body.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-alabaster/85 text-[15px] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <footer className="pt-2 font-mono text-xs text-stone-muted">
          — {state.author.toLowerCase()}, last refracted after midnight.
        </footer>
      </article>
    </div>
  );
}
