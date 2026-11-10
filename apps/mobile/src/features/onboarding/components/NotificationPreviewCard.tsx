import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppBadge } from '../../../components/ui/AppBadge';

export interface NotificationSample {
  id: string;
  timeTag: string;
  category: string;
  title: string;
  body: string;
  icon: IconName;
  iconBgVariant: 'mint' | 'lavender' | 'peach';
}

export interface NotificationPreviewCardProps {
  sample: NotificationSample;
  style?: StyleProp<ViewStyle>;
}

export const NotificationPreviewCard: React.FC<NotificationPreviewCardProps> = ({
  sample,
  style,
}) => {
  const { colors, isDark, radius } = useTheme();

  const getIconBg = () => {
    switch (sample.iconBgVariant) {
      case 'lavender':
        return colors.lavender;
      case 'peach':
        return colors.peach;
      case 'mint':
      default:
        return colors.mint;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderRadius: radius.lg,
          borderColor: isDark ? colors.border : '#E8EBE6',
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={[styles.iconDot, { backgroundColor: getIconBg() }]}>
            <AppIcon name={sample.icon} size="xs" color={colors.primaryDark} />
          </View>
          <AppText variant="caption" style={styles.brandLabel}>
            SOLACE • {sample.category}
          </AppText>
        </View>

        <AppBadge label={sample.timeTag} size="sm" variant="neutral" />
      </View>

      <View style={styles.contentBlock}>
        <AppText variant="bodyLarge" style={styles.title}>
          {sample.title}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.bodyText}>
          {sample.body}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#292431',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 11,
    color: '#716B78',
  },
  contentBlock: {
    paddingLeft: 32,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  bodyText: {
    lineHeight: 20,
  },
});

