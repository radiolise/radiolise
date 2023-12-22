import { Component, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import FasExclamationTriangle from "~icons/fa-solid/exclamation-triangle";

import KEY_BINDINGS from "@/common/hotkeys";
import type { ModalOptions } from "@/store";

interface NumberInput {
  input: string;
  timeout?: number;
}

function isFocusedInput(element: Element | null) {
  if (element?.tagName !== "INPUT") {
    return false;
  }
  return element.matches(":focus");
}

function matchesFocusVisible(element: Element | null) {
  if (!element) {
    return false;
  }
  try {
    return element.matches(":focus-visible");
  } catch {
    return element.matches(":focus");
  }
}

@Component
export default class Hotkeys extends Vue {
  numberInput: NumberInput = { input: "", timeout: undefined };

  @Getter readonly currentList!: Station[];
  @Getter readonly currentStation?: Station;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly modalOptions: Required<ModalOptions> | undefined;
  @Getter readonly settings!: Settings;
  @Getter readonly volume!: number;

  @Action adjustVolume!: (step: number) => Promise<void>;
  @Action applySettings!: (settings: Settings) => Promise<void>;
  @Action playClosestStation!: (forward: boolean) => Promise<void>;
  @Action showToast!: (toast: Toast) => Promise<void>;
  @Action toggleFullscreen!: () => Promise<void>;
  @Action toggleStation!: (station?: Station) => Promise<void>;

  created(): void {
    document.addEventListener("keydown", this.triggerHotkeyAction);
  }

  finishNumberInput(index: number): void {
    this.numberInput.input = "";
    this.numberInput.timeout = undefined;

    const station = this.currentList[index - 1];

    if (station === undefined) {
      this.showToast({
        icon: FasExclamationTriangle,
        message: this.$t("hotkeys.onScreenToasts.notExisting", [index]) as string,
      });
      return;
    }

    if (this.currentStation?.id !== station.id) {
      this.toggleStation(station);
    }

    this.showToast({
      message: this.$t("hotkeys.onScreenToasts.playingIndex", [index, station.name]) as string,
    });
  }

  handleNumberInput(enteredDigit: number): void {
    if (this.numberInput.timeout !== undefined) {
      clearTimeout(this.numberInput.timeout);
    }

    this.numberInput.input += String(enteredDigit);
    const index = Number(this.numberInput.input);

    const digitsLeft = String(this.currentList.length).length - this.numberInput.input.length;

    if (digitsLeft > 0) {
      this.showToast({
        message: `${this.numberInput.input}${"–".repeat(digitsLeft)}`,
      });

      this.numberInput.timeout = window.setTimeout(() => {
        this.finishNumberInput(index);
      }, 2000);

      return;
    }

    this.finishNumberInput(index);
  }

  isHotkeyAllowed(event: KeyboardEvent): boolean {
    if (event.key === "Escape") {
      return true;
    }
    if (event.key === " " && matchesFocusVisible(document.activeElement)) {
      return false;
    }
    return (
      document.hasFocus() &&
      !isFocusedInput(document.activeElement) &&
      this.modalOptions === undefined &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey
    );
  }

  closeModal(): boolean {
    if (this.modalOptions === undefined) {
      return false;
    }
    if (this.modalOptions.closeable) {
      this.modalOptions.handleButtonClicked(0);
    }
    return true;
  }

  triggerHotkeyAction(event: KeyboardEvent): void {
    if (!this.isHotkeyAllowed(event)) {
      return;
    }
    if (event.key in KEY_BINDINGS) {
      event.preventDefault();
      KEY_BINDINGS[event.key].trigger(this);
      return;
    }
    const enteredDigit = Number(event.key);
    if (!Number.isNaN(enteredDigit)) {
      KEY_BINDINGS.number.trigger(this, enteredDigit);
    }
  }
}
