import { Component, ProvideReactive, Watch, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class ColorChanger extends Vue {
  accentColor = "";
  backgroundColor = "";

  @Getter readonly changeColor!: boolean;
  @Getter readonly currentStation!: Station;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly playing!: boolean;
  @Getter readonly settings!: Settings;

  @ProvideReactive()
  get colorful(): boolean {
    return this.backgroundColor !== "";
  }

  get colorizationAllowed(): boolean {
    return this.changeColor && this.currentStation !== undefined && !this.fullscreen;
  }

  @Watch("backgroundColor")
  handleColorChanged(): void {
    this.accentColor = this.colorful ? this.generateHsl(60) : "";
  }

  @Watch("currentStation")
  handleStationChanged(): void {
    this.setBackgroundColor();
  }

  @Watch("playing")
  handlePlayingChanged(): void {
    this.setBackgroundColor();
  }

  @Watch("changeColor")
  handleColorChangeToggled(): void {
    this.setBackgroundColor();
  }

  generateHsl(lightness: number): string {
    return `hsl(${this.currentStation.hue} 50% ${lightness}%)`;
  }

  setBackgroundColor(): void {
    if (!this.colorizationAllowed) {
      this.backgroundColor = "";
      return;
    }

    if (this.playing) {
      this.backgroundColor = this.generateHsl(30);
    }
  }
}
