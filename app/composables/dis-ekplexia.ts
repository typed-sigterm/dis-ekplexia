import {
  createGlobalState,
  useDocumentVisibility,
  useStorage,
  useWakeLock,
} from '@vueuse/core';

export const useDisEkplexia = createGlobalState(() => {
  const toast = useToast();

  const minSeconds = useStorage<number>('dis-ekplexia:minSeconds', 60);
  const maxSeconds = useStorage<number>('dis-ekplexia:maxSeconds', 120);
  const logs = useStorage<TrainingLogEntry[]>('dis-ekplexia:logs', []);

  const isRunning = ref(false);
  const nextTriggerAt = ref<number | null>(null);
  const activeDelaySeconds = ref<number | null>(null);
  const activeScheduledAt = ref<number | null>(null);

  const now = ref(Date.now());
  const visibility = useDocumentVisibility();
  const timerId = ref<ReturnType<typeof setInterval> | null>(null);
  const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null);

  const {
    isSupported: wakeLockSupported,
    isActive: wakeLockActive,
    request: requestWakeLock,
    release: releaseWakeLock,
  } = useWakeLock();

  const remainingSeconds = computed(() => {
    if (!nextTriggerAt.value)
      return null;

    const left = Math.ceil((nextTriggerAt.value - now.value) / 1000);
    return Math.max(0, left);
  });

  function normalizeRange() {
    const min = clampPositiveInt(minSeconds.value, 60);
    const max = clampPositiveInt(maxSeconds.value, 120);

    minSeconds.value = Math.min(min, max);
    maxSeconds.value = Math.max(min, max);

    return {
      min: minSeconds.value,
      max: maxSeconds.value,
    };
  }

  function appendLog(entry: TrainingLogEntry) {
    logs.value = [entry, ...logs.value].slice(0, MAX_LOG_COUNT);
  }

  function ensureTimerTicking() {
    if (timerId.value)
      return;

    timerId.value = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function clearTimerTicking() {
    if (!timerId.value)
      return;

    clearInterval(timerId.value);
    timerId.value = null;
  }

  function clearPendingTimeout() {
    if (!timeoutId.value)
      return;

    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }

  function updateMediaSessionState(state: MediaSessionPlaybackState) {
    if (!('mediaSession' in navigator))
      return;

    navigator.mediaSession.playbackState = state;
  }

  function setMediaMetadata(preset: AudioPreset) {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined')
      return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'DisEkplexia Trigger',
      artist: preset.label,
      album: 'DisEkplexia',
    });
  }

  function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator))
      return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isRunning.value)
          void start();
      });
      navigator.mediaSession.setActionHandler('pause', stop);
      navigator.mediaSession.setActionHandler('stop', stop);
    } catch {
      // Some browsers expose mediaSession but reject certain handlers.
    }
  }

  async function playPreset(preset: AudioPreset) {
    setMediaMetadata(preset);

    const audio = new Audio(preset.src);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    updateMediaSessionState('playing');

    await audio.play();

    audio.addEventListener('ended', () => {
      updateMediaSessionState(isRunning.value ? 'playing' : 'paused');
    }, { once: true });
  }

  async function triggerSound(reason: TriggerReason) {
    const preset = pickRandomPreset();
    const nowAt = Date.now();

    if (!preset) {
      appendLog({
        id: crypto.randomUUID(),
        delaySeconds: activeDelaySeconds.value ?? 0,
        scheduledAt: toIsoDate(activeScheduledAt.value ?? nowAt),
        firedAt: toIsoDate(nowAt),
        presetId: 'none',
        presetLabel: 'No preset available',
        reason,
        success: false,
        error: '没有可用的预设音频。',
      });

      return;
    }

    const delaySeconds = activeDelaySeconds.value ?? 0;
    const scheduledAt = activeScheduledAt.value ?? nowAt;

    try {
      await playPreset(preset);

      appendLog({
        id: crypto.randomUUID(),
        delaySeconds,
        scheduledAt: toIsoDate(scheduledAt),
        firedAt: toIsoDate(nowAt),
        presetId: preset.id,
        presetLabel: preset.label,
        reason,
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '音频播放失败，可能被系统限制。';

      appendLog({
        id: crypto.randomUUID(),
        delaySeconds,
        scheduledAt: toIsoDate(scheduledAt),
        firedAt: toIsoDate(nowAt),
        presetId: preset.id,
        presetLabel: preset.label,
        reason,
        success: false,
        error: message,
      });

      toast.add({
        title: '播放失败',
        description: message,
        color: 'error',
        icon: 'i-lucide-circle-alert',
      });
    }
  }

  function scheduleNextTrigger() {
    clearPendingTimeout();

    const { min, max } = normalizeRange();
    const delaySeconds = randomInt(min, max);

    activeDelaySeconds.value = delaySeconds;
    activeScheduledAt.value = Date.now();
    nextTriggerAt.value = activeScheduledAt.value + delaySeconds * 1000;

    timeoutId.value = setTimeout(async () => {
      await triggerSound('timer');

      if (!isRunning.value)
        return;

      scheduleNextTrigger();
    }, delaySeconds * 1000);
  }

  async function start() {
    if (isRunning.value)
      return;

    normalizeRange();

    isRunning.value = true;
    ensureTimerTicking();
    setupMediaSessionHandlers();
    updateMediaSessionState('playing');

    if (wakeLockSupported.value) {
      try {
        await requestWakeLock('screen');
      } catch {
        toast.add({
          title: 'Wake Lock 未启用',
          description: '设备或浏览器策略阻止了屏幕常亮，训练仍会继续。',
          color: 'warning',
          icon: 'i-lucide-triangle-alert',
        });
      }
    }

    if (visibility.value !== 'visible') {
      toast.add({
        title: '后台模式提醒',
        description: '部分设备会在锁屏后限制定时器精度，Media Session 已启用。',
        color: 'info',
        icon: 'i-lucide-info',
      });
    }

    scheduleNextTrigger();
  }

  function stop() {
    isRunning.value = false;
    nextTriggerAt.value = null;
    activeDelaySeconds.value = null;
    activeScheduledAt.value = null;

    clearPendingTimeout();
    clearTimerTicking();

    updateMediaSessionState('paused');

    if (wakeLockActive.value)
      void releaseWakeLock();
  }

  async function playTestSound() {
    activeDelaySeconds.value = 0;
    activeScheduledAt.value = Date.now();
    await triggerSound('manual');
  }

  function clearLogs() {
    logs.value = [];
  }

  return {
    minSeconds,
    maxSeconds,
    remainingSeconds,
    nextTriggerAt,
    isRunning,
    wakeLockSupported,
    wakeLockActive,
    logs,
    audioPresets,
    start,
    stop,
    playTestSound,
    clearLogs,
  };
});
