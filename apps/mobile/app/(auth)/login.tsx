import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailError = React.useMemo(() => {
    if (!touched.email) return undefined;
    if (!email.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    return undefined;
  }, [email, touched.email]);

  const passwordError = React.useMemo(() => {
    if (!touched.password) return undefined;
    if (!password) return 'Password is required.';
    return undefined;
  }, [password, touched.password]);

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 1 && !isLoading;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleToggleRemember = () => {
    triggerHaptic.light();
    setRememberMe((prev) => !prev);
  };

  const handleLogin = async () => {
    if (!isFormValid) {
      setTouched({ email: true, password: true });
      return;
    }

    clearError();
    triggerHaptic.medium();

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      triggerHaptic.success();
      // Navigate to protected home screen
      router.replace('/(home)/index');
    } catch {
      triggerHaptic.error();
    }
  };

  const handleForgotPassword = () => {
    triggerHaptic.light();
    router.push('/(auth)/forgot-password');
  };

  const handleCreateAccount = () => {
    triggerHaptic.light();
    router.push('/(auth)/sign-up');
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

          <GhostButton title="Sign Up" size="sm" onPress={handleCreateAccount} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Block */}
          <View style={styles.headerBlock}>
            <AppHeading level={1} style={styles.heading}>
              Welcome back
            </AppHeading>
            <AppText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Step into your calm space. Your wellness reflections are safely stored here.
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

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Email Address */}
            <AppInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              onBlur={() => handleBlur('email')}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leadingIcon="mail"
              required
            />

            {/* Password */}
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              onBlur={() => handleBlur('password')}
              error={passwordError}
              required
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleToggleRemember}
                style={styles.rememberMeRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: rememberMe ? colors.primary : colors.textMuted,
                      backgroundColor: rememberMe ? colors.primary : 'transparent',
                      borderRadius: radius.xs,
                    },
                  ]}
                >
                  {rememberMe && (
                    <AppIcon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
                <AppText variant="bodySmall" color="textSecondary">
                  Remember session
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <AppText
                  variant="bodySmall"
                  style={{ color: colors.primary, fontWeight: '600' }}
                >
                  Forgot password?
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <PrimaryButton
              title="Sign In"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!isFormValid}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            {/* Switch to Sign Up */}
            <View style={styles.signUpRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                New to Solace?{' '}
              </AppText>
              <TouchableOpacity onPress={handleCreateAccount}>
                <AppText variant="bodyMedium" style={{ color: colors.primary, fontWeight: '700' }}>
                  Create an account
                </AppText>
              </TouchableOpacity>
            </View>
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
    marginBottom: 24,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 10,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});
