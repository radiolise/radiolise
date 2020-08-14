const mimeTypes = {
  txt: "application/x-yaml",
  pls: "audio/x-scpls",
  m3u: "audio/mpegurl",
  xspf: "application/xspf+xml",
};

type OutputType = keyof typeof mimeTypes;

type ListOutput =
  | string
  | Record<string, string | Record<string, Station[]> | Settings | Title[]>;

interface DownloadInfo {
  name: string;
  type: OutputType;
  output: ListOutput;
}

interface Downloadable extends DownloadInfo {
  output: string;
}

async function provideFile({
  name,
  type,
  output,
}: Downloadable): Promise<void> {
  const mimeType = mimeTypes[type];
  const fileName = `${name.replace(/ /g, "_")}_${new Date().getTime()}.${type}`;

  const FileSaver = await import(
    /* webpackChunkName: "file-saver" */ "file-saver"
  );

  FileSaver.saveAs(new Blob([output], { type: mimeType }), fileName);
}

async function download({ name, type, output }: DownloadInfo): Promise<void> {
  if (typeof output === "string") {
    provideFile({ name, type, output });
  } else {
    const YAML = await import(/* webpackChunkName: "yaml" */ "yaml");
    provideFile({ name, type, output: YAML.stringify(output) });
  }
}

export default download;
