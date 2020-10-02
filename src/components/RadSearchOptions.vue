<template>
  <div>
    <div id="more-options">
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
            <div v-if="failedToLoadFilters">
              <div style="display: table">
                <div style="display: table-cell; white-space: nowrap">
                  <font-awesome-icon
                    icon="exclamation-triangle"
                    fixed-width
                  />{{ "\xa0" }}
                </div>
                <div>
                  {{ $t("search.optionsUnavailable") }}
                  <a href="#/search" @click="loadFilters()"
                    ><font-awesome-icon icon="redo" fixed-width />{{
                      $t("search.tryAgain")
                    }}</a
                  >
                </div>
              </div>
              <br />
            </div>
            <template v-else>
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
                :label="
                  `${this.$tc('general.state')} (${syncedOptions.country})`
                "
                :data="filterOptions['states']"
                :loaded="filters.states !== null"
                @click.native="handleStatesClicked()"
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
            </template>
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
import { Action } from "vuex-class";
import { ModalOptions, ModalType } from "@/store";

import { fetchCountries, fetchStates, fetchLanguages } from "@/utils/network";

import RadCheck from "@/components/RadCheck.vue";
import RadDropdown from "@/components/RadDropdown.vue";
import RadTagInput from "@/components/RadTagInput.vue";

@Component({
  components: {
    RadCheck,
    RadDropdown,
    RadTagInput,
  },
})
export default class RadSearchOptions extends Vue {
  showOptions = false;
  failedToLoadFilters = false;

  filters: Record<string, Filter> = {
    countries: null,
    states: [],
    languages: null,
  };

  @PropSync("options", { type: Object, required: true })
  syncedOptions!: SearchOptions;

  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  get filterOptions(): Record<string, DropdownOption[]> {
    return Object.keys(this.filters).reduce((filterOptions, filterKind) => {
      const currentItems = this.filters[filterKind];

      if (currentItems !== null) {
        filterOptions[filterKind] = [
          { id: "", name: this.noFilterLabels[filterKind] },
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
    setTimeout(this.loadFilters, 300);
  }

  async loadFilters(): Promise<void> {
    this.failedToLoadFilters = false;
    this.syncedOptions.country = "";
    this.syncedOptions.language = "";

    const eventualCountries = fetchCountries();
    const eventualLanguages = fetchLanguages();

    try {
      this.filters.countries = await eventualCountries;
      this.filters.languages = await eventualLanguages;
      this.updateStates();
    } catch {
      this.failedToLoadFilters = true;
    }
  }

  async updateStates(): Promise<void> {
    this.syncedOptions.state = "";

    if (this.syncedOptions.country !== "") {
      this.filters.states = null;
      try {
        this.filters.states = await fetchStates(this.syncedOptions.country);
      } catch {
        this.failedToLoadFilters = true;
      }
    } else {
      this.filters.states = [];
    }
  }

  handleStatesClicked(): void {
    if (this.syncedOptions.country === "") {
      this.showMessage({
        buttons: [this.$t("general.ok") as string],
        type: ModalType.WARNING,
        message: this.$t("search.filters.noCountrySelected") as string,
      });
    }
  }
}
</script>

<style scoped>
#more-options {
  text-align: left;
  padding-bottom: 10px;
}
#more-options svg {
  transition: transform 0.3s;
}
</style>
