import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    SafeAreaView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { LucideChevronLeft, LucideMapPin, LucideNavigation } from 'lucide-react-native';
import LocationMap from './LocationMap';
import LocationOptionsModal from '../../components/LocationOptionsModal';
import { theme } from '../../theme/theme';
import { triggerShareCallback } from '../../utils/shareCallbacks';
import { liveLocationService } from '../../services/LiveLocationService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface Props {
    navigation: any;
    route: any;
}

const LocationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { callbackId } = route.params || {};
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required.');
                navigation.goBack();
                return;
            }

            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc);
            } catch (error) {
                console.error("Error getting location:", error);
                Alert.alert("Error", "Could not determine your location.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleSendCurrentLocation = () => {
        if (location && callbackId) {
            triggerShareCallback(callbackId, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                live: false
            });
            navigation.goBack();
        }
    };

    const handleShareLiveLocation = () => {
        setIsModalVisible(true);
    };

    const onSelectDuration = async (minutes: number) => {
        setIsModalVisible(false);
        if (location && callbackId && activeChatId && currentUser) {
            // Trigger callback for the message bubble
            triggerShareCallback(callbackId, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                live: true,
                duration: minutes
            });
            
            // Start the background service
            await liveLocationService.startLiveSharing(activeChatId, currentUser.id, minutes);
            
            navigation.goBack();
        } else {
            Alert.alert("Error", "Missing required information to share live location.");
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <LucideChevronLeft color="#FFF" size={24} />
                    <Text style={styles.headerTitle}>Location</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.mapContainer}>
                {location ? (
                    <LocationMap
                        latitude={location.coords.latitude}
                        longitude={location.coords.longitude}
                        zoom={15}
                        style={styles.map}
                    />
                ) : (
                    <View style={[styles.map, styles.center]}>
                        <Text style={styles.loadingText}>Locating...</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Pressable style={styles.option} onPress={handleShareLiveLocation}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FF9500' }]}>
                        <LucideNavigation color="#FFF" size={20} />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.title}>Share Live Location</Text>
                        <Text style={styles.subtitle}>Updates in real-time as you move</Text>
                    </View>
                </Pressable>

                <View style={styles.divider} />

                <Pressable style={styles.option} onPress={handleSendCurrentLocation}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.active }]}>
                        <LucideMapPin color="#FFF" size={20} />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.title}>Send Your Current Location</Text>
                        <Text style={styles.subtitle}>Send a static pin of your location</Text>
                    </View>
                </Pressable>
            </View>

            <LocationOptionsModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSelect={onSelectDuration}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        backgroundColor: '#1c1c1e',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
    },
    loadingText: {
        color: '#FFF',
        fontSize: 16,
    },
    content: {
        backgroundColor: '#1c1c1e',
        padding: 16,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 16,
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
        marginLeft: 56,
    },
});

export default LocationScreen;
