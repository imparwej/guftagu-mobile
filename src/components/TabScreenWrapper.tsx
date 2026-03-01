import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../navigation/tabConstants';

interface TabScreenWrapperProps {
    children: React.ReactNode;
    /** Extra bottom spacing beyond the tab bar (default: 0) */
    extraBottom?: number;
}

/**
 * Wrapper for screens rendered inside the tab navigator.
 * Provides proper bottom padding so content never goes behind the
 * absolute-positioned tab bar. Uses SafeArea top inset.
 */
const TabScreenWrapper: React.FC<TabScreenWrapperProps> = ({
    children,
    extraBottom = 0,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: Platform.OS === 'ios' ? insets.top : 0,
                    paddingBottom: TAB_BAR_HEIGHT + extraBottom,
                },
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});

export default React.memo(TabScreenWrapper);
