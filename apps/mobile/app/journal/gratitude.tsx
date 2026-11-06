import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useCreateJournal } from '../../src/hooks/useJournal';

export default function GratitudeJournalScreen() {
  const router = useRouter();
  const createMutation = useCreateJournal();

  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [note, setNote] = useState('');

  const handleSave = async () => {
    const gratitudeItems = [item1, item2, item3].map((i) => i.trim()).filter(Boolean);
    if (gratitudeItems.length === 0) {
      Alert.alert('Empty gratitude', 'Please write at least one thing you are grateful for.');
      return;
    }

    triggerHaptic.medium();
    const content = `Gratitude List:\n1. ${item1 || '—'}\n2. ${item2 || '—'}\n3. ${item3 || '—'}${
      note.trim() ? `\n\nReflection:\n${note.trim()}` : ''
    }`;

    try {
      await createMutation.mutateAsync({
        title: 'Gratitude Reflection 🌻',
        content,
        category: 'gratitude',
        gratitudeItems,
        tags: ['gratitude', 'joy', 'mindfulness'],
        moodAssociation: 'grateful',
      });

      triggerHaptic.success();
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to save gratitude log. Please try again.');
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
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gratitude Journal</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={createMutation.isPending}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🌻</Text>
          <Text style={styles.bannerTitle}>Three Gentle Bright Spots</Text>
          <Text style={styles.bannerSubtitle}>
            What brought you quiet comfort, kindness, or relief today? No gift is too small.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemLabel}>1. I am grateful for...</Text>
          <TextInput
            style={styles.input}
            placeholder="A morning cup of tea, warm sunlight..."
            placeholderTextColor={colors.textLight}
            value={item1}
            onChangeText={setItem1}
          />

          <Text style={styles.itemLabel}>2. I am grateful for...</Text>
          <TextInput
            style={styles.input}
            placeholder="A thoughtful message from a friend..."
            placeholderTextColor={colors.textLight}
            value={item2}
            onChangeText={setItem2}
          />

          <Text style={styles.itemLabel}>3. I am grateful for...</Text>
          <TextInput
            style={styles.input}
            placeholder="My body carrying me through another day..."
            placeholderTextColor={colors.textLight}
            value={item3}
            onChangeText={setItem3}
          />

          <Text style={styles.itemLabel}>Optional: Deeper reflection</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="How did these moments feel in your body and mind?"
            placeholderTextColor={colors.textLight}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
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
  backButton: {
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
  banner: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  bannerEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.sageDark,
    marginTop: 10,
    marginBottom: 6,
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
    marginBottom: 12,
  },
  noteInput: {
    minHeight: 100,
  },
});

