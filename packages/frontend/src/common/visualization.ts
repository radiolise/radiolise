import type AudioMotionAnalyzer from "audiomotion-analyzer";

let eventualAnalyzer: Promise<AudioMotionAnalyzer> | undefined;

async function createAnalyzer(mediaElement: HTMLMediaElement) {
  const { default: AudioMotionAnalyzer } = await import("audiomotion-analyzer");
  return new AudioMotionAnalyzer(undefined, {
    mode: 8,
    useCanvas: false,
    source: mediaElement,
    start: false,
  });
}

export function useAnalyzer(provide: (analyzer: AudioMotionAnalyzer) => void) {
  if (!eventualAnalyzer) {
    eventualAnalyzer = createAnalyzer(document.querySelector<HTMLMediaElement>("#media")!);
  }
  eventualAnalyzer.then(provide);
}

export function* generateBarValues(analyzer: AudioMotionAnalyzer) {
  for (const barData of analyzer.getBars()) {
    yield barData.value[0] * 100;
  }
}
