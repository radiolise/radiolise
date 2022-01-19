<template>
  <div id="relax-caption" :style="{ fontSize: `${fontSize}pt` }">
    <div class="station">
      <div class="broadcaster">{{ name }}</div>
      <div class="info">{{ info }}</div>
    </div>
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
    return this.currentStation?.name ?? "";
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

<style scoped>
#relax-caption {
  color: #fff;
  display: table;
  text-align: center;
  overflow: hidden;
  position: fixed;
  z-index: 5;
  left: 0;
  top: 0;
  width: calc(100% - 20vw);
  height: 50%;
  padding: 0 10vw;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s;
}
.station {
  display: table-cell;
  vertical-align: middle;
}
.station > div {
  width: 80vw;
}
.broadcaster {
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.info {
  font-size: 0.9em;
}
</style>
