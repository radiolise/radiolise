<template>
  <RadDrawer>
    <h3>
      <FasHistory class="w-fixed" />
      {{ $t("titleManager.title") }}
    </h3>
    <RadMenuButton class="w-full text-left" @click="showTitles = !showTitles">
      <FasChevronDown :class="['w-fixed', { '-rotate-180': showTitles }]" />
      {{ $t("titleManager.recentTitles") }}
    </RadMenuButton>
    <div v-show-slide="showTitles" class="text-left">
      <div v-if="history.length === 0" class="py-3.75 text-center">
        {{ $t("titleManager.listEmpty") }}
      </div>
      <div v-else class="flex flex-col-reverse">
        <RadTitleRow
          v-for="title in history"
          :key="title.time"
          :title="title"
          :active="activeTitle === title.time"
          @click.native="activeTitle = activeTitle !== title.time ? title.time : -1"
        />
      </div>
    </div>
    <div class="flex items-center">
      <RadMenuButton class="w-full text-left" @click="showBookmarks = !showBookmarks">
        <FasChevronDown :class="['w-fixed', { '-rotate-180': showBookmarks }]" />
        {{ $tc("titleManager.bookmark", 0) }}
      </RadMenuButton>
      <div v-if="!bookmarksEmpty" class="ml-2.5 text-xl">
        <a @click="exportBookmarks()"><FasDownload class="w-fixed" /></a>
      </div>
    </div>
    <div v-show-slide="showBookmarks" class="text-left">
      <div v-if="bookmarksEmpty" class="py-3.75 text-center">
        {{ $t("titleManager.listEmpty") }}
      </div>
      <div v-else class="flex flex-col-reverse">
        <div v-for="(titles, month) in bookmarks" :key="month">
          <div
            class="my-2.5 border-b-2 border-b-mute-contrast/50 py-1.25 px-2.5 text-xl font-bold text-on-surface/70"
          >
            {{ month }}
          </div>
          <div class="flex flex-col-reverse">
            <RadTitleRow
              v-for="title in titles"
              :key="title.time"
              :title="title"
              :active="activeBookmark === title.time"
              is-bookmark
              @click.native="activeBookmark = activeBookmark !== title.time ? title.time : -1"
            />
          </div>
        </div>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { format } from "date-fns";
import { State, Getter, Action } from "vuex-class";
import { downloadBookmarks } from "@/common/list-converter";

@Component
export default class RadTitleManager extends Vue {
  showTitles = false;
  showBookmarks = true;
  activeTitle = -1;
  activeBookmark = -1;

  @State readonly memory!: Memory;

  @Getter readonly dateFnsLocale?: Locale;

  @Action determineDateFnsLocale!: (locale: string) => Promise<Locale | undefined>;

  get bookmarksEmpty() {
    return this.memory.titles.favorites.length === 0;
  }

  get bookmarks(): Record<string, Title[]> {
    return this.generateBookmarks();
  }

  get history(): Title[] {
    return this.memory.titles.history;
  }

  formatMonth(time: Date | number): string {
    this.determineDateFnsLocale(this.$i18n.locale);
    return format(time, "MMMM yyyy", { locale: this.dateFnsLocale });
  }

  generateBookmarks(): Record<string, Title[]> {
    return this.memory.titles.favorites.reduce((bookmarks, item) => {
      const currentMonth = this.formatMonth(item.time * 60);

      if (bookmarks[currentMonth] !== undefined) {
        bookmarks[currentMonth].push(item);
      } else {
        bookmarks[currentMonth] = [item];
      }

      return bookmarks;
    }, {} as Record<string, Title[]>);
  }

  exportBookmarks(): void {
    downloadBookmarks(this.memory.titles.favorites);
  }
}
</script>
