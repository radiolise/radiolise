<template>
  <RadDrawer>
    <h3>
      <FasSearch class="w-fixed" />
      {{ $t("general.findStations") }}
    </h3>
    <i18n path="search.credit.radioBrowser" tag="p" class="my-4 py-2.5 leading-6">
      <a href="https://fsfe.org/freesoftware/" target="_blank" rel="noopener"
        >{{ $t("search.credit.free") }} <FasExternalLinkAlt class="w-fixed" /></a
      ><a href="http://www.radio-browser.info" target="_blank" rel="noopener"
        >Community Radio Browser <FasExternalLinkAlt class="w-fixed"
      /></a>
    </i18n>
    <div
      class="mb-5 flex border-b-2 border-b-mute-contrast/50 focus-within:border-b-accent focus-within:bg-black/10"
    >
      <input
        ref="searchField"
        class="w-full appearance-none bg-transparent p-2.5 font-sans text-2xl"
        :value="searchTerm"
        autocomplete="off"
        autocapitalize="off"
        :placeholder="String($t('search.byName'))"
        type="text"
        spellcheck="false"
        @input="searchTerm = searchField.value"
        @change="searchTerm = searchField.value"
        @focus="searchField.select()"
        @keypress.enter="
          searchField.blur();
          scrollDownIfLoaded();
        "
      />
      <a
        class="my-auto w-10 shrink-0 border-none bg-transparent text-xl"
        @click="scrollDownIfLoaded()"
      >
        <FasSearch />
      </a>
    </div>
    <RadSearchOptions :options.sync="options" />
    <div>
      <template v-if="!failed">
        <div
          v-if="active && results.length > 0 && !scrollOnceLoaded"
          class="mt-1.25 w-full text-left"
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
                  class="mb-0.5 inline-block rounded-sm bg-strong px-[0.6em] pb-[0.3em] pt-[0.2em] text-xs font-bold uppercase text-on-strong"
                  >{{ $t("search.stationBroken") }}</span
                >
                {{ " "
                }}<span
                  v-if="options.order !== 'name'"
                  class="mb-0.5 inline-block rounded-sm bg-emphasis px-[0.6em] pb-[0.3em] pt-[0.2em] text-xs font-bold text-on-emphasis"
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
        <div v-if="moreExpected || moreAvailable" class="mt-[18px] flex py-2.5 text-lg">
          <div v-if="moreExpected" class="m-auto py-3.5">
            <template v-if="empty">
              <FarMeh class="w-fixed" />{{ $t("search.noMatches") }}
            </template>
            <template v-else>
              <FasSpinner class="w-fixed animate-spin" />{{ $t("search.loading") }}
            </template>
          </div>
          <RadMenuButton v-else class="w-full" @click="loadMore">
            <FasSearch class="w-fixed" />
            {{ $t("search.loadMore") }}
          </RadMenuButton>
        </div>
      </template>
      <p v-if="failed" class="my-4 py-2.5 text-lg">
        <FasExclamationTriangle class="w-fixed" />
        {{ $t("search.error") }}
        <a @click="reset"><FasRedo class="w-fixed" />{{ $t("search.tryAgain") }}</a>
      </p>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import FasFlag from "~icons/fa-solid/flag";
import FasMapMarker from "~icons/fa-solid/map-marker";
import FasCommentDots from "~icons/fa-solid/comment-dots";
import FasFileAudio from "~icons/fa-solid/file-audio";
import FasPlay from "~icons/fa-solid/play";
import FasThumbsUp from "~icons/fa-solid/thumbs-up";

import { findStations } from "@/common/network";

let newestAbortController: AbortController | undefined;

@Component
export default class RadSearch extends Vue {
  searchTerm = "";
  active = false;
  results: SearchResult[] = [];
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

  @Ref() readonly searchField!: HTMLInputElement;

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

    window.setTimeout(() => {
      this.searchField.focus();
      this.active = true;
    }, 300);
  }

  deactivated(): void {
    this.setStationBackup(undefined);
    this.resetSearchStats();

    window.setTimeout(() => {
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
    newestAbortController?.abort();
    const controller = new AbortController();
    newestAbortController = controller;

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
        signal: controller.signal,
      });

      if (this.offset === 0) {
        this.results = [];

        if (this.scrollOnceLoaded) {
          this.scrollDown();
        }
      }

      for (const result of searchResults) {
        this.results.push(Object.freeze(result));
      }

      this.moreAvailable = this.results.length % 20 === 0 && searchResults.length > 0;

      this.empty = !this.moreAvailable && this.results.length === 0;
    } catch {
      if (!controller.signal.aborted) {
        this.failed = true;
      }
    } finally {
      if (!controller.signal.aborted) {
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

  toggleResult(result: SearchResult): void {
    const currentIndex = this.ids.indexOf(result.stationuuid);
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
      return;
    }
    this.scrollDown();
  }

  scrollDown(): void {
    this.$scrollTo(this.searchField, 300, {
      container: ".drawer",
      cancelable: false,
    });
  }
}
</script>
