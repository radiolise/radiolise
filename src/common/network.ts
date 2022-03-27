import axios, { AxiosRequestConfig, CancelToken } from "axios";

const SERVICE_URL = "https://service.radiolise.com";
const RADIO_BROWSER_FALLBACK_URL = "https://de1.api.radio-browser.info/json";
let eventualRadioBrowserUrl: Promise<string> | undefined;

async function request<T = any>(config: AxiosRequestConfig) {
  const response = await axios(config);
  return response.data as T;
}

function fetchFromService<T = any>(url: string, config?: AxiosRequestConfig) {
  return request<T>({ baseURL: SERVICE_URL, url, ...config });
}

async function fetchRadioBrowserUrls() {
  const serverInfo = await request<any[]>({
    baseURL: RADIO_BROWSER_FALLBACK_URL,
    url: "/servers",
  });

  return serverInfo.map((server) => `https://${server.name}/json`);
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

async function fetchFromRadioBrowser<T = any>(
  url: string,
  config?: AxiosRequestConfig
) {
  return request<T>({ baseURL: await getRadioBrowserUrl(), url, ...config });
}

export function convertOldIds(oldStationIds: string[]) {
  return fetchFromService<Record<string, string>>("/convert-ids/", {
    params: { ids: oldStationIds.join(",") },
  });
}

export function fetchCountries() {
  return fetchFromRadioBrowser<Filter>("/countries");
}

export function fetchStates(countryFilter: string) {
  return fetchFromRadioBrowser<Filter>(`/states/${countryFilter}/`);
}

export function fetchLanguages() {
  return fetchFromRadioBrowser<Filter>("/languages");
}

export function fetchPlayableUrl(options: {
  stationId: string;
  cancelToken: CancelToken;
}) {
  const { stationId, cancelToken } = options;
  return fetchFromRadioBrowser(`/url/${stationId}`, { cancelToken });
}

export function findStations(options: {
  searchEntries: Record<string, any>;
  cancelToken: CancelToken;
}) {
  const { searchEntries, cancelToken } = options;
  return fetchFromRadioBrowser<Record<string, any>[]>("/stations/search", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams(searchEntries).toString(),
    cancelToken,
  });
}

export function fetchNowPlayingInfo(options: {
  url: string;
  cancelToken: CancelToken;
}) {
  const { url, cancelToken } = options;
  return fetchFromService<Record<string, string>>("/", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams({ url }).toString(),
    cancelToken,
    timeout: 50000,
  });
}

export function voteForStation(stationId: string) {
  return fetchFromRadioBrowser<Record<string, any>>(`/vote/${stationId}`);
}

export async function fetchVoteNumber(stationId: string) {
  const results = await fetchFromRadioBrowser(`/stations/byuuid/${stationId}`);

  if (results.length === 0) {
    throw new Error("Unable to fetch vote number: Station not found.");
  }

  return results[0].votes as number;
}

export default { CancelToken: axios.CancelToken, isCancel: axios.isCancel };
