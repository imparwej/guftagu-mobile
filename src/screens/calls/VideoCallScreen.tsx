import { LinearGradient } from 'expo-linear-gradient';
import {
    LucideMic,
    LucideMicOff,
    LucidePhoneOff,
    LucideSwitchCamera,
    LucideUser,
    LucideVideo,
    LucideVideoOff,
    LucideVolume2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { RootState } from '../../store/store';

const { width, height } = Dimensions.get('window');

const VideoCallScreen = ({ navigation }: any) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
    const chats = useSelector((state: RootState) => state.chat.chats);
    const chat = chats.find(c => c.id === activeChatId);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Image
                source={{ uri: chat?.avatar }}
                style={styles.remoteVideo}
                blurRadius={isVideoOff ? 20 : 0}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />

            <Animated.View entering={FadeIn.delay(300)} style={styles.header}>
                <View style={styles.callerInfo}>
                    <Text style={styles.callerName}>{chat?.name || 'Guftagu User'}</Text>
                    <Text style={styles.callDuration}>05:24</Text>
                </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600)} style={styles.localVideoContainer}>
                <View style={styles.localVideo}>
                    <LucideUser color="rgba(255,255,255,0.3)" size={40} />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.controls}>
                <View style={styles.actionRow}>
                    <PressableScale
                        style={[styles.glassButton, isMuted && styles.activeButton]}
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <LucideMicOff color="#FFF" size={24} /> : <LucideMic color="#FFF" size={24} />}
                    </PressableScale>

                    <PressableScale
                        style={[styles.glassButton, isVideoOff && styles.activeButton]}
                        onPress={() => setIsVideoOff(!isVideoOff)}
                    >
                        {isVideoOff ? <LucideVideoOff color="#FFF" size={24} /> : <LucideVideo color="#FFF" size={24} />}
                    </PressableScale>

                    <PressableScale style={styles.glassButton}>
                        <LucideVolume2 color="#FFF" size={24} />
                    </PressableScale>

                    <PressableScale style={styles.glassButton}>
                        <LucideSwitchCamera color="#FFF" size={24} />
                    </PressableScale>
                </View>

                <PressableScale
                    style={styles.endCallButton}
                    onPress={() => navigation.goBack()}
                >
                    <LucidePhoneOff color="#FFF" size={28} />
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
    remoteVideo: {
        width: width,
        height: height,
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.4,
    },
    header: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    callerInfo: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    callerName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    callDuration: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    localVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 100,
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    localVideo: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 35,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    activeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    endCallButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
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

export default VideoCallScreen;
