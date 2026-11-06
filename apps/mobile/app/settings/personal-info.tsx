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
import { useUserProfile, useUpdateProfile } from '../../src/hooks/useProfile';
import { AppAvatar } from '../../src/components/ui';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [preferredName, setPreferredName] = useState(user?.preferredName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required field', 'Please provide a valid name.');
      return;
    }

    triggerHaptic.medium();
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        preferredName: preferredName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        timezone: timezone.trim() || undefined,
      });
      triggerHaptic.success();
      Alert.alert('Saved', 'Your profile details have been updated.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to update profile details.');
    }
  };

  const handleRemoveAvatar = () => {
    triggerHaptic.selection();
    setAvatarUrl('');
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
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <AppAvatar
            name={preferredName || name || 'User'}
            size="xl"
            backgroundColor={colors.sageLight}
            textColor={colors.sageDark}
          />

          <View style={styles.avatarActions}>
            <TextInput
              style={styles.avatarInput}
              placeholder="Paste image URL (https://...)"
              placeholderTextColor={colors.textLight}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
            />
            {avatarUrl.length > 0 && (
              <TouchableOpacity onPress={handleRemoveAvatar} style={styles.removeAvatarBtn}>
                <Text style={styles.removeAvatarText}>Remove Picture</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Preferred Display Name</Text>
          <TextInput
            style={styles.input}
            value={preferredName}
            onChangeText={setPreferredName}
            placeholder="How Solace should address you"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Email Address (Read-only)</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={user?.email || ''}
            editable={false}
          />

          <Text style={styles.label}>Timezone</Text>
          <TextInput
            style={styles.input}
            value={timezone}
            onChangeText={setTimezone}
            placeholder="e.g. Asia/Kolkata, America/New_York"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Personal Reflection Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="A short gentle reminder to yourself..."
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
            maxLength={300}
          />
        </View>
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
  saveBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarActions: {
    width: '100%',
    marginTop: 14,
    alignItems: 'center',
  },
  avatarInput: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 13,
    color: colors.textPrimary,
  },
  removeAvatarBtn: {
    marginTop: 8,
  },
  removeAvatarText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.sageDark,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
  bioInput: {
    minHeight: 80,
  },
});

