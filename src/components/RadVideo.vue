<template>
  <div
    v-show="videoShown"
    id="vcontain"
    style="position: relative"
    @dblclick="toggleFullscreen()"
  >
    <video
      ref="mediaElement"
      playsinline
      @loadedmetadata="onLoadedMetadata()"
      @loadeddata="confirmPlaying(lastTriedUrl)"
      @timeupdate="hasVideo = $event.target.videoHeight > 0"
      @play="playLastStation()"
      @pause="stop()"
      @waiting="handleBufferWaiting(true)"
      @canplay="handleBufferWaiting(false)"
      @error="handleError()"
    />
    <div v-if="hasVideo && loading" class="spin-container">
      <font-awesome-icon icon="spinner" spin size="4x" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Axios from "axios";
import Hls from "hls.js";
import QueryString from "qs";
import Screenfull from "screenfull";

import { ModalOptions, ModalType } from "@/store";

const { CancelToken } = Axios;
let source = CancelToken.source();

let hls: Hls | undefined;

@Component
export default class RadVideo extends Vue {
  hasVideo = false;
  lastTriedUrl = "";

  @Ref() readonly mediaElement!: HTMLVideoElement;

  @Getter readonly loading!: boolean;
  @Getter readonly serviceUrl!: string;
  @Getter readonly radioBrowserUrl!: string;
  @Getter("currentStation") readonly station?: Station;
  @Getter readonly volume!: number;
  @Getter readonly fullscreen!: boolean;

  @Action allowFullscreen!: (hasVideo: boolean) => Promise<void>;
  @Action confirmFullscreen!: (fullscreen: boolean) => Promise<void>;
  @Action confirmPlaying!: (url: string) => Promise<void>;
  @Action handleBufferWaiting!: (waiting: boolean) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;
  @Action stop!: () => Promise<void>;
  @Action toggleFullscreen!: () => Promise<void>;
  @Action toggleStation!: () => Promise<void>;

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

  @Watch("station")
  async onStationChanged(station?: Station): Promise<void> {
    if (source) {
      source.cancel();
      source = CancelToken.source();
    }

    this.detachStream();

    if (station !== undefined) {
      try {
        const response = await Axios.get(
          `${this.radioBrowserUrl}url/${station.id}`,
          {
            cancelToken: source.token,
          }
        );

        this.play(response.data.ok ? response.data.url : station.url);
      } catch (error) {
        if (!Axios.isCancel(error)) {
          this.play(station.url);
        }
      }
    }
  }

  @Watch("volume", { immediate: true })
  async onVolumeChanged(volume: number, oldVolume: number): Promise<void> {
    await this.$nextTick();
    this.mediaElement.volume = volume;
  }

  @Watch("hasVideo")
  onVideoToggled(hasVideo: boolean): void {
    if (hasVideo) {
      window.screen.orientation.addEventListener(
        "change",
        this.handleOrientationChange
      );
    } else {
      window.screen.orientation.removeEventListener(
        "change",
        this.handleOrientationChange
      );

      const fullscreen = Screenfull;

      if (fullscreen.isEnabled && fullscreen.isFullscreen) {
        this.toggleFullscreen();
      }
    }

    this.allowFullscreen(hasVideo);
  }

  static isNativeStream(streamUrl: string): boolean {
    let url = streamUrl;
    let index = url.lastIndexOf("/");

    if (index !== -1) {
      url = url.substring(index + 1);
    }

    index = url.indexOf("?");

    if (index !== -1) {
      url = url.substring(0, index);
    }

    index = url.indexOf("#");

    if (index !== -1) {
      url = url.substring(0, index);
    }

    index = url.lastIndexOf(".");
    return index === -1 || url.substring(index + 1) !== "m3u8";
  }

  play(url: string): void {
    this.lastTriedUrl = url;

    if (RadVideo.isNativeStream(url)) {
      this.mediaElement.src = `${this.serviceUrl}?${QueryString.stringify({
        url,
        play: 1,
      })}`;
    } else {
      this.playHls(url);
    }
  }

  playHls(url: string): void {
    if (Hls.isSupported()) {
      hls = new Hls();

      hls.on(Hls.Events.ERROR, (_, data) => {
        this.handleHlsError(data);
      });

      hls.loadSource(
        window.location.protocol === "https:"
          ? url.replace("http:", "https:")
          : url
      );

      hls.attachMedia(this.mediaElement);
    } else {
      this.showMessage({
        title: this.$t("general.error.hlsNotSupported.title") as string,
        buttons: [this.$t("general.ok") as string],
        type: ModalType.ERROR,
        message: this.$t("general.error.hlsNotSupported.description", [
          (this.station as Station).name,
        ]) as string,
      });

      this.stop();
    }
  }

  detachStream(): void {
    this.mediaElement.removeAttribute("src");
    this.mediaElement.load();

    if (hls !== undefined) {
      hls.destroy();
      hls = undefined;
    }
  }

  playLastStation(): void {
    if (this.station === undefined) {
      this.toggleStation();
    }
  }

  handleOrientationChange(): void {
    if (this.fullscreen !== (window.screen.orientation.angle % 180 === 90)) {
      this.toggleFullscreen();
    }
  }

  onLoadedMetadata(): void {
    const playPromise = this.mediaElement.play();

    if (playPromise instanceof Promise) {
      playPromise.catch(() => {
        // Errors are handled by the @error listener.
      });
    }
  }

  handleError(): void {
    if (navigator.onLine) {
      switch (this.mediaElement.error?.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.networkIssue.title") as string,
            message: this.$t("general.error.networkIssue.description", [
              this.$t("general.tryAgainLater"),
            ]) as string,
          });

          break;

        case MediaError.MEDIA_ERR_DECODE:
          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.decode.title") as string,
            message: this.$t("general.error.decode.description") as string,
          });

          break;

        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          if (!this.lastTriedUrl.endsWith("/;")) {
            this.play(`${this.lastTriedUrl}/;`.replace("//;", "/;"));
            return;
          }

          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.noSupportedSource.title") as string,
            message: this.$t(
              "general.error.noSupportedSource.description"
            ) as string,
          });

          break;

        default:
          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.noSupportedSource.title") as string,
            message: this.$t(
              "general.error.noSupportedSource.description"
            ) as string,
          });
      }
    } else {
      this.showMessage({
        type: ModalType.ERROR,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("general.error.networkIssue.title") as string,
        message: this.$t("general.error.goOnline") as string,
      });
    }

    this.stop();
    this.detachStream();
  }

  handleHlsError(data: Hls.errorData): void {
    if (!navigator.onLine) {
      this.handleError();
      return;
    }

    if (data.fatal) {
      switch (data.details) {
        case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
        case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.timeout.title") as string,
            message: this.$t("general.error.timeout.description") as string,
          });

          break;

        default:
          this.showMessage({
            type: ModalType.ERROR,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("general.error.hlsGeneric.title") as string,
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
            ]) as string,
          });
      }

      this.stop();
      this.detachStream();
    }
  }
}
</script>

<style lang="less" scoped>
video {
  pointer-events: none;
}
.spin-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
}
</style>
