import { Component, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

@Component
export default class RadPage extends Vue {
  @Getter readonly currentInfo: string | undefined;
  @Getter readonly currentStation: Station | undefined;
  @Getter readonly currentList!: Station[];

  @Action playClosestStation!: (forward: boolean) => Promise<void>;
  @Action stop!: () => Promise<void>;
  @Action toggleStation!: () => Promise<void>;

  get provideSwitchButtons() {
    const { currentStation } = this;
    return (
      currentStation !== undefined &&
      this.currentList.length >= 2 &&
      this.currentList.some((station) => station.id === currentStation.id)
    );
  }

  created() {
    if (!navigator.mediaSession) {
      return;
    }

    navigator.mediaSession.setActionHandler("pause", () => {
      this.stop();
    });
    navigator.mediaSession.setActionHandler("play", () => {
      this.toggleStation();
    });

    this.$watch("currentList", () => {
      this.setSwitchButtons(navigator.mediaSession);
    });

    const setMetadata = (info: string | undefined) => {
      const stationName = this.currentStation?.name;
      navigator.mediaSession.metadata = stationName
        ? new MediaMetadata({
            title: info ?? stationName,
            artist: info ? stationName : undefined,
            album: __APP_TITLE__,
          })
        : null;
    };

    this.$watch("currentStation", (station?: Station) => {
      navigator.mediaSession.playbackState = station ? "playing" : "paused";
      setMetadata(undefined);
      this.setSwitchButtons(navigator.mediaSession);
    });

    this.$watch("currentInfo", (info: string | undefined) => {
      if (info !== undefined) {
        setMetadata(info);
      }
    });
  }

  setSwitchButtons(mediaSession: MediaSession): void {
    const getHandler = (forward: boolean) =>
      this.provideSwitchButtons
        ? () => {
            this.playClosestStation(forward);
          }
        : null;

    mediaSession.setActionHandler("previoustrack", getHandler(false));
    mediaSession.setActionHandler("nexttrack", getHandler(true));
  }
}
