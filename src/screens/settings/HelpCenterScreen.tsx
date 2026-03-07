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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../../components/PressableScale';
import { theme } from '../../theme/theme';


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
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
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
                                <PressableScale
                                    style={styles.topicHeader}
                                    onPress={() => toggleExpand(topic.id)}
                                    scaleTo={0.99}
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
                                </PressableScale>
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
                    <PressableScale style={styles.actionItem} onPress={handleContactUs} scaleTo={0.98}>
                        <View style={styles.actionIcon}>
                            <LucideMail color={theme.colors.text.primary} size={20} />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Contact us</Text>
                            <Text style={styles.actionSubtitle}>Questions? Need help?</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.tertiary} size={18} />
                    </PressableScale>

                    <PressableScale style={styles.actionItem} scaleTo={0.98}>
                        <View style={styles.actionIcon}>
                            <LucideInfo color={theme.colors.text.primary} size={20} />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>App info</Text>
                            <Text style={styles.actionSubtitle}>Version 1.0.0 (Production)</Text>
                        </View>
                    </PressableScale>
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
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 10,
    },
    topicCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    topicTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    topicContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingLeft: 64,
    },
    topicText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        lineHeight: 22,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
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
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    actionSubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginTop: 4,
    },
    footer: {
        padding: 40,
        paddingBottom: 60,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.5,
    }
});

export default HelpCenterScreen;
