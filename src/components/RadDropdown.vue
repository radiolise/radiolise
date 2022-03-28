<template>
  <div
    class="dropdown-menu"
    :class="{
      'is-list': !isMenu,
      'flex-align': flexAlign,
      'disabled': !enabled,
    }"
  >
    <div class="wrapper" :class="{ 'fixed-height': !isMenu }">
      <div v-if="!isMenu" class="dropdown-label covering">
        <template v-if="loaded">
          {{ currentOption.name }}
          <span v-if="currentOption.description !== undefined" style="opacity: 0.5"
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
        :class="['peer', { covering: isMenu }]"
        @change="handleChange()"
      >
        <optgroup :label="label">
          <option v-if="isMenu" value="" hidden disabled selected>Please select...</option>
          <option v-for="(item, index) in data" :key="index" :value="item.id">
            {{ item.name }}
            <template v-if="item.description !== undefined"> ({{ item.description }}) </template>
          </option>
        </optgroup>
        <option v-for="(action, index) in actions" :key="index" :disabled="!actionsEnabled">
          {{ action }}
        </option>
      </select>
      <div
        v-if="isMenu"
        class="dropdown-label icons:opacity-70 icons:transition-opacity icons:duration-200 icons:peer-hover:opacity-100"
      >
        <slot />
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
  @Prop({ type: Boolean, default: false }) readonly flexAlign!: boolean;
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

<style scoped>
.dropdown-menu {
  display: inline-block;
  max-width: 200px;
}
.dropdown-menu.is-list,
.dropdown-menu.flex-align {
  font-size: 18px;
}
.dropdown-menu.flex-align {
  width: 42px;
  height: 42px;
}
.dropdown-menu.flex-align .dropdown-label {
  display: flex;
  align-items: center;
  justify-content: center;
}
.wrapper {
  position: relative;
  display: inline-block;
  vertical-align: text-top;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.wrapper,
select {
  cursor: pointer;
}
.wrapper.fixed-height {
  height: 25px;
}
.dropdown-label {
  white-space: nowrap;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  pointer-events: none;
  user-select: none;
}
.dropdown-label.covering {
  border-bottom: 2px solid #aaa;
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
}
select.covering {
  height: 100%;
}
select + div path {
  opacity: 0.7;
  transition: opacity 0.2s;
}
select:hover + div path {
  opacity: 1;
}
.covering {
  position: absolute;
}
.dropdown-menu.disabled {
  opacity: 0.5;
}
.dropdown-menu.disabled select {
  pointer-events: none;
}
.dropdown-menu.disabled .wrapper {
  cursor: not-allowed;
}
</style>
