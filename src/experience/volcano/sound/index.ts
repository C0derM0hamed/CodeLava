export {
  createVolcanoSoundController,
  getVolcanoSoundController,
  HERO_SOUND_STORAGE_KEY,
  volcanoSound,
} from "./controller";
export { useVolcanoSound } from "./useVolcanoSound";
export { VolcanoSoundToggle, type VolcanoSoundToggleProps } from "./VolcanoSoundToggle";
export { DEFAULT_THRESHOLDS, VolcanoSoundTimeline } from "./timeline";
export type {
  SoundStemId,
  UseVolcanoSoundOptions,
  UseVolcanoSoundReturn,
  VolcanoSoundController,
  VolcanoSoundLabels,
  VolcanoSoundState,
  VolcanoSoundThresholds,
} from "./types";
