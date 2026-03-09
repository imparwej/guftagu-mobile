import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LucideCheck, LucideImage, LucideRefreshCcw, LucideX } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';
import { triggerShareCallback } from '../../utils/shareCallbacks';

interface CameraScreenProps {
    navigation: any;
    route: any;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation, route }) => {
    const { callbackId } = route.params || {};
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        if (!permission) requestPermission();
    }, [permission]);

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>We need your permission to show the camera</Text>
                <Pressable onPress={requestPermission} style={styles.btn}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                setCapturedImage(photo.uri);
            } catch (e) {
                console.error('Failed to take picture', e);
            }
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            setCapturedImage(result.assets[0].uri);
        }
    };

    const handleConfirm = () => {
        if (capturedImage && callbackId) {
            triggerShareCallback(callbackId, capturedImage);
            navigation.goBack();
        }
    };

    if (capturedImage) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedImage }} style={styles.preview} />
                <View style={styles.previewControls}>
                    <Pressable onPress={() => setCapturedImage(null)} style={styles.controlBtn}>
                        <LucideX color="#FFF" size={32} />
                    </Pressable>
                    <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                        <LucideCheck color="#FFF" size={40} />
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* CameraView must not contain children — overlay is a sibling with absolute positioning */}
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
            />

            {/* Overlay controls positioned absolutely on top of the camera */}
            <View style={styles.controlsHeader}>
                <Pressable onPress={() => navigation.goBack()}>
                    <LucideX color="#FFF" size={28} />
                </Pressable>
            </View>

            <View style={styles.controlsFooter}>
                <Pressable onPress={pickImage} style={styles.iconBtn}>
                    <LucideImage color="#FFF" size={28} />
                </Pressable>

                <Pressable onPress={takePicture} style={styles.captureBtn}>
                    <View style={styles.captureBtnInner} />
                </Pressable>

                <Pressable
                    onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                    style={styles.iconBtn}
                >
                    <LucideRefreshCcw color="#FFF" size={28} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    controlsHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    controlsFooter: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    previewControls: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
    },
    iconBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtn: {
        padding: 10,
    },
    confirmBtn: {
        padding: 10,
        backgroundColor: theme.colors.active,
        borderRadius: 40,
    },
    text: {
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    btn: {
        backgroundColor: theme.colors.active,
        padding: 15,
        borderRadius: 10,
        alignSelf: 'center',
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default CameraScreen;
