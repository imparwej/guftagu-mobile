import { LucideDownload, LucideX } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

interface MediaPreviewScreenProps {
    navigation: any;
    route: any;
}

const MediaPreviewScreen: React.FC<MediaPreviewScreenProps> = ({ navigation, route }) => {
    const { uri, type } = route.params || {};

    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.play();
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <LucideX color="#FFF" size={28} />
                </Pressable>
                <Pressable style={styles.downloadBtn}>
                    <LucideDownload color="#FFF" size={24} />
                </Pressable>
            </View>

            <View style={styles.content}>
                {type === 'IMAGE' || type === 'GIF' ? (
                    <Image source={{ uri }} style={styles.image} resizeMode="contain" />
                ) : type === 'VIDEO' ? (
                    <VideoView
                        style={styles.video}
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                ) : (
                    <Text style={{ color: '#FFF' }}>Preview not available for this type</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height * 0.8,
    },
    video: {
        width: width,
        height: height * 0.8,
    },
});

export default MediaPreviewScreen;
