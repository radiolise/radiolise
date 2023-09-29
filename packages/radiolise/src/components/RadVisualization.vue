<template>
  <div
    :class="[
      'fixed bottom-0 flex h-1/2 w-full items-end space-x-[1%] px-[1%] duration-200',
      { 'invisible opacity-0': !visualizationActive },
    ]"
  >
    <div
      v-for="(value, i) in barValues"
      :key="i"
      :class="['w-full duration-100', colorful ? 'bg-white/10' : 'bg-black/10 dark:bg-white/10']"
      :style="{ height: `${value}%` }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, InjectReactive, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class RadVisualization extends Vue {
  barValues = Array.from<number>({ length: 10 }).fill(0);
  interval!: number;

  @InjectReactive() readonly colorful!: boolean;
  @Getter readonly visualizationActive!: boolean;

  updateBarValues(next: () => number) {
    for (const index of this.barValues.keys()) {
      this.$set(this.barValues, index, next());
    }
  }

  mounted() {
    this.interval = window.setInterval(() => {
      this.updateBarValues(() => Math.floor(Math.random() * 30) + 70);
    }, 100);
  }

  beforeDestroy() {
    window.clearInterval(this.interval);
  }
}
</script>
