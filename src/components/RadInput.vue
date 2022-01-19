<template>
  <input
    ref="input"
    :value="value"
    spellcheck="false"
    @input="emitInput()"
    @change="emitChange()"
    @focus="onFocus()"
    @keydown.enter="input.blur()"
  />
</template>

<script lang="ts">
import { Component, Emit, Prop, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadInput extends Vue {
  @Prop({ type: [String, Number], default: "" })
  readonly value!: string | number;

  @Prop({ type: Boolean, default: false }) readonly selectOnFocus!: boolean;

  @Ref() readonly input!: HTMLInputElement;

  @Emit("input")
  emitInput(): string {
    return this.input.value;
  }

  @Emit("change")
  emitChange(): string {
    return this.input.value;
  }

  onFocus() {
    if (this.selectOnFocus) {
      this.input.select();
    }
  }
}
</script>
