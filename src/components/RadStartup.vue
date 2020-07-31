<template>
  <transition name="fade">
    <div class="splash">
      <div class="logo">
        <div v-if="!failed">
          <h1 v-if="message">{{ message }}</h1>
        </div>
        <div v-else>
          <h1>Guru Meditation</h1>
          <p>
            Unfortunately, storage data could not be loaded.<br />
            Reset Radiolise to be able to continue using it.
          </p>
          <button @click="download()">Save data for troubleshooting</button>
          <br />
          <br />
          <button @click="reset()">Reset Radiolise</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import { memoryUpgradeNeeded, getMemory, defaultMemory } from "@/utils/memory";
import download from "@/utils/downloader";

@Component
export default class RadStartup extends Vue {
  failed = false;
  showMessages = false;

  @State readonly initialized!: boolean;
  @State readonly ready!: boolean;

  @Getter readonly appName!: string;

  @Action init!: (memory: Memory) => void;

  created(): void {
    if (memoryUpgradeNeeded) {
      this.showMessages = true;
    }

    getMemory()
      .then(this.startup)
      .catch(() => {
        this.failed = true;
      });
  }

  startup(memory: Memory): void {
    this.init(memory);
  }

  get message(): string {
    if (this.showMessages) {
      if (this.initialized) {
        return "Almost done...";
      }

      return `Upgrading ${this.appName}, please wait...`;
    }

    return "";
  }

  @Watch("ready")
  onReadyChanged(): void {
    this.showMessages = false;
  }

  download(): void {
    download({
      name: "MemoryDataCopy",
      type: "txt",
      output: localStorage.data,
    });
  }

  reset(): void {
    const confirmed = confirm(
      `Important!

If you continue now, all saved data, including station lists, settings and bookmarks, will be permanently deleted.

If you cancel, you can download a copy of the (possibly damaged) storage data beforehand.`
    );

    if (confirmed) {
      this.startup(defaultMemory);
    }
  }
}
</script>

<style lang="less" scoped>
.splash {
  background-color: #222;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  transition: opacity 2s;

  &.fade-leave-to {
    opacity: 0;
    background-image: none;
    pointer-events: none;
  }

  .logo {
    color: #fff;
    background-image: url("/img/logo.svg");
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
    text-align: center;
  }
}
</style>
