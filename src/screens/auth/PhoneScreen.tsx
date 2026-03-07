/**
 * PhoneNumberScreen.tsx — Premium Guftagu Phone Verification (2026 Brand)
 *
 * Pitch-black canvas, official SVG logo, heavy tracked typography,
 * elegant input field with focus glow, ambient aura, and a
 * spring-animated pill CTA. Maintains full brand consistency
 * with the Welcome screen.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
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
import { useDispatch } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { setPhoneNumber } from '../../store/slices/authSlice';

import { sendOtp } from '../../api/api';

// Official Guftagu SVG logo
import GuftaguLogo from '../../../assets/images/favicon.svg';

const { width, height } = Dimensions.get('window');

const COUNTRY_CODE = "+91";
const COUNTRY_FLAG = "🇮🇳";

// ─── Ambient Aura (same as Welcome screen) ────────────────────────────────────
const AmbientAura = () => {
    const pulse = useSharedValue(0.35);

    useEffect(() => {
        pulse.value = withDelay(
            800,
            withRepeat(
                withSequence(
                    withTiming(0.65, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.35, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                ),
                -1,
                true,
            ),
        );
    }, []);

    const auraStyle = useAnimatedStyle(() => ({
        opacity: pulse.value,
        transform: [{ scale: 1 + (pulse.value - 0.35) * 0.1 }],
    }));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.auraTopRight} />
            <Animated.View style={[styles.auraCentre, auraStyle]} />
            <View style={styles.auraBottomLeft} />
        </View>
    );
};

// ─── Phone Number Screen ──────────────────────────────────────────────────────
const PhoneScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const [phone, setPhone] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isValid = phone.length === 10;

    // ── Staggered entrance animations
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.8);

    const headerOp = useSharedValue(0);
    const headerY = useSharedValue(24);

    const inputOp = useSharedValue(0);
    const inputY = useSharedValue(20);

    const ctaOp = useSharedValue(0);
    const ctaY = useSharedValue(30);

    const trustOp = useSharedValue(0);

    // ── Focus glow animation
    const focusGlow = useSharedValue(0);

    useEffect(() => {
        const spring = { damping: 14, stiffness: 85, mass: 1 };

        // 1 — Logo
        logoOp.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
        logoScale.value = withSpring(1, spring);

        // 2 — Header text
        headerOp.value = withDelay(200, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        headerY.value = withDelay(200, withSpring(0, spring));

        // 3 — Input field
        inputOp.value = withDelay(350, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        inputY.value = withDelay(350, withSpring(0, spring));

        // 4 — CTA
        ctaOp.value = withDelay(500, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
        ctaY.value = withDelay(500, withSpring(0, spring));

        // 5 — Trust note
        trustOp.value = withDelay(650, withTiming(1, { duration: 600 }));
    }, []);

    // Update focus glow based on input focus
    useEffect(() => {
        focusGlow.value = withTiming(isFocused ? 1 : 0, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isFocused]);

    // ── Animated styles
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }],
    }));

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
        transform: [{ translateY: headerY.value }],
    }));

    const inputStyle = useAnimatedStyle(() => ({
        opacity: inputOp.value,
        transform: [{ translateY: inputY.value }],
    }));

    const inputGlowStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(255, 255, 255, ${0.08 + focusGlow.value * 0.14})`,
        shadowOpacity: focusGlow.value * 0.12,
    }));

    const ctaStyle = useAnimatedStyle(() => ({
        opacity: ctaOp.value,
        transform: [{ translateY: ctaY.value }],
    }));

    const trustStyle = useAnimatedStyle(() => ({
        opacity: trustOp.value * 0.35,
    }));

    const handleContinue = async () => {
        if (isValid && !isLoading) {
            Keyboard.dismiss();
            setIsLoading(true);
            try {
                const fullPhone = `${COUNTRY_CODE}${phone}`;
                console.log("Phone:", phone);
                console.log("Full Phone Sending:", fullPhone);

                const response = await sendOtp(fullPhone);
                console.log("SEND OTP RESPONSE:", response);
                dispatch(setPhoneNumber(fullPhone));
                navigation.navigate('Otp');
            } catch (error) {
                console.error("SEND OTP ERROR:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <AmbientAura />

                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    {/* ── Top Section: Logo + Brand ────────────────────────────── */}
                    <View style={[styles.topSection, { paddingTop: insets.top + 48 }]}>
                        <Animated.View style={[styles.logoWrap, logoStyle]}>
                            <View style={styles.logoGlow} />
                            <GuftaguLogo width={64} height={64} />
                        </Animated.View>

                        <Text style={styles.brandName}>GUFTAGU</Text>
                    </View>

                    {/* ── Centre Section: Input ─────────────────────────────────── */}
                    <View style={styles.centreSection}>
                        <Animated.View style={headerStyle}>
                            <Text style={styles.heading}>
                                Enter your phone number
                            </Text>
                            <Text style={styles.subheading}>
                                We'll send a verification code to confirm your identity.
                            </Text>
                        </Animated.View>

                        <Animated.View style={[styles.inputRow, inputStyle]}>
                            <Animated.View style={[styles.inputContainer, inputGlowStyle]}>
                                {/* Country flag & code display */}
                                <View style={styles.countrySection}>
                                    <Text style={styles.countryFlag}>{COUNTRY_FLAG}</Text>
                                    <Text style={styles.countryCode}>{COUNTRY_CODE}</Text>
                                    <View style={styles.countryDivider} />
                                </View>

                                {/* Phone input */}
                                <TextInput
                                    ref={inputRef}
                                    style={styles.phoneInput}
                                    placeholder="Phone number"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/[^0-9]/g, '');
                                        setPhone(cleaned);
                                    }}
                                    maxLength={10}
                                    autoComplete="tel"
                                    textContentType="telephoneNumber"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    selectionColor="rgba(255,255,255,0.5)"
                                />
                            </Animated.View>
                        </Animated.View>
                    </View>

                    {/* ── Bottom Section: CTA + Trust ──────────────────────────── */}
                    <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 28, 44) }]}>
                        <Animated.View style={ctaStyle}>
                            <PressableScale
                                style={[
                                    styles.cta,
                                    !isValid && styles.ctaDisabled,
                                ]}
                                scaleTo={0.94}
                                onPress={handleContinue}
                                disabled={!isValid}
                            >
                                <Text style={[styles.ctaLabel, !isValid && styles.ctaLabelDisabled]}>
                                    {isLoading ? 'Sending...' : 'Continue'}
                                </Text>
                                <View style={[styles.ctaCircle, !isValid && styles.ctaCircleDisabled]}>
                                    <Text style={styles.ctaArrow}>→</Text>
                                </View>
                            </PressableScale>
                        </Animated.View>

                        <Animated.View style={[styles.trustRow, trustStyle]}>
                            <Text style={styles.lockIcon}>🔒</Text>
                            <Text style={styles.trustText}>
                                Your number stays private and encrypted.
                            </Text>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CTA_H = 64;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
    },
    flex: {
        flex: 1,
        justifyContent: 'space-between',
    },

    // ── Background aura (matches Welcome screen)
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
        top: height * 0.3,
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

    // ── Top section
    topSection: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.03)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 0,
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 8,
        marginRight: -8,
        textShadowColor: 'rgba(255,255,255,0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },

    // ── Centre section
    centreSection: {
        paddingHorizontal: 32,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 10,
    },
    subheading: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
        letterSpacing: 0.2,
        marginBottom: 32,
    },

    // ── Input
    inputRow: {},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        height: 64,
        paddingHorizontal: 20,
        // Focus glow shadow
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 0,
    },
    countrySection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 4,
    },
    countryFlag: {
        fontSize: 20,
        marginRight: 8,
    },
    countryCode: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginRight: 14,
    },
    countryDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 14,
    },
    phoneInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '500',
        letterSpacing: 1,
        padding: 0,
    },

    // ── Bottom section
    bottomSection: {
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
        marginBottom: 20,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
        elevation: 12,
    },
    ctaDisabled: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        shadowOpacity: 0,
        elevation: 0,
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
    ctaLabelDisabled: {
        color: 'rgba(255,255,255,0.25)',
    },
    ctaCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaCircleDisabled: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    ctaArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: -2,
    },

    // ── Trust signal
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    lockIcon: {
        fontSize: 12,
    },
    trustText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});

export default PhoneScreen;
