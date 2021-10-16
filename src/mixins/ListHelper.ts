import { Component, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";

import { ModalOptions, ModalType } from "@/store";
import downloadList, { ListDownloadPayload } from "@/common/list-converter";

@Component
export default class ListHelper extends Vue {
  @Action changeList!: (index: number) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  checkForEmptyList(content: Station[]): boolean {
    if (content.length === 0) {
      this.showMessage({
        type: ModalType.WARNING,
        buttons: [this.$t("general.ok") as string],
        message: this.$t("general.listEmpty[0]") as string,
      });
      return true;
    }
    return false;
  }

  download(payload: ListDownloadPayload): void {
    if (!this.checkForEmptyList(payload.content)) {
      downloadList(payload);
    }
  }
}
