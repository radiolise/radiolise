<template>
  <div id="dialogLayer">
    <div style="height: 100%; overflow: hidden" @click="$router.push('/')">
      <div id="drawers" :class="{ shown: $route.path !== '/' }" @click.stop>
        <transition name="slide-fade" mode="out-in">
          <keep-alive exclude="RadEditor,RadImportWizard,RadSettings">
            <router-view :key="$route.fullPath" />
          </keep-alive>
        </transition>
      </div>
    </div>
    <rad-bottom-drawer />
    <transition name="fade">
      <div v-if="hint !== null" id="hint">
        <div>
          {{ hint.message }}
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div
        v-if="modalOptions !== undefined"
        :key="animationTrigger"
        class="modalContainer"
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
                style="position: absolute; right: 26px; top: 26px;"
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
                  <font-awesome-icon :icon="modalIcon" style="opacity: .7" />
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

  @State readonly hint!: Hint | null;

  @Getter readonly modalOptions: ModalOptions | undefined;

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
    const modalOptions = this.modalOptions as ModalOptions;

    if (modalOptions.closeable) {
      const handleButtonClicked = modalOptions.handleButtonClicked as (
        button: number
      ) => void;

      handleButtonClicked(0);
    }
  }
}
</script>

<style lang="less" scoped>
.modalContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: all;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

#hint {
  position: absolute;
  box-sizing: border-box;
  padding: 0 5px;

  > div {
    width: 300px;
    border-radius: 0 10px 0 10px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.25);
}
</style>
