import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ArrowRight, BookOpen, Download, Pencil, RotateCcw } from 'lucide-react';
import {
  HEAT_TIERS,
  clamp,
  easeOutCubic,
  filterEntries,
  getFilename,
  getTier,
  mapRange,
  splitTitleWords,
} from '../data/defaults';
import type { AppState, HeatFilter, HeatLevel } from '../types';

export interface OpticalStageHandle {
  renderFrame: (progress: number, pointerX: number, pointerY: number) => void;
}

interface OpticalStageProps {
  state: AppState;
  isLoading: boolean;
  stageFilter: HeatFilter;
  onChangeStageFilter: (filter: HeatFilter) => void;
  onJumpHeatTier: (level: HeatLevel) => void;
  onOpenEntry: (index: number) => void;
  onOpenReadMode: () => void;
  onDownloadMarkdown: () => void;
  onOpenCreatorMode: () => void;
  onReplayFilm: () => void;
}

const FILTER_TABS: { id: HeatFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'simmer', label: '1–2° Simmer' },
  { id: 'burn', label: '3–4° Burn' },
  { id: 'incandescent', label: '5° Incandescent' },
];

export const OpticalStage = forwardRef<OpticalStageHandle, OpticalStageProps>(function OpticalStage(
  {
    state,
    isLoading,
    stageFilter,
    onChangeStageFilter,
    onJumpHeatTier,
    onOpenEntry,
    onOpenReadMode,
    onDownloadMarkdown,
    onOpenCreatorMode,
    onReplayFilm,
  },
  ref
) {
  // Scene 0 Refs
  const s0Ref = useRef<HTMLElement>(null);
  const s0WallRef = useRef<HTMLDivElement>(null);
  const s0FloorRef = useRef<HTMLDivElement>(null);
  const s0PrismWrapRef = useRef<HTMLDivElement>(null);
  const s0RaysRef = useRef<SVGGElement>(null);
  const s0Word1Ref = useRef<HTMLSpanElement>(null);
  const s0Word2Ref = useRef<HTMLSpanElement>(null);
  const s0DiamondRef = useRef<HTMLSpanElement>(null);
  const s0QuotesRef = useRef<HTMLDivElement>(null);
  const s0ScrollHintRef = useRef<HTMLDivElement>(null);

  // Scene 1 Refs
  const s1Ref = useRef<HTMLElement>(null);
  const engOuterRef = useRef<SVGGElement>(null);
  const engMidRef = useRef<SVGGElement>(null);
  const engInnerRef = useRef<SVGGElement>(null);
  const engArmRef = useRef<SVGGElement>(null);
  const s1BeatARef = useRef<HTMLDivElement>(null);
  const s1BeatBRef = useRef<HTMLDivElement>(null);
  const s1BeatCRef = useRef<HTMLDivElement>(null);
  const s1DotARef = useRef<HTMLSpanElement>(null);
  const s1DotBRef = useRef<HTMLSpanElement>(null);
  const s1Strike1Ref = useRef<HTMLSpanElement>(null);
  const s1Strike2Ref = useRef<HTMLSpanElement>(null);
  const s1Strike3Ref = useRef<HTMLSpanElement>(null);

  // Scene 2 Refs
  const s2Ref = useRef<HTMLElement>(null);
  const s2ThermalWashRef = useRef<HTMLDivElement>(null);
  const s2HeaderLabelRef = useRef<HTMLSpanElement>(null);
  const s2GaugeArcRef = useRef<SVGCircleElement>(null);
  const s2DegreeNumRef = useRef<HTMLSpanElement>(null);
  const s2TierNameRef = useRef<HTMLSpanElement>(null);
  const s2TierDescRef = useRef<HTMLQuoteElement>(null);
  const s2RailFillRef = useRef<HTMLDivElement>(null);
  const s2StepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scene 3 Refs
  const s3Ref = useRef<HTMLElement>(null);
  const s3CamRef = useRef<SVGGElement>(null);

  // Scene 4 Refs
  const s4Ref = useRef<HTMLElement>(null);

  useImperativeHandle(ref, () => ({
    renderFrame(p: number, pointerX: number, pointerY: number) {
      /* -----------------------------------------------------------------
         SCENE 0: THE DARKROOM (0.00 -> 0.21)
         ----------------------------------------------------------------- */
      const s0Exit = easeOutCubic(mapRange(p, 0.11, 0.21));
      const s0Opacity = 1 - mapRange(p, 0.14, 0.21);
      if (s0Ref.current) {
        s0Ref.current.style.opacity = s0Opacity.toFixed(3);
        s0Ref.current.style.pointerEvents = s0Opacity > 0.35 ? 'auto' : 'none';
      }

      if (s0Opacity > 0.005) {
        if (s0WallRef.current) {
          s0WallRef.current.style.transform = `translateY(${(-s0Exit * 45).toFixed(2)}%)`;
        }
        if (s0FloorRef.current) {
          s0FloorRef.current.style.transform = `translateY(${(s0Exit * 65).toFixed(2)}%)`;
        }
        const prismScale = 1 + s0Exit * 0.42;
        const raySpreadY = 1 + s0Exit * 0.85;
        if (s0PrismWrapRef.current) {
          s0PrismWrapRef.current.style.transform = `translate3d(${(pointerX * 10).toFixed(1)}px, ${(-s0Exit * 48 + pointerY * 6).toFixed(1)}px, 0) scale(${prismScale.toFixed(3)})`;
        }
        if (s0RaysRef.current) {
          s0RaysRef.current.style.transformOrigin = '436px 132px';
          s0RaysRef.current.style.transform = `scaleY(${raySpreadY.toFixed(3)}) rotate(${(pointerY * 2.2 - s0Exit * 5).toFixed(2)}deg)`;
        }
        if (s0Word1Ref.current) {
          s0Word1Ref.current.style.transform = `translateX(${(-s0Exit * 68).toFixed(1)}px)`;
        }
        if (s0Word2Ref.current) {
          s0Word2Ref.current.style.transform = `translateX(${(s0Exit * 68).toFixed(1)}px)`;
        }
        if (s0DiamondRef.current) {
          s0DiamondRef.current.style.transform = `rotate(${(45 + s0Exit * 180).toFixed(1)}deg) scale(${(1 + s0Exit * 0.6).toFixed(2)})`;
        }
        if (s0QuotesRef.current) {
          s0QuotesRef.current.style.transform = `translateY(${(s0Exit * 42).toFixed(1)}px)`;
          s0QuotesRef.current.style.opacity = (1 - mapRange(p, 0.08, 0.16)).toFixed(3);
        }
        if (s0ScrollHintRef.current) {
          s0ScrollHintRef.current.style.opacity = (1 - mapRange(p, 0.02, 0.09)).toFixed(3);
        }
      }

      /* -----------------------------------------------------------------
         SCENE 1: THE PRISM ENGINE (0.18 -> 0.44)
         ----------------------------------------------------------------- */
      const s1In = mapRange(p, 0.18, 0.23);
      const s1Out = 1 - mapRange(p, 0.39, 0.44);
      const s1Opacity = Math.min(s1In, s1Out);
      if (s1Ref.current) {
        s1Ref.current.style.opacity = s1Opacity.toFixed(3);
      }

      if (s1Opacity > 0.005) {
        const s1Prog = mapRange(p, 0.18, 0.43);

        if (engOuterRef.current) {
          engOuterRef.current.style.transform = `rotate(${(s1Prog * 145).toFixed(2)}deg)`;
        }
        if (engMidRef.current) {
          engMidRef.current.style.transform = `rotate(${(-s1Prog * 110).toFixed(2)}deg) scale(${(0.92 + s1Prog * 0.14).toFixed(3)})`;
        }
        if (engInnerRef.current) {
          engInnerRef.current.style.transform = `rotate(${(s1Prog * 210).toFixed(2)}deg)`;
        }
        if (engArmRef.current) {
          engArmRef.current.style.transform = `rotate(${(-55 + s1Prog * 260).toFixed(2)}deg)`;
        }

        // Beat A
        const beatAOp = Math.min(mapRange(p, 0.19, 0.23), 1 - mapRange(p, 0.265, 0.295));
        if (s1BeatARef.current) {
          s1BeatARef.current.style.opacity = beatAOp.toFixed(3);
          s1BeatARef.current.style.transform = `translateY(${((1 - mapRange(p, 0.19, 0.24)) * 28 - mapRange(p, 0.265, 0.295) * 28).toFixed(1)}px)`;
        }
        const dotASnap = easeOutCubic(mapRange(p, 0.21, 0.25));
        if (s1DotARef.current) {
          s1DotARef.current.style.transform = `translateY(${((1 - dotASnap) * -32).toFixed(1)}px) scale(${(0.6 + dotASnap * 0.4).toFixed(2)})`;
        }

        // Beat B
        const beatBOp = Math.min(mapRange(p, 0.28, 0.305), 1 - mapRange(p, 0.335, 0.36));
        if (s1BeatBRef.current) {
          s1BeatBRef.current.style.opacity = beatBOp.toFixed(3);
          s1BeatBRef.current.style.transform = `translateY(${((1 - mapRange(p, 0.28, 0.31)) * 28 - mapRange(p, 0.335, 0.36) * 28).toFixed(1)}px)`;
        }
        const dotBSnap = easeOutCubic(mapRange(p, 0.29, 0.325));
        if (s1DotBRef.current) {
          s1DotBRef.current.style.transform = `translateY(${((1 - dotBSnap) * -32).toFixed(1)}px) scale(${(0.6 + dotBSnap * 0.4).toFixed(2)})`;
        }

        // Beat C: Tri-Strike
        const beatCOp = Math.min(mapRange(p, 0.345, 0.365), 1 - mapRange(p, 0.40, 0.435));
        if (s1BeatCRef.current) {
          s1BeatCRef.current.style.opacity = beatCOp.toFixed(3);
        }

        const st1 = mapRange(p, 0.35, 0.368);
        const st2 = mapRange(p, 0.368, 0.386);
        const st3 = mapRange(p, 0.386, 0.402);

        if (s1Strike1Ref.current) {
          s1Strike1Ref.current.style.opacity = (0.18 + st1 * 0.82).toFixed(2);
          s1Strike1Ref.current.style.transform = `scale(${(0.94 + st1 * 0.06).toFixed(3)})`;
        }
        if (s1Strike2Ref.current) {
          s1Strike2Ref.current.style.opacity = (0.18 + st2 * 0.82).toFixed(2);
          s1Strike2Ref.current.style.transform = `scale(${(0.94 + st2 * 0.06).toFixed(3)})`;
        }
        if (s1Strike3Ref.current) {
          s1Strike3Ref.current.style.opacity = (0.18 + st3 * 0.82).toFixed(2);
          s1Strike3Ref.current.style.transform = `scale(${(0.94 + st3 * 0.06).toFixed(3)})`;
        }
      }

      /* -----------------------------------------------------------------
         SCENE 2: THE HEAT SCALE (0.41 -> 0.655)
         ----------------------------------------------------------------- */
      const s2In = mapRange(p, 0.41, 0.45);
      const s2Out = 1 - mapRange(p, 0.615, 0.655);
      const s2Opacity = Math.min(s2In, s2Out);
      if (s2Ref.current) {
        s2Ref.current.style.opacity = s2Opacity.toFixed(3);
        s2Ref.current.style.pointerEvents = s2Opacity > 0.5 ? 'auto' : 'none';
      }

      if (s2Opacity > 0.005) {
        const heatSweep = mapRange(p, 0.43, 0.61);
        const tierIdx = clamp(Math.floor(heatSweep * 4.999), 0, 4);
        const tier = HEAT_TIERS[tierIdx];

        const fillRatio = 0.2 + heatSweep * 0.8;
        if (s2GaugeArcRef.current) {
          s2GaugeArcRef.current.style.strokeDashoffset = (578 * (1 - fillRatio)).toFixed(1);
        }
        if (s2RailFillRef.current) {
          s2RailFillRef.current.style.transform = `scaleX(${fillRatio.toFixed(4)})`;
        }
        if (s2ThermalWashRef.current) {
          s2ThermalWashRef.current.style.background = `radial-gradient(ellipse at 50% 45%, ${tier.rgba}, transparent 65%)`;
        }
        if (s2DegreeNumRef.current) {
          s2DegreeNumRef.current.textContent = tier.code;
        }
        if (s2TierNameRef.current) {
          s2TierNameRef.current.textContent = tier.name;
          s2TierNameRef.current.style.color = tier.color;
        }
        if (s2HeaderLabelRef.current) {
          s2HeaderLabelRef.current.style.color = tier.color;
        }
        if (s2TierDescRef.current) {
          s2TierDescRef.current.textContent = tier.desc;
        }

        s2StepRefs.current.forEach((btn, idx) => {
          if (!btn) return;
          if (idx === tierIdx) {
            btn.style.borderColor = tier.color;
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            btn.style.transform = 'translateY(-3px)';
          } else {
            btn.style.borderColor = 'rgba(255, 255, 255, 0.09)';
            btn.style.backgroundColor = 'rgba(26, 22, 28, 0.68)';
            btn.style.transform = 'translateY(0px)';
          }
        });
      }

      /* -----------------------------------------------------------------
         SCENE 3: THE ARCHIVE TABLE (0.63 -> 0.875)
         ----------------------------------------------------------------- */
      const s3In = mapRange(p, 0.63, 0.675);
      const s3Out = 1 - mapRange(p, 0.835, 0.875);
      const s3Opacity = Math.min(s3In, s3Out);
      if (s3Ref.current) {
        s3Ref.current.style.opacity = s3Opacity.toFixed(3);
        s3Ref.current.style.pointerEvents = s3Opacity > 0.5 ? 'auto' : 'none';
      }

      if (s3Opacity > 0.005) {
        const s3Prog = mapRange(p, 0.63, 0.87);
        const liftY = (1 - easeOutCubic(s3In)) * 34;
        if (s3Ref.current) {
          s3Ref.current.style.transform = `translateY(${liftY.toFixed(1)}px)`;
        }
        if (s3CamRef.current) {
          s3CamRef.current.style.transform = `translate(${(-30 + s3Prog * 60).toFixed(1)}px, ${(18 - s3Prog * 36).toFixed(1)}px)`;
        }
      }

      /* -----------------------------------------------------------------
         SCENE 4: THE FINALE & EXPORT (0.855 -> 1.00)
         ----------------------------------------------------------------- */
      const s4In = mapRange(p, 0.855, 0.91);
      if (s4Ref.current) {
        s4Ref.current.style.opacity = s4In.toFixed(3);
        s4Ref.current.style.pointerEvents = s4In > 0.5 ? 'auto' : 'none';
        if (s4In > 0.005) {
          const s4Lift = (1 - easeOutCubic(s4In)) * 36;
          s4Ref.current.style.transform = `translateY(${s4Lift.toFixed(1)}px)`;
        }
      }
    },
  }));

  const [wordOne, wordTwo] = splitTitleWords(state.title);
  const filteredStageEntries = filterEntries(state.entries, stageFilter);
  const filename = getFilename(state.title);

  return (
    <main
      id="stage"
      className={`fixed inset-0 z-10 overflow-hidden bg-obsidian select-none transition-opacity duration-700 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Dynamic Ambient Prism Wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.08), transparent 60%)',
        }}
      />

      {/* ==================== SCENE 0: THE DARKROOM (0% – 21%) ==================== */}
      <section
        ref={s0Ref}
        id="scene-0"
        className="absolute inset-0 flex flex-col items-center justify-between px-4 sm:px-8 pt-20 pb-8 sm:pb-10"
      >
        {/* Architectural Set: Back Wall & Perspective Floor Grid */}
        <div
          ref={s0WallRef}
          className="absolute inset-x-0 top-0 h-[66%] bg-gradient-to-b from-[#17131a] via-[#131016] to-[#110f12] border-b border-white/[0.04] pointer-events-none will-change-transform"
        />
        <div
          ref={s0FloorRef}
          className="absolute inset-x-0 bottom-0 h-[34%] pointer-events-none will-change-transform"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,15,18,1) 0%, rgba(28,22,32,0.85) 35%, rgba(12,10,14,1) 100%)',
          }}
        >
          <div className="darkroom-floor-grid absolute inset-0 opacity-20" />
        </div>

        {/* Top Editorial Metadata Strip */}
        <div className="relative z-10 w-full max-w-5xl flex items-center justify-between font-mono text-xs tracking-[0.18em] text-stone-muted pt-2">
          <span>{state.author}</span>
          <span className="hidden sm:inline text-white/20" aria-hidden="true">
            ·
          </span>
          <span>Edition 01 · Prism</span>
        </div>

        {/* Centerpiece: Scroll-Reactive SVG Optical Prism + Monumental Title */}
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center my-auto">
          <div
            ref={s0PrismWrapRef}
            className="relative w-full max-w-[680px] h-[160px] sm:h-[215px] -mb-4 sm:-mb-6 pointer-events-none will-change-transform"
          >
            <svg viewBox="0 0 800 260" className="w-full h-full overflow-visible" aria-hidden="true">
              <defs>
                <filter id="rayGlow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="incidentBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f4efe6" stopOpacity="0" />
                  <stop offset="65%" stopColor="#f4efe6" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="glassFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="45%" stopColor="#a855f7" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.14" />
                </linearGradient>
                <linearGradient id="rayCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rayViolet" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rayRose" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rayVermilion" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fc4109" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#fc4109" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rayAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Incoming White Light Beam */}
              <line
                x1="10"
                y1="158"
                x2="364"
                y2="128"
                stroke="url(#incidentBeam)"
                strokeWidth="2.5"
                filter="url(#rayGlow)"
              />

              {/* Internal Refracted Caustic */}
              <polygon points="364,128 434,114 441,148" fill="#ffffff" fillOpacity="0.16" />

              {/* Outgoing Fanned Spectral Rays */}
              <g ref={s0RaysRef} filter="url(#rayGlow)">
                <polygon points="432,115 795,46 795,68 434,122" fill="url(#rayCyan)" opacity="0.88" />
                <polygon points="434,122 795,84 795,108 436,129" fill="url(#rayViolet)" opacity="0.88" />
                <polygon points="436,129 795,122 795,148 438,136" fill="url(#rayRose)" opacity="0.9" />
                <polygon points="438,136 795,160 795,186 440,143" fill="url(#rayVermilion)" opacity="0.9" />
                <polygon points="440,143 795,198 795,224 442,150" fill="url(#rayAmber)" opacity="0.86" />
              </g>

              {/* Precision Optical Glass Prism */}
              <g>
                <polygon
                  points="400,44 476,184 324,184"
                  fill="url(#glassFace)"
                  stroke="#f4efe6"
                  strokeOpacity="0.58"
                  strokeWidth="1.4"
                />
                <polygon
                  points="400,56 462,175 338,175"
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.16"
                  strokeWidth="0.8"
                />
                <line
                  x1="400"
                  y1="44"
                  x2="386"
                  y2="184"
                  stroke="#ffffff"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>

          {/* Monumental Display Title */}
          <div className="text-center relative">
            <h1 className="font-serif font-normal tracking-[-0.015em] leading-[0.9] text-[clamp(3.3rem,10vw,8.4rem)] text-alabaster flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 text-balance">
              <span ref={s0Word1Ref} className="inline-block will-change-transform">
                {wordOne}
              </span>
              <span
                ref={s0DiamondRef}
                aria-hidden="true"
                className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rotate-45 rounded-[3px] prism-diamond-flow shadow-[0_0_24px_rgba(244,63,94,0.55)] will-change-transform"
              />
              <span ref={s0Word2Ref} className="inline-block italic font-normal will-change-transform">
                {wordTwo}
              </span>
            </h1>
          </div>

          {/* Opening Epigraph Lines */}
          <div
            ref={s0QuotesRef}
            className="mt-6 sm:mt-8 max-w-xl w-full space-y-1.5 sm:space-y-2 text-left sm:text-center px-2 will-change-transform"
          >
            <p className="font-mono text-xs sm:text-sm text-alabaster/85 leading-relaxed">
              <span className="text-prism-cyan mr-2" aria-hidden="true">
                &gt;
              </span>
              {state.quotes[0]}
            </p>
            <p className="font-mono text-xs sm:text-sm text-alabaster/70 leading-relaxed">
              <span className="text-prism-violet mr-2" aria-hidden="true">
                &gt;
              </span>
              {state.quotes[1]}
            </p>
            <p className="font-mono text-xs sm:text-sm text-alabaster/60 leading-relaxed">
              <span className="text-prism-rose mr-2" aria-hidden="true">
                &gt;
              </span>
              {state.quotes[2]}
            </p>
          </div>
        </div>

        {/* Bottom Scroll Cue */}
        <div ref={s0ScrollHintRef} className="relative z-10 flex flex-col items-center gap-2 pb-1">
          <span className="font-mono text-[11px] tracking-[0.22em] text-stone-muted">scroll</span>
          <div className="w-[1px] h-8 bg-white/15 overflow-hidden relative">
            <div className="scroll-line-anim absolute inset-0 prism-bar" />
          </div>
        </div>
      </section>

      {/* ==================== SCENE 1: THE PRISM ENGINE (18% – 44%) ==================== */}
      <section
        ref={s1Ref}
        id="scene-1"
        className="absolute inset-0 flex items-center justify-center px-4 sm:px-8 opacity-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, rgba(17, 15, 18, 0.96) 65%)',
          }}
        />

        {/* Procedural SVG Optical Refraction Machine */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 900 900"
            className="w-[min(96vw,780px)] h-[min(96vw,780px)] opacity-90 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <filter id="engineShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="10" dy="18" stdDeviation="12" floodColor="#050307" floodOpacity="0.78" />
              </filter>
              <filter id="armShadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="18" dy="26" stdDeviation="16" floodColor="#040206" floodOpacity="0.65" />
              </filter>
              <linearGradient id="lensSpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#a855f7" />
                <stop offset="70%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Outer Calibration Ring */}
            <g ref={engOuterRef} filter="url(#engineShadow)" style={{ transformOrigin: '450px 450px' }}>
              <circle
                cx="450"
                cy="450"
                r="340"
                fill="none"
                stroke="#f4efe6"
                strokeOpacity="0.12"
                strokeWidth="1"
                strokeDasharray="4 10"
              />
              <circle
                cx="450"
                cy="450"
                r="306"
                fill="none"
                stroke="url(#lensSpectrum)"
                strokeOpacity="0.34"
                strokeWidth="1.5"
              />
              <line x1="450" y1="95" x2="450" y2="128" stroke="#38bdf8" strokeWidth="2" />
              <line x1="450" y1="772" x2="450" y2="805" stroke="#f43f5e" strokeWidth="2" />
              <line x1="95" y1="450" x2="128" y2="450" stroke="#a855f7" strokeWidth="2" />
              <line x1="772" y1="450" x2="805" y2="450" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="690" cy="210" r="7" fill="#1a161c" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="210" cy="690" r="7" fill="#1a161c" stroke="#fc4109" strokeWidth="1.5" />
            </g>

            {/* Middle Faceted Glass Polygon */}
            <g ref={engMidRef} filter="url(#engineShadow)" style={{ transformOrigin: '450px 450px' }}>
              <polygon
                points="450,190 675,320 675,580 450,710 225,580 225,320"
                fill="#1a161c"
                fillOpacity="0.45"
                stroke="#f4efe6"
                strokeOpacity="0.22"
                strokeWidth="1.2"
              />
              <polygon
                points="450,235 636,342 636,558 450,665 264,558 264,342"
                fill="none"
                stroke="url(#lensSpectrum)"
                strokeOpacity="0.38"
                strokeWidth="1"
              />
              <line x1="450" y1="190" x2="450" y2="710" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
              <line x1="225" y1="320" x2="675" y2="580" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
              <line x1="675" y1="320" x2="225" y2="580" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
            </g>

            {/* Inner Prism Core */}
            <g ref={engInnerRef} filter="url(#engineShadow)" style={{ transformOrigin: '450px 450px' }}>
              <polygon
                points="450,312 570,520 330,520"
                fill="#231c28"
                fillOpacity="0.65"
                stroke="url(#lensSpectrum)"
                strokeWidth="1.8"
              />
              <circle
                cx="450"
                cy="450"
                r="46"
                fill="#110f12"
                stroke="#f4efe6"
                strokeOpacity="0.35"
                strokeWidth="1.2"
              />
              <circle cx="450" cy="450" r="14" fill="url(#lensSpectrum)" opacity="0.85" />
            </g>

            {/* Articulated Optical Refractor Arm */}
            <g ref={engArmRef} filter="url(#armShadow)" style={{ transformOrigin: '450px 450px' }}>
              <line
                x1="450"
                y1="450"
                x2="450"
                y2="140"
                stroke="#f4efe6"
                strokeOpacity="0.6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="450" cy="140" r="18" fill="#1a161c" stroke="url(#lensSpectrum)" strokeWidth="2.5" />
              <circle cx="450" cy="140" r="5" fill="#f4efe6" />
            </g>
          </svg>
        </div>

        {/* Kinetic Typography Stage */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-2">
          <p className="font-mono text-xs tracking-[0.2em] text-stone-muted mb-6">
            <span className="text-prism-violet">01.</span> The Prism Engine
          </p>

          <div className="relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
            {/* Beat A */}
            <div
              ref={s1BeatARef}
              className="absolute inset-0 flex flex-col items-center justify-center will-change-transform"
            >
              <h2 className="font-serif text-[clamp(2.6rem,7.4vw,6.2rem)] leading-[0.98] text-alabaster tracking-tight text-balance">
                Surface is a <span className="italic">mask</span>
                <span
                  ref={s1DotARef}
                  className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-prism-cyan ml-1.5 align-baseline shadow-[0_0_20px_#38bdf8]"
                />
              </h2>
              <p className="mt-4 max-w-md font-sans text-sm sm:text-base text-stone-muted leading-relaxed">
                Everyone edits themselves for daylight. This lens only opens after dark.
              </p>
            </div>

            {/* Beat B */}
            <div
              ref={s1BeatBRef}
              className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none will-change-transform"
            >
              <h2 className="font-serif text-[clamp(2.4rem,6.8vw,5.8rem)] leading-[0.98] text-alabaster tracking-tight text-balance">
                Every truth <span className="italic prism-text">splits</span> under light
                <span
                  ref={s1DotBRef}
                  className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-prism-violet ml-1.5 align-baseline shadow-[0_0_20px_#a855f7]"
                />
              </h2>
              <p className="mt-4 max-w-md font-sans text-sm sm:text-base text-stone-muted leading-relaxed">
                Pass a polite sentence through glass and you see the pulse hidden inside it.
              </p>
            </div>

            {/* Beat C: Tri-Strike */}
            <div
              ref={s1BeatCRef}
              className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-10 font-serif text-[clamp(3rem,8vw,6.8rem)] leading-none">
                <span
                  ref={s1Strike1Ref}
                  className="relative inline-flex items-baseline opacity-20 will-change-transform"
                >
                  Raw
                  <i className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-prism-rose ml-1 shadow-[0_0_20px_#f43f5e]" />
                </span>
                <span
                  ref={s1Strike2Ref}
                  className="relative inline-flex items-baseline italic opacity-20 will-change-transform"
                >
                  Sharp
                  <i className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-prism-vermilion ml-1 shadow-[0_0_20px_#fc4109]" />
                </span>
                <span
                  ref={s1Strike3Ref}
                  className="relative inline-flex items-baseline opacity-20 will-change-transform"
                >
                  Private
                  <i className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-prism-amber ml-1 shadow-[0_0_20px_#f59e0b]" />
                </span>
              </div>
              <p className="mt-6 font-mono text-xs tracking-[0.18em] text-stone-muted">
                Calibrated by heat · read accordingly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SCENE 2: THE HEAT SCALE (41% – 65.5%) ==================== */}
      <section
        ref={s2Ref}
        id="scene-2"
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-16 pb-10 opacity-0 pointer-events-none"
      >
        <div
          ref={s2ThermalWashRef}
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, rgba(56,189,248,0.18), transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          <p className="font-mono text-xs tracking-[0.2em] text-stone-muted mb-3">
            <span ref={s2HeaderLabelRef} className="text-prism-cyan transition-colors duration-300">
              02.
            </span>{' '}
            The Heat Rating
          </p>

          {/* Radial Gauge & Numeric Readout */}
          <div className="relative flex flex-col items-center my-2 sm:my-4">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90" aria-hidden="true">
                <defs>
                  <linearGradient id="heatArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="28%" stopColor="#a855f7" />
                    <stop offset="55%" stopColor="#f43f5e" />
                    <stop offset="80%" stopColor="#fc4109" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
                <circle
                  ref={s2GaugeArcRef}
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="url(#heatArcGrad)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray="578"
                  strokeDashoffset="462"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  ref={s2DegreeNumRef}
                  className="font-serif text-6xl sm:text-7xl leading-none text-alabaster tabular-nums"
                >
                  01°
                </span>
                <span
                  ref={s2TierNameRef}
                  className="mt-1.5 font-mono text-xs tracking-[0.2em] text-prism-cyan transition-colors duration-300"
                >
                  Quiet
                </span>
              </div>
            </div>

            <blockquote
              ref={s2TierDescRef}
              className="mt-4 sm:mt-6 text-center font-serif italic text-2xl sm:text-4xl text-alabaster/95 max-w-xl leading-snug min-h-[3.5rem] sm:min-h-[4.5rem] text-balance"
            >
              “What you admit to yourself at 2 AM.”
            </blockquote>
          </div>

          {/* 5-Tier Interactive Spectrum Stepper */}
          <div className="mt-5 sm:mt-8 w-full max-w-2xl">
            <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-4">
              <div
                ref={s2RailFillRef}
                className="h-full w-full prism-bar rounded-full origin-left will-change-transform"
                style={{ transform: 'scaleX(0.2)' }}
              />
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {HEAT_TIERS.map((tier, idx) => (
                <button
                  key={tier.level}
                  ref={(el) => {
                    s2StepRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => onJumpHeatTier(tier.level)}
                  className="group flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border border-white/10 bg-darkroom/70 hover:border-white/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                >
                  <span
                    className="font-mono text-xs sm:text-sm font-semibold tabular-nums"
                    style={{ color: tier.color }}
                  >
                    {tier.code}
                  </span>
                  <span className="font-mono text-[10px] tracking-wide text-stone-muted group-hover:text-alabaster mt-0.5 truncate max-w-full">
                    {tier.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SCENE 3: THE ARCHIVE TABLE (63% – 87.5%) ==================== */}
      <section
        ref={s3Ref}
        id="scene-3"
        className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 pt-20 pb-8 opacity-0 pointer-events-none"
      >
        {/* Camera-Panning Geometric Prism Grid SVG Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <svg viewBox="0 0 1200 700" className="w-[120%] h-[120%] -ml-[10%] -mt-[5%]" aria-hidden="true">
            <g ref={s3CamRef} stroke="rgba(244,239,230,0.14)" strokeWidth="0.8" fill="none">
              <path d="M0 140 L1200 140 M0 280 L1200 280 M0 420 L1200 420 M0 560 L1200 560" />
              <path d="M200 0 L200 700 M400 0 L400 700 M600 0 L600 700 M800 0 L800 700 M1000 0 L1000 700" />
              <polygon
                points="600,90 880,580 320,580"
                stroke="url(#lensSpectrum)"
                strokeOpacity="0.45"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col max-h-[calc(100vh-7.5rem)]">
          {/* Header & Segmented Heat Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-stone-muted mb-1.5">
                <span className="text-prism-rose">03.</span> Inside Private Parts
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-none text-alabaster">
                the <span className="italic prism-text">(private)</span> archive
              </h2>
            </div>

            <div
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-darkroom/90 border border-white/10"
              role="group"
              aria-label="Filter archive by heat rating"
            >
              {FILTER_TABS.map((tab) => {
                const isActive = stageFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeStageFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70 ${
                      isActive
                        ? 'bg-alabaster text-obsidian font-medium'
                        : 'text-stone-muted hover:text-alabaster'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Archive Cards Grid */}
          <div className="custom-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 pb-2">
            {filteredStageEntries.length === 0 ? (
              <div className="col-span-full py-12 px-6 text-center rounded-xl border border-white/10 bg-darkroom/70">
                <p className="font-mono text-xs text-stone-muted">
                  No entries at this heat tier yet. Add one in Creator Mode.
                </p>
              </div>
            ) : (
              filteredStageEntries.map((entry) => {
                const tier = getTier(entry.heat);
                const fullIdx = state.entries.findIndex((e) => e.id === entry.id);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(fullIdx)}
                    className="group text-left relative rounded-xl bg-darkroom/85 hover:bg-darkroom border border-white/10 hover:border-white/25 p-5 transition-all duration-200 flex flex-col justify-between gap-4 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
                  >
                    {/* Subtle Top Heat-Calibrated Hairline */}
                    <span
                      className="absolute top-0 inset-x-0 h-[2px] opacity-65 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: tier.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 font-mono text-[11px] min-w-0">
                          <span className="text-stone-muted tabular-nums whitespace-nowrap">
                            Entry {entry.num}
                          </span>
                          <span className="text-white/25" aria-hidden="true">
                            ·
                          </span>
                          <span
                            className="tabular-nums truncate"
                            style={{ color: tier.color }}
                          >
                            {tier.code} {tier.name}
                          </span>
                        </div>

                        <span className="inline-flex items-end gap-[2px] h-3 shrink-0" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((barIdx) => {
                            const active = barIdx <= tier.level;
                            return (
                              <i
                                key={barIdx}
                                className="block w-[2.5px] rounded-full"
                                style={{
                                  height: `${4 + barIdx * 1.8}px`,
                                  backgroundColor: active ? tier.color : 'rgba(255,255,255,0.14)',
                                }}
                              />
                            );
                          })}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-[1.7rem] leading-tight text-alabaster group-hover:text-white transition-colors">
                        {entry.title}
                      </h3>
                      <p className="mt-2 font-sans text-sm text-stone-muted line-clamp-2 leading-relaxed">
                        {entry.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-stone-muted">
                      <span>{entry.readTime}</span>
                      <span className="inline-flex items-center gap-1 text-alabaster/80 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        <span>Read entry</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ==================== SCENE 4: THE FINALE & EXPORT (85.5% – 100%) ==================== */}
      <section
        ref={s4Ref}
        id="scene-4"
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-16 pb-10 opacity-0 pointer-events-none"
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] prism-bar opacity-35 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.09), transparent 55%)',
          }}
        />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center bg-darkroom/82 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <p className="font-mono text-xs tracking-[0.2em] text-stone-muted mb-4">
            <span className="text-prism-amber">04.</span> End of Reel
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl text-alabaster leading-tight text-balance">
            Light leaves nothing <span className="italic prism-text">unseen.</span>
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base text-stone-muted max-w-lg mx-auto leading-relaxed">
            This file keeps shifting as new nights happen. Read it in plain text, keep a local Markdown copy, or open Creator Mode to rewrite any line yourself.
          </p>

          <p className="mt-5 font-mono text-xs text-alabaster/75">
            — {state.author.toLowerCase()} · last refracted after midnight
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenReadMode}
              className="h-12 px-5 rounded-xl bg-alabaster text-obsidian hover:bg-white font-mono text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Plain-Text Reader</span>
            </button>

            <button
              type="button"
              onClick={onDownloadMarkdown}
              className="h-12 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-alabaster font-mono text-xs tracking-wide transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
            >
              <Download className="w-4 h-4" />
              <span>Download {filename}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreatorMode}
              className="h-12 px-5 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/15 text-alabaster font-mono text-xs tracking-wide transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
            >
              <Pencil className="w-4 h-4" />
              <span>Creator Mode · Edit Copy</span>
            </button>

            <button
              type="button"
              onClick={onReplayFilm}
              className="h-12 px-5 rounded-xl bg-obsidian/70 hover:bg-white/10 border border-white/10 text-stone-muted hover:text-alabaster font-mono text-xs tracking-wide transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alabaster/70"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Film</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
});
