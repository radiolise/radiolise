<template>
  <transition leave-to-class="pointer-events-none opacity-0">
    <div class="fixed left-0 top-0 z-30 h-full w-full bg-brand transition-opacity duration-2000">
      <div class="h-full w-full bg-logo bg-center bg-no-repeat text-center text-white">
        <div v-if="!failed">
          <h1 v-if="message">{{ message }}</h1>
        </div>
        <div v-else>
          <h1>Guru Meditation</h1>
          <p class="my-4 py-2.5">
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
import { Component, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";

import { memoryUpgradeNeeded, getMemory, defaultMemory } from "@/common/memory";
import { saveFile } from "@/common/downloader";

@Component
export default class RadStartup extends Vue {
  appTitle = process.env.VUE_APP_TITLE;
  failed = false;
  showMessages = false;

  @Action init!: (memory: Memory) => Promise<void>;

  created() {
    document.body.classList.remove("bg-brand");
    document.body.classList.add("bg-default");
  }

  async mounted(): Promise<void> {
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
    this.showMessages = false;
    this.init(memory);
  }

  get message(): string {
    if (this.showMessages) {
      return `Upgrading ${this.appTitle}, please wait...`;
    }

    return "";
  }

  download(): void {
    saveFile({
      name: "MemoryDataCopy",
      type: "txt",
      output: localStorage.data,
    });
  }

  reset(): void {
    const warningMessage = `Important!

By proceeding, all save data – including station lists, settings and bookmarks – will get deleted. This cannot be undone.

Otherwise, you can download a copy of the (possibly corrupted) save data beforehand.`;

    const confirmed = window.confirm(warningMessage);

    if (confirmed) {
      this.startup(defaultMemory);
    }
  }
}
</script>
