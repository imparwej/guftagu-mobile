import * as Location from 'expo-location';
import { LucideMapPin, LucideX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../../theme/theme';
import { triggerShareCallback } from '../../utils/shareCallbacks';

interface LocationShareScreenProps {
    navigation: any;
    route: any;
}

const LocationShareScreen: React.FC<LocationShareScreenProps> = ({ navigation, route }) => {
    const { callbackId } = route.params || {};
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [region, setRegion] = useState<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                navigation.goBack();
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            setRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        })();
    }, []);

    const shareCurrentLocation = () => {
        if (location && callbackId) {
            triggerShareCallback(callbackId, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            });
            navigation.goBack();
        }
    };

    const shareLiveLocation = (duration: number) => {
        if (location && callbackId) {
            triggerShareCallback(callbackId, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                live: true,
                duration,
            });
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <LucideX color="#FFF" size={24} />
                </Pressable>
                <Text style={styles.headerTitle}>Share Location</Text>
                <View style={{ width: 24 }} />
            </View>

            {region ? (
                <MapView
                    style={styles.map}
                    initialRegion={region}
                    showsUserLocation
                    onRegionChangeComplete={setRegion}
                >
                    <Marker coordinate={region} />
                </MapView>
            ) : (
                <View style={[styles.map, styles.center]}>
                    <Text style={{ color: '#FFF' }}>Loading Map...</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Pressable style={styles.option} onPress={shareCurrentLocation}>
                    <View style={styles.iconCircle}>
                        <LucideMapPin color="#FFF" size={24} />
                    </View>
                    <View>
                        <Text style={styles.optionTitle}>Send current location</Text>
                        <Text style={styles.optionSub}>Accurate to 10 meters</Text>
                    </View>
                </Pressable>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Share Live Location</Text>
                <View style={styles.liveGrid}>
                    {[15, 30, 60].map(mins => (
                        <Pressable
                            key={mins}
                            style={styles.liveBtn}
                            onPress={() => shareLiveLocation(mins)}
                        >
                            <Text style={styles.liveText}>{mins === 60 ? '1 hr' : `${mins} mins`}</Text>
                        </Pressable>
                    ))}
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#1c1c1e',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    map: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        backgroundColor: '#1c1c1e',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 10,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.active,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    optionSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 15,
    },
    liveGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    liveBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    liveText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default LocationShareScreen;
