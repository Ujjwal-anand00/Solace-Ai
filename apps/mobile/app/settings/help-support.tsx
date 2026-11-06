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
import { useSubmitFeedback } from '../../src/hooks/useProfile';

export default function HelpSupportScreen() {
  const router = useRouter();
  const feedbackMutation = useSubmitFeedback();

  const [category, setCategory] = useState<'bug' | 'feature' | 'content' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Required field', 'Please write your message or question.');
      return;
    }

    triggerHaptic.medium();
    try {
      await feedbackMutation.mutateAsync({
        category,
        message: message.trim(),
        rating,
      });
      triggerHaptic.success();
      setMessage('');
      Alert.alert('Feedback Received', 'Thank you for reaching out to the Solace AI care team.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to submit feedback. Please check your connection.');
    }
  };

  const faqs = [
    {
      q: 'Is Solace AI a substitute for clinical therapy?',
      a: 'No. Solace AI is a supportive wellness companion and mindful self-care space. If you are experiencing acute psychological distress, please connect with professional healthcare providers or crisis services.',
    },
    {
      q: 'Can anyone read my private journal reflections?',
      a: 'Never. Your journals are strictly isolated to your account. Even AI reflections require your explicit one-time consent on each entry.',
    },
    {
      q: 'Why didn’t I receive a scheduled reminder?',
      a: 'Check your Quiet Hours in Notification Settings and ensure device notification permissions are enabled.',
    },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Medical Disclaimer Banner */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>Care & Safety Notice</Text>
          <Text style={styles.disclaimerText}>
            Solace AI is designed for emotional grounding, gentle reflection, and habit
            mindfulness. It does not provide clinical diagnoses or crisis intervention. In an
            emergency, call or text 988 (US/Canada) or your local emergency services.
          </Text>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, idx) => (
            <View key={idx} style={styles.faqCard}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Feedback / Contact Form */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Send Us Feedback or Questions</Text>
        <View style={styles.formCard}>
          <Text style={styles.label}>Feedback Type</Text>
          <View style={styles.categoryRow}>
            {(['general', 'feature', 'bug', 'content'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => {
                  triggerHaptic.selection();
                  setCategory(cat);
                }}
              >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  triggerHaptic.selection();
                  setRating(star);
                }}
                style={styles.starBtn}
              >
                <Text style={[styles.starText, rating >= star && styles.starTextActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us what's working well or what we can gently improve..."
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={feedbackMutation.isPending}
          >
            <Text style={styles.submitBtnText}>Submit Feedback</Text>
          </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  disclaimerBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B46C1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  faqList: {
    gap: 10,
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  faqA: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sageDark,
    marginBottom: 6,
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  catBtn: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catBtnActive: {
    backgroundColor: colors.sageLight,
    borderColor: colors.sage,
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catBtnTextActive: {
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starBtn: {
    padding: 4,
  },
  starText: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  starTextActive: {
    color: '#F59E0B',
  },
  textArea: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: colors.sage,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

