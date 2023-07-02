export const DEFAULT_SETTINGS: Settings = {
  theme: "candy",
  compactMode: true,
  externalPlayback: false,
  defaultPlaylistFormat: "xspf",
  colorScheme: "auto",
  visualization: false,
  relax: false,
  relaxTimeout: 10,
  sleep: false,
  sleepTimeout: 5,
  changecolor: false,
  volume: 100,
  loadpolicy: true,
  language: "auto",
};

export const DEFAULT_MEMORY: Memory = {
  version: "2",
  lists: [],
  settings: DEFAULT_SETTINGS,
  titles: {
    history: [],
    favorites: [],
  },
  lastStation: null,
  lastList: 0,
  cache: {},
};
