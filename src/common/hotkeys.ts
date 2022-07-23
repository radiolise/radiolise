import FasVolumeUp from "~icons/fa-solid/volume-up";
import FasVolumeMute from "~icons/fa-solid/volume-mute";
import FasExclamationTriangle from "~icons/fa-solid/exclamation-triangle";
import FasToggleOn from "~icons/fa-solid/toggle-on";
import FasToggleOff from "~icons/fa-solid/toggle-off";
import type HotkeyMixin from "@/mixins/Hotkeys";
import { navigate } from "./routing";

interface KeyBinding {
  alias: string;
  trigger(context: HotkeyMixin, enteredDigit?: number): void;
}

const KEY_BINDINGS: Record<string, KeyBinding> = {
  "h": {
    alias: "H",
    trigger() {
      navigate("hotkeys", { toggle: true });
    },
  },

  "m": {
    alias: "M",
    trigger() {
      navigate("menu", { toggle: true });
    },
  },

  "-": {
    alias: "–",
    trigger(context) {
      const { adjustVolume, showToast } = context;
      adjustVolume(-0.1);

      showToast({
        icon: context.volume === 0 ? FasVolumeMute : FasVolumeUp,
        message: context.$t("hotkeys.onScreenToasts.volume", [context.volume * 100]) as string,
      });
    },
  },

  "+": {
    alias: "+",
    trigger(context) {
      const { adjustVolume, showToast } = context;
      adjustVolume(+0.1);

      showToast({
        icon: FasVolumeUp,
        message: context.$t("hotkeys.onScreenToasts.volume", [context.volume * 100]) as string,
      });
    },
  },

  " ": {
    alias: " ",
    trigger(context) {
      const { toggleStation, showToast } = context;

      toggleStation().catch(() => {
        showToast({
          icon: FasExclamationTriangle,
          message: context.$t("general.listEmpty[0]") as string,
        });
      });
    },
  },

  "c": {
    alias: "C",
    trigger(context) {
      const { applySettings, settings, showToast } = context;
      const compact = !settings.compactMode;
      applySettings({ ...settings, compactMode: compact });
      showToast({
        message: context.$t("settings.compactMode.name") as string,
        icon: compact ? FasToggleOn : FasToggleOff,
      });
    },
  },

  "f": {
    alias: "F",
    trigger(context) {
      const { hasVideo, toggleFullscreen, showToast } = context;

      if (hasVideo) {
        toggleFullscreen();
        return;
      }

      showToast({
        icon: FasExclamationTriangle,
        message: context.$t("hotkeys.onScreenToasts.noVideoStream") as string,
      });
    },
  },

  "Escape": {
    alias: "Esc",
    trigger({ closeModal }) {
      const wasShown = closeModal();

      if (!wasShown) {
        navigate(null);
      }
    },
  },

  "p": {
    alias: "P",
    trigger(context) {
      if (context.currentStation !== undefined) {
        const { playClosestStation, showToast } = context;
        playClosestStation(false);

        showToast({
          message: context.$t("hotkeys.onScreenToasts.playingPrevious", [
            context.currentStation.name,
          ]) as string,
        });
      }
    },
  },

  "n": {
    alias: "N",
    trigger(context) {
      if (context.currentStation === undefined) {
        return;
      }

      const { playClosestStation, showToast } = context;
      playClosestStation(true);

      showToast({
        message: context.$t("hotkeys.onScreenToasts.playingNext", [
          context.currentStation.name,
        ]) as string,
      });
    },
  },

  "number": {
    alias: "0-9",
    trigger({ handleNumberInput }, enteredDigit: number) {
      handleNumberInput(enteredDigit);
    },
  },
};

export default KEY_BINDINGS;
