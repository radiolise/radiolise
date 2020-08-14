<template>
  <rad-drawer id="search">
    <h3>
      <font-awesome-icon icon="search" fixed-width />
      {{ $t("general.findStations") }}
    </h3>
    <i18n path="search.credit.radioBrowser" tag="p">
      <a
        class="btn-link white"
        href="https://www.gnu.org/philosophy/free-sw.html"
        target="_blank"
        rel="noopener"
        >{{ $t("search.credit.free") }}
        <font-awesome-icon icon="external-link-alt" fixed-width/></a
      ><a
        class="btn-link white"
        href="https://radio-browser.live"
        target="_blank"
        rel="noopener"
        >Community Radio Browser
        <font-awesome-icon icon="external-link-alt" fixed-width
      /></a>
    </i18n>
    <div>
      <div :class="{ typing }">
        <input
          id="query"
          ref="query"
          :value="searchTerm"
          autocomplete="off"
          :placeholder="$t('search.byName')"
          type="search"
          spellcheck="false"
          @input="searchTerm = $event.target.value"
          @change="searchTerm = $event.target.value"
          @focus="
            typing = true;
            query.select();
          "
          @blur="typing = false"
          @keypress.enter="
            query.blur();
            scrollDownIfLoaded();
          "
        /><button id="findstation" @click="scrollDownIfLoaded()">
          <font-awesome-icon icon="search" />
        </button>
      </div>
      <rad-search-options :options.sync="options" />
      <div>
        <template v-if="!failed">
          <div
            v-if="active && results.length > 0 && !scrollOnceLoaded"
            id="results"
            style="width: 100%; display: block !important"
          >
            <rad-result
              v-for="result in results"
              :key="result.stationuuid"
              :selected="ids.includes(result.stationuuid)"
              @change="toggleResult(result)"
            >
              {{ result.name }}
              <template #tags>
                <rad-tags
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
                    >{{ $t("Broken") }}</span
                  >
                  &nbsp;<span
                    v-if="options.order !== 'name'"
                    class="label highlighted"
                    style="font-weight: bold"
                  >
                    <font-awesome-icon :icon="sortIcon" />
                    &nbsp;
                    <template v-if="result[options.order] !== ''">{{
                      numericalOrder
                        ? result[options.order].toLocaleString($i18n.locale)
                        : result[options.order]
                    }}</template>
                    <font-awesome-icon v-else icon="question" />
                  </span>
                </rad-tags>
              </template>
            </rad-result>
          </div>
          <p
            v-if="
              !active ||
                showSpinner ||
                empty ||
                moreAvailable ||
                scrollOnceLoaded
            "
            id="loadmore"
            style="display: flex; font-size: 18px; height: 50px; margin-bottom: 0"
          >
            <span
              v-if="!active || showSpinner || empty || scrollOnceLoaded"
              style="margin: auto"
            >
              <template v-if="!active || showSpinner || scrollOnceLoaded">
                <font-awesome-icon icon="spinner" fixed-width spin />{{
                  $t("search.loading")
                }}
              </template>
              <template v-else>
                <font-awesome-icon :icon="['far', 'meh']" fixed-width />{{
                  $t("search.noMatches")
                }}
              </template>
            </span>
            <button v-else @click="loadMore">
              <font-awesome-icon icon="search" fixed-width />
              {{ $t("search.loadMore") }}
            </button>
          </p>
        </template>
        <p v-if="failed" id="failure" style="font-size: 18px">
          <font-awesome-icon icon="exclamation-triangle" fixed-width />
          {{ $t("search.error") }}
          <a id="redoajax" href="#/search" @click="reset"
            ><font-awesome-icon icon="redo" fixed-width />{{
              $t("search.tryAgain")
            }}</a
          >
        </p>
      </div>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import Axios from "axios";
import QueryString from "qs";
import { Getter, Action } from "vuex-class";

import RadDrawer from "@/components/RadDrawer.vue";
import RadTags from "@/components/RadTags.vue";
import RadResult from "@/components/RadResult.vue";
import RadSearchOptions from "@/components/RadSearchOptions.vue";

const { CancelToken } = Axios;
let source = CancelToken.source();

@Component({
  components: {
    RadDrawer,
    RadTags,
    RadResult,
    RadSearchOptions,
  },
})
export default class RadSearch extends Vue {
  searchTerm = "";
  active = false;
  results: Record<string, string | number>[] = [];
  typing = false;
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
    order: "votes",
    reverse: false,
    includeBroken: false,
  };

  @Ref() readonly query!: HTMLInputElement;

  @Getter readonly radioBrowserUrl!: string;
  @Getter readonly currentList!: Station[];
  @Getter readonly listName!: string;
  @Getter readonly selectedList!: number;

  @Action resetSearchStats!: () => Promise<void>;

  @Action setStationBackup!: (
    stationBackup: Station[] | undefined
  ) => Promise<void>;

  @Action updateList!: (payload: {
    name?: string;
    content: Station[];
  }) => Promise<void>;

  get ids(): string[] {
    return this.currentList.map((station: Station) => station.id);
  }

  get descendingOrder(): boolean {
    return this.options.reverse !== this.numericalOrder;
  }

  get numericalOrder(): boolean {
    return (
      this.options.order === "clickcount" || this.options.order === "votes"
    );
  }

  get sortIcon(): string | undefined {
    const icons = {
      name: undefined,
      country: "flag",
      state: "map-marker",
      language: "comment-dots",
      codec: "file-audio",
      clickcount: "play",
      votes: "thumbs-up",
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
      source = CancelToken.source();
    }

    let cancelled = false;
    this.loading = true;

    const response = await Axios.post(
      this.radioBrowserUrl + "stations/search",
      QueryString.stringify({
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
        reverse: this.descendingOrder,
        hidebroken: !this.options.includeBroken,
      }),
      { cancelToken: source.token }
    );

    try {
      if (this.offset === 0) {
        this.results = [];

        if (this.scrollOnceLoaded) {
          this.scrollDown();
        }
      }

      response.data.forEach((result: Record<string, string>) => {
        this.results.push(Object.freeze(result));
      });

      this.moreAvailable =
        this.results.length % 20 === 0 && response.data.length > 0;

      this.empty = !this.moreAvailable && this.results.length === 0;
    } catch (error) {
      if (Axios.isCancel(error)) {
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
    const currentIndex = this.ids.findIndex(id => id === result.stationuuid);
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
        : this.currentList.filter(item => item.id !== result.stationuuid),
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
    this.$scrollTo("#query", 300, {
      container: "#drawers",
      cancelable: false,
    });
  }
}
</script>
