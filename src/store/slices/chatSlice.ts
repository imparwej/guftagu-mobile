import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatState {
    chats: Chat[];
    messages: Record<string, Message[]>;
    activeChatId: string | null;
}

const dummyChats: Chat[] = [
    {
        id: '1',
        participants: ['1', '2'],
        lastMessageId: 'm1',
        unreadCount: 2,
        type: 'individual',
        name: 'Alice',
        avatar: 'https://i.pravatar.cc/150?u=2',
        isPinned: true,
        isGroup: false,
    },
    {
        id: '2',
        participants: ['1', '3'],
        lastMessageId: 'm2',
        unreadCount: 0,
        type: 'individual',
        name: 'Bob',
        avatar: 'https://i.pravatar.cc/150?u=3',
        isGroup: false,
    },
    {
        id: '3',
        participants: ['1', '4', '5', '6'],
        lastMessageId: 'm3',
        unreadCount: 5,
        type: 'group',
        name: 'Design Team',
        avatar: 'https://i.pravatar.cc/150?u=team1',
        isPinned: true,
        isGroup: true,
        groupMembers: ['1', '4', '5', '6'],
    },
    {
        id: '4',
        participants: ['1', '7'],
        lastMessageId: 'm4',
        unreadCount: 1,
        type: 'individual',
        name: 'David',
        avatar: 'https://i.pravatar.cc/150?u=7',
        isGroup: false,
    },
    {
        id: '5',
        participants: ['1', '8'],
        lastMessageId: 'm5',
        unreadCount: 0,
        type: 'individual',
        name: 'Emma',
        avatar: 'https://i.pravatar.cc/150?u=8',
        isMuted: true,
        isGroup: false,
    },
    {
        id: '6',
        participants: ['1', '9', '10', '11', '12'],
        lastMessageId: 'm6',
        unreadCount: 12,
        type: 'group',
        name: 'Weekend Plans',
        avatar: 'https://i.pravatar.cc/150?u=team2',
        isGroup: true,
        groupMembers: ['1', '9', '10', '11', '12'],
    },
    {
        id: '7',
        participants: ['1', '13'],
        lastMessageId: 'm7',
        unreadCount: 0,
        type: 'individual',
        name: 'Sophia',
        avatar: 'https://i.pravatar.cc/150?u=13',
        isGroup: false,
    },
    {
        id: '8',
        participants: ['1', '14'],
        lastMessageId: 'm8',
        unreadCount: 3,
        type: 'individual',
        name: 'James',
        avatar: 'https://i.pravatar.cc/150?u=14',
        isGroup: false,
    },
];

const dummyMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm0', chatId: '1', senderId: '2', text: 'Hey there!', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
        { id: 'm1', chatId: '1', senderId: '2', text: 'How are you?', timestamp: new Date(Date.now() - 10000).toISOString(), status: 'delivered' },
    ],
    '2': [
        { id: 'm2', chatId: '2', senderId: '1', text: 'See you tomorrow.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'read' },
    ],
    '3': [
        { id: 'm3', chatId: '3', senderId: '5', text: 'Updated the mockups 🎨', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'delivered' },
    ],
    '4': [
        { id: 'm4', chatId: '4', senderId: '7', text: 'Can we reschedule?', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'delivered' },
    ],
    '5': [
        { id: 'm5', chatId: '5', senderId: '1', text: "Sure, let me check.", timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'read' },
    ],
    '6': [
        { id: 'm6', chatId: '6', senderId: '10', text: "Let's go hiking! 🏔️", timestamp: new Date(Date.now() - 900000).toISOString(), status: 'delivered' },
    ],
    '7': [
        { id: 'm7', chatId: '7', senderId: '1', text: 'Thanks for the recommendation.', timestamp: new Date(Date.now() - 259200000).toISOString(), status: 'read' },
    ],
    '8': [
        { id: 'm8', chatId: '8', senderId: '14', text: 'Did you see the news?', timestamp: new Date(Date.now() - 5400000).toISOString(), status: 'delivered' },
    ],
};

const initialState: ChatState = {
    chats: dummyChats,
    messages: dummyMessages,
    activeChatId: null,
};

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        setActiveChat: (state, action: PayloadAction<string | null>) => {
            state.activeChatId = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const { chatId } = action.payload;
            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }
            state.messages[chatId].push(action.payload);
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.lastMessageId = action.payload.id;
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
        deleteChats: (state, action: PayloadAction<string[]>) => {
            state.chats = state.chats.filter(c => !action.payload.includes(c.id));
            action.payload.forEach(id => {
                delete state.messages[id];
            });
        },
        markAsRead: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach(id => {
                const chat = state.chats.find(c => c.id === id);
                if (chat) chat.unreadCount = 0;
            });
        },
        markAllAsRead: (state) => {
            state.chats.forEach(c => { c.unreadCount = 0; });
        },
        clearChat: (state, action: PayloadAction<string>) => {
            state.messages[action.payload] = [];
            const chat = state.chats.find(c => c.id === action.payload);
            if (chat) {
                chat.lastMessageId = undefined;
                chat.unreadCount = 0;
            }
        },
    },
});

export const {
    setChats,
    setActiveChat,
    addMessage,
    setMessages,
    updateMessageStatus,
    togglePin,
    toggleMute,
    deleteChats,
    markAsRead,
    markAllAsRead,
    clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
