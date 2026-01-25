import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import type { IUser } from '@/modelTypes/IUser'

export interface Message {
	id: string
	senderId: number
	text: string
	timestamp: number
}

interface ChatState {
	conversations: Record<number, Message[]>
	activeChatUserId: number | null
	isChatOpen: boolean
    isMinimized: boolean
}

const STORAGE_KEY = 'vikunja_chat_messages'

export const useChatStore = defineStore('chat', () => {
    const authStore = useAuthStore()
	
    // State
	const conversations = ref<Record<number, Message[]>>({})
	const activeChatUserId = ref<number | null>(null)
	const isChatOpen = ref(false)
    const isMinimized = ref(false)

    // Getters
	const activeConversation = computed(() => {
		if (!activeChatUserId.value) return []
		return conversations.value[activeChatUserId.value] || []
	})

    const totalUnreadCount = computed(() => {
        // In a real app we'd track read status. 
        // For now, let's just count total messages not from me as a simplified "activity" metric if we wanted.
        return 0
    })

    // Actions
	function loadFromStorage() {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			try {
				conversations.value = JSON.parse(stored)
			} catch (e) {
				console.error('Failed to parse chat messages', e)
			}
		}
	}

	function saveToStorage() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
	}

    function addMessage(userId: number, message: Message) {
        if (!conversations.value[userId]) {
            conversations.value[userId] = []
        }
        conversations.value[userId].push(message)
        saveToStorage()
    }

	function sendMessage(recipientId: number, text: string) {
        if (!authStore.info?.id) return

		const message: Message = {
			id: crypto.randomUUID(),
			senderId: authStore.info.id,
			text,
			timestamp: Date.now(),
		}

        // Add to my conversation view with this recipient
        // We use the recipientId as the key for the conversation with THEM
        addMessage(recipientId, message)
	}

    function receiveMessage(senderId: number, message: Message) {
         // In a local-only simulation, "receiving" is tricky without a backend.
         // But effectively, if we were syncing, we'd put it in the sender's slot.
         addMessage(senderId, message)
    }

	function openChat(userId: number) {
		activeChatUserId.value = userId
		isChatOpen.value = true
        isMinimized.value = false
	}

    function closeChat() {
        isChatOpen.value = false
        activeChatUserId.value = null
    }

    function toggleMinimize() {
        isMinimized.value = !isMinimized.value
    }

    // Sync across tabs
    function syncFromStorage(event: StorageEvent) {
        if (event.key === STORAGE_KEY && event.newValue) {
            try {
                const newData = JSON.parse(event.newValue)
                // Merge or replace? strict replacement is safer for simple sync
                conversations.value = newData
            } catch (e) {
                 console.error('Failed to sync chat messages', e)
            }
        }
    }

    // Initialize
    window.addEventListener('storage', syncFromStorage)
    loadFromStorage()

	return {
		conversations,
		activeChatUserId,
		isChatOpen,
        isMinimized,
		activeConversation,
        totalUnreadCount,
		sendMessage,
        receiveMessage, 
		openChat,
        closeChat,
        toggleMinimize,
        loadFromStorage // exposed mostly for debugging/reset
	}
})
