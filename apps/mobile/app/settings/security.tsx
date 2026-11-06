import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import {
  useUserSessions,
  useChangePassword,
  useRevokeSession,
  useLogoutAll,
} from '../../src/hooks/useProfile';
import { useAuthStore } from '../../src/store/authStore';

export default function SecurityScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { data: sessions } = useUserSessions();
  const changePasswordMutation = useChangePassword();
  const revokeSessionMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Incomplete fields', 'Please provide current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Too short', 'New password must be at least 8 characters.');
      return;
    }

    triggerHaptic.medium();
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      triggerHaptic.success();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password Updated', 'Your account password has been changed securely.');
    } catch {
      Alert.alert('Error', 'Unable to change password. Please verify current password.');
    }
  };

  const handleLogoutAll = async () => {
    triggerHaptic.warning();
    Alert.alert(
      'Log Out All Other Devices',
      'Are you sure you want to end all other active sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out Others',
          style: 'destructive',
          onPress: async () => {
            await logoutAllMutation.mutateAsync();
            triggerHaptic.success();
            Alert.alert('Done', 'All other active sessions have been revoked.');
          },
        },
      ],
    );
  };

  const handleLogoutCurrent = () => {
    triggerHaptic.medium();
    Alert.alert('Sign Out', 'Are you sure you want to exit your sanctuary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Sessions</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Change Password Form */}
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 symbol"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Repeat new password"
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            <Text style={styles.updateBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>

        {/* Active Sessions */}
        <View style={styles.sessionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          <TouchableOpacity onPress={handleLogoutAll}>
            <Text style={styles.logoutOthersText}>Log Out Others</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sessionsWrap}>
          {sessions?.map((s) => (
            <View key={s.id} style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionClient}>{s.userAgent || 'Solace App'}</Text>
                <Text style={styles.sessionMeta}>
                  IP: {s.ipAddress} • {s.isCurrent ? 'Current Device' : 'Other Device'}
                </Text>
              </View>

              {!s.isCurrent && (
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => {
                    triggerHaptic.selection();
                    revokeSessionMutation.mutate(s.id);
                  }}
                >
                  <Text style={styles.revokeBtnText}>Revoke</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Current Device Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogoutCurrent}>
          <Text style={styles.signOutBtnText}>Log Out from this Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sageDark,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.cream,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  updateBtn: {
    backgroundColor: colors.sage,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  updateBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutOthersText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E11D48',
  },
  sessionsWrap: {
    gap: 8,
    marginBottom: 24,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionClient: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  revokeBtn: {
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  revokeBtnText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

