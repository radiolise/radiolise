import { format } from "date-fns";

import { saveFile, convertToYaml } from "./downloader";
import store from "@/store";
import i18n from "@/lang";

export interface ListDownloadPayload {
  name: string;
  type: string;
  content: Station[];
}

interface OutputFormat<T> {
  start: string;
  getEntry: (item: T, index: number) => string;
  end: string;
}

function getDisplayName(name: string, index: number) {
  return `(${index + 1}) ${name}`;
}

function generateOutput<T>(list: T[], format: OutputFormat<T>) {
  const { start, getEntry, end } = format;
  return [start, ...list.map(getEntry), end].join("\n");
}

function convertToAppFormat(payload: { name: string; content: Station[] }) {
  return convertToYaml({
    version: "2",
    type: "list",
    data: { [payload.name]: payload.content },
  });
}

function convertToPls(list: Station[]) {
  return generateOutput(list, {
    start: "[playlist]",
    getEntry: (item, index) => {
      return `File${index + 1}=${item.url}\nTitle${index + 1}=${getDisplayName(item.name, index)}`;
    },
    end: `Version=2\n`,
  });
}

function convertToM3u(list: Station[]) {
  return generateOutput(list, {
    start: "#EXTM3U",
    getEntry: (item, index) => {
      const normalizedName = getDisplayName(item.name, index).replace(/(\s*[+\-[\]]\s*)+/g, " ");
      return `#EXTINF:-1,${normalizedName}\n${item.url}`;
    },
    end: "",
  });
}

function encodeXmlEntities(value: string) {
  return value.replace(/[\u00A0-\u9999<>&]/g, (substring) => `&#${substring.charCodeAt(0)};`);
}

function convertToXspf(list: Station[]) {
  return generateOutput(list, {
    start: `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <trackList>`,
    getEntry: (item, index) => {
      return `    <track>
      <title>${encodeXmlEntities(getDisplayName(item.name, index))}</title>
      <location>${encodeXmlEntities(item.url)}</location>
      <image>${encodeXmlEntities(item.icon)}</image>
    </track>`;
    },
    end: `  </trackList>
</playlist>
`,
  });
}

async function convertList({ type, name, content }: ListDownloadPayload) {
  switch (type) {
    case "txt":
      return convertToAppFormat({ name, content });
    case "pls":
      return convertToPls(content);
    case "m3u":
      return convertToM3u(content);
    case "xspf":
      return convertToXspf(content);
    default:
      throw new Error("List conversion failed: Unknown output type");
  }
}

export async function downloadList(payload: ListDownloadPayload) {
  const output = await convertList(payload);
  const { name, type } = payload;
  return saveFile({ name, type, output });
}

export async function downloadBookmarks(bookmarks: Title[]) {
  const name = "Bookmarks";
  const type = "txt";
  const locale = await store.dispatch("determineDateFnsLocale", i18n.locale);

  const output = generateOutput(bookmarks, {
    start: `# RADIOLISE BOOKMARKS\n` + `# As of: ${format(new Date(), "Pp", { locale })}\n`,
    getEntry: ({ time, info, station }) => {
      return `- ${format(time * 60, "Pp", { locale })} | ${info} (${station})`;
    },
    end: "",
  });

  return saveFile({ name, type, output });
}
