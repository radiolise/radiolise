import { Component, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import keyBindings from "@/utils/hotkeys";
import { ModalOptions } from "@/store";

interface NumberInput {
  input: string;
  timeout?: number;
}

@Component
export default class Hotkeys extends Vue {
  numberInput: NumberInput = { input: "", timeout: undefined };

  @Getter readonly currentList!: Station[];
  @Getter readonly currentStation?: Station;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly modalOptions: ModalOptions | undefined;
  @Getter readonly volume!: number;

  @Action adjustVolume!: (step: number) => void;
  @Action playClosestStation!: (forward: boolean) => void;
  @Action showHint!: (hint: Hint) => void;
  @Action toggleFullscreen!: () => void;
  @Action toggleStation!: (station?: Station) => void;

  created(): void {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  finishNumberInput(index: number): void {
    const station = this.currentList[index - 1];

    if (station !== undefined) {
      if (this.currentStation?.id !== station.id) {
        this.toggleStation(station);

        this.showHint({
          message: this.$t("hotkeys.onScreenHints.playingIndex", [
            index,
            station.name,
          ]) as string,
        });
      }
    } else {
      this.showHint({
        message: this.$t("hotkeys.onScreenHints.notExisting", [
          index,
        ]) as string,
      });
    }

    this.numberInput.input = "";
    this.numberInput.timeout = undefined;
  }

  handleNumberInput(enteredDigit: number): void {
    if (this.numberInput.timeout !== undefined) {
      clearTimeout(this.numberInput.timeout);
    }

    this.numberInput.input += String(enteredDigit);
    const index = Number(this.numberInput.input);

    const digitsLeft =
      String(this.currentList.length).length - this.numberInput.input.length;

    if (digitsLeft > 0) {
      this.showHint({
        message: `${this.numberInput.input}${"–".repeat(digitsLeft)}`,
      });

      this.numberInput.timeout = setTimeout(() => {
        this.finishNumberInput(index);
      }, 2000);
    } else {
      this.finishNumberInput(index);
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === " " && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
    }
  }

  isHotkeyAllowed(event: KeyboardEvent): boolean {
    return (
      document.hasFocus &&
      document.activeElement?.tagName !== "INPUT" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey
    );
  }

  closeModal(): boolean {
    if (this.modalOptions !== undefined) {
      if (this.modalOptions.closeable) {
        const handleButtonClicked = this.modalOptions.handleButtonClicked as (
          button: number
        ) => void;

        handleButtonClicked(0);
      }

      return true;
    }

    return false;
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      keyBindings.Escape.trigger(this);
      return;
    }

    if (event.key === "Enter") {
      this.closeModal();
    }

    if (this.isHotkeyAllowed(event)) {
      if (event.key in keyBindings) {
        keyBindings[event.key].trigger(this);
      } else {
        const enteredDigit = Number(event.key);

        if (!Number.isNaN(enteredDigit)) {
          keyBindings.number.trigger(this, enteredDigit);
        }
      }
    }
  }
}
