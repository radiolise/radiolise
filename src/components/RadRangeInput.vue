<template>
  <form @submit.prevent="onSubmit">
    <RadInput
      v-model.number="_min"
      type="number"
      select-on-focus
      min="0"
      step="1"
      :placeholder="$t('rangeInput.minimumShort')"
      @change="submitButton.click()"
    />
    <span style="padding: 0 10px">{{ $t("rangeInput.to") }}</span>
    <RadInput
      v-model.number="_max"
      type="number"
      select-on-focus
      min="0"
      step="1"
      :placeholder="$t('rangeInput.maximumShort')"
      @change="submitButton.click()"
    />
    <input
      ref="submit-button"
      type="submit"
      name="submit"
      style="display: none"
    />
  </form>
</template>

<script lang="ts">
import { Component, PropSync, Ref, Vue } from "vue-property-decorator";
import RadInput from "./RadInput.vue";

@Component({
  components: {
    RadInput,
  },
})
export default class RadRangeInput extends Vue {
  _min: NumberLike = "";
  _max: NumberLike = "";

  @Ref("submit-button") readonly submitButton!: HTMLInputElement;

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
