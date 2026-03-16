import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LucideChevronLeft, LucideNavigation, LucideMapPin } from 'lucide-react-native';
import LocationMap from './LocationMap';
import { theme } from '../../theme/theme';

const LocationRouteMap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { latitude: destLat, longitude: destLon } = route.params as any;

    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [routeData, setRouteData] = useState<any>(null);
    const [routeGeometry, setRouteGeometry] = useState<any>(null);

    useEffect(() => {
        fetchRoute();
    }, []);

    const fetchRoute = async () => {
        try {
            setLoading(true);
            // 1. Get current position with High Accuracy
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required to show route.');
                setLoading(false);
                return;
            }

            const currentPos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setUserLocation(currentPos);

            // 2. Fetch OSRM route
            const startLon = currentPos.coords.longitude;
            const startLat = currentPos.coords.latitude;

            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.code === 'Ok' && data.routes?.length > 0) {
                const route = data.routes[0];
                setRouteData(route);
                
                // Transform OSRM [lon, lat] to Leaflet [lat, lon]
                const geo = route.geometry.coordinates.map((coord: any) => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRouteGeometry(geo);
            } else {
                Alert.alert('Error', 'Could not find a driving route.');
            }
        } catch (error) {
            console.error('Route fetch failed:', error);
            Alert.alert('Error', 'Failed to calculate route.');
        } finally {
            setLoading(false);
        }
    };

    const markers = useMemo(() => {
        const list = [];
        if (userLocation) {
            list.push({
                id: 'origin',
                lat: userLocation.coords.latitude,
                lng: userLocation.coords.longitude,
                title: 'Your Location'
            });
        }
        list.push({
            id: 'destination',
            lat: destLat,
            lng: destLon,
            title: 'Destination'
        });
        return list;
    }, [userLocation, destLat, destLon]);

    const history = useMemo<Record<string, Array<{ latitude: number, longitude: number }>>>(() => {
        if (!routeGeometry) return {};
        const result: Record<string, Array<{ latitude: number, longitude: number }>> = {
            'route-line': routeGeometry
        };
        return result;
    }, [routeGeometry]);

    const distanceKm = routeData ? (routeData.distance / 1000).toFixed(1) : null;
    const durationMin = routeData ? Math.round(routeData.duration / 60) : null;

    return (
        <View style={styles.container}>
            <LocationMap
                latitude={destLat}
                longitude={destLon}
                zoom={14}
                markers={markers}
                history={history}
                style={styles.map}
                showControls={false}
            />

            {/* Header */}
            <SafeAreaView style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <LucideChevronLeft color="#FFF" size={24} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Route to Destination</Text>
                        {loading ? (
                            <Text style={styles.subtitle}>Calculating...</Text>
                        ) : (
                            <Text style={styles.subtitle}>Driving Directions</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </SafeAreaView>

            {/* Travel Info Overlay */}
            {!loading && routeData && (
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <LucideNavigation color={theme.colors.active} size={24} />
                            <Text style={styles.infoLabel}>Distance</Text>
                            <Text style={styles.infoValue}>{distanceKm} km</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <LucideMapPin color="#FF3B30" size={24} />
                            <Text style={styles.infoLabel}>ETA</Text>
                            <Text style={styles.infoValue}>{durationMin} min</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <View style={styles.arrowCircle}>
                                <LucideNavigation color="#FFF" size={18} style={{ transform: [{ rotate: '45deg' }] }} />
                            </View>
                            <Text style={styles.infoLabel}>Direction</Text>
                            <Text style={styles.infoValue}>North</Text>
                        </View>
                    </View>
                </View>
            )}

            {loading && (
                <View style={styles.centerLoader}>
                    <ActivityIndicator color={theme.colors.active} size="large" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    map: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(28, 28, 30, 0.8)',
        zIndex: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    infoBox: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    infoLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.active,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerLoader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    }
});

export default LocationRouteMap;
