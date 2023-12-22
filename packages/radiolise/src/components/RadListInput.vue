<template>
  <div :class="['flex max-w-sm', { hidden: !shown }]">
    <div class="px-2">
      <input
        ref="input"
        type="text"
        class="w-full border-b-2 border-b-mute-contrast/50 text-xl focus:border-b-accent focus:bg-black/10"
        :placeholder="String(isNewList ? $t('listManager.specifyName') : $t('general.newName'))"
        :value="name"
        spellcheck="false"
        @focus="handleFocus()"
        @blur="handleBlur()"
        @keydown.enter="handleEnterPress()"
      />
    </div>
    <div class="shrink-0 icons:w-fixed">
      <button
        :class="['ring-inset ring-accent focus-visible:ring-2', { 'sr-only': active }]"
        :aria-hidden="active"
        @click="input.focus()"
      >
        <FasEdit />
      </button>
      <button :class="{ hidden: !active }">
        <FasCheck />
      </button>
      <template v-if="!isNewList">
        <button class="ring-inset ring-accent focus-visible:ring-2" @click="exportList()">
          <FasDownload />
        </button>
        <button class="ring-inset ring-accent focus-visible:ring-2" @click="change()">
          <FasSearch />
        </button>
        <button
          :class="['ring-inset ring-accent focus-visible:ring-2', { hidden: !removable }]"
          @click="remove()"
        >
          <FasTrash />
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Ref, Watch } from "vue-property-decorator";
import { Action } from "vuex-class";

import { navigate } from "@/common/routing";
import ListHelper from "@/mixins/ListHelper";
import { ModalType } from "@/store";

@Component
export default class RadListInput extends Mixins(ListHelper) {
  active = false;

  @Prop({ type: String, default: "" }) readonly name!: string;
  @Prop({ type: Number, default: -1 }) readonly index!: number;
  @Prop({ type: Array }) readonly content!: Station[];
  @Prop({ type: Boolean, default: false }) readonly adding!: boolean;
  @Prop({ type: Boolean, default: false }) readonly removable!: boolean;

  @Ref() readonly input!: HTMLInputElement;

  @Action createList!: (list: StationList) => Promise<void>;
  @Action renameList!: (payload: { index: number; name: string }) => Promise<void>;
  @Action removeList!: (index: number) => Promise<void>;

  get isNewList(): boolean {
    return this.name === "";
  }

  get shown(): boolean {
    return !this.isNewList || this.adding;
  }

  @Watch("adding")
  async handleAddingChanged(adding: boolean): Promise<void> {
    if (adding) {
      await this.$nextTick();
      this.input.focus();
    }
  }

  handleFocus(): void {
    this.active = true;
    this.input.select();
  }

  @Emit("blur")
  emitBlur(): void {}

  handleBlur(): void {
    this.active = false;
    this.rename();

    if (this.isNewList) {
      this.emitBlur();
    }
  }

  handleEnterPress(): void {
    this.input.blur();
  }

  rename(): void {
    const name = this.input.value;

    if (name !== "") {
      const oldName = this.name;

      if (name !== oldName) {
        try {
          if (this.isNewList) {
            this.createList({ name, content: [] });
          } else {
            this.renameList({ index: this.index, name });
          }
        } catch {
          this.showMessage({
            type: ModalType.WARNING,
            buttons: [this.$t("general.ok") as string],
            title: this.$t("listManager.invalidName") as string,
            message: this.$t("listManager.nameTaken", [name]) as string,
          });
        }
      }

      return;
    }

    this.showMessage({
      type: ModalType.WARNING,
      buttons: [this.$t("general.ok") as string],
      title: this.$t("listManager.invalidName") as string,
      message: this.$t("listManager.nameEmpty") as string,
    });
  }

  remove(): void {
    this.removeList(this.index);
  }

  exportList(): void {
    this.download({
      name: this.name,
      type: "txt",
      content: this.content,
    });
  }

  change(): void {
    this.changeList(this.index);
    navigate("search");
  }
}
</script>
