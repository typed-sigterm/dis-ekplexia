<script setup lang="ts">
const {
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
} = useDisEkplexia();

const nextTriggerLabel = computed(() => {
  if (!nextTriggerAt.value)
    return '未计划';

  return new Date(nextTriggerAt.value).toLocaleTimeString();
});

useHead({
  title: '惊跳反应训练',
  meta: [
    {
      name: 'description',
      content: '在随机时间播放训练音频，帮助降低过度惊跳反应并记录日志。',
    },
  ],
});
</script>

<template>
  <main class="training-shell">
    <section class="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-6 md:py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <UCard class="panel-main">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted">
                DisEkplexia
              </p>
              <h1 class="text-2xl font-semibold md:text-3xl">
                惊跳反应脱敏训练
              </h1>
            </div>

            <UBadge
              :color="isRunning ? 'success' : 'neutral'"
              variant="subtle"
              class="px-3 py-1"
            >
              {{ isRunning ? '训练进行中' : '未开始' }}
            </UBadge>
          </div>
        </template>

        <div class="grid gap-6">
          <p class="text-sm text-muted">
            每轮会在你设置的区间中随机选择一个时长，倒计时结束后随机播放一段预设音频，并自动记入日志。
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="最小间隔（秒）" name="minSeconds">
              <UInput
                v-model.number="minSeconds"
                type="number"
                :min="15"
                :max="3600"
                :disabled="isRunning"
              />
            </UFormField>

            <UFormField label="最大间隔（秒）" name="maxSeconds">
              <UInput
                v-model.number="maxSeconds"
                type="number"
                :min="15"
                :max="3600"
                :disabled="isRunning"
              />
            </UFormField>
          </div>

          <div class="status-grid">
            <article class="status-item">
              <p>下一次触发</p>
              <strong>{{ nextTriggerLabel }}</strong>
            </article>

            <article class="status-item">
              <p>剩余时间</p>
              <strong>{{ remainingSeconds ?? 0 }} 秒</strong>
            </article>

            <article class="status-item">
              <p>Wake Lock</p>
              <strong>{{ wakeLockActive ? '已激活' : (wakeLockSupported ? '可用未激活' : '设备不支持') }}</strong>
            </article>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton
              v-if="!isRunning"
              icon="i-lucide-play"
              size="lg"
              @click="start"
            >
              开始训练
            </UButton>

            <UButton
              v-else
              color="neutral"
              variant="outline"
              icon="i-lucide-square"
              size="lg"
              @click="stop"
            >
              停止训练
            </UButton>

            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-bell"
              @click="playTestSound"
            >
              立即测试音频
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="grid gap-6">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              预设音频
            </h2>
          </template>

          <ul class="grid gap-2 text-sm">
            <li
              v-for="preset in audioPresets"
              :key="preset.id"
              class="preset-item"
            >
              <UIcon name="i-lucide-volume-2" class="size-4" />
              <span>{{ preset.label }}</span>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold">
                训练日志
              </h2>

              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-trash-2"
                @click="clearLogs"
              >
                清空
              </UButton>
            </div>
          </template>

          <ul v-if="logs.length" class="grid max-h-105 gap-2 overflow-auto pr-1">
            <li
              v-for="entry in logs"
              :key="entry.id"
              class="log-item"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium">
                  {{ entry.presetLabel }}
                </p>
                <UBadge
                  size="sm"
                  :color="entry.success ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{ entry.success ? '播放成功' : '播放失败' }}
                </UBadge>
              </div>

              <p class="text-xs text-muted">
                触发：{{ new Date(entry.firedAt).toLocaleString() }}
              </p>
              <p class="text-xs text-muted">
                间隔：{{ entry.delaySeconds }} 秒 · 来源：{{ entry.reason === 'timer' ? '随机触发' : '手动测试' }}
              </p>
              <p v-if="entry.error" class="text-xs text-error">
                {{ entry.error }}
              </p>
            </li>
          </ul>

          <UAlert
            v-else
            color="neutral"
            variant="subtle"
            icon="i-lucide-list-checks"
            title="暂无日志"
            description="开始训练或点击“立即测试音频”后会出现记录。"
          />
        </UCard>
      </div>
    </section>
  </main>
</template>
