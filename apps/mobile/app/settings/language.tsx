import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useUserProfile, useUpdateProfile } from '../../src/hooks/useProfile';

export default function LanguageScreen() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const updateMutation = useUpdateProfile();

  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'pa'>(
    user?.language || 'en',
  );

  const languages: Array<{ id: 'en' | 'hi' | 'pa'; name: string; native: string }> = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  const handleSave = async () => {
    triggerHaptic.medium();
    try {
      await updateMutation.mutateAsync({
        language: selectedLanguage,
      });
      triggerHaptic.success();
      Alert.alert('Language Updated', 'Preferred language saved across your devices.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to update language preference.');
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
        <Text style={styles.headerTitle}>Language & Localization</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select App Language</Text>
        <Text style={styles.sectionSubtitle}>
          Choose your sanctuary interface language. Your private journal reflections will remain in
          the language you originally wrote them.
        </Text>

        <View style={styles.list}>
          {languages.map((l) => {
            const isSelected = selectedLanguage === l.id;
            return (
              <TouchableOpacity
                key={l.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => {
                  triggerHaptic.selection();
                  setSelectedLanguage(l.id);
                }}
              >
                <View style={styles.cardInfo}>
                  <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                    {l.name}
                  </Text>
                  <Text style={styles.nativeName}>{l.native}</Text>
                </View>
                <Text style={styles.radio}>{isSelected ? '◉' : '○'}</Text>
              </TouchableOpacity>
            );
          })}
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardSelected: {
    backgroundColor: '#F0F5F1',
    borderColor: colors.sage,
  },
  cardInfo: {
    flex: 1,
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  langNameSelected: {
    color: colors.sageDark,
  },
  nativeName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  radio: {
    fontSize: 16,
    color: colors.sageDark,
  },
});

