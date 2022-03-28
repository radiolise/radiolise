<template>
  <div id="dialog-layer">
    <RadLink v-slot="{ navigate }" :to="null">
      <div style="height: 100%; overflow: hidden" @click="navigate">
        <div
          id="drawers"
          :class="['overscroll-contain', { shown: currentDialog !== null }]"
          @click.stop
        >
          <transition name="slide-fade" mode="out-in">
            <keep-alive
              :exclude="[
                'RadEditor',
                'RadImportWizard',
                'RadListManager',
                'RadSettings',
                'RadTitleManager',
              ]"
            >
              <component
                :is="currentView"
                v-if="currentDialog"
                :key="viewIndex"
                v-bind="dialogProps"
              />
            </keep-alive>
          </transition>
        </div>
      </div>
    </RadLink>
    <RadBanner />
    <transition name="fade">
      <div v-if="toast !== null" id="toast">
        <div>
          <component :is="toast.icon" v-if="toast.icon" class="w-fixed" />
          {{ toast.message }}
        </div>
      </div>
    </transition>
    <transition name="scale-fade">
      <div
        v-if="modalOptions !== undefined"
        :key="animationTrigger"
        class="modal-container"
        @click="closeModal()"
      >
        <div
          class="modal"
          style="width: 640px; border-radius: 10px 0 10px 0; margin: 10px"
          @click.stop
        >
          <div style="position: relative">
            <div style="padding: 32px 32px 0 32px">
              <div
                v-show="modalOptions.closeable"
                style="position: absolute; right: 26px; top: 26px"
              >
                <a @click="closeModal()"><FasTimes class="w-fixed text-icon-lg" /></a>
              </div>
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 22px">
                {{ modalTitle }}
              </div>
              <div style="display: table">
                <div v-if="modalIcon !== ''" style="display: table-cell; padding-right: 5px">
                  <component :is="modalIcon" class="opacity-70" />
                </div>
                <div style="display: table-cell">
                  <template v-for="(line, index) in modalOptions.message.split('\n')">
                    {{ line }}<br :key="index" />
                  </template>
                </div>
              </div>
            </div>
            <div style="display: flex; flex-direction: row-reverse; padding: 20px">
              <a
                v-for="(button, i) in modalOptions.buttons"
                :key="button"
                class="button"
                @click="modalOptions.handleButtonClicked(i)"
                ><FasBan v-if="isNegativeButton(button)" /><FasCheck
                  v-if="isPositiveButton(button)"
                />
                {{ button }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component as IComponent } from "vue";
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import RadBanner from "./RadBanner.vue";
import RadLink from "./RadLink.vue";

import { ModalOptions, ModalType } from "@/store";

import RadAbout from "@/views/RadAbout.vue";
import RadEditor from "@/views/RadEditor.vue";
import RadHotkeyReference from "@/views/RadHotkeyReference.vue";
import RadImportWizard from "@/views/RadImportWizard.vue";
import RadListManager from "@/views/RadListManager.vue";
import RadMenu from "@/views/RadMenu.vue";
import RadSearch from "@/views/RadSearch.vue";
import RadSettings from "@/views/RadSettings.vue";
import RadTitleManager from "@/views/RadTitleManager.vue";

@Component({
  components: {
    RadBanner,
    RadLink,
    FasTimes,
    FasBan,
    FasCheck,
  },
})
export default class RadDialogLayer extends Vue {
  animationTrigger = false;
  viewIndex = 0;
  currentView: IComponent | null = null;

  static get views(): Record<string, IComponent> {
    return {
      "about": RadAbout,
      "editor": RadEditor,
      "hotkeys": RadHotkeyReference,
      "import-wizard": RadImportWizard,
      "list-manager": RadListManager,
      "menu": RadMenu,
      "search": RadSearch,
      "settings": RadSettings,
      "title-manager": RadTitleManager,
    };
  }

  @State readonly currentDialog!: DialogState | null;
  @State readonly toast!: Toast | null;

  @Getter readonly modalOptions: Required<ModalOptions> | undefined;

  @Action updateDialog!: (dialog: DialogState | null) => void;

  created() {
    window.addEventListener("popstate", this.syncHistoryStack);

    if (window.history.state !== null) {
      this.syncHistoryStack();
    }
  }

  get dialogProps() {
    return this.currentDialog?.props;
  }

  get modalTitle(): string {
    return this.modalOptions?.title || (this.$t("general.note") as string);
  }

  get modalIcon(): any {
    switch (this.modalOptions?.type) {
      case ModalType.ERROR:
        return FasExclamationCircle;
      case ModalType.QUESTION:
        return FasQuestionCircle;
      case ModalType.WARNING:
        return FasExclamationTriangle;
      case ModalType.INFO:
        return FasInfoCircle;
      default:
        return false;
    }
  }

  @Watch("modalOptions.message")
  onModalOptionsChanged(): void {
    this.animationTrigger = !this.animationTrigger;
  }

  @Watch("currentDialog")
  onDialogChanged(dialog: DialogState | null) {
    if (dialog !== null) {
      this.currentView = RadDialogLayer.views[dialog.viewId];
    }
    this.viewIndex++;
  }

  syncHistoryStack() {
    this.updateDialog(window.history.state);
  }

  isPositiveButton(button: string): boolean {
    return [this.$t("general.ok"), this.$t("general.yes")].includes(button);
  }

  isNegativeButton(button: string): boolean {
    return [this.$t("general.cancel"), this.$t("general.no")].includes(button);
  }

  closeModal(): void {
    if (this.modalOptions !== undefined && this.modalOptions.closeable) {
      const handleButtonClicked = this.modalOptions.handleButtonClicked as (button: number) => void;

      handleButtonClicked(0);
    }
  }
}
</script>

<style scoped>
#dialog-layer {
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  transition-property: background, opacity;
  transition-duration: 0.3s;
}
.modal-container {
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: all;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
#toast {
  position: absolute;
  box-sizing: border-box;
  padding: 0 5px;
  margin: 50px auto;
  overflow: hidden;
  pointer-events: none;
  width: 100%;
}
#toast > div {
  width: 300px;
  border-radius: 0 10px 0 10px;
  padding: 20px;
  margin: 0 auto;
  max-width: calc(100% - 40px);
}
#toast .button {
  color: inherit;
  font-weight: normal;
  margin-bottom: -5px;
}
#drawers {
  transform: translateX(-200px);
  max-width: 470px;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  overflow-x: hidden;
  overflow-y: auto;
  transition: all 0.3s;
}
#drawers.shown {
  transform: none;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.overscroll-contain {
  overscroll-behavior: contain;
}
#drawers,
#toast {
  z-index: 2;
}
#drawers > div {
  padding: 20px;
}
#drawers > div,
#toast {
  top: 0;
  text-align: center;
  transition: all 0.3s;
}
#drawers .slide-fade-enter,
#drawers .slide-fade-leave-to {
  transform: translateX(-50px);
}
.fade-enter,
.fade-leave-to,
.scale-fade-enter,
.scale-fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active,
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: opacity 0.3s;
}
.modal {
  transition: transform 0.3s;
}
.scale-fade-enter .modal {
  transform: scale(1.25);
}
.scale-fade-leave-to .modal {
  transform: scale(0.8);
}
</style>
