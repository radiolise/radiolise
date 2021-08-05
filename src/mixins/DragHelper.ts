import { Component, Prop, Ref, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

@Component
export default class DragHelper extends Vue {
  dragOrigin = 0;
  newIndex = 0;
  currentTranslate = 0;

  @Prop({ type: Number, required: true }) readonly index!: number;

  @Ref("station-row") readonly stationRow!: HTMLTableRowElement;

  @Getter readonly currentList!: Station[];
  @Getter readonly sortIndex!: number | undefined;

  @Action moveStation!: (payload: {
    index: number;
    newIndex: number;
  }) => Promise<void>;

  @Action startSorting!: (index?: number) => Promise<void>;

  get dragging(): boolean {
    return this.sortIndex === this.index;
  }

  set dragging(dragging: boolean) {
    this.startSorting(dragging ? this.index : undefined);
  }

  handleMouseDown(event: MouseEvent): void {
    this.dragOrigin = event.pageY;
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseMove(event: MouseEvent): void {
    const container = document.querySelector("#stations") as HTMLTableElement;
    const currentTranslate = event.pageY - this.dragOrigin;

    if (!this.dragging) {
      if (Math.abs(currentTranslate) < 20) {
        return;
      }

      this.dragging = true;
      container.style.pointerEvents = "none";
    }

    this.currentTranslate = currentTranslate;

    this.newIndex = Math.floor(
      (event.pageY -
        document.documentElement.scrollTop -
        container.getBoundingClientRect().top) /
        this.stationRow.offsetHeight
    );

    if (this.newIndex < 0) {
      this.newIndex = 0;
    } else if (this.newIndex >= this.currentList.length) {
      this.newIndex = this.currentList.length - 1;
    }

    const rows = document.querySelectorAll(
      "#stations > div"
    ) as NodeListOf<HTMLTableRowElement>;

    rows.forEach((row, i) => {
      if (i === this.index) {
        return;
      }

      let translate = 0;

      if (i < this.index) {
        if (i >= this.newIndex) {
          translate = this.stationRow.offsetHeight;
        }
      } else if (i <= this.newIndex) {
        translate = -this.stationRow.offsetHeight;
      }

      row.style.transform = `translateY(${translate}px)`;
    });
  }

  handleMouseUp(): void {
    if (this.dragging) {
      const rows = [
        ...document.querySelectorAll("#stations > div"),
      ] as HTMLTableRowElement[];

      rows.forEach((row) => {
        row.style.transform = "";
      });

      this.dragging = false;
      this.currentTranslate = 0;
      this.finishSorting();
      const container = document.querySelector("#stations") as HTMLTableElement;
      container.style.pointerEvents = "";
      this.moveStation({ index: this.index, newIndex: this.newIndex });
    }
  }

  finishSorting(): void {
    this.dragOrigin = 0;
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }
}
