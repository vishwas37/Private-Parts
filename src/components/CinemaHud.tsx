import React from 'react';
import { Pause, Play } from 'lucide-react';
import { CHAPTERS, HEAT_TIERS, getTier } from '../data/defaults';
import type { HeatLevel } from '../types';

interface CinemaHudProps {
  filename: string;
  chapterIndex: number;
  heatLevel: HeatLevel;
  isWatching: boolean;
  isLoading: boolean;
  eyePupilRef: React.RefObject<SVGPolygonElement | null>;
  onHomeClick: () => void;
  onOpenReadMode: () => void;
  onJumpHeatScale: () => void;
  onToggleWatch: () => void;
  onOpenIndex: () => void;
}

export function CinemaHud({
  filename,
  chapterIndex,
  heatLevel,
  isWatching,
  isLoading,
  eyePupilRef,
  onHomeClick,
  onOpenReadMode,
  onJumpHeatScale,
  onToggleWatch,
  onOpenIndex,
}: CinemaHudProps) {
  const activeTier = getTier(heatLevel);
  const chapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[70] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 pointer-events-none transition-opacity duration-700 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Left Cluster: Prism-Eye Home, Filename Reader Link, Chapter Crumb */}
      <div className="flex items-center gap-3 pointer-events-auto min-w-0">
        <button
          type="button"
          onClick={onHomeClick}
          title="Return to Darkroom (Top)"
          aria-label="Return to top"
          className="group relative w-10 h-10 rounded-full bg-darkroom/80 hover:bg-darkroom border border-white/10 hover:border-white/25 backdrop-blur-xl flex items-center justify-center transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
        >
          <svg viewBox="0 0 36 36" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="eyePrismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="45%" stopColor="#a855f7" />
                <stop offset="75%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path
              d="M4 18 C9 10, 27 10, 32 18 C27 26, 9 26, 4 18 Z"
              fill="none"
              stroke="#f4efe6"
              strokeOpacity="0.8"
              strokeWidth="1.35"
            />
            <polygon
              ref={eyePupilRef}
              points="18,12.5 22.5,18 18,23.5 13.5,18"
              fill="url(#eyePrismGrad)"
              style={{ transformOrigin: '18px 18px' }}
            />
            <circle cx="18" cy="18" r="1.4" fill="#110f12" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5 min-w-0 px-3 py-2 rounded-lg bg-darkroom/65 border border-white/[0.08] backdrop-blur-xl">
          <button
            type="button"
            onClick={onOpenReadMode}
            title="Open Plain-Text Markdown Reader"
            className="hidden sm:inline-block font-mono text-xs tracking-wide text-alabaster/90 hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 rounded"
          >
            {filename}
          </button>
          <span className="hidden sm:inline text-white/25 select-none" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px] tracking-[0.12em] text-stone-muted truncate max-w-[135px] sm:max-w-[190px] tabular-nums">
            {chapter.label}
          </span>
        </div>
      </div>

      {/* Right Cluster: Live Heat Meter, Watch Auto-Play, Index Drawer */}
      <div className="flex items-center gap-2 pointer-events-auto shrink-0">
        <button
          type="button"
          onClick={onJumpHeatScale}
          title="Jump to Heat Scale"
          className="h-10 inline-flex items-center gap-2.5 px-3 rounded-lg bg-darkroom/80 hover:bg-darkroom border border-white/10 backdrop-blur-xl transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
          style={{ borderColor: `${activeTier.color}48` }}
        >
          <span
            className="font-mono text-[11px] font-medium tracking-wider tabular-nums transition-colors duration-300"
            style={{ color: activeTier.color }}
          >
            Heat {activeTier.code}
          </span>
          <span className="flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
            {HEAT_TIERS.map((tier, idx) => {
              const isActive = idx < heatLevel;
              const barHeight = 5 + idx * 2;
              return (
                <i
                  key={tier.level}
                  className="block w-[3px] rounded-full transition-all duration-300"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: isActive ? tier.color : 'rgba(255,255,255,0.16)',
                    boxShadow: isActive ? `0 0 8px ${tier.color}` : 'none',
                  }}
                />
              );
            })}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleWatch}
          className={`h-10 inline-flex items-center gap-2 px-3.5 rounded-lg border backdrop-blur-xl font-mono text-xs tracking-wide transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
            isWatching
              ? 'bg-prism-rose/15 border-prism-rose/60 text-alabaster hover:bg-prism-rose/25'
              : 'bg-darkroom/80 border-white/15 text-alabaster hover:bg-alabaster hover:text-obsidian'
          }`}
        >
          {isWatching ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isWatching ? 'Pause' : 'Watch'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenIndex}
          className="h-10 inline-flex items-center gap-2 px-3.5 rounded-lg bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
        >
          <span>Index</span>
          <span className="flex flex-col gap-[3px] w-3" aria-hidden="true">
            <i className="block h-[1.5px] w-full bg-obsidian rounded-full" />
            <i className="block h-[1.5px] w-2/3 ml-auto bg-obsidian rounded-full" />
          </span>
        </button>
      </div>
    </header>
  );
}
