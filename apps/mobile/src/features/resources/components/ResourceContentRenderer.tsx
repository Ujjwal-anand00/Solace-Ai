import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeading, AppText, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { ResourceContentBlock } from '@solace/shared';

interface ResourceContentRendererProps {
  blocks: ResourceContentBlock[];
}

export const ResourceContentRenderer: React.FC<ResourceContentRendererProps> = ({ blocks }) => {
  const { colors, spacing, radius } = useTheme();

  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderBlock = (block: ResourceContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <View key={`heading-${index}`} style={styles.headingWrap}>
            <AppHeading
              level={3}
              style={{
                color: colors.textPrimary,
                fontWeight: '600',
                marginTop: index === 0 ? 0 : spacing.lg,
                marginBottom: spacing.xs,
              }}
            >
              {block.text}
            </AppHeading>
            <View
              style={[
                styles.headingUnderline,
                {
                  backgroundColor: colors.primaryLight,
                  borderRadius: radius.full,
                },
              ]}
            />
          </View>
        );

      case 'paragraph':
        return (
          <AppText
            key={`p-${index}`}
            variant="body"
            style={{
              color: colors.textPrimary,
              lineHeight: 24,
              marginBottom: spacing.md,
            }}
          >
            {block.text}
          </AppText>
        );

      case 'bullet_list':
        return (
          <View key={`bl-${index}`} style={[styles.listWrap, { marginBottom: spacing.md }]}>
            {(block.items || []).map((item, itemIdx) => (
              <View key={`bl-item-${itemIdx}`} style={styles.bulletItemRow}>
                <View
                  style={[
                    styles.bulletDot,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.full,
                    },
                  ]}
                />
                <AppText
                  variant="body"
                  style={{
                    color: colors.textPrimary,
                    flex: 1,
                    lineHeight: 22,
                  }}
                >
                  {item}
                </AppText>
              </View>
            ))}
          </View>
        );

      case 'numbered_list':
      case 'step':
        return (
          <View key={`nl-${index}`} style={[styles.listWrap, { marginBottom: spacing.md }]}>
            {(block.items || []).map((item, itemIdx) => (
              <View key={`nl-item-${itemIdx}`} style={styles.stepItemRow}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: colors.primaryLight + '50',
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: colors.primaryDark,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {itemIdx + 1}
                  </AppText>
                </View>
                <AppText
                  variant="body"
                  style={{
                    color: colors.textPrimary,
                    flex: 1,
                    lineHeight: 22,
                  }}
                >
                  {item}
                </AppText>
              </View>
            ))}
          </View>
        );

      case 'callout': {
        const type = block.calloutType || 'note';
        let calloutBg = colors.surfaceSecondary;
        let calloutBorder = colors.borderLight;
        let calloutIcon: IconName = 'info';
        let iconColor = colors.primary;
        let calloutLabel = 'Gentle Note';

        if (type === 'tip') {
          calloutBg = colors.primaryLight + '25';
          calloutBorder = colors.primaryLight;
          calloutIcon = 'sparkles';
          iconColor = colors.primaryDark;
          calloutLabel = 'Mindful Tip';
        } else if (type === 'reflection') {
          calloutBg = '#F2EFFB'; // soft lavender
          calloutBorder = '#D6CCF0';
          calloutIcon = 'feather';
          iconColor = '#6A56A6';
          calloutLabel = 'Self-Reflection';
        } else if (type === 'warning') {
          calloutBg = colors.warningLight + '25';
          calloutBorder = colors.warningLight;
          calloutIcon = 'alertCircle';
          iconColor = colors.warning;
          calloutLabel = 'Gentle Reminder';
        }

        return (
          <View
            key={`callout-${index}`}
            style={[
              styles.calloutCard,
              {
                backgroundColor: calloutBg,
                borderColor: calloutBorder,
                borderRadius: radius.lg,
                marginBottom: spacing.md,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.calloutHeader}>
              <AppIcon name={calloutIcon} size={18} color={iconColor} />
              <AppText
                variant="caption"
                style={{
                  color: iconColor,
                  fontWeight: '600',
                  marginLeft: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: 11,
                }}
              >
                {calloutLabel}
              </AppText>
            </View>
            <AppText
              variant="body"
              style={{
                color: colors.textPrimary,
                lineHeight: 22,
                marginTop: 6,
              }}
            >
              {block.text}
            </AppText>
          </View>
        );
      }

      case 'quote':
        return (
          <View
            key={`quote-${index}`}
            style={[
              styles.quoteCard,
              {
                borderLeftColor: colors.primary,
                backgroundColor: colors.surfaceSecondary + '50',
                borderRadius: radius.sm,
                marginBottom: spacing.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <AppText
              variant="body"
              style={{
                color: colors.textPrimary,
                fontStyle: 'italic',
                lineHeight: 24,
              }}
            >
              "{block.text}"
            </AppText>
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{blocks.map(renderBlock)}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headingWrap: {
    marginBottom: 8,
  },
  headingUnderline: {
    width: 32,
    height: 3,
    marginTop: 4,
  },
  listWrap: {
    gap: 10,
  },
  bulletItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    marginTop: 8,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  calloutCard: {
    borderWidth: 1,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteCard: {
    borderLeftWidth: 4,
  },
});
