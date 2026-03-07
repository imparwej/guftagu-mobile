/**
 * ProfileSetupScreen.tsx — Premium Guftagu Profile Setup (2026 Brand)
 *
 * Final onboarding step: avatar selection via ImagePicker, name input,
 * optional about/bio, brand-consistent ambient aura, staggered entrance,
 * and a celebration moment before navigating to Main.
 */
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { loginSuccess, setProfileCompleted } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';

import { createProfile } from '../../api/api';

import GuftaguLogo from '../../../assets/images/favicon.svg';

const { width, height } = Dimensions.get('window');
const ABOUT_MAX = 140;

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

// ─── Profile Setup Screen ─────────────────────────────────────────────────────
const CreateProfileScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { phoneNumber } = useSelector((state: RootState) => state.auth);
    const nameRef = useRef<TextInput>(null);
    const aboutRef = useRef<TextInput>(null);

    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isAboutFocused, setIsAboutFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const isValid = name.trim().length > 0;

    // ── Entrance animations
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.8);

    const headerOp = useSharedValue(0);
    const headerY = useSharedValue(24);

    const avatarOp = useSharedValue(0);
    const avatarScale = useSharedValue(0.7);

    const nameOp = useSharedValue(0);
    const nameY = useSharedValue(20);

    const aboutOp = useSharedValue(0);
    const aboutY = useSharedValue(20);

    const ctaOp = useSharedValue(0);
    const ctaY = useSharedValue(30);

    // ── Focus glow
    const nameGlow = useSharedValue(0);
    const aboutGlow = useSharedValue(0);

    // ── Avatar pop
    const avatarPop = useSharedValue(1);

    useEffect(() => {
        const spring = { damping: 14, stiffness: 85, mass: 1 };

        logoOp.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
        logoScale.value = withSpring(1, spring);

        headerOp.value = withDelay(180, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        headerY.value = withDelay(180, withSpring(0, spring));

        avatarOp.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
        avatarScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 90 }));

        nameOp.value = withDelay(420, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        nameY.value = withDelay(420, withSpring(0, spring));

        aboutOp.value = withDelay(540, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        aboutY.value = withDelay(540, withSpring(0, spring));

        ctaOp.value = withDelay(660, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
        ctaY.value = withDelay(660, withSpring(0, spring));
    }, []);

    // Focus glow animations
    useEffect(() => {
        nameGlow.value = withTiming(isNameFocused ? 1 : 0, { duration: 250, easing: Easing.inOut(Easing.ease) });
    }, [isNameFocused]);

    useEffect(() => {
        aboutGlow.value = withTiming(isAboutFocused ? 1 : 0, { duration: 250, easing: Easing.inOut(Easing.ease) });
    }, [isAboutFocused]);

    // ── Image picker
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
                // Pop animation on new avatar
                avatarPop.value = withSequence(
                    withTiming(1.1, { duration: 150 }),
                    withSpring(1, { damping: 10, stiffness: 120 }),
                );
            }
        } catch (error) {
            console.log('Image picker error', error);
        }
    };

    const removeAvatar = () => {
        setAvatar(null);
        avatarPop.value = withSequence(
            withTiming(0.9, { duration: 100 }),
            withSpring(1, { damping: 10, stiffness: 120 }),
        );
    };

    // ── Continue handler
    const handleContinue = async () => {
        if (!isValid) {
            setShowError(true);
            return;
        }
        setShowError(false);
        setIsLoading(true);
        Keyboard.dismiss();

        try {
            await createProfile({
                phoneNumber: phoneNumber!,
                name: name.trim(),
                bio: about.trim() || 'Hey there! I am using Guftagu.',
                profileImage: avatar || '',
            });

            dispatch(loginSuccess({
                id: Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1a1a1a&color=fff&bold=true`,
                phoneNumber: phoneNumber,
                status: about.trim() || 'Hey there! I am using Guftagu.',
            }));
            dispatch(setProfileCompleted(true));

        } catch (error) {
            console.error("CREATE PROFILE ERROR:", error);
            setIsLoading(false);
        }
    };

    // ── Name validation
    useEffect(() => {
        if (showError && name.trim().length > 0) setShowError(false);
    }, [name]);

    // ── Get initials for avatar fallback
    const initials = name.trim()
        ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '';

    // ── Animated styles
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }],
    }));
    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
        transform: [{ translateY: headerY.value }],
    }));
    const avatarAnimStyle = useAnimatedStyle(() => ({
        opacity: avatarOp.value,
        transform: [{ scale: avatarScale.value * avatarPop.value }],
    }));
    const nameInputStyle = useAnimatedStyle(() => ({
        opacity: nameOp.value,
        transform: [{ translateY: nameY.value }],
    }));
    const nameBoxGlow = useAnimatedStyle(() => ({
        borderColor: `rgba(255, 255, 255, ${0.08 + nameGlow.value * 0.14})`,
        shadowOpacity: nameGlow.value * 0.1,
    }));
    const aboutInputStyle = useAnimatedStyle(() => ({
        opacity: aboutOp.value,
        transform: [{ translateY: aboutY.value }],
    }));
    const aboutBoxGlow = useAnimatedStyle(() => ({
        borderColor: `rgba(255, 255, 255, ${0.08 + aboutGlow.value * 0.14})`,
        shadowOpacity: aboutGlow.value * 0.1,
    }));
    const ctaStyle = useAnimatedStyle(() => ({
        opacity: ctaOp.value,
        transform: [{ translateY: ctaY.value }],
    }));

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <AmbientAura />

                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* ── Top: Logo + Brand ──────────────────────────────── */}
                    <View style={[styles.topSection, { paddingTop: insets.top + 36 }]}>
                        <Animated.View style={[styles.logoWrap, logoStyle]}>
                            <View style={styles.logoGlow} />
                            <GuftaguLogo width={48} height={48} />
                        </Animated.View>
                        <Text style={styles.brandName}>GUFTAGU</Text>
                    </View>

                    {/* ── Scrollable Centre ──────────────────────────────── */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <Animated.View style={[styles.headerWrap, headerStyle]}>
                            <Text style={styles.heading}>Set up your profile</Text>
                            <Text style={styles.subheading}>
                                Add your name and a photo so friends can recognise you.
                            </Text>
                        </Animated.View>

                        {/* Avatar */}
                        <Animated.View style={[styles.avatarSection, avatarAnimStyle]}>
                            <TouchableOpacity
                                style={styles.avatarRing}
                                onPress={pickImage}
                                activeOpacity={0.8}
                            >
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                                ) : initials ? (
                                    <View style={styles.avatarInitials}>
                                        <Text style={styles.initialsText}>{initials}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Camera color="rgba(255,255,255,0.3)" size={36} strokeWidth={1.5} />
                                    </View>
                                )}

                                {/* Camera badge */}
                                <View style={styles.cameraBadge}>
                                    <Camera color="#000" size={14} strokeWidth={2.5} />
                                </View>
                            </TouchableOpacity>

                            {avatar && (
                                <TouchableOpacity onPress={removeAvatar} style={styles.removeAvatarBtn}>
                                    <Text style={styles.removeAvatarText}>Remove photo</Text>
                                </TouchableOpacity>
                            )}

                            {!avatar && (
                                <Text style={styles.avatarHint}>Tap to add photo</Text>
                            )}
                        </Animated.View>

                        {/* Name Input */}
                        <Animated.View style={nameInputStyle}>
                            <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                            <Animated.View style={[styles.inputBox, nameBoxGlow, showError && styles.inputError]}>
                                <TextInput
                                    ref={nameRef}
                                    style={styles.input}
                                    placeholder="Your display name"
                                    placeholderTextColor="rgba(255,255,255,0.18)"
                                    value={name}
                                    onChangeText={setName}
                                    maxLength={30}
                                    autoCapitalize="words"
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                    selectionColor="rgba(255,255,255,0.5)"
                                    returnKeyType="next"
                                    onSubmitEditing={() => aboutRef.current?.focus()}
                                />
                            </Animated.View>
                            <View style={styles.inputFooter}>
                                {showError ? (
                                    <Text style={styles.errorText}>Name is required</Text>
                                ) : (
                                    <View />
                                )}
                                <Text style={styles.charCount}>{name.length}/30</Text>
                            </View>
                        </Animated.View>

                        {/* About / Bio Input */}
                        <Animated.View style={[aboutInputStyle, { marginTop: 20 }]}>
                            <Text style={styles.label}>
                                About <Text style={styles.optional}>optional</Text>
                            </Text>
                            <Animated.View style={[styles.inputBox, styles.inputBoxMulti, aboutBoxGlow]}>
                                <TextInput
                                    ref={aboutRef}
                                    style={[styles.input, styles.inputMulti]}
                                    placeholder="Hey there! I am using Guftagu."
                                    placeholderTextColor="rgba(255,255,255,0.15)"
                                    value={about}
                                    onChangeText={(t) => setAbout(t.slice(0, ABOUT_MAX))}
                                    maxLength={ABOUT_MAX}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    onFocus={() => setIsAboutFocused(true)}
                                    onBlur={() => setIsAboutFocused(false)}
                                    selectionColor="rgba(255,255,255,0.5)"
                                    returnKeyType="done"
                                    blurOnSubmit
                                />
                            </Animated.View>
                            <View style={styles.inputFooter}>
                                <View />
                                <Text style={styles.charCount}>{about.length}/{ABOUT_MAX}</Text>
                            </View>
                        </Animated.View>
                    </ScrollView>

                    {/* ── Bottom CTA ─────────────────────────────────────── */}
                    <Animated.View
                        style={[
                            styles.bottomSection,
                            { paddingBottom: Math.max(insets.bottom + 24, 40) },
                            ctaStyle,
                        ]}
                    >
                        <PressableScale
                            style={[
                                styles.cta,
                                !isValid && styles.ctaDisabled,
                            ]}
                            scaleTo={0.94}
                            onPress={handleContinue}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Text style={styles.ctaLabel}>Setting up…</Text>
                            ) : (
                                <>
                                    <Text style={[styles.ctaLabel, !isValid && styles.ctaLabelDisabled]}>
                                        Continue
                                    </Text>
                                    <View style={[styles.ctaCircle, !isValid && styles.ctaCircleDisabled]}>
                                        <Text style={styles.ctaArrow}>→</Text>
                                    </View>
                                </>
                            )}
                        </PressableScale>

                        <Text style={styles.footerNote}>
                            You can change this later in Settings.
                        </Text>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CTA_H = 64;
const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
    },
    flex: {
        flex: 1,
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
        marginBottom: 10,
    },
    logoGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.03)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 0,
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 6,
        marginRight: -6,
        textShadowColor: 'rgba(255,255,255,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },

    // ── Scroll content
    scrollContent: {
        paddingHorizontal: 32,
        paddingTop: 16,
        paddingBottom: 16,
    },

    // ── Header
    headerWrap: {
        marginBottom: 28,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 8,
    },
    subheading: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 21,
        letterSpacing: 0.2,
    },

    // ── Avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarRing: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    avatarImage: {
        width: AVATAR_SIZE - 3,
        height: AVATAR_SIZE - 3,
        borderRadius: (AVATAR_SIZE - 3) / 2,
    },
    avatarInitials: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: 2,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#000000',
    },
    removeAvatarBtn: {
        marginTop: 10,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    removeAvatarText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontWeight: '500',
    },
    avatarHint: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontWeight: '400',
        marginTop: 10,
    },

    // ── Input
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    required: {
        color: 'rgba(255,255,255,0.25)',
        fontWeight: '400',
    },
    optional: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontWeight: '400',
        fontStyle: 'italic',
    },
    inputBox: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 18,
        height: 56,
        justifyContent: 'center',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        elevation: 0,
    },
    inputBoxMulti: {
        height: 90,
        paddingTop: 14,
        paddingBottom: 14,
        justifyContent: 'flex-start',
    },
    inputError: {
        borderColor: 'rgba(255, 80, 60, 0.5)',
    },
    input: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.3,
        padding: 0,
    },
    inputMulti: {
        height: 62,
        textAlignVertical: 'top',
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        paddingHorizontal: 4,
    },
    errorText: {
        color: 'rgba(255, 80, 60, 0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    charCount: {
        color: 'rgba(255,255,255,0.15)',
        fontSize: 11,
        fontWeight: '500',
        fontVariant: ['tabular-nums'],
    },

    // ── Bottom CTA
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
        marginBottom: 16,
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
    footerNote: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontWeight: '400',
        letterSpacing: 0.3,
    },
});

export default CreateProfileScreen;
