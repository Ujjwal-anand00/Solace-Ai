import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';

export interface AppDividerProps {
  label?: string;
  marginVertical?: number;
  style?: StyleProp<ViewStyle>;
}

export const AppDivider: React.FC<AppDividerProps> = ({ label, marginVertical = 16, style }) => {
  const { colors } = useTheme();

  if (label) {
    return (
      <View style={[styles.labeledRow, { marginVertical }, style]}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <AppText variant="caption" style={[styles.label, { color: colors.textMuted }]}>
          {label}
        </AppText>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.simpleLine,
        {
          backgroundColor: colors.border,
          marginVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  simpleLine: {
    height: StyleSheet.hairlineWidth * 2,
    width: '100%',
  },
  labeledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  label: {
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
