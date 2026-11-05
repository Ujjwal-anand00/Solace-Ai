import React, { useState, useMemo } from 'react';
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
import { evaluatePasswordStrength } from '../../src/utils/passwordStrength';
import { triggerHaptic } from '../../src/utils/haptics';

export default function SignUpScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark, radius } = useTheme();
  const { register, isLoading, error, clearError } = useAuthStore();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);

  // Field Touched / Dirty states
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password Strength evaluation
  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  // Validations
  const nameError = useMemo(() => {
    if (!touched.name) return undefined;
    if (!name.trim()) return 'Name is required.';
    if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    return undefined;
  }, [name, touched.name]);

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    if (!email.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    return undefined;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return undefined;
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return undefined;
  }, [password, touched.password]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return undefined;
    if (!confirmPassword) return 'Please confirm your password.';
    if (confirmPassword !== password) return 'Passwords do not match.';
    return undefined;
  }, [confirmPassword, password, touched.confirmPassword]);

  const isFormValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    confirmPassword === password &&
    hasAgreedTerms &&
    !isLoading;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleToggleTerms = () => {
    triggerHaptic.light();
    setHasAgreedTerms((prev) => !prev);
  };

  const handleSignUp = async () => {
    if (!isFormValid) {
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    clearError();
    triggerHaptic.medium();

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      triggerHaptic.success();
      // Navigate to profile setup to personalize avatar and verify wellness goals
      router.replace('/(auth)/profile-setup');
    } catch {
      triggerHaptic.error();
    }
  };

  const handleBackToLogin = () => {
    router.push('/(auth)/login');
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

          <GhostButton title="Sign In" size="sm" onPress={handleBackToLogin} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <AppHeading level={1} style={styles.heading}>
              Create your sanctuary
            </AppHeading>
            <AppText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Begin your gentle journey toward emotional balance and self-care.
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
            {/* Full Name */}
            <AppInput
              label="Full name"
              placeholder="Your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) clearError();
              }}
              onBlur={() => handleBlur('name')}
              error={nameError}
              autoCapitalize="words"
              leadingIcon="user"
              required
            />

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
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              onBlur={() => handleBlur('password')}
              error={passwordError}
              required
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
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

                {/* 4-segment meter */}
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

                <AppText variant="caption" color="textMuted" style={styles.strengthTip}>
                  {passwordStrength.feedback}
                </AppText>
              </View>
            )}

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) clearError();
              }}
              onBlur={() => handleBlur('confirmPassword')}
              error={confirmPasswordError}
              required
            />

            {/* Terms and Privacy Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleToggleTerms}
              style={styles.checkboxRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: hasAgreedTerms }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: hasAgreedTerms ? colors.primary : colors.textMuted,
                    backgroundColor: hasAgreedTerms ? colors.primary : 'transparent',
                    borderRadius: radius.xs,
                  },
                ]}
              >
                {hasAgreedTerms && <AppIcon name="check" size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>

              <AppText variant="bodySmall" color="textSecondary" style={styles.checkboxLabel}>
                I agree to the{' '}
                <AppText style={{ color: colors.primary, fontWeight: '600' }}>
                  Terms of Service
                </AppText>{' '}
                and{' '}
                <AppText style={{ color: colors.primary, fontWeight: '600' }}>
                  Privacy Policy
                </AppText>
              </AppText>
            </TouchableOpacity>

            {/* Submit Button */}
            <PrimaryButton
              title="Create Account"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!isFormValid}
              onPress={handleSignUp}
              style={styles.submitBtn}
            />

            {/* Switch to Login */}
            <View style={styles.loginRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity onPress={handleBackToLogin}>
                <AppText variant="bodyMedium" style={{ color: colors.primary, fontWeight: '700' }}>
                  Log In
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
    paddingTop: 12,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 20,
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
    gap: 6,
  },
  strengthBlock: {
    marginTop: -4,
    marginBottom: 12,
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
  strengthTip: {
    fontSize: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
});

