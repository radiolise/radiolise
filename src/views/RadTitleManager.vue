<template>
  <rad-drawer id="title-manager">
    <h3>
      <font-awesome-icon icon="history" fixed-width />
      {{ $t("titleManager.title") }}
    </h3>
    <button @click="showTitles = !showTitles">
      <font-awesome-icon
        icon="chevron-down"
        fixed-width
        :style="{ transform: `rotate(${showTitles ? -180 : 0}deg)` }"
      />
      {{ $t("titleManager.recentTitles") }}
    </button>
    <div v-show-slide="showTitles" style="text-align: left">
      <div
        v-if="history.length === 0"
        style="padding: 15px 0; text-align: center"
      >
        {{ $t("titleManager.listEmpty") }}
      </div>
      <div v-else style="display: flex; flex-direction: column-reverse">
        <rad-title-row
          v-for="title in history"
          :key="title.time"
          :title="title"
          :active="activeTitle === title.time"
          @click.native="
            activeTitle = activeTitle !== title.time ? title.time : -1
          "
        />
      </div>
    </div>
    <div style="display: table; width: 100%">
      <button @click="showBookmarks = !showBookmarks">
        <font-awesome-icon
          icon="chevron-down"
          fixed-width
          :style="{
            transform: 'rotate(' + (showBookmarks ? -180 : 0) + 'deg)',
          }"
        />
        {{ $tc("titleManager.bookmark", 0) }}
      </button>
      <div
        class="download"
        style="
          display: table-cell;
          font-size: 20px;
          width: 35px;
          text-align: right;
        "
      >
        <a @click="exportBookmarks()"
          ><font-awesome-icon icon="download" fixed-width
        /></a>
      </div>
    </div>
    <div v-show-slide="showBookmarks" style="text-align: left">
      <div
        v-if="Object.keys(bookmarks).length === 0"
        style="padding: 15px 0; text-align: center"
      >
        {{ $t("titleManager.listEmpty") }}
      </div>
      <div v-else style="display: flex; flex-direction: column-reverse">
        <div v-for="(titles, month) in bookmarks" :key="month">
          <div
            class="month-separator"
            style="
              margin: 10px 0;
              padding: 5px 10px;
              font-size: 20px;
              font-weight: bold;
              opacity: 0.7;
            "
          >
            {{ month }}
          </div>
          <div style="display: flex; flex-direction: column-reverse">
            <rad-title-row
              v-for="title in titles"
              :key="title.time"
              :title="title"
              :active="activeBookmark === title.time"
              is-bookmark
              @click.native="
                activeBookmark = activeBookmark !== title.time ? title.time : -1
              "
            />
          </div>
        </div>
      </div>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { format } from "date-fns";
import { State, Getter, Action } from "vuex-class";
import saveFile from "@/common/downloader";
import RadDrawer from "@/components/RadDrawer.vue";
import RadTitleRow from "@/components/RadTitleRow.vue";

@Component({
  components: {
    RadDrawer,
    RadTitleRow,
  },
})
export default class RadTitleManager extends Vue {
  showTitles = false;
  showBookmarks = true;
  activeTitle = -1;
  activeBookmark = -1;

  @State readonly memory!: Memory;

  @Getter readonly dateFnsLocale?: Locale;

  @Action determineDateFnsLocale!: (
    locale: string
  ) => Promise<Locale | undefined>;

  get bookmarks(): Record<string, Title[]> {
    return this.generateBookmarks(this.dateFnsLocale);
  }

  get history(): Title[] {
    return this.memory.titles.history;
  }

  formatMonth(time: Date | number): string {
    this.determineDateFnsLocale(this.$i18n.locale);
    return format(time, "MMMM yyyy", { locale: this.dateFnsLocale });
  }

  generateBookmarks(locale?: Locale): Record<string, Title[]> {
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
    saveFile({ name: "Bookmarks", type: "txt", output: this.bookmarks });
  }
}
</script>

<style scoped>
.fa-chevron-down {
  transition: transform 0.3s;
}
</style>
