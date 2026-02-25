import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import RootNavigator from '../src/navigation/RootNavigator';
import { store } from '../src/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </Provider>
  );
}
