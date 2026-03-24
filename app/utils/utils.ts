export interface AudioPreset {
  id: string
  label: string
  src: string
}

export type TriggerReason = 'timer' | 'manual';

export interface TrainingLogEntry {
  id: string
  delaySeconds: number
  scheduledAt: string
  firedAt: string
  presetId: string
  presetLabel: string
  reason: TriggerReason
  success: boolean
  error?: string
}

export const audioPresets: AudioPreset[] = [
  { id: 'soft', label: 'Soft Chime', src: '/audio/chime-soft.wav' },
  { id: 'focus', label: 'Focus Chime', src: '/audio/chime-focus.wav' },
  { id: 'alert', label: 'Alert Chime', src: '/audio/chime-alert.wav' },
];

export const MAX_LOG_COUNT = 300;

export function clampPositiveInt(input: number, fallback: number) {
  if (!Number.isFinite(input))
    return fallback;

  return Math.max(15, Math.floor(input));
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandomPreset() {
  if (!audioPresets.length)
    return undefined;

  return audioPresets[randomInt(0, audioPresets.length - 1)];
}

export function toIsoDate(timestamp: number) {
  return new Date(timestamp).toISOString();
}
