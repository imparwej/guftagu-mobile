import * as ImagePicker from 'expo-image-picker';
import { LucideCamera, LucideSend, LucideType, LucideX } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addStory } from '../../store/slices/statusSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const CreateStatusScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [statusType, setStatusType] = useState<'text' | 'image' | null>(null);
    const [text, setText] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [bgColor, setBgColor] = useState('#25D366');
    const [isPublishing, setIsPublishing] = useState(false);

    const colors = ['#25D366', '#075E54', '#128C7E', '#34B7F1', '#EC407A', '#7E57C2', '#000000', '#546E7A'];

    const handleRotateColor = () => {
        const index = colors.indexOf(bgColor);
        setBgColor(colors[(index + 1) % colors.length]);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload status images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setStatusType('image');
        }
    };

    const handlePublish = async () => {
        if (isPublishing) return;

        setIsPublishing(true);

        // Simulating upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newStory = {
            id: Date.now().toString(),
            userId: currentUser?.id || '1',
            mediaUri: imageUri || undefined,
            mediaType: statusType || 'text',
            text: statusType === 'text' ? text : undefined,
            backgroundColor: statusType === 'text' ? bgColor : undefined,
            caption: statusType === 'image' ? caption : undefined,
            timestamp: new Date().toISOString(),
            isViewed: false,
        };

        dispatch(addStory(newStory as any));
        setIsPublishing(false);
        navigation.goBack();
    };

    const handleCancel = () => {
        if (statusType) {
            setStatusType(null);
            setText('');
            setImageUri(null);
            setCaption('');
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={[styles.container, statusType === 'text' && { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} disabled={isPublishing}>
                    <LucideX color="#FFF" size={28} />
                </TouchableOpacity>
                {statusType === 'text' && (
                    <TouchableOpacity onPress={handleRotateColor} disabled={isPublishing}>
                        <LucideType color="#FFF" size={28} />
                    </TouchableOpacity>
                )}
            </View>

            {statusType === null ? (
                <View style={styles.center}>
                    <TouchableOpacity style={styles.option} onPress={() => setStatusType('text')}>
                        <View style={styles.iconCircle}>
                            <LucideType color="#FFF" size={32} />
                        </View>
                        <Text style={styles.optionText}>Text Status</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option} onPress={pickImage}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.accent }]}>
                            <LucideCamera color="#FFF" size={32} />
                        </View>
                        <Text style={styles.optionText}>Image Status</Text>
                    </TouchableOpacity>
                </View>
            ) : statusType === 'text' ? (
                <View style={styles.textInputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a status"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        multiline
                        autoFocus
                        value={text}
                        onChangeText={setText}
                        editable={!isPublishing}
                    />
                </View>
            ) : (
                <View style={styles.imagePreviewContainer}>
                    {imageUri && <Image source={{ uri: imageUri }} style={styles.fullImage} />}
                    <View style={styles.captionContainer}>
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption..."
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            value={caption}
                            onChangeText={setCaption}
                            editable={!isPublishing}
                        />
                    </View>
                </View>
            )}

            {statusType !== null && (
                <TouchableOpacity
                    style={[styles.publishButton, (statusType === 'text' && !text.trim()) && styles.disabledButton]}
                    onPress={handlePublish}
                    disabled={isPublishing || (statusType === 'text' && !text.trim())}
                >
                    {isPublishing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <LucideSend color="#FFF" size={24} />
                    )}
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        zIndex: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    option: {
        alignItems: 'center',
    },
    optionText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    textInputContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    textInput: {
        color: '#FFF',
        fontSize: 32,
        textAlign: 'center',
        fontWeight: 'bold',
        minHeight: 100,
    },
    imagePreviewContainer: {
        flex: 1,
        position: 'relative',
    },
    fullImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    captionContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    captionInput: {
        color: '#FFF',
        fontSize: 16,
    },
    publishButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: theme.colors.accent,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    disabledButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    placeholderText: {
        color: '#FFF',
    }
});

export default CreateStatusScreen;
