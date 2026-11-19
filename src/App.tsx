import { useCallback, useEffect, useRef, useState } from 'react';
import { CinemaHud } from './components/CinemaHud';
import { EntryReaderModal } from './components/EntryReaderModal';
import { IndexCreatorDrawer, type DrawerTab } from './components/IndexCreatorDrawer';
import { OpticalStage, type OpticalStageHandle } from './components/OpticalStage';
import { PlainTextReader } from './components/PlainTextReader';
import {
  CHAPTERS,
  DEFAULT_STATE,
  clamp,
  generateMarkdownString,
  getFilename,
  getTier,
  loadState,
  mapRange,
  saveState,
} from './data/defaults';
import type { AppState, HeatFilter, HeatLevel } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [heatLevel, setHeatLevel] = useState<HeatLevel>(1);
  const [isWatching, setIsWatching] = useState(false);

  const [stageFilter, setStageFilter] = useState<HeatFilter>('all');
  const [isReadMode, setIsReadMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('chapters');
  const [modalEntryIndex, setModalEntryIndex] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  // Refs for 60fps scroll & animation loop
  const stageRef = useRef<OpticalStageHandle>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const eyePupilRef = useRef<SVGPolygonElement>(null);

  const targetProgressRef = useRef(0);
  const displayProgressRef = useRef(0);
  const pointerXRef = useRef(0);
  const pointerYRef = useRef(0);
  const chapterIndexRef = useRef(0);
  const heatLevelRef = useRef<HeatLevel>(1);

  const isWatchingRef = useRef(false);
  const overlayLockedRef = useRef(false);

  const isModalOpen = modalEntryIndex !== null;

  useEffect(() => {
    isWatchingRef.current = isWatching;
  }, [isWatching]);

  useEffect(() => {
    overlayLockedRef.current = isReadMode || isDrawerOpen || isModalOpen;
    if (isReadMode || isDrawerOpen || isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isReadMode, isDrawerOpen, isModalOpen]);

  // Persist appState & keep document title synchronized
  useEffect(() => {
    saveState(appState);
    document.title = `${appState.title.toUpperCase()} — ${appState.author}`;
  }, [appState]);

  // Smooth Darkroom Preloader Reveal
  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, 420);
    const hideTimer = window.setTimeout(() => {
      setShowPreloader(false);
    }, 1150);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  }, []);

  const getMaxScroll = useCallback(() => {
    const trackHeight = scrollTrackRef.current?.offsetHeight ?? window.innerHeight * 8.8;
    return Math.max(1, trackHeight - window.innerHeight);
  }, []);

  const scrollToProgress = useCallback(
    (progress: number, instant = false) => {
      const y = clamp(progress, 0, 1) * getMaxScroll();
      window.scrollTo({
        top: y,
        behavior: instant ? 'auto' : 'smooth',
      });
    },
    [getMaxScroll]
  );

  const stopWatch = useCallback(() => {
    if (isWatchingRef.current) {
      isWatchingRef.current = false;
      setIsWatching(false);
    }
  }, []);

  const startWatch = useCallback(() => {
    if (overlayLockedRef.current) return;
    if (targetProgressRef.current > 0.96) {
      scrollToProgress(0, true);
      targetProgressRef.current = 0;
      displayProgressRef.current = 0;
    }
    isWatchingRef.current = true;
    setIsWatching(true);
  }, [scrollToProgress]);

  const toggleWatch = useCallback(() => {
    if (isWatchingRef.current) stopWatch();
    else startWatch();
  }, [startWatch, stopWatch]);

  // 60fps Lerp Scroll & Optical Choreography Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const maxScroll = getMaxScroll();

      if (isWatchingRef.current && !overlayLockedRef.current) {
        const speed = 1 / 40; // ~40s full cinema reel
        const nextProg = clamp(targetProgressRef.current + speed * dt, 0, 1);
        window.scrollTo(0, nextProg * maxScroll);
        targetProgressRef.current = nextProg;
        if (nextProg >= 0.999) {
          isWatchingRef.current = false;
          setIsWatching(false);
          showToast(`End of reel — ${appState.title}`);
        }
      } else {
        targetProgressRef.current = clamp(window.scrollY / maxScroll, 0, 1);
      }

      const lerpFactor = reducedMotionQuery.matches ? 1 : 0.095;
      displayProgressRef.current += (targetProgressRef.current - displayProgressRef.current) * lerpFactor;
      if (Math.abs(targetProgressRef.current - displayProgressRef.current) < 0.0001) {
        displayProgressRef.current = targetProgressRef.current;
      }

      const p = displayProgressRef.current;

      // Bottom Prismatic Progress Bar (compositor scaleX)
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      // HUD Prism-Eye pointer tracking
      if (eyePupilRef.current) {
        eyePupilRef.current.style.transform = `translate(${(pointerXRef.current * 2.2).toFixed(2)}px, ${(pointerYRef.current * 1.6).toFixed(2)}px)`;
      }

      // Update discrete chapter & heat HUD state only on transitions
      let activeCh = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (p >= CHAPTERS[i].range[0]) activeCh = i;
      }
      if (activeCh !== chapterIndexRef.current) {
        chapterIndexRef.current = activeCh;
        setChapterIndex(activeCh);
      }

      let computedHeat: HeatLevel = CHAPTERS[activeCh].defaultHeat;
      if (p >= 0.41 && p <= 0.65) {
        const heatProg = mapRange(p, 0.43, 0.61);
        computedHeat = clamp(1 + Math.round(heatProg * 4), 1, 5) as HeatLevel;
      }
      if (computedHeat !== heatLevelRef.current) {
        heatLevelRef.current = computedHeat;
        setHeatLevel(computedHeat);
      }

      stageRef.current?.renderFrame(p, pointerXRef.current, pointerYRef.current);
      rafId = window.requestAnimationFrame(tick);
    };

    // Initial frame sync before loop
    stageRef.current?.renderFrame(0, 0, 0);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [appState.title, getMaxScroll, showToast]);

  // Global pointer parallax, manual scroll yield, and keyboard shortcuts
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerXRef.current = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerYRef.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === 'Escape') {
        if (modalEntryIndex !== null) setModalEntryIndex(null);
        else if (isDrawerOpen) setIsDrawerOpen(false);
        else if (isReadMode) setIsReadMode(false);
        return;
      }

      if (modalEntryIndex !== null && appState.entries.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setModalEntryIndex((prev) =>
            prev === null ? null : (prev - 1 + appState.entries.length) % appState.entries.length
          );
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setModalEntryIndex((prev) =>
            prev === null ? null : (prev + 1) % appState.entries.length
          );
          return;
        }
      }

      if (isTyping || isReadMode || isDrawerOpen || modalEntryIndex !== null) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleWatch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        stopWatch();
        window.scrollBy({ top: window.innerHeight * 0.45, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stopWatch();
        window.scrollBy({ top: -window.innerHeight * 0.45, behavior: 'smooth' });
      }
    };

    window.addEventListener('wheel', stopWatch, { passive: true });
    window.addEventListener('touchstart', stopWatch, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', stopWatch);
      window.removeEventListener('touchstart', stopWatch);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appState.entries.length, isDrawerOpen, isReadMode, modalEntryIndex, stopWatch, toggleWatch]);

  // Actions
  const handleHomeClick = useCallback(() => {
    stopWatch();
    setIsReadMode(false);
    setIsDrawerOpen(false);
    setModalEntryIndex(null);
    scrollToProgress(0);
  }, [scrollToProgress, stopWatch]);

  const handleOpenReadMode = useCallback(() => {
    stopWatch();
    setIsDrawerOpen(false);
    setModalEntryIndex(null);
    setIsReadMode(true);
  }, [stopWatch]);

  const handleOpenDrawer = useCallback(
    (tab: DrawerTab = 'chapters') => {
      stopWatch();
      setModalEntryIndex(null);
      setDrawerTab(tab);
      setIsDrawerOpen(true);
    },
    [stopWatch]
  );

  const handleJumpHeatTier = useCallback(
    (level: HeatLevel) => {
      const targetP = 0.44 + ((level - 1) / 4) * 0.16;
      stopWatch();
      scrollToProgress(targetP);
    },
    [scrollToProgress, stopWatch]
  );

  const handleJumpChapter = useCallback(
    (targetProgress: number) => {
      setIsDrawerOpen(false);
      stopWatch();
      scrollToProgress(targetProgress);
    },
    [scrollToProgress, stopWatch]
  );

  const handleOpenEntry = useCallback(
    (index: number) => {
      if (!appState.entries.length) return;
      stopWatch();
      setIsDrawerOpen(false);
      setModalEntryIndex((index + appState.entries.length) % appState.entries.length);
    },
    [appState.entries.length, stopWatch]
  );

  const handleReplayFilm = useCallback(() => {
    scrollToProgress(0, true);
    targetProgressRef.current = 0;
    displayProgressRef.current = 0;
    window.setTimeout(() => {
      startWatch();
    }, 220);
  }, [scrollToProgress, startWatch]);

  const handleDownloadMarkdown = useCallback(() => {
    try {
      const md = generateMarkdownString(appState);
      const filename = getFilename(appState.title);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    } catch {
      showToast('Download blocked by browser — try Copy MD');
    }
  }, [appState, showToast]);

  const handleCopyMarkdown = useCallback(async () => {
    const md = generateMarkdownString(appState);
    const filename = getFilename(appState.title);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
        showToast(`Copied ${filename} to clipboard`);
        return;
      }
    } catch {
      // Fallback below
    }
    const ta = document.createElement('textarea');
    ta.value = md;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${filename} to clipboard`);
    } catch {
      showToast('Could not copy automatically');
    }
    document.body.removeChild(ta);
  }, [appState, showToast]);

  // Creator Mode Mutations
  const handleSaveIdentity = useCallback(
    (title: string, author: string, quotes: [string, string, string]) => {
      setAppState((prev) => ({
        ...prev,
        title: title.trim() || prev.title,
        author: author.trim() || prev.author,
        quotes: [
          quotes[0].trim() || DEFAULT_STATE.quotes[0],
          quotes[1].trim() || DEFAULT_STATE.quotes[1],
          quotes[2].trim() || DEFAULT_STATE.quotes[2],
        ],
      }));
      showToast('Identity & opening lines updated live');
    },
    [showToast]
  );

  const handleAddEntry = useCallback(
    (title: string, heat: HeatLevel, excerpt: string, rawBody: string) => {
      const trimmedTitle = title.trim();
      const paragraphs = rawBody
        .trim()
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const wordCount = rawBody.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.round(wordCount / 180));

      setAppState((prev) => {
        const num = String(prev.entries.length + 1).padStart(2, '0');
        const fallbackExcerpt =
          paragraphs[0] && paragraphs[0].length > 110
            ? `${paragraphs[0].slice(0, 110)}…`
            : paragraphs[0] ?? '';
        return {
          ...prev,
          entries: [
            ...prev.entries,
            {
              id: `entry-${Date.now()}`,
              num,
              title: trimmedTitle,
              heat,
              readTime: `${mins} min read`,
              excerpt: excerpt.trim() || fallbackExcerpt,
              body: paragraphs,
            },
          ],
        };
      });

      setIsDrawerOpen(false);
      setStageFilter('all');
      scrollToProgress(0.74);
      showToast(`Published "${trimmedTitle}" (${getTier(heat).code})`);
    },
    [scrollToProgress, showToast]
  );

  const handleUpdateEntry = useCallback(
    (id: string, title: string, heat: HeatLevel, excerpt: string, rawBody: string) => {
      const paragraphs = rawBody
        .trim()
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const wordCount = rawBody.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.round(wordCount / 180));

      setAppState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                title: title.trim(),
                heat,
                readTime: `${mins} min read`,
                excerpt: excerpt.trim() || entry.excerpt,
                body: paragraphs,
              }
            : entry
        ),
      }));
      showToast(`Updated "${title.trim()}"`);
    },
    [showToast]
  );

  const handleDeleteEntry = useCallback(
    (id: string) => {
      setAppState((prev) => {
        if (prev.entries.length <= 1) return prev;
        const remaining = prev.entries
          .filter((entry) => entry.id !== id)
          .map((entry, idx) => ({
            ...entry,
            num: String(idx + 1).padStart(2, '0'),
          }));
        return { ...prev, entries: remaining };
      });
      showToast('Removed entry from archive');
    },
    [showToast]
  );

  const handleResetDefaults = useCallback(() => {
    setAppState(structuredClone(DEFAULT_STATE));
    showToast('Restored default Private Parts copy');
  }, [showToast]);

  const activeModalEntry =
    modalEntryIndex !== null ? appState.entries[modalEntryIndex] ?? null : null;

  return (
    <div className="relative bg-obsidian text-alabaster font-sans">
      {/* Accessible Skip Link */}
      <a
        href="#read"
        onClick={(e) => {
          e.preventDefault();
          handleOpenReadMode();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[120] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-alabaster focus:text-obsidian focus:font-mono focus:text-xs"
      >
        Skip to plain text ({getFilename(appState.title)})
      </a>

      {/* Zero-FOUC Darkroom Curtain Preloader */}
      {showPreloader && (
        <div
          className={`fixed inset-0 z-[110] bg-obsidian flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-10 h-10 relative flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full animate-pulse" aria-hidden="true">
              <defs>
                <linearGradient id="preloadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <polygon
                points="32,8 56,52 8,52"
                fill="none"
                stroke="url(#preloadGrad)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <p className="mt-4 font-mono text-[11px] tracking-[0.22em] text-stone-muted">
            Calibrating Prism
          </p>
        </div>
      )}

      {/* Subtle Full-Screen Film Grain Overlay */}
      <div
        className="film-grain fixed inset-0 z-[90] pointer-events-none opacity-[0.05] mix-blend-overlay"
        aria-hidden="true"
      />

      {/* Cinema HUD */}
      <CinemaHud
        filename={getFilename(appState.title)}
        chapterIndex={chapterIndex}
        heatLevel={heatLevel}
        isWatching={isWatching}
        isLoading={isLoading}
        eyePupilRef={eyePupilRef}
        onHomeClick={handleHomeClick}
        onOpenReadMode={handleOpenReadMode}
        onJumpHeatScale={() => {
          stopWatch();
          scrollToProgress(0.49);
        }}
        onToggleWatch={toggleWatch}
        onOpenIndex={() => handleOpenDrawer('chapters')}
      />

      {/* Layer 1: Fixed 5-Scene Optical Cinema Stage */}
      <OpticalStage
        ref={stageRef}
        state={appState}
        isLoading={isLoading}
        stageFilter={stageFilter}
        onChangeStageFilter={setStageFilter}
        onJumpHeatTier={handleJumpHeatTier}
        onOpenEntry={handleOpenEntry}
        onOpenReadMode={handleOpenReadMode}
        onDownloadMarkdown={handleDownloadMarkdown}
        onOpenCreatorMode={() => handleOpenDrawer('creator')}
        onReplayFilm={handleReplayFilm}
      />

      {/* Virtual Scroll Track Driving Smooth Lerp Scrubbing (880vh) */}
      <div ref={scrollTrackRef} className="relative z-0 w-full h-[880vh]" aria-hidden="true" />

      {/* Bottom Prismatic Hairline Progress Bar */}
      <div
        className={`fixed bottom-0 inset-x-0 z-[75] h-[2.5px] bg-white/[0.06] pointer-events-none transition-opacity duration-700 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          ref={progressBarRef}
          className="h-full w-full prism-bar origin-left will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Layer 2: Plain-Text Markdown Reader */}
      <PlainTextReader
        isOpen={isReadMode}
        state={appState}
        onClose={() => setIsReadMode(false)}
        onCopyMarkdown={handleCopyMarkdown}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      {/* Full-Screen Index Drawer & Zero-Code Creator Mode */}
      <IndexCreatorDrawer
        isOpen={isDrawerOpen}
        activeTab={drawerTab}
        currentChapterIndex={chapterIndex}
        state={appState}
        onClose={() => setIsDrawerOpen(false)}
        onSwitchTab={setDrawerTab}
        onJumpChapter={handleJumpChapter}
        onOpenEntry={handleOpenEntry}
        onOpenReadMode={handleOpenReadMode}
        onDownloadMarkdown={handleDownloadMarkdown}
        onSaveIdentity={handleSaveIdentity}
        onAddEntry={handleAddEntry}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
        onResetDefaults={handleResetDefaults}
        onToast={showToast}
      />

      {/* Dimly-Lit Literary Reader Sheet Modal */}
      <EntryReaderModal
        entry={activeModalEntry}
        entryIndex={modalEntryIndex ?? 0}
        totalEntries={appState.entries.length}
        siteTitle={appState.title}
        author={appState.author}
        onClose={() => setModalEntryIndex(null)}
        onPrev={() =>
          setModalEntryIndex((prev) =>
            prev === null ? null : (prev - 1 + appState.entries.length) % appState.entries.length
          )
        }
        onNext={() =>
          setModalEntryIndex((prev) =>
            prev === null ? null : (prev + 1) % appState.entries.length
          )
        }
      />

      {/* Custom Non-Blocking Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-lg bg-alabaster text-obsidian font-mono text-xs tracking-wide shadow-2xl pointer-events-none transition-all duration-200 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}
