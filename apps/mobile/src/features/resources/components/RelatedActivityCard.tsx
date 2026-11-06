import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface RelatedActivityCardProps {
  activityId?: string;
  title: string;
  subtitle: string;
  duration?: string;
  onPress: () => void;
}

export const RelatedActivityCard: React.FC<RelatedActivityCardProps> = ({
  title,
  subtitle,
  duration,
  onPress,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        triggerHaptic.selection();
        onPress();
      }}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Practice activity: ${title}`}
    >
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.primaryLight + '35',
              borderRadius: radius.md,
            },
          ]}
        >
          <AppIcon name="wind" size={22} color={colors.primary} />
        </View>

        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <AppHeading
              level={4}
              style={{
                color: colors.textPrimary,
                fontSize: 15,
              }}
              numberOfLines={1}
            >
              {title}
            </AppHeading>
            {duration && (
              <AppText
                variant="caption"
                style={{
                  color: colors.textTertiary,
                  fontSize: 11,
                }}
              >
                {duration}
              </AppText>
            )}
          </View>

          <AppText
            variant="caption"
            style={{
              color: colors.textSecondary,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </AppText>
        </View>

        <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginTop: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
