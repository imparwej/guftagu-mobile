import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </Provider>
  );
}
