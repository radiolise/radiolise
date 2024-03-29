import { DEFAULT_MEMORY, DEFAULT_SETTINGS } from "./default-data";
import { convertOldIds } from "./network";

interface OldSettings {
  "theme": number;
  "visualization": boolean;
  "relax": boolean;
  "relax-timeout": number;
  "changecolor": boolean;
  "volume": number;
  "loadpolicy": boolean;
  "language": string;
}

interface OldTitle extends Title {
  time: number;
}

interface OldMemory {
  lists: {
    [name: string]: Station[];
  };
  settings: OldSettings;
  likes: string[];
  titles: {
    history: OldTitle[];
    favorites: OldTitle[];
  };
}

function convertIds(memory: OldMemory): Promise<Record<string, string>> {
  const oldStationIds = Object.values(memory.lists)
    .flatMap((list) => list.map((station) => station.id))
    .reduce((oldStationIds, id) => {
      if (!oldStationIds.includes(id)) {
        oldStationIds.push(id);
      }

      return oldStationIds;
    }, memory.likes);

  return convertOldIds(oldStationIds);
}

async function migrateData(memory: OldMemory): Promise<Memory> {
  const { lists, settings, titles } = memory;
  const convertedIds = await convertIds(memory);

  return {
    version: "2",
    lists: Object.entries(lists).map(([name, content]) => ({
      name,
      content: content.map((station) => ({
        ...station,
        id: convertedIds[station.id],
      })),
    })),
    settings: {
      theme: "candy",
      colorScheme: "auto",
      visualization: settings.visualization,
      relax: settings.relax,
      relaxTimeout: settings["relax-timeout"],
      sleep: DEFAULT_SETTINGS.sleep,
      sleepTimeout: DEFAULT_SETTINGS.sleepTimeout,
      changecolor: settings.changecolor ?? settings.theme === 3,
      volume: settings.volume,
      loadpolicy: settings.loadpolicy,
      language: settings.language,
    },
    titles,
    lastStation: localStorage.lastStation ?? null,
    lastList: 0,
    cache: {},
  };
}

function checkVersion(exists: boolean): boolean {
  if (exists) {
    try {
      return JSON.parse(localStorage.data).version !== DEFAULT_MEMORY.version;
    } catch {
      return false;
    }
  }

  return false;
}

async function unregisterServiceWorkers(): Promise<void> {
  if (navigator.serviceWorker !== undefined) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      registration.unregister();
    }
  }
}

async function load(exists: boolean, needsUpgrade: boolean): Promise<Memory> {
  if (exists) {
    const memory = JSON.parse(localStorage.data);

    if (needsUpgrade) {
      unregisterServiceWorkers();
      return migrateData(memory);
    }

    return memory;
  }

  return DEFAULT_MEMORY;
}

const exists = "data" in localStorage;

export const MEMORY_UPGRADE_NEEDED = checkVersion(exists);

export async function getMemory(): Promise<Memory> {
  const memory = await load(exists, MEMORY_UPGRADE_NEEDED);
  memory.settings.defaultPlaylistFormat ??= DEFAULT_SETTINGS.defaultPlaylistFormat;
  return memory;
}

export { DEFAULT_MEMORY };
