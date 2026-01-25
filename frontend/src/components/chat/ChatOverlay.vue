<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
    <!-- Chat Window -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="chatStore.isChatOpen && !chatStore.isMinimized"
        class="bg-white dark:bg-gray-800 w-[360px] h-[500px] mb-4 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-gray-200 dark:border-gray-700"
      >
        <!-- Header -->
        <div class="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
          <div class="flex items-center gap-3">
            <button
              v-if="chatStore.activeChatUserId"
              @click="chatStore.activeChatUserId = null"
              class="hover:bg-blue-500 p-1 rounded transition-colors"
            >
              <i class="fas fa-arrow-left"></i>
            </button>
            <h3 class="font-bold text-lg">
              {{ chatTitle }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="chatStore.toggleMinimize"
              class="hover:bg-blue-500 p-1.5 rounded transition-colors"
            >
              <i class="fas fa-minus"></i>
            </button>
            <button
              @click="chatStore.closeChat"
              class="hover:bg-blue-500 p-1.5 rounded transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- User List View -->
        <div
          v-if="!chatStore.activeChatUserId"
          class="flex-1 overflow-y-auto p-2"
        >
			<div v-if="isLoading" class="p-4 text-center text-gray-500">
				Loading users...
			</div>
          <div
            v-else
            v-for="user in users"
            :key="user.id"
            @click="chatStore.openChat(user.id)"
            class="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {{ getInitials(user) }}
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ user.name || user.username }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Conversation View -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <div
            class="flex-1 overflow-y-auto p-4 flex flex-col bg-gray-50 dark:bg-gray-900"
            ref="messagesContainer"
          >
            <div v-if="chatStore.activeConversation.length === 0" class="text-center text-gray-400 mt-10 text-sm">
                No messages yet. Say hello!
            </div>
            <ChatBubble
              v-for="msg in chatStore.activeConversation"
              :key="msg.id"
              :message="msg"
              :is-me="msg.senderId === authStore.info?.id"
            />
          </div>

          <!-- Input Area -->
          <div class="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <form @submit.prevent="handleSend" class="flex gap-2">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-100"
              />
              <button
                type="submit"
                class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!newMessage.trim()"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Floating Action Button -->
    <button
      @click="toggleChat"
      class="pointer-events-auto h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 hover:scale-105 transition-all duration-200"
    >
        <i v-if="!chatStore.isChatOpen || chatStore.isMinimized" class="fas fa-comments"></i>
        <i v-else class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import ChatBubble from './ChatBubble.vue'
import UserService from '@/services/user'
import type { IUser } from '@/modelTypes/IUser'

const chatStore = useChatStore()
const authStore = useAuthStore()

const users = ref<IUser[]>([])
const isLoading = ref(false)
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const toggleChat = () => {
    if (chatStore.isChatOpen && !chatStore.isMinimized) {
        chatStore.closeChat()
    } else {
        chatStore.isChatOpen = true
        chatStore.isMinimized = false
    }
}

const activeUser = computed(() => {
    return users.value.find(u => u.id === chatStore.activeChatUserId)
})

const chatTitle = computed(() => {
    if (activeUser.value) {
        return activeUser.value.name || activeUser.value.username
    }
    return 'Chat'
})

const getInitials = (user: IUser) => {
    const name = user.name || user.username || '?'
    return name.slice(0, 2).toUpperCase()
}

const handleSend = () => {
    if (!newMessage.value.trim() || !chatStore.activeChatUserId) return
    
    chatStore.sendMessage(chatStore.activeChatUserId, newMessage.value)
    newMessage.value = ''
    scrollToBottom()
}

const scrollToBottom = async () => {
    await nextTick()
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// Watch for active conversation changes to scroll to bottom
watch(() => chatStore.activeConversation.length, () => {
   if (chatStore.isChatOpen && !chatStore.isMinimized) {
       scrollToBottom()
   }
})

watch(() => chatStore.activeChatUserId, (newId) => {
    if (newId) {
        scrollToBottom()
    }
})

onMounted(async () => {
    isLoading.value = true
    try {
        const userService = new UserService()
        // Pagination logic might be needed for large lists, but for now fetch first page
        const response = await userService.getAll({ page: 1 })
        
        // Filter out myself
        users.value = response.filter(u => u.id !== authStore.info?.id)
    } catch (e) {
        console.error('Failed to load users', e)
    } finally {
        isLoading.value = false
    }
})
</script>
