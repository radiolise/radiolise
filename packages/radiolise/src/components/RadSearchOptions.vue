<template>
  <div>
    <div class="pb-2.5 text-left">
      <button
        class="ring-inset ring-accent focus-visible:ring-2"
        @click="showOptions = !showOptions"
      >
        <FasChevronDown :class="['w-fixed', { '-rotate-180': showOptions }]" />{{
          $t(`search.${showOptions ? "hideOptions" : "showOptions"}`)
        }}
      </button>
    </div>
    <div v-show-slide="showOptions">
      <div class="pb-2.5">
        <RadTagInput :tags.sync="syncedOptions.tags" />
      </div>
      <div class="table w-full text-left">
        <div class="table-row overflow-hidden">
          <div class="table-cell whitespace-nowrap">
            <FasFilter class="opacity-50" />
            {{ $t("search.filters.label") }}:&nbsp;
          </div>
          <div class="table-cell w-full">
            <div v-if="failedToLoadFilters">
              <div class="flex">
                <div class="whitespace-nowrap">
                  <FasExclamationTriangle class="w-fixed" />&nbsp;
                </div>
                <div>
                  {{ $t("search.optionsUnavailable") }}
                  <button
                    class="ring-inset ring-accent focus-visible:ring-2"
                    @click="loadFilters()"
                  >
                    <FasRedo class="w-fixed" />{{ $t("search.tryAgain") }}
                  </button>
                </div>
              </div>
              <br />
            </div>
            <template v-else>
              <RadDropdown
                v-model="syncedOptions.country"
                class="w-full"
                :label="$tc('general.country')"
                :data="filterOptions['countries']"
                :loaded="filters.countries !== null"
                @change="updateStates()"
              />
              <br />
              <RadDropdown
                v-model="syncedOptions.state"
                :title="syncedOptions.country === '' ? $t('search.filters.noCountrySelected') : ''"
                class="w-full"
                :disabled="syncedOptions.country === ''"
                :label="`${$tc('general.state')} (${syncedOptions.country})`"
                :data="filterOptions['states']"
                :loaded="filters.states !== null"
                @click.native="handleStatesClicked()"
              />
              <br />
              <RadDropdown
                v-model="syncedOptions.language"
                class="w-full"
                :label="$tc('general.language')"
                :data="filterOptions['languages']"
                :loaded="filters.languages !== null"
              />
            </template>
          </div>
        </div>
        <div class="table-row">
          <div class="table-cell whitespace-nowrap">
            <FasSort class="opacity-50" />
            {{ $t("search.order.sortBy") }}&nbsp;
          </div>
          <div class="table-cell w-full">
            <RadDropdown
              v-model="syncedOptions.order"
              class="w-full"
              :label="$t('search.order.sortBy')"
              :data="[
                { id: 'clickcount', name: $t('search.order.clicks') },
                { id: 'votes', name: $t('search.order.votes') },
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
      <div class="pt-2.5 text-left">
        <span class="cursor-help" :title="String($t('search.bitrate.description'))"
          ><FasWaveSquare class="opacity-50" /> {{ $t("search.bitrate.label") }}</span
        >:
        <RadRangeInput
          :min.sync="syncedOptions.bitrate.min"
          :max.sync="syncedOptions.bitrate.max"
        />
      </div>
      <div class="py-2.5 text-left">
        <RadCheck v-model="syncedOptions.reverse">
          {{ $t("search.reverse") }}
        </RadCheck>
        <RadCheck v-model="syncedOptions.includeBroken">
          {{ $t("search.includeBroken") }}
        </RadCheck>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";
import { type ModalOptions, ModalType } from "@/store";

import { fetchCountries, fetchStates, fetchLanguages } from "@/common/network";

@Component
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
    return Object.keys(this.filters).reduce(
      (filterOptions, filterKind) => {
        const currentItems = this.filters[filterKind];

        if (currentItems !== null) {
          filterOptions[filterKind] = [
            { id: "", name: this.noFilterLabels[filterKind] },
            ...currentItems.map((item) => ({ id: item.name, name: item.name })),
          ];
        } else {
          filterOptions[filterKind] = [];
        }

        return filterOptions;
      },
      {} as Record<string, DropdownOption[]>
    );
  }

  get noFilterLabels(): Record<string, string> {
    return {
      countries: this.$t("search.filters.allCountries") as string,
      states: this.$t("search.filters.allStates") as string,
      languages: this.$t("search.filters.allLanguages") as string,
    };
  }

  created(): void {
    window.setTimeout(this.loadFilters, 300);
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
      return;
    }

    this.filters.states = [];
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
