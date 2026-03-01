import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Story } from '../../types';

interface StatusState {
    stories: Story[];
    privacy: 'contacts' | 'contacts_except' | 'only_share';
    privacyExceptions: string[]; // User IDs
}

const dummyStories: Story[] = [
    {
        id: 's1',
        userId: '2', // Alice
        mediaUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isViewed: false,
        viewers: []
    },
    {
        id: 's2',
        userId: '2', // Alice
        mediaUri: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isViewed: false,
        viewers: []
    },
    {
        id: 's3',
        userId: '3', // Bob
        mediaUri: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isViewed: true,
        viewers: []
    },
    {
        id: 's4', // My story
        userId: '1',
        mediaUri: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isViewed: true,
        viewers: [
            { userId: '2', timestamp: new Date(Date.now() - 300000).toISOString() },
            { userId: '3', timestamp: new Date(Date.now() - 100000).toISOString() },
        ]
    }
];

const initialState: StatusState = {
    stories: dummyStories,
    privacy: 'contacts',
    privacyExceptions: [],
};

const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        setStories: (state, action: PayloadAction<Story[]>) => {
            state.stories = action.payload;
        },
        markStoryViewed: (state, action: PayloadAction<string>) => {
            const story = state.stories.find(s => s.id === action.payload);
            if (story) {
                story.isViewed = true;
            }
        },
        addStory: (state, action: PayloadAction<Story>) => {
            state.stories.unshift(action.payload);
        },
        setPrivacy: (state, action: PayloadAction<StatusState['privacy']>) => {
            state.privacy = action.payload;
        },
        setPrivacyExceptions: (state, action: PayloadAction<string[]>) => {
            state.privacyExceptions = action.payload;
        },
        addViewer: (state, action: PayloadAction<{ storyId: string, userId: string }>) => {
            const story = state.stories.find(s => s.id === action.payload.storyId);
            if (story) {
                if (!story.viewers) story.viewers = [];
                const alreadyViewed = story.viewers.some(v => v.userId === action.payload.userId);
                if (!alreadyViewed) {
                    story.viewers.push({
                        userId: action.payload.userId,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        },
    },
});

export const {
    setStories,
    markStoryViewed,
    addStory,
    setPrivacy,
    setPrivacyExceptions,
    addViewer
} = statusSlice.actions;
export default statusSlice.reducer;
