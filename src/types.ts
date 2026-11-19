export type HeatLevel = 1 | 2 | 3 | 4 | 5;

export type HeatGroup = 'simmer' | 'burn' | 'incandescent';

export type HeatFilter = 'all' | HeatGroup;

export interface HeatTier {
  level: HeatLevel;
  code: string;
  name: string;
  color: string;
  rgba: string;
  desc: string;
  group: HeatGroup;
}

export interface ChapterDef {
  id: number;
  label: string;
  title: string;
  range: [number, number];
  target: number;
  defaultHeat: HeatLevel;
}

export interface ArchiveEntry {
  id: string;
  num: string;
  title: string;
  heat: HeatLevel;
  readTime: string;
  excerpt: string;
  body: string[];
}

export interface AppState {
  title: string;
  author: string;
  quotes: [string, string, string];
  entries: ArchiveEntry[];
}
