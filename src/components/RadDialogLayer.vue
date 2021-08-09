<template>
  <div id="dialog-layer">
    <div style="height: 100%; overflow: hidden" @click="$router.push('/')">
      <div id="drawers" :class="{ shown: $route.path !== '/' }" @click.stop>
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
            <router-view :key="$route.fullPath" />
          </keep-alive>
        </transition>
      </div>
    </div>
    <rad-bottom-drawer />
    <transition name="fade">
      <div v-if="toast !== null" id="toast">
        <div>
          <font-awesome-icon
            v-if="toast.icon !== undefined"
            :icon="toast.icon"
            fixed-width
          />
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
                <a @click="closeModal()"
                  ><font-awesome-icon icon="times" fixed-width size="lg"
                /></a>
              </div>
              <div
                style="font-size: 20px; font-weight: bold; margin-bottom: 22px"
              >
                {{ modalTitle }}
              </div>
              <div style="display: table">
                <div
                  v-if="modalIcon !== ''"
                  style="display: table-cell; padding-right: 5px"
                >
                  <font-awesome-icon :icon="modalIcon" style="opacity: 0.7" />
                </div>
                <div style="display: table-cell">
                  <template
                    v-for="(line, index) in modalOptions.message.split('\n')"
                  >
                    {{ line }}<br :key="index" />
                  </template>
                </div>
              </div>
            </div>
            <div
              style="display: flex; flex-direction: row-reverse; padding: 20px"
            >
              <a
                v-for="(button, i) in modalOptions.buttons"
                :key="button"
                class="button"
                @click="modalOptions.handleButtonClicked(i)"
                ><font-awesome-icon
                  v-if="isNegativeButton(button)"
                  icon="ban"
                /><font-awesome-icon
                  v-if="isPositiveButton(button)"
                  icon="check"
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
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter } from "vuex-class";

import RadBottomDrawer from "./RadBottomDrawer.vue";

import { ModalOptions, ModalType } from "@/store";

@Component({
  components: {
    RadBottomDrawer,
  },
})
export default class RadDialogLayer extends Vue {
  animationTrigger = false;

  @State readonly toast!: Toast | null;

  @Getter readonly modalOptions: Required<ModalOptions> | undefined;

  get modalTitle(): string {
    return this.modalOptions?.title || (this.$t("general.note") as string);
  }

  get modalIcon(): string {
    switch (this.modalOptions?.type) {
      case ModalType.ERROR:
        return "exclamation-circle";
      case ModalType.QUESTION:
        return "question-circle";
      case ModalType.WARNING:
        return "exclamation-triangle";
      case ModalType.INFO:
        return "info-circle";
      default:
        return "";
    }
  }

  @Watch("modalOptions.message")
  onModalOptionsChanged(): void {
    this.animationTrigger = !this.animationTrigger;
  }

  isPositiveButton(button: string): boolean {
    return [this.$t("general.ok"), this.$t("general.yes")].includes(button);
  }

  isNegativeButton(button: string): boolean {
    return [this.$t("general.cancel"), this.$t("general.no")].includes(button);
  }

  closeModal(): void {
    if (this.modalOptions !== undefined && this.modalOptions.closeable) {
      const handleButtonClicked = this.modalOptions.handleButtonClicked as (
        button: number
      ) => void;

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
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition-property: opacity, transform;
}
.scale-fade-enter,
.scale-fade-leave-to {
  transform: scale(1.25);
}
</style>
