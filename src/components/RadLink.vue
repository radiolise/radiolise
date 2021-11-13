<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { State } from "vuex-class";

import { isViewActive, navigate as setRoute } from "@/common/routing";

@Component
export default class RadLink extends Vue {
  @Prop({ type: Object, required: false }) props?: DialogProps;
  @Prop({ type: String, default: null }) to!: string | null;
  @Prop({ type: Boolean, default: false }) toggle!: boolean;
  @Prop({ type: Boolean, default: false }) replace!: boolean;

  @State readonly currentDialog!: DialogState | null;

  get active() {
    return isViewActive(this.to, this.props?.type);
  }

  navigate() {
    setRoute(this.to, {
      props: this.props,
      toggle: this.toggle,
      replace: this.replace,
    });
  }

  render() {
    return this.$scopedSlots.default?.({
      navigate: this.navigate,
      active: this.active,
    });
  }
}
</script>
