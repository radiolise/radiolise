<template>
  <div id="visualization" ref="visualization">
    <div
      v-for="(position, i) in positions"
      :key="i"
      :style="{ top: position }"
    />
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class RadVisualization extends Vue {
  positions = Array.from({ length: 10 }).fill("");
  vinterval?: number;

  @Getter("visualizationActive") readonly active!: boolean;

  @Watch("active")
  onActiveChanged(active: boolean): void {
    if (active) {
      this.vinterval = setInterval(() => {
        this.positions.forEach((child, i) => {
          this.$set(
            this.positions,
            i,
            `${Math.floor(Math.random() * 15) + 50}%`
          );
        });
      }, 100);
    } else if (this.vinterval) {
      clearInterval(this.vinterval);

      this.positions.forEach((child, i) => {
        this.$set(this.positions, i, "");
      });
    }
  }
}
</script>
