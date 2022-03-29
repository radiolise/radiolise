<template>
  <div class="fixed bottom-0 flex h-1/2 w-full items-end space-x-[1%] px-[1%]">
    <div
      v-for="(height, i) in heights"
      :key="i"
      :class="['w-full duration-100', colorful ? 'bg-white/10' : 'bg-black/10 dark:bg-white/10']"
      :style="{ height }"
    />
  </div>
</template>

<script lang="ts">
import { Component, InjectReactive, Vue } from "vue-property-decorator";

@Component
export default class RadVisualization extends Vue {
  heights = Array.from<string>({ length: 10 }).fill("0%");
  interval?: number;

  @InjectReactive() readonly colorful!: boolean;

  updateHeights(next: () => string) {
    this.heights.forEach((_, index) => {
      this.$set(this.heights, index, next());
    });
  }

  mounted() {
    this.interval = setInterval(() => {
      this.updateHeights(() => `${Math.floor(Math.random() * 30) + 70}%`);
    }, 100);
  }

  beforeDestroy() {
    clearInterval(this.interval);
  }
}
</script>
