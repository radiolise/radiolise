import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import VueScrollTo from "vue-scrollto";

Vue.use(VueScrollTo);

@Component
export default class ScrollHelper extends Vue {
  playerBarHeight!: number;
  expandTimeout?: number;

  @Getter readonly fixedPlayer!: boolean;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly isPlayerExpanded!: boolean;

  @Action fixPlayer!: (fixedPlayer: boolean) => void;

  getPlayerBarHeight(): number {
    const playerBar = document.querySelector(
      "#video .videobar"
    ) as HTMLDivElement;

    return playerBar.offsetHeight;
  }

  mounted(): void {
    this.playerBarHeight = this.getPlayerBarHeight();
    this.resizeHandler();
    window.addEventListener("scroll", this.scrollHandler);
    window.addEventListener("resize", this.resizeHandler);
  }

  @Watch("hasVideo")
  onVideoToggled(): void {
    this.$nextTick(this.resizeHandler);
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
}
