import { Component, Prop, Ref, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

@Component
export default class DragHelper extends Vue {
  dragOrigin = 0;
  newIndex = 0;
  currentTranslation = 0;

  @Prop({ type: Number, required: true }) readonly index!: number;

  @Ref("station-row") readonly stationRow!: HTMLDivElement;

  @Getter readonly currentList!: Station[];
  @Getter readonly sortIndex!: number | undefined;

  @Action moveStation!: (payload: { index: number; newIndex: number }) => Promise<void>;
  @Action startSorting!: (index?: number) => Promise<void>;

  get dragged(): boolean {
    return this.sortIndex === this.index;
  }

  set dragged(dragged: boolean) {
    this.startSorting(dragged ? this.index : undefined);
  }

  getSiblingTranslationValue(siblingIndex: number) {
    if (this.index < siblingIndex) {
      return this.newIndex >= siblingIndex ? -1 : 0;
    }
    return this.newIndex <= siblingIndex ? 1 : 0;
  }

  handleMouseDown(event: MouseEvent): void {
    this.dragOrigin = event.pageY;
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseMove(event: MouseEvent): void {
    const currentTranslation = event.pageY - this.dragOrigin;

    if (!this.dragged) {
      if (Math.abs(currentTranslation) < 20) {
        return;
      }

      this.dragged = true;
    }

    this.currentTranslation = currentTranslation;

    const offsetTop = this.stationRow.parentElement!.getBoundingClientRect().top;
    const positionRelative = event.pageY - document.documentElement.scrollTop - offsetTop;
    const closestIndex = Math.floor(positionRelative / this.stationRow.offsetHeight);

    this.newIndex = Math.min(Math.max(closestIndex, 0), this.currentList.length - 1);

    const rows = document.querySelectorAll(".station") as NodeListOf<HTMLDivElement>;

    rows.forEach((row, index) => {
      if (this.index !== index) {
        const translationValue = this.getSiblingTranslationValue(index);
        row.classList.toggle("-translate-y-full", translationValue === -1);
        row.classList.toggle("translate-y-full", translationValue === 1);
      }
    });
  }

  handleMouseUp(): void {
    if (this.dragged) {
      this.dragged = false;
      this.currentTranslation = 0;
      this.finishSorting();
      this.moveStation({ index: this.index, newIndex: this.newIndex });
    }
  }

  finishSorting(): void {
    this.dragOrigin = 0;
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }
}
