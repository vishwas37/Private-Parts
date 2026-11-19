import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Download, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { CHAPTERS, HEAT_TIERS, filterEntries, getFilename, getTier } from '../data/defaults';
import type { AppState, ArchiveEntry, HeatFilter, HeatLevel } from '../types';

export type DrawerTab = 'chapters' | 'creator';

interface IndexCreatorDrawerProps {
  isOpen: boolean;
  activeTab: DrawerTab;
  currentChapterIndex: number;
  state: AppState;
  onClose: () => void;
  onSwitchTab: (tab: DrawerTab) => void;
  onJumpChapter: (targetProgress: number) => void;
  onOpenEntry: (index: number) => void;
  onOpenReadMode: () => void;
  onDownloadMarkdown: () => void;
  onSaveIdentity: (title: string, author: string, quotes: [string, string, string]) => void;
  onAddEntry: (title: string, heat: HeatLevel, excerpt: string, rawBody: string) => void;
  onUpdateEntry: (id: string, title: string, heat: HeatLevel, excerpt: string, rawBody: string) => void;
  onDeleteEntry: (id: string) => void;
  onResetDefaults: () => void;
  onToast: (message: string) => void;
}

const FILTER_OPTIONS: { id: HeatFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'simmer', label: '1–2° Simmer' },
  { id: 'burn', label: '3–4° Burn' },
  { id: 'incandescent', label: '5° Incandescent' },
];

