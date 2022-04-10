interface Station {
  name: string;
  url: string;
  homepage: string;
  icon: string;
  country: string;
  state: string;
  language: string;
  tags: string;
  id: string;
  hue?: number;
}

interface SelectableStation extends Station {
  selected: boolean;
}

interface Title {
  station: string;
  info: string;
  time: number;
}

interface Settings {
  theme: string;
  colorScheme: string;
  compactMode?: boolean;
  externalPlayback?: boolean;
  visualization: boolean;
  relax: boolean;
  relaxTimeout: number;
  sleep: boolean;
  sleepTimeout: number;
  changecolor: boolean;
  defaultPlaylistFormat?: "xspf" | "pls" | "m3u";
  volume: number;
  loadpolicy: boolean;
  language: string;
}

interface StationList {
  name: string;
  content: Station[];
}

interface StationCache {
  [id: string]: {
    liked?: boolean;
    likeCount?: number;
    hue?: number;
    image?: string;
    playableURL?: string;
  };
}

interface Memory {
  version: string;
  lists: StationList[];
  settings: Settings;
  titles: {
    history: Title[];
    favorites: Title[];
  };
  lastStation: Station | null;
  lastList: number;
  cache: StationCache;
}

type Filter = Array<{
  name: string;
  stationcount: number;
  country?: string;
}> | null;

type NumberLike = number | `${number}` | "";

interface SearchOptions {
  tags: string;
  country: string;
  state: string;
  language: string;
  order: string;
  bitrate: { min?: NumberLike; max?: NumberLike };
  reverse: boolean;
  includeBroken: boolean;
}

interface LikeState {
  id: string;
  promise: Promise<{
    ok: boolean;
    message: string;
  }>;
}

interface DropdownOption {
  id: string | number;
  name: string;
  description?: string | number;
}

interface Toast {
  message: string;
  icon?: any;
}

interface DialogProps {
  type?: string;
  [key: string]: any;
}

interface DialogState {
  viewId: string;
  props?: DialogProps;
}

interface Window {
  app?: Vue;
}

interface Navigator {
  readonly mediaSession?: MediaSession;
}

type MediaSessionPlaybackState = "none" | "paused" | "playing";

type MediaSessionAction =
  | "play"
  | "pause"
  | "seekbackward"
  | "seekforward"
  | "previoustrack"
  | "nexttrack";

interface MediaSession {
  playbackState: MediaSessionPlaybackState;
  metadata: MediaMetadata | null;
  setActionHandler(action: MediaSessionAction, listener: (() => void) | null): void;
}

interface MediaImage {
  src: string;
  sizes?: string;
  type?: string;
}

interface MediaMetadataInit {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}

declare class MediaMetadata {
  constructor(init?: MediaMetadataInit);
  title: string;
  artist: string;
  album: string;
}
