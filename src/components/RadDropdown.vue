<template>
  <div
    class="dropdownMenu"
    :class="{ isList: !isMenu, flexAlign, disabled: !enabled }"
  >
    <div class="wrapper" :class="{ fixedHeight: !isMenu }">
      <div v-if="!isMenu" class="dropdownLabel covering">
        <template v-if="loaded">
          {{ currentOption.name }}
          <span
            v-if="currentOption.description !== undefined"
            style="opacity: 0.5"
            >({{ currentOption.description }})</span
          >
        </template>
        <template v-else>
          {{ $t("general.loading") }}
        </template>
      </div>
      <select
        ref="select"
        :disabled="!enabled"
        :value="value"
        :class="{ covering: isMenu }"
        @change="handleChange()"
      >
        <option v-if="isMenu" value="" hidden disabled selected>
          Please select...
        </option>
        <optgroup :label="label">
          <option v-for="(item, index) in data" :key="index" :value="item.id">
            {{ item.name }}
            <template v-if="item.description !== undefined">
              ({{ item.description }})
            </template>
          </option>
        </optgroup>
        <option
          v-for="(action, index) in actions"
          :key="index"
          :disabled="!actionsEnabled"
        >
          {{ action }}
        </option>
      </select>
      <div v-if="isMenu" class="dropdownLabel"><slot></slot></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Prop, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadDropdown extends Vue {
  @Model("change", { type: [String, Number], default: "" })
  readonly value!: string | number;

  @Prop({ type: Array, default: () => [] }) readonly actions!: string[];
  @Prop({ type: Boolean, default: true }) readonly actionsEnabled!: boolean;
  @Prop({ type: Array, required: true }) readonly data!: DropdownOption[];
  @Prop({ type: Boolean, default: false }) readonly disabled!: boolean;
  @Prop({ type: Boolean, default: false }) readonly flexAlign!: boolean;
  @Prop({ type: Boolean, default: true }) readonly loaded!: boolean;
  @Prop({ type: String, required: true }) readonly label!: string;

  @Ref() readonly select!: HTMLSelectElement;

  get currentOption(): DropdownOption | undefined {
    return this.data.find(item => item.id === this.value);
  }

  get enabled(): boolean {
    return this.loaded && !this.disabled;
  }

  get indexed(): boolean {
    return typeof this.value === "number";
  }

  get isMenu(): boolean {
    return this.$slots.default !== undefined;
  }

  get optionCount(): number {
    return this.data.length;
  }

  @Emit("change")
  handleValueChanged(value: string | number): void {}

  @Emit("actionSelect")
  handleActionSelected(index: number): void {}

  handleChange(): void {
    const { selectedIndex, value } = this.select;

    if (selectedIndex < this.optionCount + Number(this.isMenu)) {
      this.handleValueChanged(this.indexed ? Number(value) : value);
    } else {
      this.handleActionSelected(selectedIndex - this.optionCount);
    }

    this.resetValue();
  }

  resetValue(): void {
    if (this.isMenu) {
      this.select.value = "";
    }
  }
}
</script>

<style lang="less" scoped>
.dropdownMenu {
  display: inline-block;
  max-width: 200px;

  &.isList,
  &.flexAlign {
    font-size: 18px;
  }

  &.flexAlign {
    width: 42px;
    height: 42px;

    .dropdownLabel {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .wrapper {
    position: relative;
    display: inline-block;
    vertical-align: text-top;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &,
    select {
      cursor: pointer;
    }

    &.fixedHeight {
      height: 25px;
    }

    .dropdownLabel {
      white-space: nowrap;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      pointer-events: none;
      user-select: none;

      &.covering {
        border-bottom: 2px solid #aaa;
      }
    }

    select {
      font-size: 18px;
      font-family: Fira Sans, sans-serif;
      opacity: 0;
      max-width: 400px;
      max-height: 100%;
      width: inherit;
      height: inherit;
      border: none;
      appearance: none;

      &.covering {
        height: 100%;
      }

      + div path {
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      &:hover + div path {
        opacity: 1;
      }
    }

    .covering {
      position: absolute;
    }
  }

  &.disabled {
    opacity: 0.5;

    select {
      cursor: not-allowed;
    }
  }
}
</style>
