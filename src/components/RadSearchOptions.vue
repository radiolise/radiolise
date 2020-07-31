<template>
  <div>
    <div id="moreoptions">
      <a href="#/search" @click="showOptions = !showOptions"
        ><font-awesome-icon
          icon="chevron-down"
          fixed-width
          :style="{
            transform: 'rotate(' + (showOptions ? -180 : 0) + 'deg)',
          }"
        />{{ $t(`search.${showOptions ? "hideOptions" : "showOptions"}`) }}</a
      >
    </div>
    <div id="filters" v-show-slide="showOptions">
      <rad-tag-input
        style="padding-bottom: 10px"
        :tags.sync="syncedOptions.tags"
      />
      <div style="text-align: left; display: table; width: 100%">
        <div style="padding: 5px 0; display: table-row; overflow: hidden">
          <div style="display: table-cell; white-space: nowrap">
            <font-awesome-icon icon="filter" />
            {{ $t("search.filters.label") }}:{{ "\xa0" }}
          </div>
          <div style="display: table-cell; width: 100%">
            <div id="failmsg" style="display: none">
              <div style="display: table">
                <font-awesome-icon
                  icon="exclamation-triangle"
                  fixed-width
                  style="display: table-cell"
                />
                <div>
                  {{ $t("search.optionsUnavailable")
                  }}<a id="tryfetch" href="#/search"
                    ><font-awesome-icon icon="redo" fixed-width />{{
                      $t("search.tryAgain")
                    }}</a
                  >
                </div>
              </div>
              <br />
            </div>
            <rad-dropdown
              id="country"
              v-model="syncedOptions.country"
              style="width: 100%"
              :label="$tc('general.country')"
              :data="filterOptions['countries']"
              :loaded="filters.countries !== null"
              @change="updateStates()"
            />
            <br />
            <rad-dropdown
              id="state"
              v-model="syncedOptions.state"
              :title="
                syncedOptions.country === ''
                  ? this.$t('search.filters.noCountrySelected')
                  : ''
              "
              style="width: 100%"
              :disabled="syncedOptions.country === ''"
              :label="`${this.$tc('general.state')} (${syncedOptions.country})`"
              :data="filterOptions['states']"
              :loaded="filters.states !== null"
            />
            <br />
            <rad-dropdown
              id="language"
              v-model="syncedOptions.language"
              style="width: 100%"
              :label="$tc('general.language')"
              :data="filterOptions['languages']"
              :loaded="filters.languages !== null"
            />
          </div>
        </div>
        <div style="padding: 5px 0; display: table-row">
          <div style="display: table-cell; white-space: nowrap">
            <font-awesome-icon icon="sort" />
            {{ $t("search.order.sortBy") }}{{ "\xa0" }}
          </div>
          <div style="display: table-cell; width: 100%">
            <rad-dropdown
              id="order"
              v-model="syncedOptions.order"
              style="width: 100%"
              :label="$t('search.order.sortBy')"
              :data="[
                { id: 'votes', name: $t('search.order.votes') },
                { id: 'clickcount', name: $t('search.order.clicks') },
                { id: 'name', name: $t('search.order.names') },
                { id: 'country', name: $t('search.order.countries') },
                { id: 'state', name: $t('search.order.states') },
                { id: 'language', name: $t('search.order.languages') },
                { id: 'codec', name: $t('search.order.codecs') },
              ]"
            />
          </div>
        </div>
      </div>
      <div style="text-align: left; padding: 10px 0">
        <rad-check v-model="syncedOptions.reverse">
          {{ $t("search.reverse") }}
        </rad-check>
        <rad-check v-model="syncedOptions.includeBroken">
          {{ $t("search.includeBroken") }}
        </rad-check>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from "vue-property-decorator";
import Axios from "axios";
import { Getter } from "vuex-class";

import RadCheck from "@/components/RadCheck.vue";
import RadDropdown from "@/components/RadDropdown.vue";
import RadTagInput from "@/components/RadTagInput.vue";

type Filter = { name: string; stationcount: number; country?: string }[] | null;

@Component({
  components: {
    RadCheck,
    RadDropdown,
    RadTagInput,
  },
})
export default class RadSearchOptions extends Vue {
  showOptions = false;

  filters: Record<string, Filter> = {
    countries: null,
    states: [],
    languages: null,
  };

  @PropSync("options", { type: Object, required: true })
  syncedOptions!: SearchOptions;

  @Getter readonly radioBrowserUrl!: string;

  get filterOptions(): Record<string, DropdownOption[]> {
    return Object.keys(this.filters).reduce((filterOptions, filterKind) => {
      const currentItems = this.filters[filterKind];

      if (currentItems !== null) {
        filterOptions[filterKind] = [
          { id: "", name: `${this.noFilterLabels[filterKind]}` },
          ...currentItems.map(item => ({ id: item.name, name: item.name })),
        ];
      } else {
        filterOptions[filterKind] = [];
      }

      return filterOptions;
    }, {} as Record<string, DropdownOption[]>);
  }

  get noFilterLabels(): Record<string, string> {
    return {
      countries: this.$t("search.filters.allCountries") as string,
      states: this.$t("search.filters.allStates") as string,
      languages: this.$t("search.filters.allLanguages") as string,
    };
  }

  created(): void {
    setTimeout(() => {
      const { filters } = this;

      Object.keys(filters).forEach(item => {
        if (item !== "states") {
          Axios.get(`${this.radioBrowserUrl}${item}`).then(response => {
            this.filters[item] = response.data;
          });
        }
      });
    }, 300);
  }

  updateStates(): void {
    this.syncedOptions.state = "";

    if (this.syncedOptions.country !== "") {
      this.filters.states = null;

      Axios.get(
        `${this.radioBrowserUrl}states/${this.syncedOptions.country}/`
      ).then(response => {
        this.filters.states = response.data;
      });
    } else {
      this.filters.states = [];
    }
  }
}
</script>
