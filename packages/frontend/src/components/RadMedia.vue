<template>
  <div
    :class="[
      'w-full overflow-hidden bg-black',
      {
        'relative rounded-tl border-t mobile:rounded-none mobile:border-none': !fullscreen,
        'hidden': !videoShown,
      },
    ]"
    @dblclick="toggleFullscreen()"
  >
    <video
      ref="mediaElement"
      class="pointer-events-none h-full w-full"
      playsinline
      @loadedmetadata="onLoadedMetadata()"
      @loadeddata="confirmPlaying(lastTriedUrl)"
      @timeupdate="hasVideo = mediaElement.videoHeight > 0"
      @play="playLastStation()"
      @pause="stop()"
      @waiting="handleBufferWaiting(true)"
      @playing="handleBufferWaiting(false)"
      @error="handleError()"
    ></video>
    <div
      v-if="hasVideo && loading"
      class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50 text-white"
    >
      <FasSpinner class="animate-spin text-[4em]" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Hls, { type ErrorData } from "hls.js";
import Screenfull from "screenfull";

import FasPlay from "~icons/fa-solid/play";

import { type ModalOptions, ModalType } from "@/store";
import { fetchPlayableUrl } from "@/common/network";
import type { TranslateResult } from "vue-i18n";
import { downloadList } from "@/common/list-converter";

let newestAbortController: AbortController | undefined;
let hls: Hls | undefined;

@Component
export default class RadMedia extends Vue {
  hasVideo = false;
  triedUrls = [] as string[];

  @Ref() readonly mediaElement!: HTMLVideoElement;

  @Getter readonly fullscreen!: boolean;
  @Getter readonly loading!: boolean;
  @Getter readonly settings!: Settings;
  @Getter("currentStation") readonly station?: Station;
  @Getter readonly volume!: number;

  @Action allowFullscreen!: (hasVideo: boolean) => Promise<void>;
  @Action confirmFullscreen!: (fullscreen: boolean) => Promise<void>;
  @Action confirmPlaying!: (url: string) => Promise<void>;
  @Action handleBufferWaiting!: (waiting: boolean) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;
  @Action showToast!: (toast: Toast) => Promise<void>;
  @Action stop!: () => Promise<void>;
  @Action toggleFullscreen!: () => Promise<void>;
  @Action toggleStation!: () => Promise<void>;

  get lastTriedUrl(): string {
    return this.triedUrls[this.triedUrls.length - 1];
  }

  set lastTriedUrl(lastTriedUrl: string) {
    this.triedUrls.push(lastTriedUrl);
  }

  get videoShown(): boolean {
    return this.station !== undefined && this.hasVideo;
  }

  created(): void {
    window.addEventListener("beforeunload", this.detachStream);
    const fullscreen = Screenfull;

    if (fullscreen.isEnabled) {
      fullscreen.on("change", () => {
        this.confirmFullscreen(fullscreen.isFullscreen);
      });
    }
  }

  @Watch("settings.externalPlayback")
  onPlaybackChanged() {
    this.stop();
  }

  @Watch("station")
  async onStationChanged(station?: Station): Promise<void> {
    newestAbortController?.abort();
    const controller = new AbortController();
    newestAbortController = controller;

    this.detachStream();
    this.triedUrls = [];

    if (station === undefined) {
      return;
    }

    if (this.settings.externalPlayback) {
      this.playExternally(this.station!);
      return;
    }

    try {
      const playableUrl = await fetchPlayableUrl({
        stationId: station.id,
        signal: controller.signal,
      });

      this.play(playableUrl.ok ? playableUrl.url : station.url);
    } catch {
      if (!controller.signal.aborted) {
        this.play(station.url);
      }
    }
  }

  @Watch("volume", { immediate: true })
  async onVolumeChanged(volume: number): Promise<void> {
    await this.$nextTick();
    this.mediaElement.volume = volume;
  }

  @Watch("hasVideo")
  onVideoToggled(hasVideo: boolean): void {
    if (hasVideo) {
      window.screen.orientation?.addEventListener("change", this.handleOrientationChange);
    } else {
      window.screen.orientation?.removeEventListener("change", this.handleOrientationChange);

      const fullscreen = Screenfull;

      if (fullscreen.isEnabled && fullscreen.isFullscreen) {
        this.toggleFullscreen();
      }
    }

    this.allowFullscreen(hasVideo);
  }

