<template>
  <div
    class="flex w-full mb-3"
    :class="isMe ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm relative"
      :class="[
        isMe
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600',
      ]"
    >
      <p class="whitespace-pre-wrap break-words">{{ message.text }}</p>
      <span
        class="text-[10px] opacity-70 block text-right mt-1"
        :class="isMe ? 'text-blue-100' : 'text-gray-400'"
      >
        {{ formatTime(message.timestamp) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/stores/chat'

const props = defineProps<{
  message: Message;
  isMe: boolean;
}>();

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
