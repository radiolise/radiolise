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

<style scoped>
#visualization > div {
  position: fixed;
  background: #fff;
  opacity: 0.1;
  width: 8.9%;
  height: 50%;
  top: 100%;
  transition: top 0.1s;
}
#visualization > :first-child {
  left: 1%;
}
#visualization > :nth-child(2) {
  left: 10.9%;
}
#visualization > :nth-child(3) {
  left: 20.8%;
}
#visualization > :nth-child(4) {
  left: 30.7%;
}
#visualization > :nth-child(5) {
  left: 40.6%;
}
#visualization > :nth-child(6) {
  left: 50.5%;
}
#visualization > :nth-child(7) {
  left: 60.4%;
}
#visualization > :nth-child(8) {
  left: 70.3%;
}
#visualization > :nth-child(9) {
  left: 80.2%;
}
#visualization > :last-child {
  left: 90.1%;
}
</style>
