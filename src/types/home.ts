// src/types/home.ts
export type HomeHero = {
  title: string;
  subtitle: string;
  showSearch: boolean;
};

export type MissionItem = { id: string; text: string };
export type Missions = { title: string; items: MissionItem[] };

export type SectionCardImage = { id: string; url: string; alt?: string };

export type HomeRow = {
  id: string;
  kind:
    | 'food'
    | 'cafe'
    | 'beauty'
    | 'carcare'
    | 'events'
    | 'videos'
    | 'network'
    | 'custom';
  title: string;
  ctaText?: string;
  ctaHref?: string;
  images?: SectionCardImage[];
  videoIds?: string[];
  storeIds?: string[];
  visible: boolean;
};

export type StoreMini = {
  id: string;
  name: string;
  logo?: string;
  views?: number;
  avgRating?: number;
};

export type HomePayload = {
  hero: HomeHero;
  missions: Missions;
  rows: HomeRow[];
  storesMini?: StoreMini[];
  updatedAt: string;
};