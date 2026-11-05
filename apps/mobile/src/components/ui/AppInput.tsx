import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText, AppLabel } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leadingIcon?: IconName | LucideIcon;
  trailingIcon?: IconName | LucideIcon;
  onTrailingIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  required,
  leadingIcon,
  trailingIcon,
  onTrailingIconPress,
  disabled = false,
  value,
  placeholder,
  containerStyle,
  inputStyle,
  inputContainerStyle,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors, layout, radius, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = React.useMemo(() => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return isDark ? colors.border : colors.border;
  }, [error, isFocused, colors, isDark]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <AppLabel required={required}>{label}</AppLabel>}

      <View
        style={[
          styles.inputContainer,
          {
            height: layout.inputHeightMd, // 48
            backgroundColor: disabled ? (isDark ? '#191F1A' : '#F2F2EC') : colors.surface,
            borderColor,
            borderRadius: radius.md,
            borderWidth: isFocused ? 1.5 : 1,
          },
          inputContainerStyle,
        ]}
      >
        {leadingIcon && (
          <View style={styles.leadingIcon}>
            <AppIcon
              name={leadingIcon}
              size="sm"
              color={isFocused ? colors.primary : colors.textMuted}
            />
          </View>
        )}

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.textInput,
            {
              color: disabled ? colors.textMuted : colors.textPrimary,
              fontSize: 15,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {trailingIcon && (
          <TouchableOpacity
            onPress={onTrailingIconPress}
            disabled={!onTrailingIconPress}
            style={styles.trailingIcon}
            accessibilityRole={onTrailingIconPress ? 'button' : undefined}
          >
            <AppIcon
              name={trailingIcon}
              size="sm"
              color={error ? colors.error : isFocused ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <AppText variant="caption" style={[styles.feedbackText, { color: colors.error }]}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" style={[styles.feedbackText, { color: colors.textSecondary }]}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

export interface PasswordInputProps extends Omit<
  AppInputProps,
  'secureTextEntry' | 'trailingIcon' | 'onTrailingIconPress'
> {
  showToggle?: boolean;
}

/**
 * PasswordInput
 * Secure text entry with eye/eye-off visibility toggle.
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({ showToggle = true, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <AppInput
      secureTextEntry={!isVisible}
      trailingIcon={showToggle ? (isVisible ? 'eyeOff' : 'eye') : undefined}
      onTrailingIconPress={showToggle ? () => setIsVisible((prev) => !prev) : undefined}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
};

export interface SearchInputProps extends Omit<
  AppInputProps,
  'leadingIcon' | 'trailingIcon' | 'onTrailingIconPress'
> {
  onClear?: () => void;
}

/**
 * SearchInput
 * Search bar with search lens icon and clear button when text is present.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  ...props
}) => {
  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  const hasValue = Boolean(value && value.length > 0);

  return (
    <AppInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leadingIcon="search"
      trailingIcon={hasValue ? 'x' : undefined}
      onTrailingIconPress={hasValue ? handleClear : undefined}
      returnKeyType="search"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  leadingIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailingIcon: {
    marginLeft: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
