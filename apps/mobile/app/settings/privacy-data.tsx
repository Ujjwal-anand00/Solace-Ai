import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useRequestDataExport } from '../../src/hooks/useProfile';
import { AccountDeletionModal } from '../../src/features/profile';
import { userService } from '../../src/services/api/userService';
import { useAuthStore } from '../../src/store/authStore';

export default function PrivacyDataScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const exportMutation = useRequestDataExport();

  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportReadyData, setExportReadyData] = useState<string | null>(null);

  const handleExportData = async () => {
    triggerHaptic.medium();
    try {
      const res = await exportMutation.mutateAsync();
      setExportReadyData(JSON.stringify(res.data, null, 2));
      triggerHaptic.success();
      Alert.alert(
        'Export Generated',
        'Your comprehensive personal data archive has been created and verified.',
      );
    } catch {
      Alert.alert('Error', 'Unable to generate personal data export.');
    }
  };

  const handleConfirmDeletion = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount('DELETE');
      await logout();
      triggerHaptic.success();
      Alert.alert('Account Deleted', 'Your account and personal data have been completely deleted.');
      router.replace('/(auth)');
    } catch {
      Alert.alert('Error', 'Unable to process account deletion.');
    } finally {
      setIsDeleting(false);
      setDeletionModalVisible(false);
    }
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
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Transparency Section */}
        <Text style={styles.sectionTitle}>Data Transparency</Text>
        <View style={styles.card}>
          <Text style={styles.transparencyItem}>• Profile: Name, email, timezone, and language.</Text>
          <Text style={styles.transparencyItem}>• Mood Check-ins: Emotions, intensity, and notes.</Text>
          <Text style={styles.transparencyItem}>• Private Journals: Thoughts, gratitudes, and reflections.</Text>
          <Text style={styles.transparencyItem}>• AI Conversations: Sanctuary companion chats.</Text>
          <Text style={styles.transparencyItem}>• Analytics: Mindful streak and activity counters.</Text>
        </View>

        {/* Data Export */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Export Your Personal Data</Text>
        <View style={styles.card}>
          <Text style={styles.desc}>
            Download a portable, complete JSON archive of all your personal wellness records,
            journals, moods, and conversation transcripts.
          </Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleExportData}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.actionBtnText}>Generate Data Export</Text>
            )}
          </TouchableOpacity>

          {exportReadyData && (
            <View style={styles.exportSuccessBox}>
              <Text style={styles.exportSuccessTitle}>Archive Ready (Snapshot)</Text>
              <Text style={styles.exportSnippet} numberOfLines={5}>
                {exportReadyData}
              </Text>
            </View>
          )}
        </View>

        {/* Account Deletion */}
        <Text style={[styles.sectionTitle, { marginTop: 24, color: '#E11D48' }]}>
          Danger Zone
        </Text>
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.desc}>
            Permanently delete your Solace AI account and remove all personal information, mood
            records, push tokens, and wellness streaks.
          </Text>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              triggerHaptic.warning();
              setDeletionModalVisible(true);
            }}
          >
            <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Account Deletion Confirmation Modal */}
      <AccountDeletionModal
        visible={deletionModalVisible}
        onConfirm={handleConfirmDeletion}
        onCancel={() => setDeletionModalVisible(false)}
        isLoading={isDeleting}
      />
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
  },
  dangerCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  transparencyItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionBtn: {
    backgroundColor: colors.sage,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  exportSuccessBox: {
    marginTop: 14,
    backgroundColor: colors.cream,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  exportSuccessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sageDark,
    marginBottom: 4,
  },
  exportSnippet: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.textSecondary,
  },
});

