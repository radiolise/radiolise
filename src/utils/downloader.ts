const mimeTypes = {
  txt: "application/x-yaml",
  pls: "audio/x-scpls",
  m3u: "audio/mpegurl",
  xspf: "application/xspf+xml",
};

type OutputType = keyof typeof mimeTypes;

type ListOutput =
  | string
  | Record<string, string | Record<string, Station[]> | Settings>
  | (string | Title)[];

interface DownloadInfo {
  name: string;
  type: OutputType;
  output: ListOutput;
}

interface Downloadable extends DownloadInfo {
  output: string;
}

function provideFile({ name, type, output }: Downloadable): void {
  const mimeType = mimeTypes[type];
  const fileName = `${name.replace(/ /g, "_")}_${new Date().getTime()}.${type}`;

  import(/* webpackChunkName: "file-saver" */ "file-saver").then(FileSaver => {
    FileSaver.saveAs(new Blob([output], { type: mimeType }), fileName);
  });
}

function download({ name, type, output }: DownloadInfo): void {
  if (typeof output === "string") {
    provideFile({ name, type, output });
  } else {
    import(/* webpackChunkName: "yaml" */ "yaml").then(YAML => {
      provideFile({ name, type, output: YAML.stringify(output) });
    });
  }
}

export default download;
