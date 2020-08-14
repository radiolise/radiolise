<template>
  <rad-drawer id="title-manager">
    <h3>
      <font-awesome-icon icon="history" fixed-width />
      {{ $t("titleManager.title") }}
    </h3>
    <div style="display: table; width: 100%">
      <button
        id="showrecent"
        style="display: table-cell; width: 100%"
        @click="showTitles = !showTitles"
      >
        <font-awesome-icon
          icon="chevron-down"
          fixed-width
          :style="{ transform: `rotate(${showTitles ? -180 : 0}deg)` }"
        />
        {{ $t("titleManager.recentTitles") }}
      </button>
      <div
        class="reload"
        style="display: none; font-size: 20px; width: 35px; text-align: right"
      >
        <a><font-awesome-icon icon="redo" fixed-width/></a>
      </div>
    </div>
    <div id="recent" v-show-slide="showTitles" style="text-align: left">
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
      <button id="showbookmarks" @click="showBookmarks = !showBookmarks">
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
        style="display: table-cell; font-size: 20px; width: 35px; text-align: right"
      >
        <a @click="exportBookmarks()"
          ><font-awesome-icon icon="download" fixed-width
        /></a>
      </div>
    </div>
    <div id="favorites" v-show-slide="showBookmarks" style="text-align: left">
      <div
        v-if="Object.keys(bookmarks).length === 0"
        style="padding: 15px 0; text-align: center"
      >
        {{ $t("titleManager.listEmpty") }}
      </div>
      <div v-else style="display: flex; flex-direction: column-reverse">
        <div v-for="(titles, month) in bookmarks" :key="month">
          <div
            class="monthseparator"
            style="margin: 10px 0; padding: 5px 10px; font-size: 20px; font-weight: bold; opacity: .7"
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
import Moment from "moment";
import { State } from "vuex-class";
import download from "@/utils/downloader";
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

  get history(): Title[] {
    return this.memory.titles.history;
  }

  get bookmarks(): Record<string, Title[]> {
    return this.memory.titles.favorites.reduce((bookmarks, item) => {
      const currentMonth = Moment(item.time * 60).format("MMMM YYYY");

      if (bookmarks[currentMonth] !== undefined) {
        bookmarks[currentMonth].push(item);
      } else {
        bookmarks[currentMonth] = [item];
      }

      return bookmarks;
    }, {} as Record<string, Title[]>);
  }

  exportBookmarks(): void {
    download({ name: "Bookmarks", type: "txt", output: this.bookmarks });
  }
}
</script>
