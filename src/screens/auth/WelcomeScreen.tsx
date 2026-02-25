/**
 * WelcomeScreen.tsx — Premium Guftagu Onboarding (2026 Brand Experience)
 *
 * Pitch-black canvas with the official Guftagu SVG logo,
 * heavy tracked typography, ambient aura breathing,
 * and a tactile spring-animated CTA.
 */
import React, { useEffect } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from '../../components/PressableScale';

// SVG brand logo — imported as a React component via react-native-svg-transformer
import GuftaguLogo from '../../../assets/images/favicon.svg';

const { width, height } = Dimensions.get('window');

// ─── Ambient Aura ─────────────────────────────────────────────────────────────
// Imperceptible, slowly breathing luminance fields behind the primary content.
const AmbientAura = () => {
    const pulse = useSharedValue(0.35);

    useEffect(() => {
        pulse.value = withDelay(
            1200,
            withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.35, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                ),
                -1,
                true,
            ),
        );
    }, []);

    const auraStyle = useAnimatedStyle(() => ({
        opacity: pulse.value,
        transform: [{ scale: 1 + (pulse.value - 0.35) * 0.12 }],
    }));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.auraTopRight} />
            <Animated.View style={[styles.auraCentre, auraStyle]} />
            <View style={styles.auraBottomLeft} />
        </View>
    );
};

// ─── Welcome Screen ───────────────────────────────────────────────────────────
const WelcomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    // ── Staggered entrance shared values
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.75);
    const floatY = useSharedValue(0);

    const titleOp = useSharedValue(0);
    const titleY = useSharedValue(28);

    const dividerOp = useSharedValue(0);
    const dividerW = useSharedValue(0);

    const subOp = useSharedValue(0);
    const subY = useSharedValue(18);

    const ctaOp = useSharedValue(0);
    const ctaY = useSharedValue(44);

    useEffect(() => {
        const spring = { damping: 14, stiffness: 85, mass: 1 };

        // 1 — Logo reveals
        logoOp.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
        logoScale.value = withSpring(1, spring);

        // Perpetual gentle float
        floatY.value = withDelay(
            900,
            withRepeat(
                withSequence(
                    withTiming(-7, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                true,
            ),
        );

        // 2 — Title
        titleOp.value = withDelay(280, withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
        titleY.value = withDelay(280, withSpring(0, spring));

        // 3 — Divider expands
        dividerOp.value = withDelay(420, withTiming(1, { duration: 550 }));
        dividerW.value = withDelay(420, withSpring(36, spring));

        // 4 — Subtitle
        subOp.value = withDelay(520, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        subY.value = withDelay(520, withSpring(0, spring));

        // 5 — CTA footer
        ctaOp.value = withDelay(680, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
        ctaY.value = withDelay(680, withSpring(0, spring));
    }, []);

    // ── Animated styles
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }, { translateY: floatY.value }],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
        transform: [{ translateY: titleY.value }],
    }));

    const dividerStyle = useAnimatedStyle(() => ({
        opacity: dividerOp.value,
        width: dividerW.value,
    }));

    const subStyle = useAnimatedStyle(() => ({
        opacity: subOp.value,
        transform: [{ translateY: subY.value }],
    }));

    const footerStyle = useAnimatedStyle(() => ({
        opacity: ctaOp.value,
        transform: [{ translateY: ctaY.value }],
    }));

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ── Background ambience ──────────────────────────────────────── */}
            <AmbientAura />

            {/* ── Centre stage ─────────────────────────────────────────────── */}
            <View style={styles.stage}>
                {/* Official Guftagu SVG Logo */}
                <Animated.View style={[styles.logoWrap, logoStyle]}>
                    <View style={styles.logoGlow} />
                    <GuftaguLogo width={120} height={120} />
                </Animated.View>

                {/* Brand name */}
                <Animated.View style={[styles.titleWrap, titleStyle]}>
                    <Text style={styles.title}>GUFTAGU</Text>
                </Animated.View>

                {/* Editorial subline */}
                <View style={styles.editorialWrap}>
                    <Animated.View style={[styles.divider, dividerStyle]} />
                    <Animated.View style={subStyle}>
                        <Text style={styles.editorial}>
                            WHERE CONVERSATIONS COME ALIVE
                        </Text>
                    </Animated.View>
                </View>
            </View>

            {/* ── Footer CTA ──────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom + 32, 48) },
                    footerStyle,
                ]}
            >
                <PressableScale
                    style={styles.cta}
                    scaleTo={0.94}
                    onPress={() => navigation.navigate('PhoneNumber')}
                >
                    <Text style={styles.ctaLabel}>Get Started</Text>
                    <View style={styles.ctaCircle}>
                        <Text style={styles.ctaArrow}>→</Text>
                    </View>
                </PressableScale>

                <Text style={styles.footerNote}>
                    Private. Secure. Yours.
                </Text>
            </Animated.View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CTA_H = 64;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
    },

    // ── Background aura
    auraTopRight: {
        position: 'absolute',
        top: -height * 0.08,
        right: -width * 0.15,
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: width * 0.425,
        backgroundColor: 'rgba(255,255,255,0.03)',
        transform: [{ scale: 1.6 }],
    },
    auraCentre: {
        position: 'absolute',
        top: height * 0.28,
        left: width * 0.08,
        width: width * 0.84,
        height: width * 0.84,
        borderRadius: width * 0.42,
        backgroundColor: 'rgba(255,255,255,0.018)',
        transform: [{ scale: 2 }],
    },
    auraBottomLeft: {
        position: 'absolute',
        bottom: -height * 0.04,
        left: -width * 0.18,
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        backgroundColor: 'rgba(255,255,255,0.018)',
        transform: [{ scale: 1.5 }],
    },

    // ── Content stage
    stage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: 40,
    },

    // ── Logo
    logoWrap: {
        marginBottom: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.04)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 50,
        elevation: 0,
    },

    // ── Typography
    titleWrap: {
        marginBottom: 24,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 46,
        fontWeight: '800',
        letterSpacing: 14,
        textAlign: 'center',
        marginRight: -14,
        textShadowColor: 'rgba(255,255,255,0.2)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 14,
    },

    // ── Editorial
    editorialWrap: {
        alignItems: 'center',
    },
    divider: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.14)',
        marginBottom: 14,
        borderRadius: 1,
    },
    editorial: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 5,
        lineHeight: 18,
        textAlign: 'center',
        marginRight: -5,
    },

    // ── Footer / CTA
    footer: {
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    cta: {
        width: '100%',
        height: CTA_H,
        borderRadius: CTA_H / 2,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 32,
        paddingRight: 8,
        marginBottom: 22,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
        elevation: 12,
    },
    ctaLabel: {
        color: '#000000',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
        flex: 1,
        textAlign: 'center',
        marginLeft: 16,
    },
    ctaCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: -2,
    },
    footerNote: {
        color: 'rgba(255,255,255,0.22)',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.4,
    },
});

export default WelcomeScreen;
