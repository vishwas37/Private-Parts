import type { AppState, ArchiveEntry, ChapterDef, HeatFilter, HeatLevel, HeatTier } from '../types';

export const STORAGE_KEY = 'private_parts_prism_state_v1';

export const HEAT_TIERS: HeatTier[] = [
  {
    level: 1,
    code: '01°',
    name: 'Quiet',
    color: '#38bdf8',
    rgba: 'rgba(56, 189, 248, 0.22)',
    desc: '“What you admit to yourself at 2 AM.”',
    group: 'simmer',
  },
  {
    level: 2,
    code: '02°',
    name: 'Warm',
    color: '#a855f7',
    rgba: 'rgba(168, 85, 247, 0.22)',
    desc: '“The unspoken tension in the room.”',
    group: 'simmer',
  },
  {
    level: 3,
    code: '03°',
    name: 'Slow Burn',
    color: '#f43f5e',
    rgba: 'rgba(244, 63, 94, 0.24)',
    desc: '“Desire, friction, and the parts edited out.”',
    group: 'burn',
  },
  {
    level: 4,
    code: '04°',
    name: 'Fever',
    color: '#fc4109',
    rgba: 'rgba(252, 65, 9, 0.26)',
    desc: '“No polite framing. No alibis.”',
    group: 'burn',
  },
  {
    level: 5,
    code: '05°',
    name: 'Incandescent',
    color: '#f59e0b',
    rgba: 'rgba(245, 158, 11, 0.28)',
    desc: '“Unredacted. Read with the door shut.”',
    group: 'incandescent',
  },
];

export const CHAPTERS: ChapterDef[] = [
  { id: 0, label: '00 · Darkroom', title: 'The Darkroom', range: [0.0, 0.19], target: 0.0, defaultHeat: 1 },
  { id: 1, label: '01 · The Prism', title: 'The Prism Engine', range: [0.19, 0.41], target: 0.29, defaultHeat: 2 },
  { id: 2, label: '02 · Heat Scale', title: 'The Heat Scale', range: [0.41, 0.63], target: 0.52, defaultHeat: 3 },
  { id: 3, label: '03 · The Archive', title: 'The Private Archive', range: [0.63, 0.85], target: 0.74, defaultHeat: 4 },
  { id: 4, label: '04 · Finale', title: 'Finale & Export', range: [0.85, 1.0], target: 0.98, defaultHeat: 5 },
];

