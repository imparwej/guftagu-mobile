import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Story } from '../../types';

interface StatusState {
    stories: Story[];
}

const dummyStories: Story[] = [
    {
        id: 's1',
        userId: '2', // Alice
        mediaUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isViewed: false,
    },
    {
        id: 's2',
        userId: '2', // Alice
        mediaUri: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isViewed: false,
    },
    {
        id: 's3',
        userId: '3', // Bob
        mediaUri: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=800',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isViewed: true,
    }
];

const initialState: StatusState = {
    stories: dummyStories,
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
    },
});

export const { setStories, markStoryViewed, addStory } = statusSlice.actions;
export default statusSlice.reducer;
