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
  PrimaryButton,
  OutlineButton,
  GhostButton,
  AppIcon,
  AppCard,
} from '../../src/components/ui';
import { authService } from '../../src/services/api/authService';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    if (!isValidEmail || isLoading) return;

    setError(null);
    setIsLoading(true);
    triggerHaptic.medium();

    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      triggerHaptic.success();
      setIsSubmitted(true);
    } catch {
      // Show generic message even on error to prevent account enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToReset = () => {
    triggerHaptic.light();
    router.push('/(auth)/reset-password');
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
          {!isSubmitted ? (
            <>
              {/* Header */}
              <View style={styles.headerBlock}>
                <View style={[styles.iconCircle, { backgroundColor: colors.lavender }]}>
                  <AppIcon name="lock" size="lg" color={colors.primaryDark} />
                </View>

                <AppHeading level={1} style={styles.heading}>
                  Reset your password
                </AppHeading>
                <AppText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
                  Enter the email address associated with your sanctuary, and we’ll send you
                  recovery instructions.
                </AppText>
              </View>

              {/* Input Form */}
              <View style={styles.form}>
                <AppInput
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leadingIcon="mail"
                  required
                />

                <PrimaryButton
                  title="Send Reset Instructions"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={!isValidEmail}
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                />

                <OutlineButton
                  title="I already have a reset code"
                  size="md"
                  fullWidth
                  onPress={handleGoToReset}
                  style={styles.haveCodeBtn}
                />
              </View>
            </>
          ) : (
            /* Success confirmation card */
            <View style={styles.successBlock}>
              <View style={[styles.successCircle, { backgroundColor: colors.mint }]}>
                <AppIcon name="checkCircle" size="xl" color={colors.primaryDark} />
              </View>

              <AppHeading level={1} align="center" style={styles.heading}>
                Check your inbox
              </AppHeading>

              <AppText
                variant="bodyLarge"
                color="textSecondary"
                align="center"
                style={styles.subtitle}
              >
                If an account exists for <AppText style={styles.boldEmail}>{email.trim()}</AppText>,
                we’ve dispatched a recovery code and reset link.
              </AppText>

              <AppCard variant="soft" style={styles.noticeCard}>
                <AppText variant="bodySmall" color="textSecondary" style={styles.noticeText}>
                  Please check your spam or promotions folder if you don't see it within a couple of
                  minutes.
                </AppText>
              </AppCard>

              <View style={styles.successActions}>
                <PrimaryButton
                  title="Enter Reset Code"
                  size="lg"
                  fullWidth
                  onPress={handleGoToReset}
                  style={styles.submitBtn}
                />

                <GhostButton
                  title="Return to Sign In"
                  size="md"
                  fullWidth
                  onPress={handleBackToLogin}
                  style={styles.returnBtn}
                />
              </View>
            </View>
          )}
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
  form: {
    gap: 12,
  },
  submitBtn: {
    marginTop: 8,
  },
  haveCodeBtn: {
    marginTop: 4,
  },
  successBlock: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  boldEmail: {
    fontWeight: '700',
    color: '#303A34',
  },
  noticeCard: {
    padding: 16,
    marginVertical: 20,
    width: '100%',
  },
  noticeText: {
    lineHeight: 20,
    textAlign: 'center',
  },
  successActions: {
    width: '100%',
    gap: 8,
  },
  returnBtn: {
    marginTop: 4,
  },
});
