import HotkeyMixin from "@/mixins/Hotkeys";

interface KeyBinding {
  alias: string;
  trigger(context: HotkeyMixin, enteredDigit?: number): void;
}

const keyBindings: Record<string, KeyBinding> = {
  h: {
    alias: "H",
    trigger({ $router, $route }) {
      $router.push($route.path === "/hotkeys" ? "/" : "/hotkeys");
    },
  },

  m: {
    alias: "M",
    trigger({ $router, $route }) {
      $router.push($route.path === "/menu" ? "/" : "/menu");
    },
  },

  "-": {
    alias: "–",
    trigger(context) {
      const { adjustVolume, showHint } = context;
      adjustVolume(-0.1);

      showHint({
        message: context.$t("hotkeys.onScreenHints.volume", [
          context.volume * 100,
        ]) as string,
      });
    },
  },

  "+": {
    alias: "+",
    trigger(context) {
      const { adjustVolume, showHint } = context;
      adjustVolume(+0.1);

      showHint({
        message: context.$t("hotkeys.onScreenHints.volume", [
          context.volume * 100,
        ]) as string,
      });
    },
  },

  " ": {
    alias: " ",
    trigger({ toggleStation }) {
      toggleStation();
    },
  },

  f: {
    alias: "F",
    trigger(context) {
      const { hasVideo, toggleFullscreen, showHint } = context;

      if (hasVideo) {
        toggleFullscreen();
      } else {
        showHint({
          icon: "exclamation-triangle",
          message: context.$t("hotkeys.onScreenHints.noVideoStream") as string,
        });
      }
    },
  },

  Escape: {
    alias: "Esc",
    trigger({ $route, $router, closeModal }) {
      const wasShown = closeModal();

      if (!wasShown && $route.path !== "/") {
        $router.push("/");
      }
    },
  },

  p: {
    alias: "P",
    trigger(context) {
      if (context.currentStation !== undefined) {
        const { playClosestStation, showHint } = context;
        playClosestStation(false);

        showHint({
          message: context.$t("hotkeys.onScreenHints.playingPrevious", [
            context.currentStation.name,
          ]) as string,
        });
      }
    },
  },

  n: {
    alias: "N",
    trigger(context) {
      if (context.currentStation !== undefined) {
        const { playClosestStation, showHint } = context;
        playClosestStation(true);

        showHint({
          message: context.$t("hotkeys.onScreenHints.playingNext", [
            context.currentStation.name,
          ]) as string,
        });
      }
    },
  },

  number: {
    alias: "0-9",
    trigger({ handleNumberInput }, enteredDigit: number) {
      handleNumberInput(enteredDigit);
    },
  },
};

export default keyBindings;
