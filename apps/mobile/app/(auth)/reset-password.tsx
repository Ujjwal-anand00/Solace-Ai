import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppInput,
  PasswordInput,
  PrimaryButton,
  GhostButton,
  AppIcon,
  AppCard,
} from '../../src/components/ui';
import { authService } from '../../src/services/api/authService';
import { useTheme } from '../../src/hooks/useTheme';
import { evaluatePasswordStrength } from '../../src/utils/passwordStrength';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ResetPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { colors, isDark } = useTheme();

  const [token, setToken] = useState(params.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);

  const isFormValid =
    token.trim().length >= 6 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword &&
    !isLoading;

  const handleResetPassword = async () => {
    if (!isFormValid) return;

    setError(null);
    setIsLoading(true);
    triggerHaptic.medium();

    try {
      await authService.resetPassword({
        token: token.trim(),
        newPassword,
      });

      triggerHaptic.success();
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. You may now sign in to your sanctuary with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/(auth)/login'),
          },
        ],
      );
    } catch (err: unknown) {
      triggerHaptic.error();
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Failed to reset password. Please verify your code and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <AppIcon name="chevronLeft" size="md" color={colors.textPrimary} />
          </TouchableOpacity>

          <GhostButton title="Sign In" size="sm" onPress={() => router.push('/(auth)/login')} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={[styles.iconCircle, { backgroundColor: colors.mint }]}>
              <AppIcon name="lock" size="lg" color={colors.primaryDark} />
            </View>

            <AppHeading level={1} style={styles.heading}>
              Create new password
            </AppHeading>
            <AppText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Choose a strong, peaceful password to safeguard your reflections.
            </AppText>
          </View>

          {/* Error Banner */}
          {error && (
            <AppCard variant="soft" style={styles.errorBanner}>
              <View style={styles.errorRow}>
                <AppIcon name="alertCircle" size="sm" color={colors.error} />
                <AppText variant="bodySmall" color="error" style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            </AppCard>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Reset Token */}
            <AppInput
              label="Reset Code or Token"
              placeholder="Paste code from email"
              value={token}
              onChangeText={(text) => {
                setToken(text);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              leadingIcon="shield"
              required
            />

            {/* New Password */}
            <PasswordInput
              label="New Password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (error) setError(null);
              }}
              required
            />

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthBlock}>
                <View style={styles.strengthHeader}>
                  <AppText variant="caption" color="textSecondary">
                    Strength:
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: passwordStrength.color, fontWeight: '700' }}
                  >
                    {passwordStrength.label}
                  </AppText>
                </View>

                <View style={styles.meterRow}>
                  {[1, 2, 3, 4].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.meterSegment,
                        {
                          backgroundColor:
                            step <= passwordStrength.score
                              ? passwordStrength.color
                              : isDark
                                ? colors.surfaceSecondary
                                : '#E2E6DF',
                        },
                      ]}
                    />
                  ))}
                </View>

                <AppText variant="caption" color="textMuted">
                  {passwordStrength.feedback}
                </AppText>
              </View>
            )}

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) setError(null);
              }}
              error={
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? 'Passwords do not match.'
                  : undefined
              }
              required
            />

            {/* Submit Button */}
            <PrimaryButton
              title="Reset Password & Sign In"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!isFormValid}
              onPress={handleResetPassword}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    lineHeight: 24,
  },
  errorBanner: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(224, 122, 95, 0.12)',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    lineHeight: 18,
  },
  form: {
    gap: 8,
  },
  strengthBlock: {
    marginTop: -4,
    marginBottom: 10,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterRow: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
    marginBottom: 6,
  },
  meterSegment: {
    flex: 1,
    borderRadius: 2,
  },
  submitBtn: {
    marginTop: 14,
  },
});
