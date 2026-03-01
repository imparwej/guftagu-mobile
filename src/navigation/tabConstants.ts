import { Platform } from 'react-native';

/** Height of the bottom tab bar — use for content padding calculations. */
export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72;

export const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 28 : 8;
