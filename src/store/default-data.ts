export const defaultSettings: Settings = {
  theme: "candy",
  compactMode: true,
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

export const defaultMemory: Memory = {
  version: "2",
  lists: [],
  settings: defaultSettings,
  titles: {
    history: [],
    favorites: [],
  },
  lastStation: null,
  lastList: 0,
  cache: {},
};
