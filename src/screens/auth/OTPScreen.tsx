/**
 * OTPScreen.tsx — Premium Guftagu OTP Verification (2026 Brand)
 *
 * Refined input: 6 individual TextInputs for rock-solid focus/backspace.
 * Premium resend: pill-styled with formatted countdown + animated reveal.
 * Success: checkmark celebration before navigation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { setOtpVerified } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';

import { sendOtp, verifyOtp } from '../../api/api';

import GuftaguLogo from '../../../assets/images/favicon.svg';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

// ─── Ambient Aura ─────────────────────────────────────────────────────────────
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

// ─── Blinking Cursor ──────────────────────────────────────────────────────────
const BlinkingCursor = () => {
    const blink = useSharedValue(1);

    useEffect(() => {
        blink.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
        );
    }, []);

    const cursorStyle = useAnimatedStyle(() => ({
        opacity: blink.value,
    }));

    return <Animated.View style={[styles.cursor, cursorStyle]} />;
};

// ─── Single OTP Cell ──────────────────────────────────────────────────────────
const OTPCellDisplay = ({
    digit,
    isFocused,
    index,
}: {
    digit: string;
    isFocused: boolean;
    index: number;
}) => {
    const cellGlow = useSharedValue(0);
    const cellScale = useSharedValue(0.85);
    const isFilled = digit.length > 0;

    useEffect(() => {
        cellScale.value = withDelay(
            350 + index * 60,
            withSpring(1, { damping: 12, stiffness: 100 }),
        );
    }, []);

    useEffect(() => {
        cellGlow.value = withTiming(isFocused ? 1 : 0, {
            duration: 200,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isFocused]);

    const cellStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(255, 255, 255, ${0.06 + cellGlow.value * 0.22})`,
        backgroundColor: `rgba(255, 255, 255, ${0.025 + cellGlow.value * 0.035})`,
        transform: [{ scale: cellScale.value }],
        shadowOpacity: cellGlow.value * 0.08,
    }));

    return (
        <Animated.View style={[styles.otpCell, cellStyle]}>
            {isFilled ? (
                <Text style={styles.otpDigitFilled}>{digit}</Text>
            ) : isFocused ? (
                <BlinkingCursor />
            ) : null}
        </Animated.View>
    );
};

// ─── Premium Resend Button ────────────────────────────────────────────────────
const ResendButton = ({
    timer,
    canResend,
    onResend,
}: {
    timer: number;
    canResend: boolean;
    onResend: () => void;
}) => {
    const pillOp = useSharedValue(canResend ? 1 : 0.5);
    const pillScale = useSharedValue(1);

    useEffect(() => {
        if (canResend) {
            // Animate in when becoming available
            pillOp.value = withSpring(1, { damping: 14, stiffness: 90 });
            pillScale.value = withSequence(
                withTiming(1.04, { duration: 200 }),
                withSpring(1, { damping: 12, stiffness: 120 }),
            );
        } else {
            pillOp.value = withTiming(0.5, { duration: 300 });
            pillScale.value = withTiming(1, { duration: 200 });
        }
    }, [canResend]);

    const pillStyle = useAnimatedStyle(() => ({
        opacity: pillOp.value,
        transform: [{ scale: pillScale.value }],
    }));

    if (canResend) {
        return (
            <PressableScale scaleTo={0.95} onPress={onResend}>
                <Animated.View style={[styles.resendPill, styles.resendPillActive, pillStyle]}>
                    <Text style={styles.resendActiveText}>Resend Code</Text>
                </Animated.View>
            </PressableScale>
        );
    }

    return (
        <Animated.View style={[styles.resendPill, pillStyle]}>
            <Text style={styles.resendTimerLabel}>Resend in</Text>
            <Text style={styles.resendTimerValue}>{formatTime(timer)}</Text>
        </Animated.View>
    );
};

// ─── Verifying Dots Animation ─────────────────────────────────────────────────
const VerifyingDots = () => {
    const dot1 = useSharedValue(0.3);
    const dot2 = useSharedValue(0.3);
    const dot3 = useSharedValue(0.3);

    useEffect(() => {
        const anim = (delay: number) =>
            withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    ),
                    -1,
                    true,
                ),
            );

        dot1.value = anim(0);
        dot2.value = anim(150);
        dot3.value = anim(300);
    }, []);

    const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
    const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
    const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

    return (
        <>
            <Animated.View style={[styles.dot, s1]} />
            <Animated.View style={[styles.dot, s2]} />
            <Animated.View style={[styles.dot, s3]} />
        </>
    );
};

// ─── OTP Screen ───────────────────────────────────────────────────────────────
const OtpScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { phoneNumber } = useSelector((state: RootState) => state.auth);

    // 6 individual input refs
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);

    // ── Entrance animations
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const headerOp = useSharedValue(0);
    const headerY = useSharedValue(24);
    const cellsOp = useSharedValue(0);
    const cellsY = useSharedValue(20);
    const footerOp = useSharedValue(0);
    const footerY = useSharedValue(30);

    // ── Success animation
    const successScale = useSharedValue(0.5);
    const successOp = useSharedValue(0);

    // ── Error shake
    const shakeX = useSharedValue(0);

    useEffect(() => {
        const spring = { damping: 14, stiffness: 85, mass: 1 };

        logoOp.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
        logoScale.value = withSpring(1, spring);

        headerOp.value = withDelay(180, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        headerY.value = withDelay(180, withSpring(0, spring));

        cellsOp.value = withDelay(320, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        cellsY.value = withDelay(320, withSpring(0, spring));

        footerOp.value = withDelay(480, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
        footerY.value = withDelay(480, withSpring(0, spring));

        // Auto-focus first cell
        setTimeout(() => inputRefs.current[0]?.focus(), 500);
    }, []);

    // ── Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true);
            return;
        }
        const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const handleDigitChange = useCallback((text: string, index: number) => {

        if (isVerifying || isSuccess) return;

        const digit = text.replace(/[^0-9]/g, "");

        if (!digit) {
            setDigits((prev) => {
                const next = [...prev];
                next[index] = "";
                return next;
            });
            return;
        }

        setDigits((prev) => {

            const next = [...prev];
            next[index] = digit[0];

            const otp = next.join("");

            // move focus
            if (index < OTP_LENGTH - 1) {
                setActiveIndex(index + 1);
                setTimeout(() => inputRefs.current[index + 1]?.focus(), 30);
            } else {
                setActiveIndex(index);
            }

            // auto verify
            if (otp.length === 6) {
                setTimeout(() => {
                    handleVerify(otp);
                }, 200);
            }

            return next;
        });

    }, [isVerifying, isSuccess]);

    // ── Handle backspace
    const handleKeyPress = useCallback((e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (digits[index] === '' && index > 0) {
                // Move to previous cell and clear it
                setDigits((prev) => {
                    const next = [...prev];
                    next[index - 1] = '';
                    return next;
                });
                setActiveIndex(index - 1);
                setTimeout(() => inputRefs.current[index - 1]?.focus(), 30);
            } else {
                // Clear current cell
                setDigits((prev) => {
                    const next = [...prev];
                    next[index] = '';
                    return next;
                });
            }
        }
    }, [digits]);

    // ── Verify
    const handleVerify = async (otpParam?: string) => {
        if (isVerifying || isSuccess) return;
        Keyboard.dismiss();
        setIsVerifying(true);

        const otp = otpParam ?? digits.join("");
        console.log("Digits:", digits);
        console.log("OTP:", digits.join(""));

        if (otp.length !== 6) {
            alert("Please enter full 6 digit OTP");
            setIsVerifying(false);
            return;
        }

        console.log("OTP Sending:", otp);

        try {
            const response = await verifyOtp(phoneNumber!, otp);
            console.log("VERIFY RESPONSE:", response);

            setIsVerifying(false);

            if (response.status === "INVALID_OTP") {
                alert("Incorrect OTP");
                shakeX.value = withSequence(
                    withTiming(-10, { duration: 50 }),
                    withRepeat(withTiming(10, { duration: 50 }), 3, true),
                    withTiming(0, { duration: 50 })
                );
                return;
            }

            if (response.status === "OTP_EXPIRED") {
                alert("OTP expired. Please resend.");
                return;
            }

            if (response.status === "LOGIN_SUCCESS" || response.status === "VERIFIED") {
                setIsSuccess(true);

                successOp.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
                successScale.value = withSpring(1, { damping: 12, stiffness: 100 });

                setTimeout(() => {
                    dispatch(setOtpVerified(true));

                    if (response.status === "LOGIN_SUCCESS") {
                        navigation.replace("Chats");
                    } else {
                        navigation.replace("CreateProfile");
                    }
                }, 1200);
            }
        } catch (error) {
            console.error("VERIFY ERROR:", error);
            setIsVerifying(false);
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withRepeat(withTiming(10, { duration: 50 }), 3, true),
                withTiming(0, { duration: 50 })
            );
        }
    };

    // ── Resend
    const handleResend = useCallback(async () => {
        if (!canResend) return;
        setCanResend(false);
        setResendTimer(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(''));
        setActiveIndex(0);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);

        try {
            await sendOtp(phoneNumber!);
        } catch (error) {
            console.error("RESEND ERROR:", error);
        }
    }, [canResend, phoneNumber]);

    const handleChangeNumber = () => navigation.goBack();

    // ── Animated styles
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }],
    }));
    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
        transform: [{ translateY: headerY.value }],
    }));
    const cellsStyle = useAnimatedStyle(() => ({
        opacity: cellsOp.value,
        transform: [{ translateY: cellsY.value }, { translateX: shakeX.value }],
    }));
    const footerStyle = useAnimatedStyle(() => ({
        opacity: footerOp.value,
        transform: [{ translateY: footerY.value }],
    }));
    const successStyle = useAnimatedStyle(() => ({
        opacity: successOp.value,
        transform: [{ scale: successScale.value }],
    }));

    const maskedPhone = phoneNumber
        ? `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 5)}••••${phoneNumber.slice(-2)}`
        : '••••••••••';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <AmbientAura />

                {/* ── Top: Logo + Brand ─────────────────────────────────────── */}
                <View style={[styles.topSection, { paddingTop: insets.top + 48 }]}>
                    <Animated.View style={[styles.logoWrap, logoStyle]}>
                        <View style={styles.logoGlow} />
                        <GuftaguLogo width={56} height={56} />
                    </Animated.View>
                    <Text style={styles.brandName}>GUFTAGU</Text>
                </View>

                {/* ── Centre: OTP Input ─────────────────────────────────────── */}
                <View style={styles.centreSection}>
                    <Animated.View style={headerStyle}>
                        <Text style={styles.heading}>Verify your number</Text>
                        <Text style={styles.subheading}>
                            A 6-digit code was sent to{'\n'}
                            <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
                        </Text>
                    </Animated.View>

                    {/* OTP Cells */}
                    {!isSuccess ? (
                        <Animated.View style={[styles.otpRow, cellsStyle]}>
                            {digits.map((digit, i) => (
                                <View key={i} style={styles.cellTouchTarget}>
                                    <OTPCellDisplay
                                        digit={digit}
                                        isFocused={activeIndex === i && !isVerifying}
                                        index={i}
                                    />
                                    {/* Real TextInput overlaid on the cell — invisible */}
                                    <TextInput
                                        ref={(ref) => { inputRefs.current[i] = ref; }}
                                        style={styles.cellInput}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleDigitChange(text, i)}
                                        onKeyPress={(e) => handleKeyPress(e, i)}
                                        onFocus={() => setActiveIndex(i)}
                                        editable={!isVerifying && !isSuccess}
                                        caretHidden
                                        selectTextOnFocus={false}
                                        selectionColor="transparent"
                                    />
                                </View>
                            ))}
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.successWrap, successStyle]}>
                            <View style={styles.successCircle}>
                                <Text style={styles.successCheck}>✓</Text>
                            </View>
                            <Text style={styles.successText}>Verified</Text>
                        </Animated.View>
                    )}

                    {/* Verifying indicator */}
                    {isVerifying && (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            style={styles.verifyingWrap}
                        >
                            <View style={styles.verifyingDots}>
                                <VerifyingDots />
                            </View>
                            <Text style={styles.verifyingText}>Verifying...</Text>
                        </Animated.View>
                    )}
                </View>

                {/* ── Bottom: Actions ───────────────────────────────────────── */}
                <Animated.View
                    style={[
                        styles.bottomSection,
                        { paddingBottom: Math.max(insets.bottom + 28, 44) },
                        footerStyle,
                    ]}
                >
                    {/* Premium Resend Button */}
                    <ResendButton
                        timer={resendTimer}
                        canResend={canResend}
                        onResend={handleResend}
                    />

                    {/* Divider */}
                    <View style={styles.actionDot} />

                    {/* Change number */}
                    <TouchableOpacity
                        onPress={handleChangeNumber}
                        style={styles.changeButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.changeText}>Change Number</Text>
                    </TouchableOpacity>

                    {/* Trust signal */}
                    <View style={styles.trustRow}>
                        <Text style={styles.lockIcon}>🔒</Text>
                        <Text style={styles.trustText}>End-to-end encrypted verification</Text>
                    </View>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CELL_SIZE = Math.min((width - 64 - 5 * 10) / 6, 52);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
    },

    // ── Aura
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

    // ── Top
    topSection: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoGlow: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.03)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 25,
        elevation: 0,
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 7,
        marginRight: -7,
        textShadowColor: 'rgba(255,255,255,0.12)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },

    // ── Centre
    centreSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 10,
        textAlign: 'center',
    },
    subheading: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
        letterSpacing: 0.2,
        marginBottom: 36,
        textAlign: 'center',
    },
    phoneHighlight: {
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '600',
        letterSpacing: 1,
    },

    // ── OTP Cells
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    cellTouchTarget: {
        width: CELL_SIZE,
        height: CELL_SIZE * 1.25,
    },
    otpCell: {
        width: CELL_SIZE,
        height: CELL_SIZE * 1.25,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(255,255,255,0.025)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        elevation: 0,
    },
    cellInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        fontSize: 1,
        color: 'transparent',
    },
    otpDigitFilled: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    cursor: {
        width: 2,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 1,
    },

    // ── Success
    successWrap: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successCheck: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '600',
    },
    successText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
    },

    // ── Verifying
    verifyingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 10,
    },
    verifyingDots: {
        flexDirection: 'row',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    verifyingText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    // ── Bottom
    bottomSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
    },

    // ── Premium Resend Pill
    resendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        gap: 8,
    },
    resendPillActive: {
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    resendTimerLabel: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    resendTimerValue: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.5,
        fontVariant: ['tabular-nums'],
    },
    resendActiveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // ── Actions
    actionDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginVertical: 10,
    },
    changeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    changeText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: 0.3,
    },
    lockIcon: {
        fontSize: 11,
    },
    trustText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});

export default OtpScreen;
