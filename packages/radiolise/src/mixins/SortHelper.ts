import { Component, Prop, PropSync, Ref, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import FasCheck from "~icons/fa-solid/check";
import FasInfoCircle from "~icons/fa-solid/info-circle";

let touchTimeout: number | undefined;
let animationFrame: number | undefined;
let waitForTouchEnd = false;
let mouseOrigin = 0;

document.addEventListener("scroll", () => clearTimeout(touchTimeout));

@Component
export default class SortHelper extends Vue {
  originalPosition = 0;
  newIndex = 0;
  currentTranslation = 0;
  viewportObserver: IntersectionObserver | undefined;

  @Prop({ type: Number, required: true }) readonly index!: number;
  @PropSync("touchDraggingEnabled", { type: Boolean, required: true })
  touchFriendlyMoveModeEnabled!: boolean;

  @Ref() readonly stationRow!: HTMLDivElement;

  @Getter readonly currentList!: Station[];
  @Getter readonly sortIndex!: number | undefined;

  @Action moveStation!: (payload: { index: number; newIndex: number }) => Promise<void>;
  @Action startSorting!: (index?: number) => Promise<void>;
  @Action showToast!: (toast: Toast) => Promise<void>;

  get container() {
    return this.stationRow.parentElement!;
  }

  get dragged() {
    return this.sortIndex === this.index;
  }

  set dragged(dragged) {
    this.startSorting(dragged ? this.index : undefined);
  }

  beforeDestroy() {
    this.finishSorting();
  }

  handleMouseWheel(event: WheelEvent) {
    event.preventDefault();
  }

  saveOrigin(pageY: number) {
    mouseOrigin = pageY;
    this.originalPosition = this.stationRow.offsetTop;
    document.addEventListener("wheel", this.handleMouseWheel, { passive: false });
  }

  handleMouseDown(event: MouseEvent) {
    this.saveOrigin(event.pageY);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  enterTouchFriendlyMode() {
    this.touchFriendlyMoveModeEnabled = true;
    document.addEventListener(
      "mousedown",
      () => {
        if (this.touchFriendlyMoveModeEnabled) {
          this.exitTouchFriendlyMode();
        }
      },
      { once: true }
    );
  }

  exitTouchFriendlyMode() {
    this.touchFriendlyMoveModeEnabled = false;
    this.showToast({
      icon: FasCheck,
      message: this.$t("sortHelper.touchFriendlyMode.exit") as string,
    });
  }

  preventGestures(event: TouchEvent) {
    event.preventDefault();
  }

  @Watch("touchFriendlyMoveModeEnabled")
  onMoveModeToggled(enabled: boolean) {
    if (enabled) {
      this.stationRow.addEventListener("touchstart", this.preventGestures);
      this.stationRow.addEventListener("touchmove", this.handleTouchMove);
    } else {
      this.stationRow.removeEventListener("touchstart", this.preventGestures);
      this.stationRow.removeEventListener("touchmove", this.handleTouchMove);
    }
  }

  handleTouchStart(event: TouchEvent) {
    this.saveOrigin(event.touches[0].pageY);
    clearTimeout(touchTimeout);
    touchTimeout = window.setTimeout(() => {
      if (this.touchFriendlyMoveModeEnabled) {
        return this.exitTouchFriendlyMode();
      }
      this.showToast({
        icon: FasInfoCircle,
        message: this.$t("sortHelper.touchFriendlyMode.releaseToEnter") as string,
      });
      waitForTouchEnd = true;
    }, 1000);
  }

  isDraggingAllowed(pageY: number) {
    return this.dragged || Math.abs(pageY - mouseOrigin) >= 20;
  }

  handleMouseMove(event: MouseEvent) {
    if (this.isDraggingAllowed(event.pageY)) {
      this.handleMove(event.pageY);
    }
  }

  handleTouchMove(event: TouchEvent) {
    if (!this.touchFriendlyMoveModeEnabled || waitForTouchEnd) {
      return;
    }
    const { pageY } = event.touches[0];
    if (this.isDraggingAllowed(pageY)) {
      event.preventDefault();
      clearTimeout(touchTimeout);
      this.handleMove(pageY);
    }
  }

  createViewportObserver() {
    return new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          return this.cancelScrollLoop();
        }
        const halfViewport = document.documentElement.clientHeight * 0.5;
        const direction = entry.boundingClientRect.top < halfViewport ? -1 : 1;
        this.runScrollLoop(direction);
      },
      { rootMargin: "-120px 0px 0px 0px", threshold: 1 }
    );
  }

  getTranslationValue(mousePosition: number) {
    const minimalPosition = this.container.offsetTop - this.originalPosition;
    const maximalPosition =
      minimalPosition + this.container.offsetHeight - this.stationRow.offsetHeight;

    if (mousePosition < mouseOrigin + minimalPosition) return minimalPosition;
    if (mousePosition > mouseOrigin + maximalPosition) return maximalPosition;
    return mousePosition - mouseOrigin;
  }

  getSiblingTranslationDirection(siblingIndex: number) {
    if (this.index < siblingIndex) return this.newIndex >= siblingIndex ? -1 : 0;
    return this.newIndex <= siblingIndex ? 1 : 0;
  }

  handleMove(pageY: number) {
    this.dragged = true;
    this.currentTranslation = this.getTranslationValue(pageY);

    if (!this.viewportObserver) {
      this.viewportObserver = this.createViewportObserver();
    }
    this.viewportObserver.observe(this.stationRow);

    const positionRelative = pageY - this.container.offsetTop;
    const closestIndex = Math.floor(positionRelative / this.stationRow.offsetHeight);
    this.newIndex = Math.min(Math.max(closestIndex, 0), this.currentList.length - 1);

    const rows = this.container.childNodes as NodeListOf<HTMLDivElement>;

    for (const [index, row] of rows.entries()) {
      if (this.stationRow !== row) {
        const translationDirection = this.getSiblingTranslationDirection(index);
        row.classList.toggle("-translate-y-full", translationDirection === -1);
        row.classList.toggle("translate-y-full", translationDirection === 1);
      }
    }
  }

  handleMouseUp() {
    this.finishSorting();
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  handleTouchEnd() {
    clearTimeout(touchTimeout);
    if (!this.dragged && (waitForTouchEnd || this.touchFriendlyMoveModeEnabled)) {
      this.showToast({
        icon: FasInfoCircle,
        message: this.$t("sortHelper.touchFriendlyMode.explanation") as string,
      });
    }
    if (waitForTouchEnd) {
      this.enterTouchFriendlyMode();
    }
    this.finishSorting();
  }

  finishSorting() {
    waitForTouchEnd = false;
    document.removeEventListener("wheel", this.handleMouseWheel);

    if (this.dragged) {
      this.dragged = false;
      this.currentTranslation = 0;
      this.viewportObserver?.disconnect();
      this.cancelScrollLoop();
      this.moveStation({ index: this.index, newIndex: this.newIndex });
    }
  }

  runScrollLoop(direction: number) {
    animationFrame = window.requestAnimationFrame(() => this.runScrollLoop(direction));
    const moveBy = direction * 10;
    window.scrollBy({ top: moveBy });
    this.handleMove(mouseOrigin + this.currentTranslation + moveBy);
  }

  cancelScrollLoop() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  }
}
