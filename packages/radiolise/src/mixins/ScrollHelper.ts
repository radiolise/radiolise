import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import VueScrollto from "vue-scrollto";

Vue.use(VueScrollto);

@Component
export default class ScrollHelper extends Vue {
  @Ref() readonly controls!: HTMLDivElement;

  @Getter readonly stickyPlayer!: boolean;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly hasVideo!: boolean;

  @Action expandPlayer!: (expand: boolean) => Promise<void>;
  @Action stickPlayer!: (sticky: boolean) => Promise<void>;

  mounted(): void {
    window.addEventListener("scroll", this.scrollHandler);
    window.addEventListener("resize", this.scrollHandler);
  }

  @Watch("hasVideo")
  async onVideoToggled(): Promise<void> {
    await this.$nextTick();
    this.scrollHandler();
  }

  @Watch("fullscreen")
  async scrollHandler(): Promise<void> {
    await this.$nextTick();

    const { top } = this.controls.getBoundingClientRect();
    const sticky = top <= 50;

    if (this.stickyPlayer !== sticky) {
      this.stickPlayer(sticky);
    }
  }
}
