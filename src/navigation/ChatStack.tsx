import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChatListScreen from '../screens/chats/ChatListScreen';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="ChatList" component={ChatListScreen} />
        </Stack.Navigator>
    );
};

export default ChatStack;
