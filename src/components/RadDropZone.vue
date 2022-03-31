<template>
  <label
    class="flex h-[142px] cursor-pointer border-[1px] border-dotted border-[#888] bg-soft p-2.5 text-center"
    @drop.prevent="handleDrop"
    @dragover.prevent
  >
    <div class="my-auto">
      <div v-show-slide="imported">
        <div class="text-[1.2em] text-emphasis"><FasCheck /> {{ $t("dropZone.fileAdded") }}</div>
        <br />
      </div>
      {{ $t("dropZone.usage") }}
    </div>
    <input
      ref="fileInput"
      hidden
      type="file"
      accept="text/plain, application/x-yaml, .txt"
      @change="handleFileChanged"
    />
  </label>
</template>

<script lang="ts">
import { Component, Emit, Ref, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";

import { ModalOptions, ModalType } from "@/store";

type ImportResult = SelectableStation[] | Settings;

@Component({
  components: {
    FasCheck,
  },
})
export default class RadDropZone extends Vue {
  reader = new FileReader();
  imported = false;

  @Ref() readonly fileInput!: HTMLInputElement;

  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  created(): void {
    this.reader.addEventListener("load", async () => {
      const YAML = await import(/* webpackChunkName: "yaml" */ "yaml");

      try {
        const fileContent = YAML.parse(this.reader.result as string);
        this.handleReaderLoaded(fileContent);
      } catch {
        this.handleReaderError();
      }
    });
  }

  handleFileChanged(event: Event): void {
    const { files } = event.target as HTMLInputElement;

    if (files !== null) {
      this.reader.readAsText(files[0]);
    }
  }

  @Emit("change")
  handleReaderLoaded(result: ImportResult): ImportResult {
    this.imported = true;
    this.fileInput.value = "";
    return result;
  }

  @Emit("error")
  handleReaderError(): void {}

  handleDrop({ dataTransfer }: DragEvent): void {
    if (dataTransfer === null) {
      return;
    }

    const { files } = dataTransfer;

    if (files.length > 1) {
      this.showMessage({
        type: ModalType.WARNING,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("dropZone.multipleFilesError.title") as string,
        message: this.$t("dropZone.multipleFilesError.description") as string,
      });

      return;
    }

    this.reader.readAsText(files[0]);
  }

  reset(): void {
    this.imported = false;
  }
}
</script>
