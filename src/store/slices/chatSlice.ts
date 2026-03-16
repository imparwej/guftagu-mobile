import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatState {
    chats: Chat[];
    messages: Record<string, Message[]>;
    activeChatId: string | null;
}

const initialState: ChatState = {
    chats: [],
    messages: {},
    activeChatId: null,
};

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<any[]>) => {
            state.chats = action.payload.map(item => ({
                id: item.conversationId,
                lastMessage: item.lastMessage,
                lastMessageTime: item.lastMessageTime,
                unreadCount: item.unreadCount,
                isPinned: item.pinned ?? item.isPinned ?? false,
                otherUser: {
                    id: item.otherUserId,
                    name: item.otherUserName,
                    avatar: item.otherUserAvatar,
                    status: item.isOnline ? 'online' : item.lastSeen,
                    lastSeen: item.lastSeen,
                },
                name: item.otherUserName,
                avatar: item.otherUserAvatar,
            } as Chat));
        },
        setActiveChat: (state, action: PayloadAction<string | null>) => {
            state.activeChatId = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const message = action.payload;
            const conversationId = message.conversationId || (message as any).chatId || (message as any).roomId;
            
            if (!conversationId) {
                console.warn("[chatSlice] Received message without conversation identifier:", message);
                return;
            }

            // Normalize internal state mapping
            if (!message.conversationId) message.conversationId = conversationId;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            
            const exists = state.messages[conversationId].find(m => m.id === message.id);
            if (!exists) {
                state.messages[conversationId].push(message);
            }

            // Update chat list summary
            const chatIndex = state.chats.findIndex(c => c.id === conversationId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                chat.lastMessage = action.payload.content;
                chat.lastMessageTime = String(action.payload.timestamp);

                // If not active chat and not from me, increment unread
                if (state.activeChatId !== conversationId) {
                    chat.unreadCount = (chat.unreadCount || 0) + 1;
                }

                // Move to top
                state.chats.splice(chatIndex, 1);
                state.chats.unshift(chat);
            } else {
                // New conversation — create a placeholder chat entry
                state.chats.unshift({
                    id: conversationId,
                    lastMessage: action.payload.content,
                    lastMessageTime: String(action.payload.timestamp),
                    unreadCount: state.activeChatId === conversationId ? 0 : 1,
                } as Chat);
            }
        },
        setMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
            state.messages[action.payload.chatId] = action.payload.messages;
        },
        updateMessageStatus: (state, action: PayloadAction<{ chatId: string; messageId: string; status: Message['status'] }>) => {
            const chatMessages = state.messages[action.payload.chatId];
            if (chatMessages) {
                const msg = chatMessages.find(m => m.id === action.payload.messageId);
                if (msg) {
                    msg.status = action.payload.status;
                }
            }
        },
        deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string; forEveryone?: boolean }>) => {
            const chatMessages = state.messages[action.payload.chatId];
            if (chatMessages) {
                if (action.payload.forEveryone) {
                    state.messages[action.payload.chatId] = chatMessages.map(msg =>
                        msg.id === action.payload.messageId
                            ? {
                                ...msg,
                                content: "This message was deleted",
                                deletedForEveryone: true,
                                mediaUrl: undefined,
                                type: 'TEXT'
                            }
                            : msg
                    );
                } else {
                    state.messages[action.payload.chatId] = chatMessages.filter(m => m.id !== action.payload.messageId);
                }
            }
        },
        starMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
            const chatMessages = state.messages[action.payload.chatId];
            if (chatMessages) {
                const msg = chatMessages.find(m => m.id === action.payload.messageId);
                if (msg) {
                    msg.isStarred = !msg.isStarred;
                }
            }
        },
        togglePin: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach(id => {
                const chat = state.chats.find(c => c.id === id);
                if (chat) chat.isPinned = !chat.isPinned;
            });
        },
        toggleMute: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach(id => {
                const chat = state.chats.find(c => c.id === id);
                if (chat) chat.isMuted = !chat.isMuted;
            });
        },
        blockChat: (state, action: PayloadAction<string>) => {
            const chat = state.chats.find(c => c.id === action.payload);
            if (chat) chat.isBlocked = true;
        },
        unblockChat: (state, action: PayloadAction<string>) => {
            const chat = state.chats.find(c => c.id === action.payload);
            if (chat) chat.isBlocked = false;
        },
        setWallpaper: (state, action: PayloadAction<{ chatId: string; wallpaper: string | undefined }>) => {
            const chat = state.chats.find(c => c.id === action.payload.chatId);
            if (chat) chat.wallpaper = action.payload.wallpaper;
        },
        updateChatName: (state, action: PayloadAction<{ chatId: string; name: string }>) => {
            const chat = state.chats.find(c => c.id === action.payload.chatId);
            if (chat) chat.name = action.payload.name;
        },
        exitGroup: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter(c => c.id !== action.payload);
            delete state.messages[action.payload];
            if (state.activeChatId === action.payload) {
                state.activeChatId = null;
            }
        },
        deleteChats: (state, action: PayloadAction<string[]>) => {
            state.chats = state.chats.filter(c => !action.payload.includes(c.id));
            action.payload.forEach(id => {
                delete state.messages[id];
            });
        },
        markAsReadInStore: (state, action: PayloadAction<{ chatId: string; userId: string }>) => {
            const { chatId } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.unreadCount = 0;
            }
            const chatMessages = state.messages[chatId];
            if (chatMessages) {
                chatMessages.forEach(m => {
                    if (m.receiverId === action.payload.userId) m.status = 'READ';
                });
            }
        },
        markAllAsRead: (state) => {
            state.chats.forEach(c => {
                c.unreadCount = 0;
            });
        },
        clearChat: (state, action: PayloadAction<string>) => {
            state.messages[action.payload] = [];
            const chat = state.chats.find(c => c.id === action.payload);
            if (chat) {
                chat.lastMessage = undefined;
                chat.unreadCount = 0;
            }
        },
        addChat: (state, action: PayloadAction<Chat>) => {
            const chat = action.payload;
            const chatId = chat.id || (chat as any).conversationId || (chat as any).chatId;
            if (chatId && !state.chats.find(c => c.id === chatId)) {
                if (!chat.id) chat.id = chatId;
                state.chats.unshift(chat);
            }
        },
        toggleReaction: (state, action: PayloadAction<{ chatId: string; messageId: string; userId: string; emoji: string }>) => {
            const { chatId, messageId, userId, emoji } = action.payload;
            const messages = state.messages[chatId];
            if (!messages) return;

            const message = messages.find(m => m.id === messageId);
            if (!message) return;

            if (!message.reactions) {
                message.reactions = {};
            }

            // userId -> emoji map: toggle same emoji, or set new one
            if (message.reactions[userId] === emoji) {
                delete message.reactions[userId];
            } else {
                message.reactions[userId] = emoji;
            }
        },
        // Update a message in-place (used for edits, reactions from WebSocket)
        updateMessage: (state, action: PayloadAction<Message>) => {
            const updatedMsg = action.payload;
            const chatMessages = state.messages[updatedMsg.conversationId];
            if (chatMessages) {
                const idx = chatMessages.findIndex(m => m.id === updatedMsg.id);
                if (idx !== -1) {
                    chatMessages[idx] = updatedMsg;
                }
            }
        },
        updatePresence: (state, action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen: string | null }>) => {
            const { userId, isOnline, lastSeen } = action.payload;
            state.chats.forEach(chat => {
                if (chat.otherUser && chat.otherUser.id === userId) {
                    chat.otherUser.status = isOnline ? 'online' : lastSeen || undefined;
                    chat.otherUser.lastSeen = lastSeen || undefined;
                }
            });
        },
    },
});

export const {
    setChats,
    setActiveChat,
    addMessage,
    setMessages,
    updateMessageStatus,
    deleteMessage,
    starMessage,
    togglePin,
    toggleMute,
    blockChat,
    unblockChat,
    setWallpaper,
    updateChatName,
    exitGroup,
    deleteChats,
    markAsReadInStore,
    markAllAsRead,
    clearChat,
    addChat,
    toggleReaction,
    updateMessage,
    updatePresence,
} = chatSlice.actions;

export default chatSlice.reducer;
