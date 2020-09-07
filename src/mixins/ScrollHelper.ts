import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import VueScrollto from "vue-scrollto";

Vue.use(VueScrollto);

@Component
export default class ScrollHelper extends Vue {
  playerBarHeight!: number;

  @Getter readonly fixedPlayer!: boolean;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly isPlayerExpanded!: boolean;

  @Action fixPlayer!: (fixedPlayer: boolean) => Promise<void>;

  mounted(): void {
    this.playerBarHeight = this.getPlayerBarHeight();
    this.resizeHandler();
    window.addEventListener("scroll", this.scrollHandler);
    window.addEventListener("resize", this.resizeHandler);
  }

  @Watch("hasVideo")
  async onVideoToggled(): Promise<void> {
    await this.$nextTick();
    this.resizeHandler();
  }

  @Watch("fullscreen")
  resizeHandler(): void {
    this.scrollHandler();
  }

  @Watch("isPlayerExpanded")
  onPlayerExpanded(playerExpanded: boolean): void {
    const playerLocked =
      playerExpanded &&
      this.fixedPlayer &&
      document.documentElement.scrollTop === 0;

    if (playerLocked) {
      this.fixPlayer(false);
    }
  }

  getPlayerBarHeight(): number {
    const playerBar = document.querySelector(
      "#video .media-controls"
    ) as HTMLDivElement;

    return playerBar.offsetHeight;
  }

  scrollHandler(): void {
    const player = document.querySelector("#video") as HTMLDivElement;
    const playerRect = player.getBoundingClientRect();

    const fixedPlayer =
      playerRect.top + playerRect.height <= this.playerBarHeight + 50;

    if (this.fixedPlayer !== fixedPlayer) {
      this.fixPlayer(fixedPlayer);
    }
  }
}
