<template>
  <RadDrawer>
    <h3>
      <FasEdit class="w-fixed" />
      {{ stationReference ? stationReference.name : $t("editor.newStation") }} –
      {{ $t("editor.title") }}
    </h3>
    <form ref="form" @submit.prevent="handleSubmit()">
      <div v-if="stationClone !== null" class="text-left">
        <sup class="align-text-top text-strong" :title="String($t('editor.field.marked'))"
          >&lowast;</sup
        >
        {{ $t("editor.field.name") }}:
        <RadInput
          :value="stationClone.name"
          class="mb-2.5 w-full"
          :placeholder="$t('editor.field.name')"
          type="text"
          required
          @change="stationClone.name = $event"
        />
        <sup class="align-text-top text-strong" :title="String($t('editor.field.marked'))"
          >&lowast;</sup
        >
        {{ $t("editor.field.url") }}:
        <RadInput
          :value="stationClone.url"
          class="mb-2.5 w-full"
          :placeholder="$t('editor.field.url')"
          type="url"
          required
          @change="stationClone.url = $event"
        />
        <sup class="align-text-top text-strong" :title="String($t('editor.field.marked'))"
          >&lowast;</sup
        >
        {{ $t("editor.field.homepage") }}:
        <RadInput
          :value="stationClone.homepage"
          class="mb-2.5 w-full"
          :placeholder="$t('editor.field.homepage')"
          type="url"
          required
          @change="stationClone.homepage = $event"
        />
        {{ $t("editor.field.icon") }}:
        <RadInput
          :value="stationClone.icon"
          class="mb-2.5 w-full"
          :placeholder="$t('editor.field.icon')"
          type="url"
          @change="stationClone.icon = $event"
        />
        {{ $tc("general.country") }}:
        <RadInput
          :value="stationClone.country"
          class="mb-2.5 w-full"
          :placeholder="$tc('general.country')"
          type="text"
          @change="stationClone.country = $event"
        />
        {{ $tc("general.state") }}:
        <RadInput
          :value="stationClone.state"
          class="mb-2.5 w-full"
          :placeholder="$tc('general.state')"
          type="text"
          @change="stationClone.state = $event"
        />
        {{ $tc("general.language") }}:
        <RadInput
          :value="stationClone.language"
          class="mb-2.5 w-full"
          :placeholder="$tc('general.language')"
          type="text"
          @change="stationClone.language = $event"
        />
        <RadTagInput :tags.sync="stationClone.tags" />
        <br />
        <div class="text-left text-strong">&lowast; {{ $t("editor.field.required") }}</div>
      </div>
      <div class="py-2.5 text-right">
        <RadButton @click="finish()" type="button">
          <FasCheck class="w-fixed" />
          {{ $t("general.done") }}
        </RadButton>
        <input ref="submit" type="submit" name="submit" hidden />
      </div>
    </form>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import { type ModalOptions, ModalType } from "@/store";
import { navigate } from "@/common/routing";

@Component
export default class RadEditor extends Vue {
  stationReference: Station | null = null;
  stationClone: Station = null!;
  closing = false;

  @Prop({ type: Number, required: true }) readonly list!: number;
  @Prop({ type: String, required: true }) readonly id!: string;

  @Ref() readonly form!: HTMLFormElement;
  @Ref("submit") readonly submitButton!: HTMLInputElement;

  @Getter readonly lists!: StationList[];

  @Action editStation!: (station: Station | undefined) => Promise<void>;
  @Action updateStation!: (station: Station) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  created(): void {
    const station = this.lists[this.list]?.content.find((station) => station.id === this.id);

    if (station !== undefined) {
      this.stationReference = station;
      this.editStation(station);
      this.stationClone = { ...station };
      return;
    }

    this.showMessage({
      type: ModalType.WARNING,
      buttons: [this.$t("general.ok") as string],
      message: this.$t("editor.notExisting") as string,
    });

    navigate(null, { replace: true });
  }

  destroyed(): void {
    this.editStation(undefined);
  }

  @Watch("stationClone", { deep: true })
  onStationChanged(station: Station, oldStation: Station | null): void {
    if (oldStation !== null) {
      this.submitButton.click();
    }
  }

  handleSubmit(): void {
    if (!this.closing) {
      this.updateStation(this.stationClone as Station);
    }
  }

  finish(): void {
    this.closing = true;
    this.submitButton.click();
    this.closing = false;

    if (this.form.checkValidity()) {
      navigate(null);
    }
  }
}
</script>
