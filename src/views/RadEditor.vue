<template>
  <rad-drawer id="editor">
    <h3>
      <font-awesome-icon icon="edit" fixed-width />
      {{ stationReference ? stationReference.name : $t("editor.newStation") }} –
      {{ $t("editor.title") }}
    </h3>
    <form ref="form" @submit.prevent="handleSubmit()">
      <div v-if="stationClone !== null" id="customstations">
        <span style="display: table-cell"
          ><sup
            class="important"
            :title="$t('editor.field.marked')"
            style="vertical-align: text-top"
            >&lowast;</sup
          >
          {{ $t("editor.field.name") }}: </span
        ><rad-input
          :value="stationClone.name"
          style="display: table-cell; width: 100%"
          :placeholder="$t('editor.field.name')"
          type="text"
          required
          @change="stationClone.name = $event"
        />
        <span style="display: table-cell"
          ><sup
            class="important"
            :title="$t('editor.field.marked')"
            style="vertical-align: text-top"
            >&lowast;</sup
          >
          {{ $t("editor.field.url") }}: </span
        ><rad-input
          :value="stationClone.url"
          style="display: table-cell; width: 100%"
          :placeholder="$t('editor.field.url')"
          type="url"
          required
          @change="stationClone.url = $event"
        />
        <span style="display: table-cell"
          ><sup
            class="important"
            :title="$t('editor.field.marked')"
            style="vertical-align: text-top"
            >&lowast;</sup
          >
          {{ $t("editor.field.homepage") }}: </span
        ><rad-input
          :value="stationClone.homepage"
          style="display: table-cell; width: 100%"
          :placeholder="$t('editor.field.homepage')"
          type="url"
          required
          @change="stationClone.homepage = $event"
        />
        <span style="display: table-cell">{{ $t("editor.field.icon") }}: </span
        ><rad-input
          :value="stationClone.icon"
          style="display: table-cell; width: 100%"
          :placeholder="$t('editor.field.icon')"
          type="url"
          @change="stationClone.icon = $event"
        />
        <span style="display: table-cell">{{ $tc("general.country") }}: </span
        ><rad-input
          :value="stationClone.country"
          style="display: table-cell; width: 100%"
          :placeholder="$tc('general.country')"
          type="text"
          @change="stationClone.country = $event"
        />
        <span style="display: table-cell">{{ $tc("general.state") }}: </span
        ><rad-input
          :value="stationClone.state"
          style="display: table-cell; width: 100%"
          :placeholder="$tc('general.state')"
          type="text"
          @change="stationClone.state = $event"
        />
        <span style="display: table-cell">{{ $tc("general.language") }}: </span
        ><rad-input
          :value="stationClone.language"
          style="display: table-cell; width: 100%"
          :placeholder="$tc('general.language')"
          type="text"
          @change="stationClone.language = $event"
        />
        <rad-tag-input :tags.sync="stationClone.tags" />
        <br />
        <div class="important" style="text-align: left">
          &lowast; {{ $t("editor.field.required") }}
        </div>
      </div>
      <div style="text-align: right">
        <a id="done" class="button" @click="finish()">
          <font-awesome-icon icon="check" fixed-width />{{ $t("general.done") }}
        </a>
        <input
          ref="submitButton"
          type="submit"
          name="submit"
          style="display: none"
        />
      </div>
    </form>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import RadDrawer from "@/components/RadDrawer.vue";
import RadInput from "@/components/RadInput.vue";
import RadTagInput from "@/components/RadTagInput.vue";

import { ModalOptions, ModalType } from "@/store";

@Component({
  components: {
    RadDrawer,
    RadInput,
    RadTagInput,
  },
})
export default class RadEditor extends Vue {
  stationReference: Station | null = null;
  stationClone: Station | null = null;
  closing = false;

  @Prop({ type: Number, required: true }) readonly list!: number;
  @Prop({ type: String, required: true }) readonly id!: string;

  @Ref() readonly form!: HTMLFormElement;
  @Ref() readonly submitButton!: HTMLInputElement;

  @Getter readonly lists!: StationList[];

  @Action editStation!: (station: Station | undefined) => void;
  @Action updateStation!: (station: Station) => void;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  created(): void {
    const station = this.lists[this.list]?.content.find(
      station => station.id === this.id
    );

    if (station !== undefined) {
      this.stationReference = station;
      this.editStation(station);
      this.stationClone = { ...station };
    } else {
      this.showMessage({
        type: ModalType.WARNING,
        buttons: [this.$t("general.ok") as string],
        message: this.$t("editor.notExisting") as string,
      });

      this.$router.replace("/");
    }
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
      this.$router.push("/");
    }
  }
}
</script>
