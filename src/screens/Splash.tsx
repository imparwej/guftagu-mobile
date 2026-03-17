/**
 * Splash.tsx — Premium Guftagu Splash Screen
 *
 * 3-Phase Animation Sequence:
 *  Phase 1 (0 → 0.8s)  — Logo fades + scales in with float & glow
 *  Phase 2 (0.8 → 1.6s) — Typing dots bounce in, bubble outline appears
 *  Phase 3 (1.6 → 2.4s) — Everything fades out → navigation.replace
 */
import { MessageCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    SharedValue,
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { encryptionService } from '../services/encryptionService';

const { width } = Dimensions.get('window');

// ─── Typing Dot ──────────────────────────────────────────────────────────────
const Dot = ({ delay, masterOpacity }: { delay: number; masterOpacity: SharedValue<number> }) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay + 800,  // start after Phase 1 completes
            withRepeat(
                withSequence(
                    withTiming(-9, { duration: 350, easing: Easing.bezier(0.33, 1, 0.68, 1) }),
                    withTiming(0, { duration: 350, easing: Easing.bezier(0.32, 0, 0.67, 0) })
                ),
                -1,
                false
            )
        );
        return () => cancelAnimation(translateY);
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: masterOpacity.value,
    }));

    return <Animated.View style={[styles.dot, style]} />;
};

// ─── Main Splash Screen ───────────────────────────────────────────────────────
const SplashScreen = ({ navigation }: any) => {
    const { profileCompleted, user: currentUser } = useSelector((state: RootState) => state.auth);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Shared values
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.82);
    const logoFloat = useSharedValue(0);     // subtle 6px float
    const glowOpacity = useSharedValue(0);     // breathing glow
    const dotsOpacity = useSharedValue(0);     // typing dots + tagline
    const bubbleOpacity = useSharedValue(0);    // ghost bubble behind logo
    const exitOpacity = useSharedValue(1);     // whole-screen fade-out layer

    const navigate = useCallback(async () => {
        if (currentUser?.id) {
            try {
                await encryptionService.initialize(currentUser.id);
            } catch (err) {
                console.warn('[SplashScreen] E2EE Init failed:', err);
            }
        }

        if (profileCompleted) {
            navigation.replace('Main');
        } else {
            navigation.replace('Welcome');
        }
    }, [profileCompleted, navigation, currentUser?.id]);

    useEffect(() => {
        // ── PHASE 1  (0 → 800 ms): Logo appears ──────────────────────────────
        logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1) });
        logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.2)) });

        // Subtle 6px continuous float (starts immediately, very gentle)
        logoFloat.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            )
        );

        // Breathing glow pulse — starts at 400 ms
        glowOpacity.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(0.25, { duration: 900 }),
                    withTiming(0.07, { duration: 900 })
                ),
                -1,
                false
            )
        );

        // ── PHASE 2  (800 → 1600 ms): Dots + bubble ──────────────────────────
        dotsOpacity.value = withDelay(800, withTiming(1, { duration: 350 }));
        bubbleOpacity.value = withDelay(700, withTiming(0.07, { duration: 700 }));

        // ── PHASE 3  (1800 → 2400 ms): Smooth fade-out → navigate ─────────────
        // Scale logo down very slightly (1 → 0.97) then fade everything
        timerRef.current = setTimeout(() => {
            logoScale.value = withTiming(0.96, { duration: 300, easing: Easing.in(Easing.ease) });
            exitOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }, (finished) => {
                if (finished) runOnJS(navigate)();
            });
        }, 2100);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            // Cancel all looping animations to avoid memory leaks
            cancelAnimation(logoFloat);
            cancelAnimation(glowOpacity);
        };
    }, []);

    // ── Animated Styles ───────────────────────────────────────────────────────
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { translateY: logoFloat.value },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const dotsStyle = useAnimatedStyle(() => ({
        opacity: dotsOpacity.value,
    }));

    const bubbleStyle = useAnimatedStyle(() => ({
        opacity: bubbleOpacity.value,
    }));

    const screenFadeStyle = useAnimatedStyle(() => ({
        opacity: exitOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

            <Animated.View style={[StyleSheet.absoluteFill, styles.screen, screenFadeStyle]}>

                {/* Ghost chat-bubble watermark behind logo */}
                <Animated.View style={[styles.bubbleWrap, bubbleStyle]} pointerEvents="none">
                    <MessageCircle color="#FFFFFF" size={220} strokeWidth={0.8} />
                </Animated.View>

                {/* Center content */}
                <View style={styles.center} pointerEvents="none">

                    {/* Logo */}
                    <Animated.View style={[styles.logoWrap, logoStyle]}>
                        {/* Glow halo */}
                        <Animated.View style={[styles.glow, glowStyle]} />
                        <Text style={styles.logoText}>Guftagu</Text>
                    </Animated.View>

                    {/* Typing dots + tagline — Phase 2 */}
                    <Animated.View style={[styles.phaseTwo, dotsStyle]}>
                        <View style={styles.dotsRow}>
                            <Dot delay={0} masterOpacity={dotsOpacity} />
                            <Dot delay={150} masterOpacity={dotsOpacity} />
                            <Dot delay={300} masterOpacity={dotsOpacity} />
                        </View>
                        <Text style={styles.tagline}>PREMIUM MESSAGING</Text>
                    </Animated.View>

                </View>
            </Animated.View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // always black — prevents any white flash
    },
    screen: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleWrap: {
        position: 'absolute',
        zIndex: 0,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 44,
    },
    glow: {
        position: 'absolute',
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        backgroundColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 48,
        shadowOpacity: 1,
        elevation: 24,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 52,
        fontWeight: '700',
        letterSpacing: 3,
        // Subtle text shadow for soft glow
        textShadowColor: 'rgba(255,255,255,0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    phaseTwo: {
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 22,
        marginBottom: 14,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: 'rgba(255,255,255,0.85)',
        marginHorizontal: 5,
    },
    tagline: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 4,
    },
});

export default SplashScreen;
