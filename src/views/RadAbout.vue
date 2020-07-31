<template>
  <rad-drawer id="about">
    <br />
    <div>
      <div>
        <img src="img/logo.svg" /><span>{{ appName }}</span>
      </div>
    </div>
    <br />
    <div id="infotext">
      <p>&copy; 2017-2020 Marco Bauer</p>
      <i18n class="text-left" path="about.licenseInfo" tag="p">
        {{ appName }}
        <a
          class="btn-link white"
          href="https://www.gnu.org/philosophy/free-sw.html"
          target="_blank"
          rel="noopener"
          >{{ $t("about.freeSoftware")
          }}<font-awesome-icon icon="external-link-alt" fixed-width
        /></a>
      </i18n>
      <p class="text-left">
        {{ $t("about.noWarranty", [appName]) }}
      </p>
      <i18n class="text-left" path="about.licenseCopy" tag="p">
        {{ appName
        }}<a href="http://www.gnu.org/licenses/" target="_blank" rel="noopener"
          >http://www.gnu.org/licenses/<font-awesome-icon
            icon="external-link-alt"
            fixed-width
        /></a>
      </i18n>
    </div>
    <p class="text-center">
      <a
        class="button"
        href="https://gitlab.com/radiolise/radiolise.gitlab.io/tree/master"
        target="_blank"
        rel="noopener"
        ><font-awesome-icon :icon="['fab', 'gitlab']" fixed-width/>{{
          $t("about.code")
        }}
        <font-awesome-icon icon="external-link-alt" fixed-width
      /></a>
      <a
        class="button"
        href="https://gitlab.com/radiolise/radiolise.gitlab.io/issues"
        target="_blank"
        rel="noopener"
        ><font-awesome-icon icon="comments" fixed-width/>{{
          $t("about.issues")
        }}
        <font-awesome-icon icon="external-link-alt" fixed-width
      /></a>
    </p>
    <a href="js/LICENSES.html" rel="jslicense" />
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

import RadDrawer from "@/components/RadDrawer.vue";

@Component({
  components: {
    RadDrawer,
  },
})
export default class RadAbout extends Vue {
  @Getter readonly appName!: string;
}
</script>
