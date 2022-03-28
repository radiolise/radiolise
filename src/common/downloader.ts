interface FileInfo {
  name: string;
  type: string;
  output: string;
}

function resolveMimeType(type: string) {
  switch (type) {
    case "txt":
      return "application/x-yaml";
    case "pls":
      return "audio/x-scpls";
    case "m3u":
      return "audio/mpegurl";
    case "xspf":
      return "application/xspf+xml";
    default:
      throw new Error("MIME type resolution failed: Unknown type");
  }
}

export async function convertToYaml(value: any) {
  const YAML = await import("yaml");
  return YAML.stringify(value);
}

export async function saveFile({ name, type, output }: FileInfo) {
  const mimeType = resolveMimeType(type);
  const fileName = `${name.replace(/ /g, "_")}_${new Date().getTime()}.${type}`;

  const { default: FileSaver } = await import(/* webpackChunkName: "file-saver" */ "file-saver");

  FileSaver.saveAs(new Blob([output], { type: mimeType }), fileName);
}
