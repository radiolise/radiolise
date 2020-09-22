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
            Reset {{ appTitle }} to be able to continue using it.
          </p>
          <button @click="download()">Save data for troubleshooting</button>
          <br />
          <br />
          <button @click="reset()">Reset {{ appTitle }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Action } from "vuex-class";

import { memoryUpgradeNeeded, getMemory, defaultMemory } from "@/utils/memory";
import saveFile from "@/utils/downloader";

@Component
export default class RadStartup extends Vue {
  appTitle = process.env.VUE_APP_TITLE;
  failed = false;
  showMessages = false;

  @State readonly initialized!: boolean;
  @State readonly ready!: boolean;

  @Action init!: (memory: Memory) => Promise<void>;

  async created(): Promise<void> {
    if (memoryUpgradeNeeded) {
      this.showMessages = true;
    }

    try {
      this.startup(await getMemory());
    } catch {
      this.failed = true;
    }
  }

  startup(memory: Memory): void {
    this.init(memory);
  }

  get message(): string {
    if (this.showMessages) {
      if (this.initialized) {
        return "Almost done...";
      }

      return `Upgrading ${this.appTitle}, please wait...`;
    }

    return "";
  }

  @Watch("ready")
  onReadyChanged(): void {
    this.showMessages = false;
  }

  download(): void {
    saveFile({
      name: "MemoryDataCopy",
      type: "txt",
      output: localStorage.data,
    });
  }

  reset(): void {
    const warningMessage = `
Important!

If you proceed now, all saved data – including station lists, settings and bookmarks – will be permanently deleted.

If you cancel, you can download a copy of the (possibly corrupted) storage data beforehand.
`.trim();

    const confirmed = confirm(warningMessage);

    if (confirmed) {
      this.startup(defaultMemory);
    }
  }
}
</script>

<style scoped>
.splash {
  background-color: #222;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  transition: opacity 2s;
}

.fade-leave-to {
  opacity: 0;
  background-image: none;
  pointer-events: none;
}

.logo {
  color: #fff;
  background-image: url("../assets/img/logo.svg");
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
