const SERVICE_URL = "https://service.radiolise.com";
const RADIO_BROWSER_FALLBACK_URL = "https://de1.api.radio-browser.info";
let eventualRadioBrowserUrl: Promise<string> | undefined;

async function request<T = any>(url: URL, config?: RequestInit) {
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
}

function fetchFromService<T = any>(path: string, config: RequestInit) {
  return request<T>(new URL(path, SERVICE_URL), config);
}

async function fetchRadioBrowserUrls() {
  const serverInfo = await request<any[]>(new URL("/json/servers", RADIO_BROWSER_FALLBACK_URL));
  return serverInfo.map((server) => `https://${server.name}`);
}

async function fetchRandomRadioBrowserUrl() {
  const baseUrls = await fetchRadioBrowserUrls();
  return baseUrls[Math.floor(Math.random() * baseUrls.length)];
}

async function getRadioBrowserUrl() {
  if (eventualRadioBrowserUrl === undefined) {
    eventualRadioBrowserUrl = fetchRandomRadioBrowserUrl();
  }

  try {
    return await eventualRadioBrowserUrl;
  } catch {
    eventualRadioBrowserUrl = undefined;
    return RADIO_BROWSER_FALLBACK_URL;
  }
}

async function fetchFromRadioBrowser<T = any>(path: string, config?: RequestInit) {
  return request<T>(new URL(path, await getRadioBrowserUrl()), config);
}

export function convertOldIds(oldStationIds: string[]) {
  return fetchFromService<Record<string, string>>("/convert-ids/", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: oldStationIds.join(",") }),
  });
}

export function fetchCountries() {
  return fetchFromRadioBrowser<Filter>("/json/countries");
}

export function fetchStates(countryFilter: string) {
  return fetchFromRadioBrowser<Filter>(`/json/states/${countryFilter}/`);
}

export function fetchLanguages() {
  return fetchFromRadioBrowser<Filter>("/json/languages");
}

export function fetchPlayableUrl(options: { stationId: string; signal: AbortSignal }) {
  const { stationId, signal } = options;
  return fetchFromRadioBrowser(`/json/url/${stationId}`, { signal });
}

export function findStations(options: { searchEntries: Record<string, any>; signal: AbortSignal }) {
  const { searchEntries, signal } = options;
  return fetchFromRadioBrowser<SearchResult[]>("/json/stations/search", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(searchEntries),
    signal,
  });
}

export function voteForStation(stationId: string) {
  return fetchFromRadioBrowser<Record<string, any>>(`/json/vote/${stationId}`);
}

export async function fetchVoteNumber(stationId: string) {
  const results = await fetchFromRadioBrowser(`/json/stations/byuuid/${stationId}`);

  if (results.length === 0) {
    throw new Error("Unable to fetch vote number: Station not found.");
  }

  return results[0].votes as number;
}
