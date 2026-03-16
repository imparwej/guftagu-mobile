import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    onLocationSelect?: (lat: number, lng: number) => void;
    showControls?: boolean;
    style?: any;
    markers?: Array<{id: string, lat: number, lng: number, title?: string, avatar?: string}>;
    history?: Record<string, Array<{ latitude: number, longitude: number }>>;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
    latitude, 
    longitude, 
    zoom = 15, 
    onLocationSelect,
    showControls = true,
    style,
    markers = [],
    history = {}
}) => {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; background: #242424; }
                .leaflet-container { background: #242424; }
                .leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', {
                    zoomControl: ${showControls},
                    attributionControl: false
                }).setView([${latitude}, ${longitude}], ${zoom});

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                var markers = {};
                var polylines = {};
                var mainMarker = L.marker([${latitude}, ${longitude}]).addTo(map);

                function createAvatarIcon(url, name) {
                    const initials = name ? name.substring(0, 2).toUpperCase() : '?';
                    const content = url 
                        ? '<img src="' + url + '" style="width: 36px; height: 36px; border-radius: 18px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">'
                        : '<div style="width: 36px; height: 36px; border-radius: 18px; border: 2px solid white; background: #34C759; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">' + initials + '</div>';
                    
                    return L.divIcon({
                        html: '<div style="position: relative; transition: all 0.5s linear;">' + content + '<div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid white;"></div></div>',
                        className: '',
                        iconSize: [36, 36],
                        iconAnchor: [18, 41]
                    });
                }

                function updateMarker(lat, lng) {
                    mainMarker.setLatLng([lat, lng]);
                    map.panTo([lat, lng]);
                }

                function addOrUpdateMarker(id, lat, lng, title, avatar) {
                    if (markers[id]) {
                        // Interpolate movement
                        var startLat = markers[id].getLatLng().lat;
                        var startLng = markers[id].getLatLng().lng;
                        var duration = 1000;
                        var start = null;

                        function animate(timestamp) {
                            if (!start) start = timestamp;
                            var progress = (timestamp - start) / duration;
                            if (progress > 1) progress = 1;

                            var currentLat = startLat + (lat - startLat) * progress;
                            var currentLng = startLng + (lng - startLng) * progress;
                            markers[id].setLatLng([currentLat, currentLng]);

                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            }
                        }
                        requestAnimationFrame(animate);
                    } else {
                        const icon = createAvatarIcon(avatar, title);
                        markers[id] = L.marker([lat, lng], { icon: icon }).addTo(map);
                        if (title) markers[id].bindPopup(title);
                    }
                }

                function updatePolyline(id, points) {
                    if (polylines[id]) {
                        polylines[id].setLatLngs(points);
                    } else {
                        polylines[id] = L.polyline(points, {
                            color: '#25D366', // WhatsApp Green
                            weight: 4,
                            opacity: 0.8,
                            lineJoin: 'round'
                        }).addTo(map);
                    }
                }

                map.on('click', function(e) {
                    var lat = e.latlng.lat;
                    var lng = e.latlng.lng;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ON_SELECT',
                        latitude: lat,
                        longitude: lng
                    }));
                });

                window.addEventListener('message', function(event) {
                    var data = JSON.parse(event.data);
                    if (data.type === 'UPDATE_LOCATION') {
                        updateMarker(data.lat, data.lng);
                    } else if (data.type === 'SYNC_MARKERS') {
                        data.markers.forEach(m => addOrUpdateMarker(m.id, m.lat, m.lng, m.title, m.avatar));
                    } else if (data.type === 'SYNC_HISTORY') {
                        // data.history = { userId: [{lat, lng}, ...] }
                        Object.keys(data.history).forEach(userId => {
                            updatePolyline(userId, data.history[userId]);
                        });
                    }
                });

            </script>
        </body>
        </html>
    `;

    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'UPDATE_LOCATION',
                lat: latitude,
                lng: longitude
            }));
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (webViewRef.current && markers.length > 0) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'SYNC_MARKERS',
                markers: markers
            }));
        }
    }, [markers]);

    useEffect(() => {
        if (webViewRef.current && history && Object.keys(history).length > 0) {
            // Transform history for Leaflet (Array of [lat, lng])
            const transformedHistory: Record<string, any> = {};
            Object.keys(history).forEach(userId => {
                if (history[userId]) {
                    transformedHistory[userId] = history[userId].map(p => [p.latitude, p.longitude]);
                }
            });

            webViewRef.current.postMessage(JSON.stringify({
                type: 'SYNC_HISTORY',
                history: transformedHistory
            }));
        }
    }, [history]);

    const onMessage = (event: any) => {
        try {
            const data = JSON.parse(event?.nativeEvent?.data);
            if (data.type === 'ON_SELECT' && onLocationSelect) {
                onLocationSelect(data.latitude, data.longitude);
            }
        } catch (e) {}
    };

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                style={styles.webView}
                source={{ html: mapHtml }}
                onMessage={onMessage}
                onLoadEnd={() => setLoading(false)}
                scrollEnabled={false}
                overScrollMode="never"
            />
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator color="#FFF" size="large" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    webView: {
        flex: 1,
        backgroundColor: '#242424',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LocationMap;
