import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../hooks/useTheme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withTopInset?: boolean;
  withBottomInset?: boolean;
  paddingHorizontal?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  withTopInset = true,
  withBottomInset = true,
  paddingHorizontal,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, layout, isDark } = useTheme();

  const hPadding = paddingHorizontal ?? layout.screenHorizontal; // default 20

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: withTopInset ? insets.top : 0,
    paddingBottom: withBottomInset ? Math.max(insets.bottom, 12) : 0,
  };

  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : undefined;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView behavior={keyboardBehavior} style={styles.keyboardView}>
        <View style={[containerStyle, style]}>
          {scrollable ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingHorizontal: hPadding },
                contentContainerStyle,
              ]}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View
              style={[styles.fixedContent, { paddingHorizontal: hPadding }, contentContainerStyle]}
            >
              {children}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  fixedContent: {
    flex: 1,
  },
});
