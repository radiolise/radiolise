<template>
  <input
    ref="input"
    :class="[
      'border-b-2 border-b-mute-contrast/50 focus:border-b-accent focus:bg-black/10',
      type === 'number' ? 'w-[72px] text-center text-lg' : 'text-xl',
    ]"
    :type="type"
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
  @Prop({ type: String, default: "text" }) readonly type!: string;
  @Prop({ type: [String, Number], default: "" }) readonly value!: string | number;
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
