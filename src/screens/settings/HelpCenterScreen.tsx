import {
    LucideArrowLeft,
    LucideChevronDown,
    LucideChevronRight,
    LucideChevronUp,
    LucideHelpCircle,
    LucideInfo,
    LucideMail,
    LucideMessageSquare,
    LucideSearch,
    LucideShieldCheck
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HELP_TOPICS = [
    {
        id: '1',
        title: 'Connectivity',
        icon: LucideMessageSquare,
        content: 'If you are having trouble connecting, ensure your Wi-Fi or mobile data is active. Try toggling Airplane Mode or restarting the app.'
    },
    {
        id: '2',
        title: 'Account & Profile',
        icon: LucideInfo,
        content: 'You can update your name, about, and profile photo in the Profile section. To delete your account, visit Account settings.'
    },
    {
        id: '3',
        title: 'Privacy & Security',
        icon: LucideShieldCheck,
        content: 'Guftagu uses end-to-end encryption. You can manage your last seen, profile photo, and status privacy in the Privacy section.'
    },
    {
        id: '4',
        title: 'Payments',
        icon: LucideHelpCircle,
        content: 'Guftagu is a free messaging app. We do not charge for basic messaging or calling services.'
    },
];

const HelpCenterScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleContactUs = () => {
        Alert.alert(
            'Contact Us',
            'Our support team is available 24/7. How would you like to reach out?',
            [
                { text: 'Chat with Support', onPress: () => Alert.alert('Support', 'Starting a support chat...') },
                { text: 'Email us', onPress: () => Alert.alert('Support', 'Opening email client...') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const filteredTopics = HELP_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <LucideSearch color={theme.colors.text.tertiary} size={20} />
                    <TextInput
                        placeholder="Search help topics..."
                        placeholderTextColor={theme.colors.text.tertiary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Popular Topics</Text>
                    {filteredTopics.map(topic => {
                        const isExpanded = expandedIds.includes(topic.id);
                        const Icon = topic.icon;
                        return (
                            <View key={topic.id} style={styles.topicCard}>
                                <TouchableOpacity
                                    style={styles.topicHeader}
                                    onPress={() => toggleExpand(topic.id)}
                                >
                                    <View style={styles.topicTitleContainer}>
                                        <View style={styles.iconCircle}>
                                            <Icon color={theme.colors.accent} size={18} />
                                        </View>
                                        <Text style={styles.topicTitle}>{topic.title}</Text>
                                    </View>
                                    {isExpanded ? (
                                        <LucideChevronUp color={theme.colors.text.tertiary} size={20} />
                                    ) : (
                                        <LucideChevronDown color={theme.colors.text.tertiary} size={20} />
                                    )}
                                </TouchableOpacity>
                                {isExpanded && (
                                    <View style={styles.topicContent}>
                                        <Text style={styles.topicText}>{topic.content}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Support</Text>
                    <TouchableOpacity style={styles.actionItem} onPress={handleContactUs}>
                        <View style={styles.actionIcon}>
                            <LucideMail color={theme.colors.text.primary} size={20} />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Contact us</Text>
                            <Text style={styles.actionSubtitle}>Questions? Need help?</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.tertiary} size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIcon}>
                            <LucideInfo color={theme.colors.text.primary} size={20} />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>App info</Text>
                            <Text style={styles.actionSubtitle}>Version 1.0.0 (Production)</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Guftagu Messaging</Text>
                    <Text style={styles.footerText}>All rights reserved</Text>
                </View>
            </ScrollView>
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
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: theme.spacing.md,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: theme.colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text.primary,
        marginLeft: 10,
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingBottom: 20,
    },
    sectionHeader: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionDivider: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    topicCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    topicTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    topicTitle: {
        color: theme.colors.text.primary,
        fontSize: 15,
        fontWeight: '500',
    },
    topicContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingLeft: 60,
    },
    topicText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    actionIcon: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        color: theme.colors.text.primary,
        fontSize: 16,
    },
    actionSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginTop: 2,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.text.tertiary,
        fontSize: 12,
        marginBottom: 4,
    }
});

export default HelpCenterScreen;
