import { createMetadataClient, type NowPlayingInfo } from "@radiolise/metadata-client";
import store from "@/store";

const delimiter = " - ";

function processMetadata({ title }: NowPlayingInfo) {
  if (!title || title === "-") {
    return;
  }
  const cutStrings = title.split(delimiter);
  if (cutStrings.length >= 2) {
    title = [cutStrings.slice(0, 2).reverse().join(" / "), ...cutStrings.slice(2)].join(delimiter);
  }
  store.dispatch("updateInfo", title);
}

const nowPlaying = createMetadataClient({ url: __METADATA_SOCKET__ });

nowPlaying.subscribe(processMetadata);

export const { trackStream } = nowPlaying;
