import axios, { AxiosRequestConfig, CancelToken } from "axios";
import qs from "qs";

const serviceUrl = "https://service.radiolise.com";
const fallbackRadioBrowserUrl = "https://fr1.api.radio-browser.info/json";
let eventualRadioBrowserUrl: Promise<string> | undefined;

async function fetch(config: AxiosRequestConfig): Promise<any> {
  const response = await axios(config);
  return response.data;
}

function fetchFromService(
  url: string,
  config?: AxiosRequestConfig
): Promise<any> {
  return fetch({ baseURL: serviceUrl, url, ...config });
}

async function fetchRadioBrowserUrls(): Promise<string[]> {
  const serverInfo = await fetch({
    baseURL: fallbackRadioBrowserUrl,
    url: "/servers",
  });

  return serverInfo.map((server: any) => "https://" + server.name + "/json");
}

async function fetchRandomRadioBrowserUrl(): Promise<string> {
  const baseUrls = await fetchRadioBrowserUrls();
  return baseUrls[Math.floor(Math.random() * baseUrls.length)];
}

async function getRadioBrowserUrl(): Promise<string> {
  if (eventualRadioBrowserUrl === undefined) {
    eventualRadioBrowserUrl = fetchRandomRadioBrowserUrl();
  }

  try {
    return await eventualRadioBrowserUrl;
  } catch {
    eventualRadioBrowserUrl = undefined;
    return fallbackRadioBrowserUrl;
  }
}

async function fetchFromRadioBrowser(
  url: string,
  config?: AxiosRequestConfig
): Promise<any> {
  return fetch({ baseURL: await getRadioBrowserUrl(), url, ...config });
}

export function convertOldIds(
  oldStationIds: string[]
): Promise<Record<string, string>> {
  return fetchFromService("/convert-ids/", {
    params: { ids: oldStationIds.join(",") },
  });
}

export function fetchCountries(): Promise<Filter> {
  return fetchFromRadioBrowser("/countries");
}

export function fetchStates(countryFilter: string): Promise<Filter> {
  return fetchFromRadioBrowser("/states/" + countryFilter + "/");
}

export function fetchLanguages(): Promise<Filter> {
  return fetchFromRadioBrowser("/languages");
}

export function fetchPlayableUrl(options: {
  stationId: string;
  cancelToken: CancelToken;
}): Promise<any> {
  const { stationId, cancelToken } = options;
  return fetchFromRadioBrowser("/url/" + stationId, { cancelToken });
}

export function findStations(options: {
  searchEntries: Record<string, any>;
  cancelToken: CancelToken;
}): Promise<any> {
  const { searchEntries, cancelToken } = options;
  return fetchFromRadioBrowser("/stations/search", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(searchEntries),
    cancelToken,
  });
}

export function fetchNowPlayingInfo(options: {
  url: string;
  cancelToken: CancelToken;
}): Promise<Record<string, string>> {
  const { url, cancelToken } = options;
  return fetchFromService("/", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({ url }),
    cancelToken,
    timeout: 50000,
  });
}

export function voteForStation(
  stationId: string
): Promise<Record<string, any>> {
  return fetchFromRadioBrowser("/vote/" + stationId);
}

export async function fetchVoteNumber(stationId: string): Promise<number> {
  const results = await fetchFromRadioBrowser("/stations/byuuid/" + stationId);

  if (results.length === 0) {
    throw new Error("Unable to fetch vote number: Station not found.");
  }

  return results[0].votes;
}

export default { CancelToken: axios.CancelToken, isCancel: axios.isCancel };
