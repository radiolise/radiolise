<template>
  <form class="inline-block whitespace-nowrap" @submit.prevent="onSubmit">
    <RadInput
      v-model.number="_min"
      type="number"
      select-on-focus
      min="0"
      step="1"
      :placeholder="$t('rangeInput.minimumShort')"
      @change="submitButton.click()"
    />
    <span class="px-2.5">{{ $t("rangeInput.to") }}</span>
    <RadInput
      v-model.number="_max"
      type="number"
      select-on-focus
      min="0"
      step="1"
      :placeholder="$t('rangeInput.maximumShort')"
      @change="submitButton.click()"
    />
    <input ref="submit" type="submit" name="submit" hidden />
  </form>
</template>

<script lang="ts">
import { Component, PropSync, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadRangeInput extends Vue {
  _min: NumberLike = "";
  _max: NumberLike = "";

  @Ref("submit") readonly submitButton!: HTMLInputElement;

  @PropSync("min", { type: [String, Number], default: 0 })
  syncedMin!: NumberLike;

  @PropSync("max", { type: [String, Number], default: "" })
  syncedMax!: NumberLike;

  created() {
    this._min = this.syncedMin;
    this._max = this.syncedMax;
  }

  onSubmit() {
    this.syncedMin = this._min;
    this.syncedMax = this._max;
  }
}
</script>
