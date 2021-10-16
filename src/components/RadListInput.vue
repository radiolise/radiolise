<template>
  <div v-show="shown" style="display: table-row">
    <input
      ref="input"
      type="text"
      class="list-name"
      :placeholder="
        $t(isNewList ? 'listManager.specifyName' : 'general.newName')
      "
      :value="name"
      spellcheck="false"
      @focus="handleFocus()"
      @blur="handleBlur()"
      @keydown.enter="handleEnterPress()"
    />
    <div style="display: table-cell; white-space: nowrap; text-align: left">
      <a v-show="active"><font-awesome-icon icon="check" fixed-width /></a>
      <a v-show="!active" @click="input.focus()"
        ><font-awesome-icon icon="edit" fixed-width /></a
      ><template v-if="!isNewList">
        <a @click="exportList()"
          ><font-awesome-icon icon="download" fixed-width /></a
        ><router-link to="/search" @click.native="change()"
          ><font-awesome-icon icon="search" fixed-width /></router-link
        ><a v-show="removable" @click="remove()"
          ><font-awesome-icon icon="trash" fixed-width
        /></a>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Mixins,
  Prop,
  Ref,
  Watch,
} from "vue-property-decorator";
import { Action } from "vuex-class";

import { ModalType } from "@/store";
import ListHelper from "@/mixins/ListHelper";

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
  @Action allowEnterKey!: (allow: boolean) => Promise<void>;

  @Action renameList!: (payload: {
    index: number;
    name: string;
  }) => Promise<void>;

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
    this.allowEnterKey(false);
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
    } else {
      this.showMessage({
        type: ModalType.WARNING,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("listManager.invalidName") as string,
        message: this.$t("listManager.nameEmpty") as string,
      });
    }
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
  }
}
</script>
