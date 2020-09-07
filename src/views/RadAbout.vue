<template>
  <rad-drawer>
    <br />
    <div
      class="logo"
      @mouseenter="versionShown = true"
      @mouseleave="versionShown = false"
      @touchstart="versionShown = !versionShown"
    >
      <div>
        <img src="@/assets/img/logo.svg" alt="Logo" /><span>{{
          appTitle
        }}</span>
      </div>
      <div
        v-show-slide="versionShown"
        class="version"
        :class="{ visible: versionShown }"
      >
        <span><font-awesome-icon icon="code-branch" /> {{ version }}</span>
      </div>
    </div>
    <br />
    <div>
      <p>{{ copyright }}</p>
      <i18n class="text-left" path="about.licenseInfo" tag="p">
        {{ appTitle }}
        <a
          href="https://www.gnu.org/philosophy/free-sw.html"
          target="_blank"
          rel="noopener"
          >{{ $t("about.freeSoftware")
          }}<font-awesome-icon icon="external-link-alt" fixed-width
        /></a>
      </i18n>
      <p class="text-left">
        {{ $t("about.noWarranty", [appTitle]) }}
      </p>
      <i18n class="text-left" path="about.licenseCopy" tag="p">
        {{ appTitle
        }}<a href="http://www.gnu.org/licenses/" target="_blank" rel="noopener"
          >http://www.gnu.org/licenses/<font-awesome-icon
            icon="external-link-alt"
            fixed-width
        /></a>
      </i18n>
    </div>
    <p class="text-center">
      <a class="button" :href="repoUrl" target="_blank" rel="noopener"
        ><font-awesome-icon :icon="['fab', 'gitlab']" fixed-width/>{{
          $t("about.code")
        }}
        <font-awesome-icon icon="external-link-alt" fixed-width
      /></a>
      <a class="button" :href="issuesUrl" target="_blank" rel="noopener"
        ><font-awesome-icon icon="comments" fixed-width/>{{
          $t("about.issues")
        }}
        <font-awesome-icon icon="external-link-alt" fixed-width
      /></a>
    </p>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RadDrawer from "@/components/RadDrawer.vue";

@Component({
  components: {
    RadDrawer,
  },
})
export default class RadAbout extends Vue {
  appTitle = process.env.VUE_APP_TITLE;
  version = process.env.VUE_APP_VERSION;
  copyright = process.env.VUE_APP_COPYRIGHT;
  repoUrl = process.env.VUE_APP_REPO;
  issuesUrl = process.env.VUE_APP_ISSUES;
  versionShown = false;
}
</script>

<style scoped>
.logo > :first-child {
  margin-bottom: 10px;
}
.logo img {
  height: 50px;
  margin-right: 5px;
  vertical-align: middle;
}
.logo img + span {
  margin-left: 5px;
  font-size: 30px;
  vertical-align: middle;
}
.version > :only-child {
  opacity: 0;
  transition: opacity 0.3s;
}
.version.visible > :only-child {
  opacity: 0.5;
}
</style>