  isNativeStream(streamUrl: string): boolean {
    try {
      return !new URL(streamUrl).pathname.endsWith(".m3u8");
    } catch {
      return true;
    }
  }

  play(url: string): void {
    this.lastTriedUrl = url;

    if (this.isNativeStream(url)) {
      this.mediaElement.src = url;
      return;
    }
    this.playHls(url);
  }

  playHls(url: string): void {
    if (Hls.isSupported()) {
      hls = new Hls();

      hls.on(Hls.Events.ERROR, (_, data) => {
        this.handleHlsError(data);
      });

      hls.loadSource(window.location.protocol === "https:" ? url.replace("http:", "https:") : url);
      hls.attachMedia(this.mediaElement);

      return;
    }

    this.showErrorMessage({
      title: this.$t("general.error.hlsNotSupported.title"),
      message: this.$t("general.error.hlsNotSupported.description", [
        (this.station as Station).name,
      ]),
    });

    this.stop();
  }

  async playExternally(station: Station): Promise<void> {
    await downloadList({
      name: station.name,
      type: this.settings.defaultPlaylistFormat!,
      content: [station],
    });

    this.showToast({
      message: this.$t("general.externalPlayback") as string,
      icon: FasPlay,
    });
  }

  detachStream(): void {
    this.mediaElement.removeAttribute("src");
    this.mediaElement.load();

    if (hls !== undefined) {
      this.hasVideo = false;
      hls.destroy();
      hls = undefined;
    }
  }

  playLastStation(): void {
    if (this.station === undefined) {
      this.toggleStation().catch(() => {});
    }
  }

  handleOrientationChange(): void {
    if (this.fullscreen !== (window.screen.orientation.angle % 180 === 90)) {
      this.toggleFullscreen();
    }
  }

  onLoadedMetadata(): void {
    this.mediaElement.play().catch(() => {
      // Errors are handled by the @error listener.
    });
  }

  handleError(): void {
    if (navigator.onLine) {
      switch (this.mediaElement.error?.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          this.showErrorMessage({
            title: this.$t("general.error.networkIssue.title"),
            message: this.$t("general.error.networkIssue.description", [
              this.$t("general.tryAgainLater"),
            ]),
          });

          break;

        case MediaError.MEDIA_ERR_DECODE:
          this.showErrorMessage({
            title: this.$t("general.error.decode.title"),
            message: this.$t("general.error.decode.description"),
          });

          break;

        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: {
          if (this.triedUrls.every((url) => !url.endsWith("/;"))) {
            this.play(`${this.lastTriedUrl}/;`.replace("//;", "/;"));
            return;
          }

          const stationUrl = (this.station as Station).url;

          if (!this.triedUrls.includes(stationUrl)) {
            this.play(stationUrl);
            return;
          }

          this.showErrorMessage({
            title: this.$t("general.error.noSupportedSource.title"),
            message: this.$t("general.error.noSupportedSource.description"),
          });

          break;
        }

        default:
          this.showErrorMessage({
            title: this.$t("general.error.noSupportedSource.title"),
            message: this.$t("general.error.noSupportedSource.description"),
          });
      }
    } else {
      this.showErrorMessage({
        title: this.$t("general.error.networkIssue.title"),
        message: this.$t("general.error.goOnline"),
      });
    }

    this.stop();
    this.detachStream();
  }

  showErrorMessage(config: { title: TranslateResult; message: TranslateResult }): void {
    this.showMessage({
      type: ModalType.ERROR,
      buttons: [this.$t("general.ok") as string],
      title: config.title as string,
      message: config.message as string,
    });
  }

  handleHlsError(data: ErrorData): void {
    if (!navigator.onLine) {
      this.handleError();
      return;
    }

    if (data.fatal) {
      switch (data.details) {
        case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
        case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          this.showErrorMessage({
            title: this.$t("general.error.timeout.title"),
            message: this.$t("general.error.timeout.description"),
          });

          break;

        default:
          this.showErrorMessage({
            title: this.$t("general.error.hlsGeneric.title"),
            message: this.$t("general.error.hlsGeneric.description", [
              (this.station as Station).name,
              this.$t(
                `general.error.hlsGeneric.${
                  data.type === Hls.ErrorTypes.NETWORK_ERROR
                    ? "network"
                    : data.type === Hls.ErrorTypes.MEDIA_ERROR
                    ? "media"
                    : "other"
                }`
              ),
            ]),
          });
      }

      this.stop();
      this.detachStream();
    }
  }
}
</script>
