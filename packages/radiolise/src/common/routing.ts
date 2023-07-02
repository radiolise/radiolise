import store from "@/store";

interface NavigationOptions {
  props?: DialogProps;
  replace?: boolean;
  toggle?: boolean;
  force?: boolean;
}

interface RoutePayload extends NavigationOptions {
  viewId: string | null;
}

export function isViewActive(viewId: string | null, type?: string) {
  const currentDialog = store.state.currentDialog as DialogState | null;
  return (
    (currentDialog?.viewId ?? null) === viewId &&
    (type === undefined || currentDialog?.props?.type === type)
  );
}

function updateRoute({ viewId, props, replace }: RoutePayload) {
  const historyState = viewId ? { viewId, props } : null;
  store.dispatch("updateDialog", historyState);

  if (replace) {
    window.history.replaceState(historyState, "");
    return;
  }

  window.history.pushState(historyState, "");
}

export function navigate(viewId: string | null, options?: NavigationOptions) {
  if (options?.force || !isViewActive(viewId, options?.props?.type)) {
    updateRoute({ viewId, ...options });
    return;
  }

  if (options?.toggle) {
    updateRoute({ viewId: null, ...options });
  }
}
