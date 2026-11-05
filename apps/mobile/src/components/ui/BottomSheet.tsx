import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { AppHeading } from './AppText';
import { AppIcon } from './AppIcon';
import { SlideUpView } from '../../utils/animations';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeight = '80%',
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, radius, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={[
              styles.backdrop,
              {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(48, 58, 52, 0.45)',
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sliding Sheet */}
        <SlideUpView
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: Math.max(insets.bottom, 20),
              maxHeight: typeof maxHeight === 'number' ? maxHeight : undefined,
            },
            style,
          ]}
        >
          {/* Drag Pill Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          {title && (
            <View style={styles.headerRow}>
              <AppHeading level={3} style={styles.title}>
                {title}
              </AppHeading>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <AppIcon name="x" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            bounces={false}
          >
            {children}
          </ScrollView>
        </SlideUpView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: '100%',
    paddingTop: 10,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  contentScroll: {
    maxHeight: 500,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
