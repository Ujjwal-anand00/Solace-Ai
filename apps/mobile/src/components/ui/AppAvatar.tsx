import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'calm' | 'busy' | 'offline';

export interface AppAvatarProps {
  source?: ImageSourcePropType | { uri: string };
  name?: string;
  size?: AvatarSize | number;
  status?: AvatarStatus;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  source,
  name,
  size = 'md',
  status,
  backgroundColor,
  textColor,
  style,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useTheme();

  const dimension = React.useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 26;
      case 'sm':
        return 34;
      case 'lg':
        return 56;
      case 'xl':
        return 72;
      case 'md':
      default:
        return 44;
    }
  }, [size]);

  const initials = React.useMemo(() => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  const statusColor = React.useMemo(() => {
    switch (status) {
      case 'online':
      case 'calm':
        return colors.success;
      case 'busy':
        return colors.warning;
      case 'offline':
      default:
        return colors.textMuted;
    }
  }, [status, colors]);

  const resolvedBg = backgroundColor || (isDark ? colors.surfaceSecondary : colors.primaryTint);
  const statusSize = Math.max(8, Math.round(dimension * 0.26));

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: resolvedBg,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || name || 'Avatar'}
    >
      {source ? (
        <Image
          source={source}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <AppText
          style={{
            fontSize: Math.round(dimension * 0.38),
            fontWeight: '600',
            color: textColor || (isDark ? colors.primaryLight : colors.primaryDark),
          }}
        >
          {initials}
        </AppText>
      )}

      {status && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: statusColor,
              borderColor: colors.surface,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});

