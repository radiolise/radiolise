<template>
  <transition enter-class="opacity-0" leave-to-class="opacity-0" appear>
    <div
      class="fixed top-0 z-50 flex h-1/2 w-full items-center justify-center overflow-hidden px-[10vw] text-white transition-opacity"
      :style="{ fontSize: `${fontSize}pt` }"
    >
      <div class="max-w-full text-center">
        <div class="truncate font-bold">{{ name }}</div>
        <div class="text-[0.9em]">{{ info }}</div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
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

  beforeDestroy(): void {
    window.removeEventListener("resize", this.resizeFont);
  }

  get name(): string {
    return this.currentStation?.name ?? "";
  }

  get info(): string {
    return this.currentInfo ?? "";
  }

  resizeFont(): void {
    this.fontSize = Math.sqrt(window.innerWidth * 1.2);
  }
}
</script>
