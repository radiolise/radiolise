import { saveFile, convertToYaml } from "./downloader";

export interface ListDownloadPayload {
  name: string;
  type: string;
  content: Station[];
}

interface OutputFormat {
  start: string;
  getEntry: (item: Station, index: number) => string;
  end: string;
}

function generateOutput(list: Station[], format: OutputFormat) {
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
      return `File${index + 1}=${item.url}\nTitle${index + 1}=${item.name}`;
    },
    end: `Version=2\n`,
  });
}

function convertToM3u(list: Station[]) {
  return generateOutput(list, {
    start: "#EXTM3U",
    getEntry: (item) => {
      const normalizedName = item.name.replace(/(\s*[+\-()[\]]\s*)+/g, " ");
      return `#EXTINF:-1,${normalizedName}\n${item.url}`;
    },
    end: "",
  });
}

function encodeXmlEntities(value: string) {
  return value.replace(/[\u00A0-\u9999<>&]/g, (substring) => {
    return `&#${substring.charCodeAt(0)};`;
  });
}

function convertToXspf(list: Station[]) {
  return generateOutput(list, {
    start: `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <trackList>`,
    getEntry: (item) => {
      return `    <track>
      <title>${encodeXmlEntities(item.name)}</title>
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

async function downloadList(payload: ListDownloadPayload) {
  const output = await convertList(payload);
  const { name, type } = payload;
  saveFile({ name, type, output });
}

export default downloadList;
