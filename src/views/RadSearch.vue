<template>
  <RadDrawer id="search">
    <h3>
      <FasSearch class="w-fixed" />
      {{ $t("general.findStations") }}
    </h3>
    <i18n path="search.credit.radioBrowser" tag="p">
      <a href="https://fsfe.org/freesoftware/" target="_blank" rel="noopener"
        >{{ $t("search.credit.free") }} <FasExternalLinkAlt class="w-fixed" /></a
      ><a href="http://www.radio-browser.info" target="_blank" rel="noopener"
        >Community Radio Browser <FasExternalLinkAlt class="w-fixed"
      /></a>
    </i18n>
    <div>
      <div id="search-field">
        <input
          ref="query"
          :value="searchTerm"
          autocomplete="off"
          autocapitalize="off"
          :placeholder="$t('search.byName')"
          type="text"
          spellcheck="false"
          @input="searchTerm = $event.target.value"
          @change="searchTerm = $event.target.value"
          @focus="query.select()"
          @keypress.enter="
            query.blur();
            scrollDownIfLoaded();
          "
        /><button
          id="find-station"
          class="opacity-70 duration-200 hover:opacity-100"
          @click="scrollDownIfLoaded()"
        >
          <FasSearch />
        </button>
      </div>
      <RadSearchOptions :options.sync="options" />
      <div>
        <template v-if="!failed">
          <div
            v-if="active && results.length > 0 && !scrollOnceLoaded"
            id="results"
            style="width: 100%; display: block !important"
          >
            <RadResult
              v-for="result in results"
              :key="result.stationuuid"
              :selected="ids.includes(result.stationuuid)"
              @change="toggleResult(result)"
            >
              {{ result.name }}
              <template #tags>
                <RadTags
                  :labels="[
                    ...(result.bitrate > 0 ? [`${result.bitrate} kBit/s`] : []),
                    result.country,
                    result.state,
                    ...result.tags.split(','),
                  ]"
                >
                  <span
                    v-if="result.lastcheckok === 0"
                    class="label important"
                    style="font-weight: bold; text-transform: uppercase"
                    >{{ $t("search.stationBroken") }}</span
                  >
                  {{ " "
                  }}<span
                    v-if="options.order !== 'name'"
                    class="label highlighted"
                    style="font-weight: bold"
                  >
                    <component :is="sortIcon" />
                    {{ " " }}
                    <template v-if="result[options.order] !== ''">{{
                      numericalOrder
                        ? result[options.order].toLocaleString($i18n.locale)
                        : result[options.order]
                    }}</template>
                    <FasQuestion v-else />
                  </span>
                </RadTags>
              </template>
            </RadResult>
          </div>
          <p v-if="moreExpected || moreAvailable" id="load-more">
            <span v-if="moreExpected" style="margin: auto">
              <template v-if="empty">
                <FarMeh class="w-fixed" />{{ $t("search.noMatches") }}
              </template>
              <template v-else>
                <FasSpinner class="w-fixed animate-spin" />{{ $t("search.loading") }}
              </template>
            </span>
            <RadMenuButton v-else class="w-full" @click="loadMore">
              <FasSearch class="w-fixed" />
              {{ $t("search.loadMore") }}
            </RadMenuButton>
          </p>
        </template>
        <p v-if="failed" style="font-size: 18px">
          <FasExclamationTriangle class="w-fixed" />
          {{ $t("search.error") }}
          <a @click="reset"><FasRedo class="w-fixed" />{{ $t("search.tryAgain") }}</a>
        </p>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import network, { findStations } from "@/common/network";

import RadDrawer from "@/components/RadDrawer.vue";
import RadMenuButton from "@/components/RadMenuButton.vue";
import RadResult from "@/components/RadResult.vue";
import RadSearchOptions from "@/components/RadSearchOptions.vue";
import RadTags from "@/components/RadTags.vue";

let source = network.CancelToken.source();

@Component({
  components: {
    RadDrawer,
    RadMenuButton,
    RadResult,
    RadSearchOptions,
    RadTags,
    FasSearch,
    FasExternalLinkAlt,
    FasQuestion,
    FarMeh,
    FasSpinner,
    FasExclamationTriangle,
    FasRedo,
  },
})
export default class RadSearch extends Vue {
  searchTerm = "";
  active = false;
  results: Record<string, string | number>[] = [];
  transition = "";
  moreAvailable = true;
  failed = false;
  empty = false;
  offset = 0;
  showSpinner = true;
  loading = true;
  scrollOnceLoaded = false;

  options: SearchOptions = {
    tags: "",
    country: "",
    state: "",
    language: "",
    order: "clickcount",
    bitrate: { min: 0, max: "" },
    reverse: false,
    includeBroken: false,
  };

  @Ref() readonly query!: HTMLInputElement;

  @Getter readonly currentList!: Station[];
  @Getter readonly listName!: string;
  @Getter readonly selectedList!: number;

  @Action resetSearchStats!: () => Promise<void>;