export const DEFAULT_STATE: AppState = {
  title: 'Private Parts',
  author: 'Ravenclaw',
  quotes: [
    'a prism for the things said after midnight.',
    'not a feed. not a performance. not sanitized.',
    'refracted by ravenclaw.',
  ],
  entries: [
    {
      id: 'entry-1',
      num: '01',
      title: 'Inventory of Things I Didn’t Send',
      heat: 1,
      readTime: '2 min read',
      excerpt: 'Every drafts folder is an accidental autobiography of who we almost became.',
      body: [
        'At 2:14 AM, honesty has a strange weightlessness. You type four sentences that could rearrange an entire month, stare at the cursor blinking like a lighthouse, and then backspace them down to a single polite emoji.',
        'We talk about curation as if it happens in public. The real curation happens in the seconds before our thumb lifts off the glass. What stays unsent does not disappear; it settles into the floorboards of how we look at someone the next morning.',
        'This archive starts there—with the quiet ledger of sentences that deserved oxygen even when daylight voted them down.',
      ],
    },
    {
      id: 'entry-2',
      num: '02',
      title: 'Two Glasses, One Narrow Table',
      heat: 2,
      readTime: '2 min read',
      excerpt: 'On the exact geometry of a conversation that says one thing while the air says another.',
      body: [
        'There is a specific decibel level in a crowded room where two people stop speaking for the room and start speaking only for the six inches between their elbows.',
        'Nobody crosses a line. Nobody needs to. The whole charge lives in the timing—how long a gaze stays parked after a joke lands, the slight tilt of a wrist turning a coaster in slow circles.',
        'Polite language calls this chemistry. Precision calls it an agreement neither party is ready to sign out loud.',
      ],
    },
    {
      id: 'entry-3',
      num: '03',
      title: 'The Version We Cut Before Print',
      heat: 3,
      readTime: '3 min read',
      excerpt: 'Every smooth persona hides a rougher draft with far better pacing and sharper teeth.',
      body: [
        'Notice how almost everything published online sounds like it was reviewed by a nervous committee. Soft edges. Pre-emptive disclaimers. Apologies wrapped around appetites.',
        'When you sand down every contradiction until nothing can bruise a stranger, you also sand off the exact friction that makes another human lean forward and think: wait—you too?',
        'Slow burn isn’t about volume. It is about refusing to blink first when the paragraph gets uncomfortable.',
      ],
    },
    {
      id: 'entry-4',
      num: '04',
      title: 'No Alibis After Midnight',
      heat: 4,
      readTime: '3 min read',
      excerpt: 'What happens to a room the moment you stop decorating your real motive.',
      body: [
        'Half of modern intimacy is theater conducted through plausible deniability. We ask a question hoping someone hears the secret question tucked beneath it. We linger by the door pretending to check the weather.',
        'Fever starts the second the alibi drops. When you look straight across the dim light and name the thing plainly, without irony as a fire escape.',
        'It is terrifying for three seconds. After that, the air finally becomes breathable.',
      ],
    },
    {
      id: 'entry-5',
      num: '05',
      title: 'Read With the Door Shut',
      heat: 5,
      readTime: '3 min read',
      excerpt: 'The unredacted manifesto of wanting deeply, privately, and without a single apology.',
      body: [
        'Incandescent light does not ask whether you are ready to be seen. It strips the lacquer off polite excuses and reveals the grain underneath—every pulse, every hunger, every private contradiction we lock behind passwords.',
        'To keep a private part of yourself intact is not secrecy for the sake of shame. It is sovereignty. It is deciding that some rooms are strictly by invitation, lit on your own dimmer switch.',
        'If you made it to degree five, close the tabs you don’t need. Sit with the sentence that made your chest tighten. That one is yours.',
      ],
    },
  ],
};

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function mapRange(val: number, inMin: number, inMax: number): number {
  return clamp((val - inMin) / (inMax - inMin), 0, 1);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getTier(level: number): HeatTier {
  const idx = clamp(Math.round(level) - 1, 0, HEAT_TIERS.length - 1);
  return HEAT_TIERS[idx];
}

export function filterEntries(entries: ArchiveEntry[], filterType: HeatFilter): ArchiveEntry[] {
  if (filterType === 'all') return entries;
  return entries.filter((entry) => getTier(entry.heat).group === filterType);
}

export function getFilename(title: string): string {
  const slug = title.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_') || 'PRIVATE_PARTS';
  return `${slug}.md`;
}

export function splitTitleWords(title: string): [string, string] {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  const firstWord = parts[0] || 'PRIVATE';
  const restWords = parts.slice(1).join(' ') || 'PARTS';
  return [firstWord.toUpperCase(), restWords.toUpperCase()];
}

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AppState>;
      if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.entries)) {
        const quotes: [string, string, string] = [
          parsed.quotes?.[0] ?? DEFAULT_STATE.quotes[0],
          parsed.quotes?.[1] ?? DEFAULT_STATE.quotes[1],
          parsed.quotes?.[2] ?? DEFAULT_STATE.quotes[2],
        ];
        return {
          title: parsed.title || DEFAULT_STATE.title,
          author: parsed.author || DEFAULT_STATE.author,
          quotes,
          entries: parsed.entries.map((entry, idx) => ({
            ...entry,
            heat: clamp(Number(entry.heat) || 1, 1, 5) as HeatLevel,
            num: entry.num || String(idx + 1).padStart(2, '0'),
            body: Array.isArray(entry.body) ? entry.body : [String(entry.body || '')],
          })),
        };
      }
    }
  } catch {
    // Safe fallback if storage is blocked in sandboxed iframe
  }
  return structuredClone(DEFAULT_STATE);
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or sandbox restrictions silently
  }
}

export function generateMarkdownString(state: AppState): string {
  const lines: string[] = [
    `# ${state.title.toUpperCase()}`,
    `> ${state.quotes[0] || ''}`,
    `> ${state.quotes[1] || ''}`,
    `> ${state.quotes[2] || ''}`,
    '',
    `By **${state.author}** · Edition 01 (Prism)`,
    '',
    '---',
    '',
    '## 01. The Prism Engine',
    '',
    'Surface is a mask. Every truth splits under light.',
    'Raw. Sharp. Private.',
    '',
    '## 02. The Heat Rating',
    '',
    ...HEAT_TIERS.map((t) => `- **${t.code} ${t.name}** — ${t.desc.replace(/[“”]/g, '')}`),
    '',
    '## 03. The Private Archive',
    '',
  ];

  state.entries.forEach((entry) => {
    const tier = getTier(entry.heat);
    lines.push(`### ${entry.num}. ${entry.title} [${tier.code} ${tier.name}]`);
    lines.push(`*${entry.excerpt}*`);
    lines.push('');
    entry.body.forEach((p) => {
      lines.push(p);
      lines.push('');
    });
  });

  lines.push('---');
  lines.push(`— ${state.author.toLowerCase()}, last refracted after midnight.`);
  return lines.join('\n');
}
