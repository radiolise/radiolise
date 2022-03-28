<template>
  <RadDrawer>
    <h3>
      <FaIcon icon="keyboard" fixed-width />
      {{ $t("hotkeys.title") }}
    </h3>
    <div class="content">
      <div v-for="key in bindingAliases" :key="key" class="hotkey-item">
        <div>
          <div class="hotkey-tile">
            <span>{{ key }}</span>
          </div>
          <span v-if="key === ' '" :class="{ 'space-bar-label': key === ' ' }">{{
            $t("hotkeys.space")
          }}</span>
        </div>
        <div>
          <div class="name">
            {{ $t(`hotkeys.bindings["${key}"].name`) }}
          </div>
          <div class="description">
            {{ $t(`hotkeys.bindings["${key}"].description`) }}
          </div>
        </div>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import RadDrawer from "@/components/RadDrawer.vue";
import keyBindings from "@/common/hotkeys";

@Component({
  components: {
    RadDrawer,
  },
})
export default class RadHotkeyReference extends Vue {
  get bindingAliases(): string[] {
    return Object.values(keyBindings).map((keybinding) => keybinding.alias);
  }
}
</script>

<style scoped>
.content {
  display: table;
  text-align: left;
}
.hotkey-item {
  display: table-row;
  margin: 10px 0;
}
.hotkey-item > :first-child {
  font-size: 20px;
  white-space: nowrap;
  text-align: center;
  vertical-align: top;
  padding: 8px 10px;
}
.hotkey-tile {
  margin: 5px 0 0 auto;
  border-radius: 5px;
  display: table;
  width: 40px;
  height: 35px;
}
.hotkey-tile span {
  display: table-cell;
  vertical-align: middle;
}
.space-bar-label {
  font-size: 12px;
}
.hotkey-item > div {
  display: table-cell;
  padding: 10px 10px 10px 0;
}
.name {
  font-size: 20px;
  margin-bottom: 5px;
}
</style>
