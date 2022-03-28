import { Component, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";

@Component
export default class BookmarkHelper extends Vue {
  @Action showToast!: (toast: Toast) => Promise<void>;

  @Action("toggleBookmark") _toggleBookmark!: (payload: {
    station: string;
    info: string;
  }) => Promise<boolean>;

  async toggleBookmark(bookmark: { station: string; info: string }): Promise<void> {
    const added = await this._toggleBookmark(bookmark);

    if (added) {
      this.showToast({
        icon: FasCheck,
        message: this.$t("player.bookmarked") as string,
      });
    }
  }
}
