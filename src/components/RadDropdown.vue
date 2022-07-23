<template>
  <div :class="['inline-block max-w-[200px]', { 'text-lg': !isMenu, 'opacity-50': !enabled }]">
    <div
      :class="[
        'relative inline-block h-full w-full cursor-pointer overflow-hidden align-text-top',
        { 'h-6.25': !isMenu, 'cursor-not-allowed': !enabled },
      ]"
    >
      <div
        v-if="!isMenu"
        class="pointer-events-none absolute h-full w-full select-none truncate border-0 border-b-2 border-b-mute-contrast/50"
      >
        <template v-if="loaded">
          {{ currentOption?.name }}
          <span v-if="currentOption?.description !== undefined" class="opacity-50"
            >({{ currentOption.description }})</span
          >
        </template>
        <template v-else>
          {{ $t("general.loading") }}
        </template>
      </div>
      <select
        ref="select"
        :value="value"
        :disabled="!enabled"
        :class="[
          'peer h-full w-full cursor-pointer appearance-none text-lg opacity-0',
          { 'absolute': isMenu, 'pointer-events-none': !enabled },
        ]"
        @change="handleChange()"
      >
        <optgroup :label="label">
          <option v-if="isMenu" value="" hidden disabled selected>Please select...</option>
          <option v-for="(item, index) in data" :key="index" :value="item.id">
            {{ item.name }}
            <template v-if="item.description !== undefined"> ({{ item.description }})</template>
          </option>
        </optgroup>
        <option v-for="(action, index) in actions" :key="index" :disabled="!actionsEnabled">
          {{ action }}
        </option>
      </select>
      <div
        v-if="isMenu"
        class="pointer-events-none h-full w-full select-none truncate icons:opacity-70 icons:transition-opacity icons:duration-200 icons:peer-hover:opacity-100"
      >
        <slot></slot>
      </div>
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
  @Prop({ type: Boolean, default: true }) readonly loaded!: boolean;
  @Prop({ type: String, required: true }) readonly label!: string;

  @Ref() readonly select!: HTMLSelectElement;

  get currentOption(): DropdownOption | undefined {
    return this.data.find((item) => item.id === this.value);
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
