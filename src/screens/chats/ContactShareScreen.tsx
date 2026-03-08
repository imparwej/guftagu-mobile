import * as Contacts from 'expo-contacts';
import { LucideSearch, LucideUser, LucideX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../theme/theme';
import { triggerShareCallback } from '../../utils/shareCallbacks';

interface ContactShareScreenProps {
    navigation: any;
    route: any;
}

const ContactShareScreen: React.FC<ContactShareScreenProps> = ({ navigation, route }) => {
    const { callbackId } = route.params || {};
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
                    sort: Contacts.SortTypes.FirstName,
                });
                const validContacts = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);
                setContacts(validContacts);
                setFilteredContacts(validContacts);
            }
            setLoading(false);
        })();
    }, []);

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text) {
            const filtered = contacts.filter(c =>
                c.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredContacts(filtered);
        } else {
            setFilteredContacts(contacts);
        }
    };

    const handleSelect = (contact: Contacts.Contact) => {
        if (callbackId) {
            triggerShareCallback(callbackId, {
                name: contact.name,
                phoneNumber: contact.phoneNumbers?.[0]?.number || '',
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
                <Text style={styles.headerTitle}>Select Contact</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <LucideSearch color="rgba(255,255,255,0.4)" size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name or number"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.active} />
                </View>
            ) : (
                <FlatList
                    data={filteredContacts}
                    keyExtractor={(item) => (item as any).id || (item as any).lookupKey || (item as any).name || Math.random().toString()}
                    renderItem={({ item }) => (
                        <Pressable style={styles.contactItem} onPress={() => handleSelect(item)}>
                            <View style={styles.avatar}>
                                <LucideUser color="#FFF" size={24} />
                            </View>
                            <View>
                                <Text style={styles.contactName}>{item.name}</Text>
                                <Text style={styles.contactPhone}>
                                    {item.phoneNumbers?.[0]?.number}
                                </Text>
                            </View>
                        </Pressable>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        margin: 15,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        height: 44,
        fontSize: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    contactPhone: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ContactShareScreen;
