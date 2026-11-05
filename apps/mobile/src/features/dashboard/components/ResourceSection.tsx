import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { AppCard, AppText, AppHeading, AppBadge, AppIcon, IconName } from '../../../components/ui';
import { WellnessResource, ResourceContentType } from '@solace/shared';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ResourceSectionProps {
  resources?: WellnessResource[];
  isLoading?: boolean;
  onResourcePress?: (resource: WellnessResource) => void;
  onSeeAllPress?: () => void;
}

export const ResourceSection: React.FC<ResourceSectionProps> = ({
  resources = [],
  isLoading = false,
  onResourcePress,
  onSeeAllPress,
}) => {
  const { colors, isDark } = useTheme();

  const getContentTypeIcon = (type: ResourceContentType): IconName => {
    switch (type) {
      case 'audio':
        return 'play-circle';
      case 'exercise':
        return 'activity';
      case 'helpline':
        return 'phone';
      case 'guide':
        return 'bookOpen';
      case 'article':
      default:
        return 'file-text';
    }
  };

  const getContentTypeLabel = (type: ResourceContentType) => {
    switch (type) {
      case 'audio':
        return 'Audio';
      case 'exercise':
        return 'Practice';
      case 'helpline':
        return 'Support';
      case 'guide':
        return 'Guide';
      case 'article':
      default:
        return 'Article';
    }
  };

  const handlePress = (resource: WellnessResource) => {
    triggerHaptic.selection();
    onResourcePress?.(resource);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <AppHeading level="h4" style={styles.sectionTitle}>
            Recommended Resources
          </AppHeading>
        </View>
        <AppCard style={styles.card}>
          <View style={styles.loadingPlaceholder}>
            <AppText variant="bodySmall" color="secondary">
              Curating gentle reading for you...
            </AppText>
          </View>
        </AppCard>
      </View>
    );
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <AppHeading level="h4" style={styles.sectionTitle}>
            Mindful Library 📚
          </AppHeading>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Curated articles and exercises for your mental wellness
          </AppText>
        </View>
        {onSeeAllPress && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.light();
              onSeeAllPress();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              See all
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Cards Carousel */}
      <FlatList
        data={resources}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handlePress(item)}
            style={styles.cardWrapper}
          >
            <AppCard style={styles.resourceCard}>
              {/* Category & Content Type */}
              <View style={styles.cardTopRow}>
                <AppBadge
                  label={item.category.toUpperCase()}
                  variant="primary"
                  size="sm"
                />
                <View
                  style={[
                    styles.contentTypePill,
                    { backgroundColor: isDark ? colors.surfaceSecondary : '#F0EFE9' },
                  ]}
                >
                  <AppIcon
                    name={getContentTypeIcon(item.contentType)}
                    size={12}
                    color={colors.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    style={[styles.contentTypeText, { color: colors.textSecondary }]}
                  >
                    {getContentTypeLabel(item.contentType)}
                  </AppText>
                </View>
              </View>

              {/* Title & Description */}
              <AppHeading
                level="h4"
                style={[styles.resourceTitle, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {item.title}
              </AppHeading>
              <AppText
                variant="bodySmall"
                style={[styles.resourceDesc, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </AppText>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <AppText
                  variant="caption"
                  style={[styles.actionLink, { color: colors.primaryDark }]}
                >
                  {item.contentType === 'audio' ? 'Listen now' : 'Read resource'}
                </AppText>
                <AppIcon name="chevron-right" size={14} color={colors.primaryDark} />
              </View>
            </AppCard>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 20,
    padding: 16,
  },
  loadingPlaceholder: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  cardWrapper: {
    width: 250,
  },
  resourceCard: {
    padding: 16,
    borderRadius: 18,
    height: 180,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  contentTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 6,
  },
  resourceDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E5E0',
  },
  actionLink: {
    fontWeight: '700',
    fontSize: 12,
  },
});