  @Action setStationBackup!: (stationBackup: Station[] | undefined) => Promise<void>;

  @Action updateList!: (payload: { name?: string; content: Station[] }) => Promise<void>;

  get ids(): string[] {
    return this.currentList.map((station: Station) => station.id);
  }

  get descendingOrder(): boolean {
    return this.options.reverse !== this.numericalOrder;
  }

  get moreExpected(): boolean {
    return !this.active || this.showSpinner || this.empty || this.scrollOnceLoaded;
  }

  get numericalOrder(): boolean {
    return this.options.order === "clickcount" || this.options.order === "votes";
  }

  get sortIcon(): any {
    const icons = {
      name: undefined,
      country: FasFlag,
      state: FasMapMarker,
      language: FasCommentDots,
      codec: FasFileAudio,
      clickcount: FasPlay,
      votes: FasThumbsUp,
    };

    return icons[this.options.order as keyof typeof icons];
  }

  @Watch("listName")
  onListChanged(): void {
    this.resetSearchStats();
    this.setStationBackup([...this.currentList]);
  }

  @Watch("options", { deep: true })
  onOptionsChanged(): void {
    this.reset();
  }

  @Watch("searchTerm")
  onSearchTermChanged(): void {
    this.requestResults();
  }

  activated(): void {
    this.searchTerm = "";
    this.reset();
    this.setStationBackup([...this.currentList]);

    setTimeout(() => {
      this.query.focus();
      this.active = true;
    }, 300);
  }

  deactivated(): void {
    this.setStationBackup(undefined);
    this.resetSearchStats();

    setTimeout(() => {
      this.active = false;
    }, 300);
  }

  reset(): void {
    this.failed = false;
    this.showSpinner = true;
    this.results = [];
    this.requestResults();
  }

  requestResults(): void {
    this.offset = 0;
    this.loadEntries();
  }

  async loadEntries(): Promise<void> {
    if (source) {
      source.cancel();
      source = network.CancelToken.source();
    }

    let cancelled = false;
    this.loading = true;

    try {
      const searchResults = await findStations({
        searchEntries: {
          name: this.searchTerm,
          tagList: this.options.tags,
          country: this.options.country,
          state: this.options.state,
          language: this.options.language,
          tagExact: true,
          countryExact: this.options.country !== "",
          stateExact: this.options.state !== "",
          languageExact: this.options.language !== "",
          offset: this.offset,
          limit: 20,
          order: this.options.order,
          bitrateMin: this.options.bitrate.min,
          bitrateMax: this.options.bitrate.max,
          reverse: this.descendingOrder,
          hidebroken: !this.options.includeBroken,
        },
        cancelToken: source.token,
      });

      if (this.offset === 0) {
        this.results = [];

        if (this.scrollOnceLoaded) {
          this.scrollDown();
        }
      }

      searchResults.forEach((result: Record<string, string>) => {
        this.results.push(Object.freeze(result));
      });

      this.moreAvailable = this.results.length % 20 === 0 && searchResults.length > 0;

      this.empty = !this.moreAvailable && this.results.length === 0;
    } catch (error) {
      if (network.isCancel(error)) {
        cancelled = true;
      } else {
        this.failed = true;
      }
    } finally {
      if (!cancelled) {
        this.loading = false;
        this.scrollOnceLoaded = false;
        this.showSpinner = false;
      }
    }
  }

  loadMore(): void {
    this.offset += 20;
    this.loadEntries();
    this.showSpinner = true;
  }

  toggleResult(result: Record<string, string>): void {
    const currentIndex = this.ids.findIndex((id) => id === result.stationuuid);
    const added = currentIndex === -1;

    this.updateList({
      content: added
        ? [
            ...this.currentList,
            {
              name: result.name,
              url: result.url,
              homepage: result.homepage,
              icon: result.favicon,
              country: result.country,
              state: result.state,
              language: result.language,
              tags: result.tags,
              id: result.stationuuid,
            },
          ]
        : this.currentList.filter((item) => item.id !== result.stationuuid),
    });
  }

  scrollDownIfLoaded(): void {
    if (this.loading) {
      this.scrollOnceLoaded = true;
    } else {
      this.scrollDown();
    }
  }

  scrollDown(): void {
    this.$scrollTo(this.query, 300, {
      container: "#drawers",
      cancelable: false,
    });
  }
}
</script>

<style scoped>
#search > :nth-child(4) > :first-child {
  margin-bottom: 20px;
}
#search-field input {
  width: calc(100% - 60px);
  border: none;
  font-size: 24px;
  font-family: inherit;
  padding: 10px;
  background: none;
  appearance: none;
}
#search-field input::-webkit-search-cancel-button {
  display: none;
}
#find-station {
  font-size: 20px;
  font-family: inherit;
  width: 40px;
  border: none;
  background: none;
  white-space: nowrap;
}
#results {
  text-align: left;
  margin-top: 5px;
}
#load-more {
  display: flex;
  font-size: 18px;
  height: 50px;
  margin-bottom: 0;
}
</style>
