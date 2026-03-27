<script setup lang="ts">
const {
  minSeconds,
  maxSeconds,
  isRunning,
  logs,
  audioPresets,
  start,
  stop,
  playTestSound,
  clearLogs,
} = useDisEkplexia();

const toast = useToast();
function startTraining() {
  start();
  toast.add({
    icon: 'i-lucide-circle-check',
    color: 'success',
    title: '训练已开始',
    duration: 1500,
  });
}
</script>

<template>
  <UContainer class="mt-6 md:mt-10">
    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
          </div>
        </template>

        <div class="grid gap-6">
          <p class="text-sm text-muted">
            开始训练后，每隔随机的一段时间播放一个预设音频。
          </p>

          <div v-if="!isRunning" class="flex justify-center gap-2">
            <UFormField label="最小间隔（秒）" name="minSeconds">
              <UInputNumber
                v-model="minSeconds"
                class="w-30"
                :min="5"
                :max="maxSeconds"
              />
            </UFormField>

            <UFormField label="最大间隔（秒）" name="maxSeconds">
              <UInputNumber
                v-model="maxSeconds"
                class="w-30"
                :min="minSeconds"
                :max="3600"
              />
            </UFormField>
          </div>

          <UProgress v-if="isRunning" indeterminate />

          <div class="flex justify-center gap-3">
            <UButton
              v-if="!isRunning"
              icon="i-lucide-play"
              size="lg"
              @click="startTraining"
            >
              开始训练
            </UButton>

            <UButton
              v-else
              variant="outline"
              icon="i-lucide-square"
              size="lg"
              @click="stop"
            >
              停止训练
            </UButton>

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-bell"
              @click="playTestSound"
            >
              测试音频
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
              class="flex items-center gap-2 border border-gray-200 rounded-md bg-gray-50 p-3"
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
              v-for="(entry, i) in logs"
              :key="i"
              class="border border-gray-200 rounded-lg bg-gray-50 p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium">
                  {{ entry.presetLabel }}
                </p>
                <UBadge
                  v-if="!entry.success"
                  size="sm"
                  color="error"
                  variant="subtle"
                >
                  播放失败
                </UBadge>
              </div>

              <p class="text-xs text-muted">
                触发：{{ new Date(entry.firedAt).toLocaleString() }}，间隔：{{ entry.delaySeconds }} 秒
              </p>
              <p v-if="entry.error" class="text-xs text-error">
                {{ entry.error }}
              </p>
            </li>
          </ul>

          <UEmpty v-else variant="naked" icon="i-lucide-inbox" title="暂无日志" />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
