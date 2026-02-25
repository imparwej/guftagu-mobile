import { LinearGradient } from 'expo-linear-gradient';
import {
    LucideMic,
    LucideMicOff,
    LucidePhoneOff,
    LucideUser,
    LucideVolume2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { RootState } from '../../store/store';

const { width, height } = Dimensions.get('window');

const VoiceCallScreen = ({ navigation }: any) => {
    const [isMuted, setIsMuted] = useState(false);
    const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
    const chats = useSelector((state: RootState) => state.chat.chats);
    const chat = chats.find(c => c.id === activeChatId);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#1A1A1A', '#000000']}
                style={styles.gradient}
            />

            <View style={styles.content}>
                <Animated.View entering={FadeIn.delay(300)} style={styles.avatarContainer}>
                    <View style={styles.avatarGlow} />
                    <Image source={{ uri: chat?.avatar }} style={styles.avatar} />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(500)} style={styles.callerInfo}>
                    <Text style={styles.callerName}>{chat?.name || 'Guftagu User'}</Text>
                    <Text style={styles.callStatus}>Ringing...</Text>
                </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.controls}>
                <View style={styles.actionRow}>
                    <PressableScale
                        style={[styles.glassButton, isMuted && styles.activeButton]}
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <LucideMicOff color="#FFF" size={28} /> : <LucideMic color="#FFF" size={28} />}
                    </PressableScale>

                    <PressableScale style={styles.glassButton}>
                        <LucideVolume2 color="#FFF" size={28} />
                    </PressableScale>

                    <PressableScale style={styles.glassButton}>
                        <LucideUser color="#FFF" size={28} />
                    </PressableScale>
                </View>

                <PressableScale
                    style={styles.endCallButton}
                    onPress={() => navigation.goBack()}
                >
                    <LucidePhoneOff color="#FFF" size={32} />
                </PressableScale>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    avatarContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarGlow: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatar: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    callerInfo: {
        alignItems: 'center',
    },
    callerName: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    callStatus: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 18,
        fontWeight: '500',
    },
    controls: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        marginBottom: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    activeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    endCallButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
});

export default VoiceCallScreen;
