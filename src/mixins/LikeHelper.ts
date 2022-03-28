import { Component, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import { ModalOptions, ModalType } from "@/store";

@Component
export default class LikeHelper extends Vue {
  @Getter readonly likeState: LikeState | undefined;

  @Action fetchLikeCount!: (id?: string) => Promise<number>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  @Watch("likeState")
  async handleLike(likeState: LikeState): Promise<void> {
    try {
      const data = await likeState.promise;

      if (data.ok) {
        this.showLikeCounter(likeState.id, false);
      } else if (data.message.includes("too often")) {
        this.showLikeCounter(likeState.id, true);
      } else {
        this.showMessage({
          type: ModalType.ERROR,
          buttons: [this.$t("general.ok") as string],
          title: this.$t("general.like.unableToVote.title") as string,
          message: this.$t("general.like.unableToVote.description", [data.message]) as string,
        });
      }
    } catch (alreadyVoted) {
      if (alreadyVoted) {
        this.showLikeCounter(likeState.id, true);
      } else {
        this.showMessage({
          type: ModalType.ERROR,
          buttons: [this.$t("general.ok") as string],
          title: this.$t("general.like.unableToVote.title") as string,
          message: this.$t(
            `general.error.${navigator.onLine ? "genericTryLater" : "goOnline"}`
          ) as string,
        });
      }
    }
  }

  async showLikeCounter(id: string, alreadyVoted: boolean): Promise<void> {
    const message = this.$t(
      `general.like.${alreadyVoted ? "alreadyVoted" : "submitMessage"}`
    ) as string;

    try {
      const votes = await this.fetchLikeCount(id);

      this.showMessage({
        type: ModalType.INFO,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("general.like.submitted") as string,
        message: `${this.$t("general.like.count", [
          votes.toLocaleString(this.$i18n.locale),
        ])}\n${message}`,
      });
    } catch {
      this.showMessage({
        type: ModalType.WARNING,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("general.error.networkIssue.title") as string,
        message: this.$t("general.error.networkIssue.description", [message]) as string,
      });
    }
  }
}