export function IndexCreatorDrawer({
  isOpen,
  activeTab,
  currentChapterIndex,
  state,
  onClose,
  onSwitchTab,
  onJumpChapter,
  onOpenEntry,
  onOpenReadMode,
  onDownloadMarkdown,
  onSaveIdentity,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onResetDefaults,
  onToast,
}: IndexCreatorDrawerProps) {
  const [drawerFilter, setDrawerFilter] = useState<HeatFilter>('all');

  // Identity editor state
  const [edTitle, setEdTitle] = useState(state.title);
  const [edAuthor, setEdAuthor] = useState(state.author);
  const [edQ1, setEdQ1] = useState(state.quotes[0]);
  const [edQ2, setEdQ2] = useState(state.quotes[1]);
  const [edQ3, setEdQ3] = useState(state.quotes[2]);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newHeat, setNewHeat] = useState<HeatLevel>(3);
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newBody, setNewBody] = useState('');

  // Inline editing existing entry
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHeat, setEditHeat] = useState<HeatLevel>(3);
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    setEdTitle(state.title);
    setEdAuthor(state.author);
    setEdQ1(state.quotes[0]);
    setEdQ2(state.quotes[1]);
    setEdQ3(state.quotes[2]);
  }, [state]);

  if (!isOpen) return null;

  const filteredEntries = filterEntries(state.entries, drawerFilter);
  const filename = getFilename(state.title);

  const handleSaveIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIdentity(edTitle, edAuthor, [edQ1, edQ2, edQ3]);
  };

  const handleAddEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      onToast('Please enter at least a title and entry text');
      return;
    }
    onAddEntry(newTitle, newHeat, newExcerpt, newBody);
    setNewTitle('');
    setNewHeat(3);
    setNewExcerpt('');
    setNewBody('');
  };

  const startEditingEntry = (entry: ArchiveEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditHeat(entry.heat);
    setEditExcerpt(entry.excerpt);
    setEditBody(entry.body.join('\n\n'));
  };

  const handleSaveEditEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editTitle.trim() || !editBody.trim()) {
      onToast('Entry title and text cannot be empty');
      return;
    }
    onUpdateEntry(editingId, editTitle, editHeat, editExcerpt, editBody);
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-[95] bg-[#110f12]/94 backdrop-blur-2xl overflow-y-auto custom-scroll"
      role="dialog"
      aria-modal="true"
      aria-label="Index and Creator Mode"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 min-h-full flex flex-col">
        {/* Drawer Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-darkroom border border-white/10">
            <button
              type="button"
              onClick={() => onSwitchTab('chapters')}
              className={`px-4 py-2 rounded-md font-mono text-xs tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
                activeTab === 'chapters'
                  ? 'bg-alabaster text-obsidian font-medium'
                  : 'text-stone-muted hover:text-alabaster'
              }`}
            >
              Index &amp; Archive
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('creator')}
              className={`px-4 py-2 rounded-md font-mono text-xs tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
                activeTab === 'creator'
                  ? 'bg-alabaster text-obsidian font-medium'
                  : 'text-stone-muted hover:text-alabaster'
              }`}
            >
              Creator Mode
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 font-mono text-xs text-alabaster transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TAB 1: INDEX & FILTERABLE ARCHIVE */}
        {activeTab === 'chapters' && (
          <div className="py-8 space-y-10 flex-1 flex flex-col">
            {/* Film Chapters */}
            <section>
              <p className="font-mono text-xs tracking-[0.16em] text-stone-muted mb-4">
                Film Chapters
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {CHAPTERS.map((chapter) => {
                  const tier = getTier(chapter.defaultHeat);
                  const isCurrent = chapter.id === currentChapterIndex;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => onJumpChapter(chapter.target)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
                        isCurrent
                          ? 'bg-white/10 border-white/30'
                          : 'bg-darkroom/75 border-white/10 hover:border-white/25 hover:bg-darkroom'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-stone-muted tabular-nums">
                          0{chapter.id}
                        </span>
                        <span
                          className="font-mono text-[11px] tabular-nums"
                          style={{ color: tier.color }}
                        >
                          {tier.code}
                        </span>
                      </div>
                      <p className="font-serif text-2xl text-alabaster leading-tight">
                        {chapter.title}
                      </p>
                      <p className="font-mono text-[11px] text-stone-muted mt-1">
                        {tier.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Archive Entries by Heat */}
            <section className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <p className="font-mono text-xs tracking-[0.16em] text-stone-muted">
                  Archive Entries ({filteredEntries.length})
                </p>
                <div
                  className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-darkroom border border-white/10"
                  role="group"
                  aria-label="Filter drawer archive by heat"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDrawerFilter(opt.id)}
                      className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
                        drawerFilter === opt.id
                          ? 'bg-alabaster text-obsidian font-medium'
                          : 'text-stone-muted hover:text-alabaster'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-xl border border-white/10 bg-darkroom/60">
                  <p className="font-mono text-xs text-stone-muted">
                    No entries at this heat tier yet. Switch to Creator Mode to publish one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredEntries.map((entry) => {
                    const tier = getTier(entry.heat);
                    const fullIndex = state.entries.findIndex((e) => e.id === entry.id);
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onOpenEntry(fullIndex)}
                        className="group text-left p-5 rounded-xl bg-darkroom/85 hover:bg-darkroom border border-white/10 hover:border-white/25 transition-all duration-200 flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-mono text-[11px] mb-1.5">
                            <span style={{ color: tier.color }} className="tabular-nums">
                              {tier.code} · {tier.name}
                            </span>
                            <span className="text-white/25" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-stone-muted">{entry.readTime}</span>
                          </div>
                          <h4 className="font-serif text-2xl text-alabaster leading-tight group-hover:text-white transition-colors">
                            {entry.title}
                          </h4>
                          <p className="text-xs text-stone-muted mt-1.5 line-clamp-1">
                            {entry.excerpt}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-muted group-hover:text-alabaster group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Utility Bar */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs text-stone-muted">
                Shortcuts: Space watch · ↑/↓ scroll · Esc close
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenReadMode}
                  className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-white/10 hover:bg-white/15 font-mono text-xs text-alabaster transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Plain-Text Reader</span>
                </button>
                <button
                  type="button"
                  onClick={onDownloadMarkdown}
                  className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {filename}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ZERO-CODE CREATOR MODE */}
        {activeTab === 'creator' && (
          <div className="py-8 space-y-8 flex-1">
            {/* Identity & Opening Copy */}
            <form
              onSubmit={handleSaveIdentitySubmit}
              className="rounded-xl bg-darkroom/90 border border-white/10 p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-3xl text-alabaster">
                    Live Identity &amp; Opening Copy
                  </h3>
                  <p className="text-sm text-stone-muted mt-1">
                    Changes update the film, plain-text reader, and Markdown download immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg border border-white/15 font-mono text-xs text-stone-muted hover:text-alabaster hover:border-white/30 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ed-title"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Site Title (2 words works best)
                  </label>
                  <input
                    id="ed-title"
                    type="text"
                    value={edTitle}
                    onChange={(e) => setEdTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster focus:outline-none focus:border-prism-cyan"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ed-author"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Pseudonym / Author
                  </label>
                  <input
                    id="ed-author"
                    type="text"
                    value={edAuthor}
                    onChange={(e) => setEdAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster focus:outline-none focus:border-prism-violet"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="ed-q1"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Opening Quote Line 1
                  </label>
                  <input
                    id="ed-q1"
                    type="text"
                    value={edQ1}
                    onChange={(e) => setEdQ1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm font-mono text-alabaster focus:outline-none focus:border-prism-cyan"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="ed-q2"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Opening Quote Line 2
                  </label>
                  <input
                    id="ed-q2"
                    type="text"
                    value={edQ2}
                    onChange={(e) => setEdQ2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm font-mono text-alabaster focus:outline-none focus:border-prism-violet"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="ed-q3"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Opening Quote Line 3
                  </label>
                  <input
                    id="ed-q3"
                    type="text"
                    value={edQ3}
                    onChange={(e) => setEdQ3(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm font-mono text-alabaster focus:outline-none focus:border-prism-rose"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  Apply Identity Changes
                </button>
              </div>
            </form>

            {/* Add New Archive Entry */}
            <form
              onSubmit={handleAddEntrySubmit}
              className="rounded-xl bg-darkroom/90 border border-white/10 p-6 space-y-5"
            >
              <div>
                <h3 className="font-serif text-3xl text-alabaster">
                  Add New Archive Entry
                </h3>
                <p className="text-sm text-stone-muted mt-1">
                  Publish a new piece directly into Scene 3 with its own Heat Rating (1°–5°).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="new-entry-title"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Entry Title
                  </label>
                  <input
                    id="new-entry-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Notes From the Fire Escape"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster placeholder:text-stone-muted/60 focus:outline-none focus:border-prism-rose"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-entry-heat"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Heat Rating
                  </label>
                  <select
                    id="new-entry-heat"
                    value={newHeat}
                    onChange={(e) => setNewHeat(Number(e.target.value) as HeatLevel)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm font-mono text-alabaster focus:outline-none focus:border-prism-amber"
                  >
                    {HEAT_TIERS.map((t) => (
                      <option key={t.level} value={t.level}>
                        {t.code} · {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="new-entry-excerpt"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    One-Line Teaser
                  </label>
                  <input
                    id="new-entry-excerpt"
                    type="text"
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="Short atmospheric hook displayed on the archive card..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster placeholder:text-stone-muted/60 focus:outline-none focus:border-prism-violet"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="new-entry-body"
                    className="block font-mono text-xs text-stone-muted mb-1.5"
                  >
                    Full Entry Text (Separate paragraphs with blank lines)
                  </label>
                  <textarea
                    id="new-entry-body"
                    rows={4}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Write your entry here..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster placeholder:text-stone-muted/60 focus:outline-none focus:border-prism-rose"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-10 inline-flex items-center gap-2 px-5 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Entry</span>
                </button>
              </div>
            </form>

            {/* Manage Existing Entries */}
            <div className="rounded-xl bg-darkroom/90 border border-white/10 p-6 space-y-4">
              <div>
                <h3 className="font-serif text-3xl text-alabaster">
                  Manage Existing Entries ({state.entries.length})
                </h3>
                <p className="text-sm text-stone-muted mt-1">
                  Edit or remove any published entry in your archive.
                </p>
              </div>

              <div className="divide-y divide-white/[0.08]">
                {state.entries.map((entry) => {
                  const tier = getTier(entry.heat);
                  const isEditing = editingId === entry.id;

                  if (isEditing) {
                    return (
                      <form key={entry.id} onSubmit={handleSaveEditEntry} className="py-5 space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            aria-label="Edit entry title"
                            className="sm:col-span-2 px-3 py-2 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster focus:outline-none focus:border-prism-rose"
                          />
                          <select
                            value={editHeat}
                            onChange={(e) => setEditHeat(Number(e.target.value) as HeatLevel)}
                            aria-label="Edit entry heat rating"
                            className="px-3 py-2 rounded-lg bg-obsidian border border-white/15 text-sm font-mono text-alabaster focus:outline-none focus:border-prism-amber"
                          >
                            {HEAT_TIERS.map((t) => (
                              <option key={t.level} value={t.level}>
                                {t.code} · {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={editExcerpt}
                          onChange={(e) => setEditExcerpt(e.target.value)}
                          aria-label="Edit entry teaser"
                          className="w-full px-3 py-2 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster focus:outline-none focus:border-prism-violet"
                        />
                        <textarea
                          rows={4}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          aria-label="Edit entry text"
                          className="w-full px-3 py-2 rounded-lg bg-obsidian border border-white/15 text-sm text-alabaster focus:outline-none focus:border-prism-rose"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="h-9 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 font-mono text-xs text-alabaster transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="h-9 px-4 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium transition-colors"
                          >
                            Save Entry
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={entry.id}
                      className="py-4 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-stone-muted tabular-nums">Entry {entry.num}</span>
                          <span className="text-white/25" aria-hidden="true">
                            ·
                          </span>
                          <span style={{ color: tier.color }} className="tabular-nums">
                            {tier.code} {tier.name}
                          </span>
                        </div>
                        <p className="font-serif text-2xl text-alabaster mt-0.5">{entry.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditingEntry(entry)}
                          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/15 font-mono text-xs text-alabaster transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          disabled={state.entries.length <= 1}
                          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-prism-rose/20 font-mono text-xs text-stone-muted hover:text-prism-rose transition-colors disabled:opacity-35"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
