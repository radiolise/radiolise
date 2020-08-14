<template>
  <label class="dropzone" @drop.prevent="handleDrop" @dragover.prevent>
    <div>
      <div v-show-slide="imported">
        <div class="highlighted">
          <font-awesome-icon icon="check" /> {{ $t("dropZone.fileAdded") }}
        </div>
        <br />
      </div>
      {{ $t("dropZone.usage") }}
    </div>
    <input
      ref="fileInput"
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

@Component
export default class RadDropZone extends Vue {
  reader = new FileReader();
  imported = false;

  @Ref() readonly fileInput!: HTMLInputElement;

  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  created(): void {
    this.reader.addEventListener("load", async () => {
      const YAML = await import(/* webpackChunkName: "yaml" */ "yaml");
      this.handleReaderLoaded(YAML.parse(this.reader.result as string));
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

<style lang="less" scoped>
input[type="file"] {
  display: none;
}

label > div {
  margin: auto;

  div.highlighted {
    font-size: 1.2em;
  }
}
</style>
