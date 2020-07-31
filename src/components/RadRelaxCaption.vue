<template>
  <div id="relaxcaption" :style="{ fontSize: fontSize + 'pt' }">
    <span>
      <div>{{ name }}</div>
      <div>{{ info }}</div>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class RadRelaxCaption extends Vue {
  fontSize = 0;

  @Getter readonly currentStation: Station | undefined;
  @Getter readonly currentInfo: string | undefined;

  created(): void {
    window.addEventListener("resize", this.resizeFont);
    this.resizeFont();
  }

  get name(): string {
    return this.currentStation ? this.currentStation.name : "";
  }

  get info(): string {
    return this.currentInfo ?? "";
  }

  @Watch("relaxed")
  onRelaxedChanged(relaxed: boolean): void {
    if (relaxed) {
      window.addEventListener("resize", this.resizeFont);
      this.resizeFont();
    } else {
      window.removeEventListener("resize", this.resizeFont);
    }
  }

  resizeFont(): void {
    this.fontSize = Math.sqrt(window.innerWidth * 1.2);
  }
}
</script>
