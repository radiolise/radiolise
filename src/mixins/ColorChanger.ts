import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class ColorChanger extends Vue {
  backgroundColor = "";

  @Getter readonly changeColor!: boolean;
  @Getter readonly currentStation!: Station;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly playing!: boolean;
  @Getter readonly settings!: Settings;

  get colorful(): boolean {
    return this.backgroundColor !== "";
  }

  get colorizationAllowed(): boolean {
    return this.changeColor && this.currentStation !== undefined && !this.fullscreen;
  }

  @Watch("backgroundColor")
  handleColorChanged(): void {
    const themeColor = this.colorful ? this.generateHsl(60) : "";
    document.documentElement.style.setProperty("--rad-primary-color", themeColor);
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
    return `hsl(${this.currentStation.hue}, 50%, ${lightness}%)`;
  }

  setBackgroundColor(): void {
    if (this.colorizationAllowed) {
      if (this.playing) {
        this.backgroundColor = this.generateHsl(30);
      }
    } else {
      this.backgroundColor = "";
    }
  }
}
