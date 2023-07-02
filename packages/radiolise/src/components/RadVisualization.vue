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
      :class="['w-full', colorful ? 'bg-white/10' : 'bg-black/10 dark:bg-white/10']"
      :style="{ height: `${value}%` }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, InjectReactive, Vue, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";

import { generateBarValues, useAnalyzer } from "@/common/visualization";

@Component
export default class RadVisualization extends Vue {
  barValues = Array.from<number>({ length: 10 }).fill(0);

  @InjectReactive() readonly colorful!: boolean;
  @Getter readonly visualizationActive!: boolean;

  async mounted() {
    useAnalyzer((analyzer) => {
      analyzer.onCanvasDraw = () => {
        this.barValues = [...generateBarValues(analyzer)];
      };
    });
  }

  @Watch("visualizationActive")
  async toggleAnalyzer(active: boolean) {
    useAnalyzer((analyzer) => analyzer.toggleAnalyzer(active));
  }

  beforeDestroy() {
    this.toggleAnalyzer(false);
  }
}
</script>
