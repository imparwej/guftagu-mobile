export const theme = {
    colors: {
        background: '#000000',
        secondary: '#121212',
        surface: '#1A1A1A',
        card: 'rgba(255, 255, 255, 0.04)',
        glass: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.12)',
        text: {
            primary: '#ffffff',
            secondary: '#8E8E93',
            tertiary: '#48484A',
            inverse: '#000000',
        },
        accent: '#ffffff',
        active: '#007AFF', // Subtle blue for active states if needed, or stick to white
        error: '#FF3B30',
        success: '#34C759',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
        xxxl: 64,
    },
    radius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        full: 9999,
    },
    typography: {
        sizes: {
            xs: 11,
            sm: 13,
            md: 15,
            lg: 17,
            xl: 20,
            xxl: 24,
            xxxl: 34,
        },
        weights: {
            light: '300',
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },
};

export type Theme = typeof theme;
